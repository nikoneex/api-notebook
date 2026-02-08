export interface ParsedRequest {
	method: string;
	url: string;
	headers: Record<string, string>;
	body?: string;
}

const ALLOWED_METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]);

export function parseHttpBlock(source: string): ParsedRequest {
	const trimmed = source.trim();
	if (!trimmed) {
		throw new Error("[API Notebook] Request block is empty.");
	}

	const lines = trimmed.split(/\r?\n/);
	const firstNonEmptyIndex = lines.findIndex((line) => line.trim() !== "");
	if (firstNonEmptyIndex === -1) {
		throw new Error("[API Notebook] Request block has no content.");
	}

	const firstLine = lines[firstNonEmptyIndex]!.trim();
	const firstParts = firstLine.split(/\s+/);
	if (firstParts.length < 2) {
		throw new Error(
			"[API Notebook] First line must be METHOD URL (e.g. GET https://example.com)"
		);
	}

	const method = firstParts[0]!.toUpperCase();
	if (!ALLOWED_METHODS.has(method)) {
		throw new Error(
			`[API Notebook] Invalid method "${method}". Allowed: GET, POST, PUT, PATCH, DELETE.`
		);
	}

	const url = firstParts.slice(1).join(" ").trim();
	if (!url) {
		throw new Error("[API Notebook] URL is missing.");
	}

	const headers: Record<string, string> = {};
	let i = firstNonEmptyIndex + 1;
	while (i < lines.length) {
		const line = lines[i]!;
		if (line.trim() === "") {
			i++;
			break;
		}
		const colonIndex = line.indexOf(":");
		if (colonIndex === -1) {
			throw new Error(
				`[API Notebook] Invalid header line (expected "Key: value"): ${line}`
			);
		}
		const key = line.slice(0, colonIndex).trim();
		const value = line.slice(colonIndex + 1).trim();
		if (key) {
			headers[key] = value;
		}
		i++;
	}

	const bodyLines = lines.slice(i);
	const body = bodyLines.join("\n").trim();
	const result: ParsedRequest = {
		method,
		url,
		headers,
	};
	if (body) {
		result.body = body;
	}
	return result;
}
