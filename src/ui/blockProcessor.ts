import type { MarkdownPostProcessorContext } from "obsidian";
import type { Plugin } from "obsidian";
import { parseHttpBlock } from "../requestParser";
import { runHttpRequest } from "../httpRunner";

export function registerHttpBlockProcessor(plugin: Plugin): void {
	plugin.registerMarkdownCodeBlockProcessor(
		"http",
		(source: string, el: HTMLElement, _ctx: MarkdownPostProcessorContext) => {
			const pre = el.createEl("pre", { cls: "api-notebook-source" });
			pre.setText(source);

			const buttonWrap = el.createEl("div", { cls: "api-notebook-actions" });
			const button = buttonWrap.createEl("button", {
				cls: "api-notebook-run-button",
			});
			button.setText("Run Request");

			const outputContainer = el.createEl("div", {
				cls: "api-notebook-output",
			});

			button.addEventListener("click", () => {
				outputContainer.empty();
				const run = async () => {
					try {
						const parsed = parseHttpBlock(source);
						const result = await runHttpRequest(parsed);
						const outPre = outputContainer.createEl("pre", {
							cls: "api-notebook-response",
						});
						const statusLine = `${result.status} ${result.statusText}`;
						const headerLines = Object.entries(result.headers).map(
							([k, v]) => `${k}: ${v}`
						);
						const parts = [statusLine, ...headerLines, "", result.body];
						outPre.setText(parts.join("\n"));
					} catch (err) {
						const msg =
							err instanceof Error ? err.message : String(err);
						const errPre = outputContainer.createEl("pre", {
							cls: "api-notebook-error",
						});
						errPre.setText(
							msg.startsWith("[API Notebook]")
								? msg
								: `[API Notebook] ${msg}`
						);
					}
				};
				void run();
			});
		}
	);
}
