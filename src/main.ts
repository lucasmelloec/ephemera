import { EphemerumFile } from 'ephemerum/ephemerum';
import { Plugin, TFile } from 'obsidian';
import { DEFAULT_SETTINGS, EphemeraSettings, EphemeraSettingTab } from './settings/settings';



export default class Ephemera extends Plugin {
	settings: EphemeraSettings;

	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new EphemeraSettingTab(this.app, this));

		// Register Events
		this.registerEvent(this.app.vault.on('modify', () => {}));
		this.registerEvent(this.app.workspace.on('file-open', (file) => this.fileOpenHook(file)));
	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	private fileOpenHook(file: TFile | null) {
		if(file) {
			if (EphemerumFile.isEphemerum(this.app, file)) {
				console.log("Ephemerum File opened")

				const userScript = EphemerumFile.getEphemerumUserScript(this.app, file);
				if(userScript) {
					const ephemerum = new EphemerumFile(file, this.settings.scriptsFolder, userScript);
					ephemerum.render(this.app);
				}
			}
		}
	}
}
