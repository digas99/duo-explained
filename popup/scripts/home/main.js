import { settingsManager } from "./settingsManager.js";
import { interfaceManager } from "./interfaceManager.js";

(async () => {
	interfaceManager.setDefaults(settingsManager.loadFromLocal());
	interfaceManager.setDefaults(await settingsManager.loadFromStorage());

	interfaceManager.setupEventHandlers();
})();