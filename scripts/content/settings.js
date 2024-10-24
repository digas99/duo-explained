(() => {
	const injectSettings = root => {
		const firstSection = root.querySelector("section");
		const firstHeader = firstSection.firstElementChild;

		const settingsHeader = firstHeader.cloneNode(true);
		if (settingsHeader?.querySelector("h2"))
			settingsHeader.querySelector("h2").textContent = "Duo Explained";

		const settingsWrapper = document.createElement("section");
		settingsWrapper.id = "d-cgpt-settings";
		settingsWrapper.classList.add("d-cgpt-settings-container");
		firstSection.parentElement.insertBefore(settingsWrapper, firstSection);
		settingsWrapper.appendChild(settingsHeader);

		const settings = new Settings(Settings.defaults, settingsWrapper, 'SETTINGS');
		settings.build();
		
		chrome.storage.sync.get(["UI_LANGUAGE"], data => {
			const uiLanguage = data.UI_LANGUAGE;
			if (uiLanguage) {
				const languageSelect = settingsWrapper.querySelector("#d-cgpt-language");
				const autoOption = languageSelect.querySelector("option[value='Auto']");
				autoOption.textContent = "Auto ("+uiLanguage+")";
			}
		});
	};

	window.navigation.addEventListener("navigate", (event) => {
		const destination = new URL(event.destination.url);
		if (destination.pathname === "/settings/account") {
			// remove all old settings containers
			document.querySelectorAll(".d-cgpt-settings-container").forEach(container => container.remove());
			
			setTimeout(() => injectSettings(document.querySelector("#root")));
		}
	});

	// wait for page to load
	window.addEventListener("load", () => {
		if (window.location.pathname === "/settings/account") {
			setTimeout(() => injectSettings(document.querySelector("#root")));
		}
	});
})();