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

		if (apiKey) {
			document.querySelector("#api-key").value = apiKey;
			localStore.set("apiKey", apiKey);
			if (apiMode === "personal")
				apiModeManager.swapAPIMode("personal");

			apiKeyInput.value = apiKey;
			apiKeyInput.dataset.original = apiKey;
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
		if (version)
			document.querySelector("#version").innerText = "v"+version;
	};

	// render values from local storage
	setDefaults(settingsManager.loadFromLocal());
	// update values from browser storage
	setDefaults(await settingsManager.loadFromStorage());

	setupEventHandlers();
})();
