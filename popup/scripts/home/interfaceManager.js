import { localStore } from "../storage.js";
import { apiKeyManager, apiModeManager, apiModelManager } from "./apiManager.js";

export const interfaceManager = {
	setupEventHandlers() {
		// API
		const apiKeyMode = document.querySelector(".api-mode");
	
		apiKeyMode		.addEventListener("click", apiModeManager.apiModeSelectEvent);
		apiKeyMode		.addEventListener("mouseover", apiModeManager.apiModeHoverEvent);
		apiKeyMode		.addEventListener("mouseout", apiModeManager.apiModeOutEvent);
	
		const apiKeyInput = document.querySelector("#api-key");
		const saveApiKey = document.querySelector("#save-api-key");
		const copyApiKey = document.querySelector("#copy-api-key");
		const pasteApiKey = document.querySelector("#paste-api-key");
		const removeApiKey = document.querySelector("#remove-api-key");
		const cancelApiKey = document.querySelector("#cancel-action-api-key");
	
		saveApiKey		.addEventListener("click", apiKeyManager.apiKeySaveEvent);
		copyApiKey		.addEventListener("click", apiKeyManager.apiKeyCopyEvent);
		pasteApiKey		.addEventListener("click", apiKeyManager.apiKeyPasteEvent);
		removeApiKey	.addEventListener("click", apiKeyManager.apiKeyRemoveEvent);
		cancelApiKey	.addEventListener("click", apiKeyManager.apiKeyCancelEvent);
		apiKeyInput		.addEventListener("input", apiKeyManager.apiKeyInputEvent);
	
	
		
		// MODEL
		const modelSelect = document.querySelector("#d-cgpt-model");
		
		modelSelect		.addEventListener("change", apiModelManager.modelSelectEvent);


		// SETTINGS
		const settings = document.querySelector("#settings");
		settings 		.addEventListener("change", interfaceManager.settingsChangeEvent);
	},

	setDefaults(data) {
		// api key
		const apiMode = data.API_MODE || "free";
		const apiKey = data.API_KEY;
		const apiKeyInput = document.querySelector("#api-key");
		const apiKeyRemove = document.querySelector("#remove-api-key");
		const apiKeySave = document.querySelector("#save-api-key");

		if (apiKey) {
			document.querySelector("#api-key").value = apiKey;
			localStore.set("apiKey", apiKey);
			apiModeManager.swapAPIMode(apiMode);

			apiKeyInput.value = apiKey;
			apiKeyInput.dataset.original = apiKey;

			apiKeyRemove.classList.remove("button-disabled");
			apiKeySave.classList.add("button-disabled");
		}
		else {
			if (apiMode === "personal")
				apiModeManager.swapAPIMode("free");

			apiKeyRemove.classList.add("button-disabled");
			apiKeySave.classList.remove("button-disabled");
		}

		// model select
		const model = data.SETTINGS?.model ||  SettingsComponent.defaults.find(setting => setting.key === "model").default;
		const modelSelect = document.querySelector("#d-cgpt-model");
		modelSelect.value = model;
		localStore.set("model", model);

		// explanation language select
		const uiLanguage = data.UI_LANGUAGE;
		if (uiLanguage) {
			localStore.set("uiLanguage", uiLanguage);
			const languageSelect = document.querySelector("#d-cgpt-language");
			const autoOption = languageSelect.querySelector("option[value='Auto']");
			autoOption.textContent = "Auto ("+uiLanguage+")";
		}

		// version
		const version = data.VERSION;
		if (version) {
			localStore.set("version", version);
			document.querySelector("#version").innerText = "v"+version;
			const versionLink =	document.querySelector(".version");
			versionLink.href = versionLink.href.replace("v0.0.0", "v"+version); 
			versionLink.title = versionLink.title.replace("v0.0.0", "v"+version);
		}

		// app language
		const appLanguage = data.SETTINGS["app-language"] || "en-rUS";
		window.languageManager.changeLanguage(window.languageManager.getLanguageID(appLanguage));

	},

	settingsChangeEvent(e) {
		const target = e.target;
		if (target.closest("select")) {
			const select = target.closest("select");
			switch(select.id) {
				case "d-cgpt-app-language":
					const lang = select.value;
					const langLabel = window.languageManager.getLanguageID(lang);
					if (langLabel)
						window.languageManager.changeLanguage(langLabel);
					break;
			}
		}
	}
};