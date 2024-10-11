class Settings {
	constructor(settings, wrapper, storeKey) {
		this.settings = settings;
		this.wrapper = wrapper;
		this.storeKey = storeKey;

		if (this.wrapper) {
			chrome.storage.sync.get([this.storeKey], result => {
				const settings = result[this.storeKey];
				if (settings) {
					this.update(settings);
				}
			});
		}
	}

	static defaults = [
		{
			type: "checkbox",
			label: "Extension enabled",
			description: "Enable or disable the possibility to query ChatGPT for explanations.",
			default: true,
			key: "extension-enabled"
		},
		{
			type: "checkbox",
			label: "Explanation typing animation",
			description: "Typing animation with the response from ChatGPT.",
			default: true,
			key: "typing-animation"
		},
		{
			type: "select",
			label: "GPT model",
			description: "The model to use with ChatGPT.",
			default: "gpt-4o-mini",
			options: [
				"chatgpt-4o-latest",
				"gpt-3.5-turbo",
				"gpt-4o-mini",
				"gpt-4o",
				"gpt-4",
				"gpt-4-turbo",
			],
			key: "model"
		},
		{
			type: "select",
			label: "Explanation language",
			description: "The language that ChatGPT will use to explain the exercise.",
			default: "Auto",
			options: [
				"Auto",
				"Bahasa Ind.",
				"Čeština",
				"Deutsch",
				"English",
				"Español",
				"Français",
				"Italiano",
				"Magyar",
				"Nederlands",
				"Polski",
				"Português",
				"Română",
				"Tagalog",
				"Tiếng Việt",
				"Türkçe",
				"Ελληνικά",
				"Русский",
				"Українською",
				"العربية",
				"हिंदी",
				"বাংলা",
				"తెలుగు",
				"ภาษาไทย",
				"한국어",
				"中文",
				"日本語"
			],
			key: "language"
		}
	];

	build() {
		let html = "";
		this.settings.forEach(setting => {
			switch (setting.type) {
				case "checkbox":
					html += Settings.buildCheckbox(setting);
					break;
				case "select":
					html += Settings.buildSelect(setting);
					break;
			}
		});
		this.wrapper.insertAdjacentHTML("beforeend", html);
	
		// add event listeners
		document.addEventListener("click", e => {
			const target = e.target;
	
			if (target.closest(".d-cgpt-custom-checkbox")) {
				const checkbox = target.closest(".d-cgpt-custom-checkbox").querySelector("input");
				checkbox.click();

				switch (checkbox.id) {
					case "d-cgpt-extension-enabled":
						chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
							chrome.tabs.sendMessage(tabs[0].id, {type: "TOGGLE_EXTENSION", value: checkbox.checked}, () => window.chrome.runtime.lastError);
						});
						break;
				}
			}
		});
	
		document.addEventListener("change", e => {
			const target = e.target;
	
			if (target.closest("input[type='checkbox']")) {
				const checkbox = target.closest("input[type='checkbox']");
				if (target.parentElement.classList.contains("d-cgpt-custom-checkbox")) {
					if (checkbox.checked) {
						target.closest(".d-cgpt-settings-checkbox").classList.add("d-cgpt-settings-enabled");
					}
					else {
						target.closest(".d-cgpt-settings-checkbox").classList.remove("d-cgpt-settings-enabled");
					}
					
					chrome.storage.sync.get([this.storeKey], result => {
						const settings = result[this.storeKey] || {};
						settings[target.id.replace("d-cgpt-", "")] = checkbox.checked;
						chrome.storage.sync.set({ [this.storeKey]: settings });
					});
				}
			}

			if (target.closest("select")) {
				const select = target.closest("select");
				chrome.storage.sync.get([this.storeKey], result => {
					const settings = result[this.storeKey] || {};
					settings[select.id.replace("d-cgpt-", "")] = select.value;
					chrome.storage.sync.set({ [this.storeKey]: settings });
				});
			}
		});
	}

	update(settings) {
		Object.keys(settings).forEach(key => {
			const setting = this.wrapper.querySelector(`#d-cgpt-${key}`);
			if (setting) {
				switch (setting.dataset.type) {
					case "checkbox":
						if (settings[key] && !setting.checked) {
							setting.click();
						}
						break;
					case "select":
						setting.value = settings[key];
						break;
				}
			}
		});
	}

	setDefaults() {
		chrome.storage.sync.get([this.storeKey], result => {
			const storedSettings = result[this.storeKey] || {};
			// only set defaults for settings that are not already stored
			const defaulted = {};
			Settings.defaults.forEach(setting => {
				if (!storedSettings.hasOwnProperty(setting.key)) {
					defaulted[setting.key] = setting.default;
				}
			});
			chrome.storage.sync.set({ [this.storeKey]: { ...storedSettings, ...defaulted } });
		});
	}


	static buildCheckbox(setting) {
		return /* html */ `
			<div class="d-cgpt-settings d-cgpt-settings-checkbox" title="${setting.description}">
				<label for="d-cgpt-${setting.key}">${setting.label} <div>${setting.description}</div></label>
				<div class="d-cgpt-custom-checkbox">
					<input data-type="checkbox" type="checkbox" id="d-cgpt-${setting.key}">
					<div class="d-cgpt-custom-checkbox-back"></div>
					<div class="d-cgpt-custom-checkbox-ball"></div>
				</div>
			</div>
		`;
	}

	static buildSelect(setting) {
		let options = "";
		setting.options.forEach(option => {
			options += `<option value="${option}">${option}</option>`;
		});
		return /* html */ `
			<div class="d-cgpt-settings d-cgpt-settings-select" title="${setting.description}">
				<label for="d-cgpt-${setting.key}">${setting.label} <div>${setting.description}</div></label>
				<select data-type="select" id="d-cgpt-${setting.key}">
					${options}
				</select>
			</div>
		`;
	}
}

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = Settings;
} else if (typeof window !== "undefined") {
    window.Settings = Settings;
}