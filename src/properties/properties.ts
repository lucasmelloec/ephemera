import { App, TFile } from "obsidian";

type PropertiesObject = Record<string, unknown>;

export class Properties {
	public propertiesObject: PropertiesObject;

	private addToProperties(key: string, value: unknown) {
		if(this.propertiesObject[key]) {
			if(Array.isArray(this.propertiesObject[key])) {
				(this.propertiesObject[key] as unknown[]).push(value);
				this.propertiesObject[key] = (this.propertiesObject[key] as unknown[]).flat(1);
			}
			else {
				this.propertiesObject[key] = [this.propertiesObject[key], value];
				this.propertiesObject[key] = (this.propertiesObject[key] as unknown[]).flat(1);
			}
		}
		else {
			this.propertiesObject[key] = value;
		}
	}

	private parseFrontmatter(app: App, file: TFile) {
		const fileCache = app.metadataCache.getFileCache(file);

		if(fileCache) {
			const {position, tags, ...fileFrontmatter} = fileCache.frontmatter;

			if(fileFrontmatter) {
				for(const key in fileFrontmatter) {
					this.addToProperties(key, fileFrontmatter[key]);
				}
			}
		}
	}

	private async parseInlineFields(app: App, file: TFile) {
        const content = await app.vault.cachedRead(file);

        for(const line of content.split("\n")) {
			const parts = line.split("::");

			if (parts[0] && parts[1]) {
				this.addToProperties(parts[0], parts[1].trim());
			}
			else if (line.includes("::")) {
				const key: string = line.replace("::",'');
				this.addToProperties(key, "");
			}
		}
    }

	private getTagsForFile(app: App, file: TFile) {
		const fileCache = app.metadataCache.getFileCache(file);

		if (fileCache) {
			if (fileCache.tags) {
				this.addToProperties('tags', fileCache.tags.map(t => t.tag.substring(1)));
			}
			const {tags} = fileCache.frontmatter;

			if(tags) {
				this.addToProperties('tags', tags);
			}
		}
	}

	public async getPropertiesInFile(app: App, file: TFile) {
        this.parseFrontmatter(app, file);
        await this.parseInlineFields(app, file);
        this.getTagsForFile(app, file);
    }
}
