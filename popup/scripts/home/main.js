import { settingsManager } from "./settingsManager.js";
import { setupEventHandlers } from "./eventHandlers.js";
import { localStore } from "../storage.js";
import { apiModeManager } from "./apiManager.js";

(async () => {
	const setDefaults = data => {
		// api key
		const apiMode = data.API_MODE || "free";
		const apiKey = data.API_KEY;
		const apiKeyInput = document.querySelector("#api-key");
		const apiKeyRemove = document.querySelector("#remove-api-key");
		const apiKeySave = document.querySelector("#save-api-key");

		console.log(apiKey, apiMode);
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

		// ui language select
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
	};

	// render values from local storage
	setDefaults(settingsManager.loadFromLocal());
	// update values from browser storage
	setDefaults(await settingsManager.loadFromStorage());

	setupEventHandlers();
})();
