(() => {
	window.settings = new Settings(Settings.defaults, document.querySelector("#settings"), 'SETTINGS');
	window.settings.build();

	chrome.storage.sync.get(["SETTINGS", "API_KEY", "THEME"], data => {
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

		theme = data.THEME;
		if (theme) {
			document.documentElement.dataset.duoTheme = theme;
			localStorage.setItem("theme", theme);
		}
	});

	const apiKeyInput = document.querySelector("#api-key");
	const apiKeyRemove = document.querySelector("#remove-api-key");
	const apiKeySave = document.querySelector("#save-api-key");

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

	// theme select
	let theme = localStorage.getItem("theme");
	if (theme)
		document.documentElement.dataset.duoTheme = theme;

	// version
	let version = localStorage.getItem("version");
	if (version)
		document.querySelector("#version").innerText = "v"+version;

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
				chrome.tabs.sendMessage(tabs[0].id, {type: "RESET"}, () => window.chrome.runtime.lastError);
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
	apiKeySave.addEventListener("click", () => {
		const apiKey = document.querySelector("#api-key").value;
		if (apiKey) {
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

	chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
		console.log(request);
		if (request.type === "UPDATE_THEME") {
			document.documentElement.dataset.duoTheme = request.theme;
			localStorage.setItem("theme", request.theme);
		}
	});
})();

const removeApiKey = callback => {
	chrome.storage.sync.remove("API_KEY", () => {
		localStorage.removeItem("apiKey");
		document.querySelector("#api-key").value = "";
		callback && callback();
	});
}
