import { settingsManager } from "./settingsManager.js";
import { interfaceManager } from "./interfaceManager.js";

import LanguageManager from "./languageManager.js";

(async () => {
	window.languageManager = new LanguageManager("data-i18n", "/locales", "messages", "/popup/strings.json");
	await window.languageManager.init();

	interfaceManager.setDefaults(settingsManager.loadFromLocal());
	interfaceManager.setDefaults(await settingsManager.loadFromStorage());

	interfaceManager.setupEventHandlers();

})();