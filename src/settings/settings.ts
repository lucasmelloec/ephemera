import { App, PluginSettingTab, Setting } from "obsidian";
import Ephemera from "main";
import { FolderSuggest } from "./suggester/FolderSuggester";

export interface EphemeraSettings {
	scriptsFolder: string;
}

export const DEFAULT_SETTINGS: Partial<EphemeraSettings> = {}

export class EphemeraSettingTab extends PluginSettingTab {
	plugin: Ephemera;

	constructor(app: App, plugin: Ephemera) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Scripts Folder')
			.setDesc('Folder where your scripts are located')
			.addSearch(cb => {
				new FolderSuggest(this.app, cb.inputEl);
				cb.setPlaceholder("Folder1/Folder2")
					.setValue(this.plugin.settings.scriptsFolder)
					.onChange(async folder => {
						this.plugin.settings.scriptsFolder = folder;
						await this.plugin.saveSettings();
					});
			});
	}
}
