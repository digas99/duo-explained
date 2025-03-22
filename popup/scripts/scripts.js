import { browserStore, localStore } from "./storage.js";

(async () => {
	// theme
	let theme = localStore.get("theme");
	if (theme)
		document.documentElement.dataset.duoTheme = theme;
	
	theme = await browserStore.get("THEME");
	if (theme) {
		document.documentElement.dataset.duoTheme = theme;
		localStore.set("theme", theme);
	}

	chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
		if (request.type === "UPDATE_THEME") {
			document.documentElement.dataset.duoTheme = request.theme;
			localStore.set("theme", request.theme);
		}
	});
})();

export const popupMessage = (wrapper, message, type = "info") => {
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