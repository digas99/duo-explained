(() => {
	window.settings = new Settings(Settings.defaults, document.querySelector("#settings"), 'SETTINGS');
	window.settings.build();

	chrome.storage.sync.get(["SETTINGS", "API_KEY", "UI_LANGUAGE"], data => {
		const settings = data.SETTINGS || {};
		window.settings.update(settings);

		apiKey = data.API_KEY;
		if (apiKey) {
			document.querySelector("#api-key").value = apiKey;
			localStorage.setItem("apiKey", apiKey);
		}
		else {
			const extensionEnabled = document.querySelector("#d-cgpt-extension-enabled");
			if (extensionEnabled.checked) {
				extensionEnabled.click();
			}
			extensionEnabled.closest(".d-cgpt-settings-checkbox").style.pointerEvents = "none";
		}

		model = settings["model"];
		if (model) {
			document.querySelector("#d-cgpt-model").value = model;
			localStorage.setItem("model", model);
		}
		else {
			document.querySelector("#d-cgpt-model").value = Settings.defaults.find(setting => setting.key === "model").default;
		}

		uiLanguage = data.UI_LANGUAGE;
		if (uiLanguage) {
			localStorage.setItem("uiLanguage", uiLanguage);
			const autoOption = languageSelect.querySelector("option[value='Auto']");
			autoOption.textContent = "Auto ("+uiLanguage+")";
		}
	});

	const apiKeyInput = document.querySelector("#api-key");
	const apiKeyRemove = document.querySelector("#remove-api-key");
	const apiKeySave = document.querySelector("#save-api-key");
	const languageSelect = document.querySelector("#d-cgpt-language");

	// api key input
	let apiKey = localStorage.getItem("apiKey");
	if (apiKey) {
		apiKeyInput.value = apiKey;
		apiKeyInput.dataset.original = apiKey;
	}
	else {
		apiKeyRemove.classList.add("button-disabled");
		apiKeySave.classList.remove("button-disabled");
	}

	// model select
	const modelSelect = document.querySelector("#d-cgpt-model");
	let model = localStorage.getItem("model");
	if (model)
		modelSelect.value = model;

	// version
	let version = localStorage.getItem("version");
	if (version)
		document.querySelector("#version").innerText = "v"+version;

	// ui language
	let uiLanguage = localStorage.getItem("uiLanguage");
	if (uiLanguage) {
		const autoOption = languageSelect.querySelector("option[value='Auto']");
		autoOption.textContent = "Auto ("+uiLanguage+")";
	}

	fetch("/manifest.json")
		.then(response => response.json())
		.then(data => {
			version = data.version;
			document.querySelector("#version").innerText = "v"+version;
			localStorage.setItem("version", version);
		});


	// api key copy button
	const copyApiKey = document.querySelector("#copy-api-key");
	copyApiKey.addEventListener("click", async () => {
		const apiKey = document.querySelector("#api-key");
		apiKey.select();
		if (window.navigator.clipboard) {
			await window.navigator.clipboard.writeText(apiKey.value);
			copyApiKey.classList.add("icon-accent");
			setTimeout(() => copyApiKey.classList.remove("icon-accent"), 1000);
		}
	});

	// api key buttons
	apiKeyRemove.addEventListener("click", () => {
		confirm("Are you sure you want to remove the API key?") && removeApiKey(() => {
			chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
				chrome.tabs.sendMessage(tabs[0].id, {type: "RESET"}, () => {
					chrome.storage.sync.remove("API_KEY_PROMPT_CLOSED");
				});
			});

			window.location.reload();
		});
	});

	// api key input
	apiKeyInput.addEventListener("input", () => {
		if (apiKeyInput.value) {
			apiKeyRemove.classList.remove("button-disabled");
			if (apiKeyInput.value !== apiKeyInput.dataset.original)
				apiKeySave.classList.remove("button-disabled");
			else
				apiKeySave.classList.add("button-disabled");
		}
		else {
			apiKeyRemove.classList.add("button-disabled");
			apiKeySave.classList.add("button-disabled");
		}
	});

	// api key save button
	apiKeySave.addEventListener("click", async () => {
		const apiKey = document.querySelector("#api-key").value;
		if (apiKey) {
			const result = await validApiKey(apiKey);
			if (result.valid) {
				chrome.storage.sync.set({ API_KEY: apiKey }, () => {
					localStorage.setItem("apiKey", apiKey);
					chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
						chrome.tabs.sendMessage(tabs[0].id, {type: "SAVED_KEY", key: apiKey}, () => window.chrome.runtime.lastError);
					});

					chrome.storage.sync.get("SETTINGS", data => {
						const settings = data.SETTINGS || {};
						settings["extension-enabled"] = true;
						chrome.storage.sync.set({ SETTINGS: settings }, () => chrome.runtime.sendMessage({ type: "RELOAD" }));
					});
				});

				window.location.reload();
			}
			else {
				let error = result.message;

				if (result.status === 429) {
					error += " Please check <a href='apikey.html#update-tier'>here</a> how to solve this issue.";
				}

				popupMessage(document.body, error, "error");
			}
		}
	});

	// model select
	modelSelect.addEventListener("change", () => {
		const model = modelSelect.value;
		chrome.storage.sync.get("SETTINGS", data => {
			const settings = data.SETTINGS || {};
			settings["model"] = model;
			chrome.storage.sync.set({ SETTINGS: settings }, () => chrome.runtime.sendMessage({ type: "SET_MODEL", model: model }));
		});
	});

	const validApiKey = async apiKey => {
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
	}
})();

const removeApiKey = callback => {
	chrome.storage.sync.remove("API_KEY", () => {
		localStorage.removeItem("apiKey");
		document.querySelector("#api-key").value = "";
		callback && callback();
	});
}
