(() => {
	chrome.storage.sync.get(["THEME"], data => {
		theme = data.THEME;
		if (theme) {
			document.documentElement.dataset.duoTheme = theme;
			localStorage.setItem("theme", theme);
		}
	});
	
	// theme select
	let theme = localStorage.getItem("theme");
	if (theme)
		document.documentElement.dataset.duoTheme = theme;

	chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
		if (request.type === "UPDATE_THEME") {
			document.documentElement.dataset.duoTheme = request.theme;
			localStorage.setItem("theme", request.theme);
		}
	});
})();