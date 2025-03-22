export default class LanguageManager {
	constructor(id, localesSource, localesNamespace, fallbackStringsPath, defaultLanguage="en-rUS") {
		this.id = id;
		this.localesSource = localesSource;
		this.localesNamespace = localesNamespace;
		this.defaultLanguage = defaultLanguage;
		this.fallbackStringsPath = fallbackStringsPath;
		
		this.rtlLanguages = ["ar-rSA", "iw-rIL", "fa-rIR", "ur-rPK"];
	
		this.languageName = {
			"ar-rSA": "العربية",
			"en-rUS": "English (US)",
			"en-rGB": "English (UK)",
			"es-rES": "Español",
			"fr-rFR": "Français",
			"de-rDE": "Deutsch",
			"it-rIT": "Italiano",
			"ja-rJP": "日本語",
			"ko-rKR": "한국어",
			"nl-rNL": "Nederlands",
			"pl-rPL": "Polski",
			"pt-rPT": "Português",
			"pt-rBR": "Português (Brasil)",
			"ru-rRU": "Русский",
			"tr-rTR": "Türkçe",
			"zh-rCN": "中文 (简体)",
			"zh-rTW": "中文 (繁體)"
		};
	}

	async init() {
		i18next.use(i18nextHttpBackend).init({
			lng: this.defaultLanguage,
			fallbackLng: this.defaultLanguage,
			ns: [this.localesNamespace],
			defaultNS: this.localesNamespace,
			debug: true,
			load: "currentOnly",
			nonExplicitWhitelist: true,
			backend: {
				loadPath: `${this.localesSource}/{{lng}}/{{ns}}.json`,
				addPath: `${this.fallbackStringsPath}`,
				parse: data => {
					const parsedData = JSON.parse(data);
					return Object.fromEntries(
						Object.entries(parsedData)
							.map(([key, value]) => [key, value.message]));
				}
			}
		}, (err, t) => {
			if (err) return console.error("Error initializing i18next: ", err);
			
			this.updateContent();
			this.updateTextDirection(this.defaultLanguage);
		});

		// set a fallback strings.json file
		this.fallback = await this.loadFallback(this.fallbackStringsPath);
		i18next.addResourceBundle(this.defaultLanguage, this.localesNamespace, this.fallback, true, true);
	}

	updateContent() {
		document.querySelectorAll(`[${this.id}]`).forEach(el => {
			try {
				const key = el.getAttribute(this.id);
				el.textContent = i18next.t(key);
			} catch (error) {
				console.error("Error updating content: ", error);
			}
		});
	}

	changeLanguage(lang) {
		i18next.changeLanguage(lang, (err, t) => {
			if (err) return console.error("Error changing language: ", err);
			
			this.updateContent();
			this.updateTextDirection(lang);
		});
	}

	updateTextDirection(lang) {
		document.documentElement.dir = this.rtlLanguages.includes(lang) ? "rtl" : "ltr";
	}

	async loadFallback(path) {
		const response = await fetch(path);
		const data = await response.json();
		return Object.fromEntries(
			Object.entries(data)
				.map(([key, value]) => [key, value.message]));
	}

	getLanguageID(lang) {
		const value = Object.entries(this.languageName).find(([key, value]) => value === lang);
		return value ? value[0] : null;
	}
}
