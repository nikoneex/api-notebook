import type { ParsedRequest } from "./requestParser";

export interface ResponseResult {
	status: number;
	statusText: string;
	headers: Record<string, string>;
	body: string;
}

function headersToRecord(headers: Headers): Record<string, string> {
	const out: Record<string, string> = {};
	headers.forEach((value, key) => {
		out[key] = value;
	});
	return out;
}

function isJsonContentType(contentType: string): boolean {
	return contentType.toLowerCase().includes("application/json");
}

function tryPrettyPrintJson(body: string, contentType: string): string {
	if (!isJsonContentType(contentType)) {
		return body;
	}
	try {
		const parsed = JSON.parse(body) as unknown;
		return JSON.stringify(parsed, null, 2);
	} catch {
		return body;
	}
}

export async function runHttpRequest(req: ParsedRequest): Promise<ResponseResult> {
	const init: RequestInit = {
		method: req.method,
		headers: req.headers,
	};
	if (req.body !== undefined && req.method !== "GET") {
		init.body = req.body;
	}

	let response: Response;
	try {
		response = await fetch(req.url, init);
	} catch (err) {
		const message =
			err instanceof Error ? err.message : String(err);
		throw new Error(`[API Notebook] Request failed: ${message}`);
	}

	const rawBody = await response.text();
	const contentType =
		response.headers.get("Content-Type") ?? "";
	const body = tryPrettyPrintJson(rawBody, contentType);

	return {
		status: response.status,
		statusText: response.statusText,
		headers: headersToRecord(response.headers),
		body,
	};
}
