export class SettingsComponent {
	constructor(settings, wrapper, storeKey, urls, storage) {
		this.wrapper = wrapper;
		this.storeKey = storeKey;
		this.urls = urls;
		this.storage = storage;
		
		this.defaults = [
			{
				type: "checkbox",
				group: "",
				label: {
					value: "Extension enabled",
					i18n: "settingsExtEnabled"
				},
				description: {
					value: "Enable or disable the possibility to query ChatGPT for explanations.",
					i18n: "settingsEnabledDescription"
				},
				default: true,
				key: "extension-enabled"
			},
			{
				type: "checkbox",
				group: "lessons",
				label: {
					value: "Explanation typing animation",
					i18n: "settingsTypingAnimation"
				},
				description: {
					value: "Typing animation with the response from ChatGPT.",
					i18n: "settingsTypingAnimationDescription"
				},
				default: true,
				key: "typing-animation"
			},
			{
				type: "select",
				group: "lessons",
				label: {
					value: "GPT model",
					i18n: "settingsGptModel"
				},
				description: {
					value: "The model to use with ChatGPT.",
					i18n: "settingsGptModelDescription"
				},
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
				group: "lessons",
				label: {
					value: "Explanation language",
					i18n: "settingsExplanationLanguage"
				},
				description: {
					value: "The language that ChatGPT will use to explain the exercise.",
					i18n: "settingsExplanationLanguageDescription"
				},
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
			},
			{
				type: "checkbox",
				group: "mobile",
				label: {
					value: "Remove Continue in App",
					i18n: "settingsRemoveContinueInApp"
				},
				description: {
					value: "Remove constant prompt asking to continue in the app.",
					i18n: "settingsRemoveContinueInAppDescription"
				},
				default: true,
				key: "remove-continue-app"
			},
			{
				type: "checkbox",
				group: "mobile",
				label: {
					value: "Extension Icon",
					i18n: "settingsExtensionIcon"
				},
				description: {
					value: "Show the extension icon in the toolbar (this might cause overflow).",
					i18n: "settingsExtensionIconDescription"
				},
				default: true,
				key: "mobile-extension-icon"
			},
			{
				type: "checkbox",
				group: "lessons",
				label: {
					value: "Show used Tokens in Stats",
					i18n: "settingsTokensUsed"
				},
				description: {
					value: "Show the number of tokens used throughout a lesson in the stats at the end.",
					i18n: "settingsTokensUsedDescription"
				},
				default: true,
				key: "show-used-tokens"
			},
			{
				type: "external",
				group: "app",
				label: {
					value: "Extension Theme",
					i18n: "settingsExtensionTheme"
				},
				description: {
					value: "Change between light and dark mode. It will match the theme of the Duolingo website.",
					i18n: "settingsExtensionThemeDescription"
				},
				link: `${this.urls.duolingo}/settings/account#:~:text=Appearance-,Dark%20mode,-ON`,
				key: "extension-theme"
			},
			{
				type: "select",
				group: "app",
				label: {
					value: "App Language",
					i18n: "settingsAppLanguage"
				},
				description: {
					value: "The language of this Extension's interface.",
					i18n: "settingsAppLanguageDescription"
				},
				default: "English (US)",
				options: [
					"العربية",
					"English (US)",
					"Français",
					"Português",
					"Português (Brasil)",
					"Русский"
				],
				key: "app-language"
			},
		];

		settings = settings || this.defaults;

		console.log(this);

		// group settings by 'group' key
		if (typeof settings.reduce === "function") {
			this.settings = settings.reduce((acc, setting) => {
				const group = setting.group || "general";
				if (!acc[group]) {
					acc[group] = [];
				}
				acc[group].push(setting);
				return acc;
			}, {});
		}

		if (this.wrapper) {
			this.storage.get([this.storeKey], result => {
				const settings = result[this.storeKey];
				if (settings) {
					this.update(settings);
				}
			});
		}
	}

	static groups = {
		general: {
			value: "General",
			order: 0,
		},
		lessons: {
			value: "Lessons",
			i18n: "settingsLessonsLabel",
			order: 1,
		},
		app: {
			value: "App",
			i18n: "settingsAppLabel",
			order: 2,
		},
		mobile: {
			value: "Mobile",
			i18n: "settingsMobileLabel",
			order: 3,
		},
	}

	build() {
		let html = "";

		const groups = Object.keys(this.settings).sort((a, b) => SettingsComponent.groups[a].order - SettingsComponent.groups[b].order);
		groups.forEach(group => {
			let groupHtml = "";
			this.settings[group].forEach(setting => {
				switch (setting.type) {
					case "checkbox":
						groupHtml += SettingsComponent.buildCheckbox(setting);
						break;
					case "select":
						groupHtml += SettingsComponent.buildSelect(setting);
						break;
					case "external":
						groupHtml += SettingsComponent.buildExternal(setting, `${this.urls.assets}/icons/foreign.png`);
						break;
				}
			});
			const groupData = SettingsComponent.groups[group];
			html += /* htmy: Explanation typing animationl */ `
				<div class="d-cgpt-settings-group" data-type="${group}">
					${group === "general" ? "" : `<h3 data-i18n="${groupData.i18n}">${groupData.value}</h3>`}
					${groupHtml}
				</div>
			`;
		});

		this.wrapper.insertAdjacentHTML("beforeend", html);

		let clickTarget = this.wrapper;

		// put general on top
		if (this.wrapper.parentElement.querySelector(".element")) {
			const general = this.wrapper.querySelector(".d-cgpt-settings-group[data-type='general']");
			this.wrapper.parentElement.insertBefore(general, this.wrapper.parentElement.querySelector(".element").previousElementSibling);
			clickTarget = document;
		}
	
		// add event listeners
		clickTarget.addEventListener("click", e => {
			const target = e.target;
	
			if (target.closest(".d-cgpt-custom-checkbox")) {
				const checkbox = target.closest(".d-cgpt-custom-checkbox").querySelector("input");
				checkbox.click();

				switch (checkbox.id) {
					case "d-cgpt-extension-enabled":
						if (chrome.tabs) {
							chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
								chrome.tabs.sendMessage(tabs[0].id, {type: "TOGGLE_EXTENSION", value: checkbox.checked}, () => window.chrome.runtime.lastError);
							});
						} else {
							this.storage.get("API_KEY", data =>
								window.toggleExtension(data.API_KEY && checkbox.checked)
							);
						}
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
					
					this.storage.get([this.storeKey], result => {
						const settings = result[this.storeKey] || {};
						settings[target.id.replace("d-cgpt-", "")] = checkbox.checked;
						this.storage.set({ [this.storeKey]: settings });
					});
				}
			}

			if (target.closest("select")) {
				const select = target.closest("select");
				this.storage.get([this.storeKey], result => {
					const settings = result[this.storeKey] || {};
					settings[select.id.replace("d-cgpt-", "")] = select.value;
					this.storage.set({ [this.storeKey]: settings });
				});
			}
		});
	}

	update(settings) {
		Object.keys(settings).forEach(key => {
			const setting = document.body.querySelector(`#d-cgpt-${key}`);
			if (setting) {
				switch (setting.dataset.type) {
					case "checkbox":
						console.log("CLICKED", settings[key], setting.checked);
						if (settings[key] && !setting.checked) {
							setting.closest(".d-cgpt-settings-checkbox").classList.add("d-cgpt-settings-enabled");	
							setting.checked = true;
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
		this.storage.get([this.storeKey], result => {
			const storedSettings = (result && result[this.storeKey]) || {};
			// only set defaults for settings that are not already stored
			const defaulted = {};
			this.defaults.forEach(setting => {
				if (!storedSettings.hasOwnProperty(setting.key)) {
					defaulted[setting.key] = setting.default;
				}
			});
			this.storage.set({ [this.storeKey]: { ...storedSettings, ...defaulted } });
		});
	}


	static buildCheckbox(setting) {
		return /* html */ `
			<div class="d-cgpt-settings d-cgpt-settings-checkbox" title="${setting.description.value}">
				<label for="d-cgpt-${setting.key}"><span data-i18n="${setting.label.i18n}">${setting.label.value}</span> <div data-i18n="${setting.description.i18n}">${setting.description.value}</div></label>
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
			<div class="d-cgpt-settings d-cgpt-settings-select" title="${setting.description.value}">
				<label for="d-cgpt-${setting.key}"><span data-i18n="${setting.label.i18n}">${setting.label.value}</span> <div data-i18n="${setting.description.i18n}">${setting.description.value}</div></label>
				<select data-type="select" id="d-cgpt-${setting.key}">
					${options}
				</select>
			</div>
		`;
	}

	static buildExternal(setting, iconSource) {
		return /* html */ `
			<a href="${setting.link}" target="_blank" class="d-cgpt-settings d-cgpt-settings-external" title="${setting.description}">
				<label for="d-cgpt-${setting.key}"><span data-i18n="${setting.label.i18n}">${setting.label}</span> <div data-i18n="${setting.description.i18n}">${setting.description}</div></label>
				<img id="d-cgpt-${setting.key}" class="d-cgpt-icon-accent icon-colored icon" src="${iconSource}" alt="External link" title="${setting.link}">
			</a>
		`;
	}
}

if (typeof window !== "undefined") {
    window.SettingsComponent = SettingsComponent;
}