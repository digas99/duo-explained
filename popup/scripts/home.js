(() => {
	window.settings = new Settings(Settings.defaults, document.querySelector("#settings"), 'SETTINGS');
	window.settings.build();

	chrome.storage.sync.get("SETTINGS", data => {
		const settings = data.SETTINGS || {};
		window.settings.update(settings);
	});

	const version = localStorage.getItem("version");
	if (version) {
		document.querySelector("#version").innerText = "v"+version;
	}
	fetch("/manifest.json")
		.then(response => response.json())
		.then(data => {
			document.querySelector("#version").innerText = "v"+data.version;
			localStorage.setItem("version", data.version);
		});
})();
