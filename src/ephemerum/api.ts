import { App } from "obsidian";
import { EphemerumFile } from "./ephemerum";

export interface EphemerumApiObject {
	app: App;
	table: (keys: string[], rows?: unknown[][]) => void;
	h1: (header: string) => void;
	h2: (header: string) => void;
	h3: (header: string) => void;
	p: (text: string) => void;
}

export class EphemerumApi {
	public ephemerumFile: EphemerumFile;

	constructor(ephemerumFile: EphemerumFile) {
		this.ephemerumFile = ephemerumFile;
	}

	public table(keys: string[], rows?: unknown[][]) {
		let content = '\n';
		if(!keys || keys.length === 0) {
			return;
		}

		let delim = '';
		for(const key of keys) {
			content += `| ${key} `;
			delim += '|---';
		}
		content += '|\n' + delim + '|';

		if(!rows || rows.length === 0 || rows[0].length !== keys.length) {
			return;
		}

		content += '\n';

		for(const row of rows) {
			for(const text of row) {
				content += `| ${text} `;
			}
			content += '|\n';
		}

		this.ephemerumFile.content += content;
	}

	public h1(header: string) {
		this.ephemerumFile.content += `\n# ${header}`
	}

	public h2(header: string) {
		this.ephemerumFile.content += `\n## ${header}`
	}

	public h3(header: string) {
		this.ephemerumFile.content += `\n### ${header}`
	}

	public p(text: string) {
		this.ephemerumFile.content += `\n${text}`;
	}

	public generateObject(): EphemerumApiObject {
		return {
			"app": app,
			"table": (keys: string[], rows?: unknown[][]) => this.table(keys, rows),
			"h1": (header: string) => this.h1(header),
			"h2": (header: string) => this.h2(header),
			"h3": (header: string) => this.h3(header),
			"p": (text: string) => this.p(text),
		}
	}
}
