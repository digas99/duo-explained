import { apiKeyManager, apiModeManager, apiModelManager } from "./apiManager.js";

export function setupEventHandlers() {
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
}