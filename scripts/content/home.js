(() => {
	// kick starter
	const observer = new MutationObserver(mutations => {
		mutations.forEach(mutation => {
			if (mutation.addedNodes.length) {
				const node = mutation.addedNodes[0];
				if (node?.classList?.contains("deV4C")) {
					injectElements();
				}
			}
		});
	});
	observer.observe(document.body, { childList: true, subtree: true });

	// watch for theme change
	document.addEventListener("duotheme", event => {
		const theme = event.detail.theme;
		chrome.storage.sync.set({ "THEME": theme });
		localStorage.setItem("duo.theme", theme);

		updateTheme(theme);
	});

	const injectElements = () => {
		// set theme from local storage
		const theme = localStorage.getItem("duo.theme");
		if (theme) updateTheme(theme);

		// Duo ChatGPT tab
		const moreNav = document.querySelector("a[data-test='home-nav']")?.parentElement;
		const navbar = moreNav?.parentElement;
		let newTab;
		if (navbar) {
			newTab = makeTab(moreNav);
			navbar.insertBefore(newTab, navbar.firstElementChild);
		}

		// API Key prompt
		chrome.storage.sync.get(["API_KEY", "API_KEY_PROMPT_CLOSED", "EXTENSION_ACTIVE"], data => {
			const apiKey = data.API_KEY;
			const promptClosed = data.API_KEY_PROMPT_CLOSED;
			const extensionActive = data.EXTENSION_ACTIVE;
			if (!apiKey && !promptClosed) {
				setupPrompt(newTab);
			}
			
			if (apiKey && extensionActive) {
				if (newTab) {
					newTab.querySelector("a").classList.add("active");
				}
			}

			// clicked on navbar tab
			if (newTab) {
				newTab.addEventListener("click", () => {
					chrome.storage.sync.get("API_KEY", data => {
						const apiKey = data.API_KEY;
						if (!apiKey) {
							setupPrompt(newTab, 100);
						} else {
							if (newTab.querySelector("a").classList.contains("active")) {
								newTab.querySelector("a").classList.remove("active");
							}
							else {
								newTab.querySelector("a").classList.add("active");
							}
							chrome.storage.sync.set({ "EXTENSION_ACTIVE": newTab.querySelector("a").classList.contains("active") });
						}
					});
				});
			}
		});

	}

	const setupPrompt = (newTab, delay = 1000) => {
		const prompt = makePrompt();
		const root = document.querySelector("#root");
		root.insertAdjacentHTML("beforeend", prompt);
		const promptButton = document.querySelector(".d-cgpt-prompt button");
		
		// clicked on prompt submit
		promptButton.addEventListener("click", () => {
			const apiKey = document.querySelector(".d-cgpt-prompt input").value;
			if (!apiKey) {
				return;
			}

			chrome.runtime.sendMessage({ type: "SET_API_KEY", apiKey: apiKey }, response => {
				if (response) {
					document.querySelector(".d-cgpt-prompt").remove();
					if (newTab) {
						newTab.querySelector("a").classList.add("active");
					}
				}
			});
		});

		// slide up prompt
		setTimeout(() => document.querySelector(".d-cgpt-prompt").style.removeProperty("bottom"), delay);

		// clicked on prompt close
		const promptClose = document.querySelector("#d-cgpt-prompt-close");
		promptClose.addEventListener("click", () => {
			chrome.storage.sync.set({ "API_KEY_PROMPT_CLOSED": true, "EXTENSION_ACTIVE": true }, () => {
				document.querySelector(".d-cgpt-prompt").remove();
			});
		});
	}

	const makeTab = (template) => {
		const tab = template.cloneNode(true);
		tab.className = "d-cgpt-tab";
		const tabLink = tab.querySelector("a");
		delete tabLink.dataset.test;
		tabLink.href = "javascript: void(0)";
		const tabText = tab.querySelector("span span");
		tabText.innerText = "Duo ChatGPT";
		const tabIcon = tab.querySelector("img");
		tabIcon.src = "https://andreclerigo.github.io/duolingo-chatgpt-assets/logo.png";
		return tab;
	}

	const makePrompt = () => {
		return /* html */`
			<div class="d-cgpt-prompt" style="bottom: -100px;">
				<div>
					<img src="https://andreclerigo.github.io/duolingo-chatgpt-assets/logo-stroke.png">
					<input type="text" placeholder="ChatGPT API Key">
					<button>Submit</button>
					<img id="d-cgpt-prompt-close" class="d-cgpt-prompt-icon" src="https://andreclerigo.github.io/duolingo-chatgpt-assets/icons/close-thick.png">
				</div>
			</div>
		`;
	};
})();