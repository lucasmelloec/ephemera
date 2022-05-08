import { App, TFile } from "obsidian";

type Property = Record<string, unknown>;

export class Properties {
	private static addToProperties(properties: Property, key: string, value: unknown) {
		if(properties[key]) {
			if(Array.isArray(properties[key])) {
				(properties[key] as unknown[]).push(value);
				properties[key] = (properties[key] as unknown[]).flat(1);
			}
			else {
				properties[key] = [properties[key], value];
				properties[key] = (properties[key] as unknown[]).flat(1);
			}
		}
		else {
			properties[key] = value;
		}
	}

	private static parseFrontmatter(app: App, file: TFile): Property {
		const properties: Property = {};

		const fileCache = app.metadataCache.getFileCache(file);

		if(fileCache) {
			const {position, tags, ...fileFrontmatter} = fileCache.frontmatter;

			if(fileFrontmatter) {
				for(const key in fileFrontmatter) {
					this.addToProperties(properties, key, fileFrontmatter[key]);
				}
			}
		}

		return properties;
	}

	private static async parseInlineFields(app: App, file: TFile): Promise<Property> {
        const content = await app.vault.cachedRead(file);

        return content.split("\n").reduce((obj: Property, str: string) => {
            const parts = str.split("::");

            if (parts[0] && parts[1]) {
				this.addToProperties(obj, parts[0], parts[1].trim());
            }
            else if (str.includes("::")) {
                const key: string = str.replace("::",'');
                this.addToProperties(obj, key, "");
            }

            return obj;
        },  {});
    }

	private static getTagsForFile(app: App, file: TFile): Property {
		const properties: Property = {};

		const fileCache = app.metadataCache.getFileCache(file);

		console.log(fileCache);

		if (fileCache) {
			if (fileCache.tags) {
				this.addToProperties(properties, 'tags', fileCache.tags.map(t => t.tag.substring(1)));
			}
			const {tags} = fileCache.frontmatter;

			if(tags) {
				this.addToProperties(properties, 'tags', tags);
			}
		}

		return properties;
	}

	public static async getPropertiesInFile(app: App, file: TFile): Promise<Property> {
        const yaml = this.parseFrontmatter(app, file);
        const inlineFields = await this.parseInlineFields(app, file);
        const tags = this.getTagsForFile(app, file);

        return {...tags, ...yaml, ...inlineFields};
    }
}
