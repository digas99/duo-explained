import { storage, localStore } from "../storage.js";

class SettingsManager {
	constructor() {
		this.settings = new SettingsComponent(SettingsComponent.defaults, document.querySelector("#settings"), 'SETTINGS');
		this.settings.build();
	}

	async loadFromStorage() {
		return new Promise((resolve, reject) => {
			chrome.storage.sync.get(["SETTINGS", "API_KEY", "API_MODE", "UI_LANGUAGE"], async data => {
				this.settings.update(data.SETTINGS || {});
				
				const version = await fetch("/manifest.json").then(response => response.json()).then(data => data.version);
				data.VERSION = version;

				resolve(data);
			});
		});		
	}

	loadFromLocal() {
		return {
			API_KEY: localStore.get("apiKey"),
			UI_LANGUAGE: localStore.get("uiLanguage"),
			VERSION: localStore.get("version"),
			SETTINGS: {
				model: localStore.get("model"),
			}
		};

	}

	async updateValue(key, value) {
		const settingsData = await storage.get("SETTINGS");
		settingsData[key] = value;
		await storage.set("SETTINGS", settingsData); 
	}
}

export const settingsManager = new SettingsManager();