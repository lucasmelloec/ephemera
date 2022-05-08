import { TFile, App } from "obsidian";
import { EphemerumFile } from "./ephemerum";

type RenderFunction = (api: unknown) => void

export class UserScript {
	private filename: string;

	constructor(scriptsFolder: string, filename: string) {
		this.filename = `${scriptsFolder}/${filename}.js`;
	}

	private async loadUserScript(app: App): Promise<RenderFunction | null> {
		const file = app.vault.getAbstractFileByPath(this.filename);
		if(file && file instanceof TFile) {
			const fileContent = await app.vault.read(file);

			try {
				const req = (s: string) => window.require && window.require(s);
				const exp: Record<string, unknown> = {};
				const mod = { exports: exp };

				const fn = window.eval(`(function(require, module, exports){${fileContent}})`);

				fn(req, mod, exp);
				const temp = exp['default'] || mod.exports;
				if(typeof temp === 'function') {
					return (temp as RenderFunction);
				}
			}
			catch(e) {
				console.error(e);
			}
		}

		return null;
	}

	public async render(app: App, ephemerumFile: EphemerumFile) {
		const renderFn = await this.loadUserScript(app);
		if(renderFn) {
			renderFn(ephemerumFile.api.generateObject());
		}
	}
}
