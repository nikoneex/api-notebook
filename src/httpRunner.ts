import { requestUrl } from "obsidian";
import type { ParsedRequest } from "./requestParser";

export interface ResponseResult {
	status: number;
	statusText: string;
	headers: Record<string, string>;
	body: string;
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
	const param: { url: string; method?: string; headers?: Record<string, string>; body?: string; throw: boolean } = {
		url: req.url,
		method: req.method,
		headers: Object.keys(req.headers).length > 0 ? req.headers : undefined,
		throw: false,
	};
	if (req.body !== undefined && req.method !== "GET") {
		param.body = req.body;
	}

	let response: { status: number; headers: Record<string, string>; text: string };
	try {
		response = await requestUrl(param);
	} catch (err) {
		const message =
			err instanceof Error ? err.message : String(err);
		throw new Error(`[API Notebook] Request failed: ${message}`);
	}

	const contentType =
		response.headers["Content-Type"] ?? response.headers["content-type"] ?? "";
	const body = tryPrettyPrintJson(response.text, contentType);

	return {
		status: response.status,
		statusText: response.status >= 400 ? "Error" : "OK",
		headers: response.headers,
		body,
	};
}
