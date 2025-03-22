import { browserStore, localStore } from "../storage.js";
import { SettingsComponent } from "/scripts/settings.js";
import { urls, storage } from "/scripts/config.js";

class SettingsManager {
	constructor() {
		this.settings = new SettingsComponent(
			null, // use defaults
			document.querySelector("#settings"),
			'SETTINGS',
			{
				"duolingo": urls.DUOLINGO,
				"assets": urls.ASSETS,
			},
			storage
		);
		this.settings.build();
	}

	async loadFromStorage() {
		return new Promise((resolve, reject) => {
			storage.get(["SETTINGS", "API_KEY", "API_MODE", "UI_LANGUAGE"], async data => {
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
			API_MODE: localStore.get("apiMode") || "free",
			UI_LANGUAGE: localStore.get("uiLanguage"),
			VERSION: localStore.get("version"),
			SETTINGS: {
				model: localStore.get("model"),
			}
		};

	}

	async updateValue(key, value) {
		const settingsData = await browserStore.get("SETTINGS");
		settingsData[key] = value;
		await browserStore.set("SETTINGS", settingsData); 
	}
}

export const settingsManager = new SettingsManager();