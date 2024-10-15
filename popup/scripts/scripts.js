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

const popupMessage = (wrapper, message, type = "info") => {
	const popup = /*html*/`
		<div class="darken"></div>
		<div class="popup" data-type="${type}">
			<p>${message}</p>
			<button class="popup-close">Close</button>
		</div>
	`;
	wrapper.insertAdjacentHTML("beforeend", popup);

	const popupClose = wrapper.querySelector(".popup-close");
	popupClose.addEventListener("click", () => {
		document.querySelector(".darken").remove();
		document.querySelector(".popup").remove();
	});
};