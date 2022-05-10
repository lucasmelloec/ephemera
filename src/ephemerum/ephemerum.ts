import { App, TFile } from "obsidian";
import { EphemerumApi } from "./api";
import { UserScript } from "./userScript";

export class EphemerumFile {
	private file: TFile;
	private userScript: UserScript;
	public dirty: boolean;
	public content: string;
	public api: EphemerumApi;

	constructor(file: TFile, scriptsFolder: string, userScriptFilename: string) {
		this.file = file;
		this.userScript = new UserScript(scriptsFolder, userScriptFilename);
		this.dirty = true;
		this.content = '---\n' +
						`ephemera: ${userScriptFilename}\n` +
						'---\n';
		this.api = new EphemerumApi(this);
	}

	public async render(app: App) {
		if(this.dirty) {
			await this.userScript.render(app, this);

			if(this.content[-1] !== '\n') {
				this.content += '\n';
			}
			
			await app.vault.modify(this.file, this.content);

			this.dirty = false;
		}
	}

	public static isEphemerum(app: App, file: TFile): boolean {
		const fileCache = app.metadataCache.getFileCache(file);

		if(fileCache) {
			const {...fileFrontmatter} = fileCache.frontmatter;

			if(fileFrontmatter) {
				if("ephemera" in fileFrontmatter) {
					return true;
				}
			}
		}

		return false;
	}

	public static getEphemerumUserScript(app: App, file: TFile): string | null {
		const fileCache = app.metadataCache.getFileCache(file);

		if(fileCache) {
			const {...fileFrontmatter} = fileCache.frontmatter;

			if(fileFrontmatter) {
				if("ephemera" in fileFrontmatter) {
					return fileFrontmatter["ephemera"];
				}
			}
		}

		return null;
	}
}
