import { Plugin } from "obsidian";
import { registerHttpBlockProcessor } from "./ui/blockProcessor";

export default class ApiNotebookPlugin extends Plugin {
	async onload() {
		registerHttpBlockProcessor(this);
	}
}
