/* apiManager.js
 * - apiKeyManager
 * - apiModelManager
 * - apiModeManager
*/

import { storage, localStore } from "../storage.js";
import { settingsManager } from "./settingsManager.js";
import { popupMessage } from "../scripts.js";

export const apiKeyManager = {
	// METHODS
	async removeApiKey(callback) {
		await storage.remove("API_KEY");
		localStore.remove("apiKey");
		document.querySelector("#api-key").value = "";
		callback && callback();
	},

	async validApiKey(apiKey) {
		// not starts with sk-
		if (!apiKey.startsWith("sk-")) return {
			valid: false,
			message: "OpenAI API Key must start with <b>sk-</b>"
		}

		return await new Promise((resolve, reject) => {
			chrome.runtime.sendMessage({ type: "CHECK_API_KEY", apiKey }, response => {
				if (chrome.runtime.lastError) {
					return reject(chrome.runtime.lastError);
				}
				resolve(response);
			});	
		});
	},


	
	// HANDLERS
	apiKeyInputEvent(e) {
		const apiKeyInput = e.target;
		const apiKey = apiKeyInput.value?.trim();
		const saveButton = document.querySelector("#save-api-key");
		const removeButton = document.querySelector("#remove-api-key");
		const cancelButton = document.querySelector("#cancel-action-api-key");

		if (apiKey) {
			removeButton.classList.remove("button-disabled");
			if (apiKey !== apiKeyInput.dataset.original?.trim()) {
				saveButton.classList.remove("button-disabled");
				cancelButton.classList.remove("button-disabled");
			}
			else {
				saveButton.classList.add("button-disabled");
				cancelButton.classList.add("button-disabled");
			}
		}
		else {
			removeButton.classList.add("button-disabled");
			saveButton.classList.add("button-disabled");
		}
	},

	async apiKeySaveEvent() {
		const apiKey = document.querySelector("#api-key").value;
		const result = await apiKeyManager.validApiKey(apiKey);
		if (result.valid) {
			await storage.set("API_KEY", apiKey);
			localStore.set("apiKey", apiKey);
			chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
				chrome.tabs.sendMessage(tabs[0].id, {type: "SAVED_KEY", key: apiKey}, () => window.chrome.runtime.lastError);
			});

			await settingsManager.updateValue("extension-enabled", true);
			chrome.runtime.sendMessage({ type: "RELOAD" });

			await apiModeManager.swapAPIMode("personal");

			window.location.reload();
		}
		else {
			let error = result.message;

			if (result.status === 429) {
				error += " Please check <a href='apikey.html#update-tier'>here</a> how to solve this issue.";
			}

			popupMessage(document.body, error, "error");
		}
	},
	
	async apiKeyCopyEvent(e) {
		const apiKey = document.querySelector("#api-key");
		apiKey.select();
		if (window.navigator.clipboard) {
			await window.navigator.clipboard.writeText(apiKey.value);
			e.target.classList.add("icon-accent");
			setTimeout(() => e.target.classList.remove("icon-accent"), 1000);
		}
	},

	async apiKeyPasteEvent() {
		const apiKey = document.querySelector("#api-key");
		if (window.navigator.clipboard) {
			const text = await window.navigator.clipboard.readText();
			apiKey.value = text;
			apiKeyInput.dispatchEvent(new Event("input"));
		}
	},

	async apiKeyRemoveEvent() {
		confirm("Are you sure you want to remove the API key?") && await apiKeyManager.removeApiKey(() => {
			chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
				chrome.tabs.sendMessage(tabs[0].id, {type: "RESET"}, async () => {
					await storage.remove("API_KEY_PROMPT_CLOSED");
				});
			});

			window.location.reload();
		});
	},

	apiKeyCancelEvent() {
		const apiKeyElement = document.querySelector("#api-key");
		apiKeyElement.value = localStore.get("apiKey");
		apiKeyElement.dispatchEvent(new Event("input"));
	},
}


export const apiModelManager = {
	// HANDLERS
	async modelSelectEvent(e) {
		const model = e.target.value;
		await settingsManager.updateValue("model", model);
		chrome.runtime.sendMessage({ type: "SET_MODEL", model });
	}
}


export const apiModeManager = {
	// METHODS
	async swapAPIMode(mode) {
		const apiModeSelectedElement = document.querySelector(".api-mode-selected");

		if (mode) {
			apiModeSelectedElement?.classList.remove("api-mode-selected");
			document.querySelector(`.api-mode div[data-mode="${mode}"]`).classList.add("api-mode-selected");
			await storage.set("API_MODE", mode);

			if (mode === "personal") {
				const apiKeyWrapper = document.querySelector(".api-key-input");
				apiKeyWrapper?.style.removeProperty("opacity");
			}
		}
		else {
			mode = await storage.get("API_MODE")
				|| apiModeSelectedElement?.dataset.mode
				|| "free";

			swapAPIMode(mode);
		}
	},



	// HANDLERS
	async apiModeSelectEvent(e) {
		const apiKeyInputWrapper = document.querySelector(".api-key-input");
		const apiKeyInput = document.querySelector("#api-key");
		const modeSelectedElement = e.target.closest(".api-mode > div");
		const mode = modeSelectedElement?.dataset.mode;
		switch(mode) {
			case "personal":
				apiKeyInputWrapper.style.removeProperty("opacity");

				if (apiKeyInput.value)
					await apiModeManager.swapAPIMode(mode);
				else
					apiKeyInput.focus();

				break;
			case "free":
				apiKeyInputWrapper.style.opacity = 0.5;
				await apiModeManager.swapAPIMode(mode);
				break;
		}

		chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
			chrome.tabs.sendMessage(tabs[0].id, {type: "SET_MODE", mode}, () => window.chrome.runtime.lastError);
		});
	},

	apiModeHoverEvent(e) {
		const apiKeyInput = document.querySelector(".api-key-input");
		const modelSelected = e.target.closest(".api-mode > div");
		const mode = modelSelected?.dataset.mode;
		if (mode === "personal") {
			apiKeyInput.style.removeProperty("opacity");
		}
	},
	
	async apiModeOutEvent(e) {
		const apiKeyInput = document.querySelector(".api-key-input");
		const modelSelected = e.target.closest(".api-mode > div");
		const mode = modelSelected?.dataset.mode;
		if (mode === "personal") {
			const apiMode = await storage.get("API_MODE") || "free";
			if (apiMode !== "personal") apiKeyInput.style.opacity = 0.5;
		}
	},
}