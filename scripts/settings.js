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
			description: "The model to use for with ChatGPT.",
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
					// html += Settings.buildSelect(setting);
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
				console.log(target, checkbox.checked);
				if (target.parentElement.classList.contains("d-cgpt-custom-checkbox")) {
					if (checkbox.checked) {
						target.closest(".d-cgpt-settings-checkbox").classList.add("d-cgpt-settings-checkbox-enabled");
					}
					else {
						target.closest(".d-cgpt-settings-checkbox").classList.remove("d-cgpt-settings-checkbox-enabled");
					}
					
					chrome.storage.sync.get([this.storeKey], result => {
						const settings = result[this.storeKey] || {};
						settings[target.id.replace("d-cgpt-", "")] = checkbox.checked;
						chrome.storage.sync.set({ [this.storeKey]: settings });
					});
				}
			}
		});
	}

	update(settings) {
		Object.keys(settings).forEach(key => {
			const setting = this.wrapper.querySelector(`#d-cgpt-${key}`);
			if (setting) {
				switch (setting.type) {
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
			<div class="d-cgpt-settings-checkbox" title="${setting.description}">
				<label for="d-cgpt-${setting.key}">${setting.label} <div>${setting.description}</div></label>
				<div class="d-cgpt-custom-checkbox">
					<input type="checkbox" id="d-cgpt-${setting.key}">
					<div class="d-cgpt-custom-checkbox-back"></div>
					<div class="d-cgpt-custom-checkbox-ball"></div>
				</div>
			</div>
		`;
	}
}

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = Settings;
} else if (typeof window !== "undefined") {
    window.Settings = Settings;
}