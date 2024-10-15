/**
 * @fileoverview Extension kick starter with only the essential elements to atleast toggle the extension on and off.
 */

(async () => {
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

		chrome.runtime.sendMessage({ type: "UPDATE_THEME", theme });
	});

	const injectElements = () => {
		// backdoor to the duo object
		const script = document.createElement("script");
		script.src = chrome.runtime.getURL("scripts/content/duo.js");
		script.type = "text/javascript";
		document.documentElement.appendChild(script);

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
		chrome.storage.sync.get(["API_KEY", "API_KEY_PROMPT_CLOSED", "SETTINGS"], data => {
			const apiKey = data.API_KEY;
			const promptClosed = data.API_KEY_PROMPT_CLOSED;
			const settings = data.SETTINGS || {};
			const extensionActive = settings?.["extension-enabled"];
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
								// disable extension
								newTab.querySelector("a").classList.remove("active");
							}
							else {
								// enable extension
								newTab.querySelector("a").classList.add("active");
							}

							settings["extension-enabled"] = newTab.querySelector("a").classList.contains("active");
							chrome.storage.sync.set({"SETTINGS": settings}, () => chrome.runtime.sendMessage({ type: "RELOAD" }));
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
		const BETADiv = document.createElement("div");
		BETADiv.className = "d-cgpt-beta";
		BETADiv.innerText = "BETA";
		const tabSpanWrapper = tab.querySelector("span");
		tabSpanWrapper.appendChild(BETADiv);
		const tabText = tab.querySelector("span span");
		tabText.innerText = "Duo Explained";
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
					<img id="d-cgpt-prompt-close" class="d-cgpt-prompt-icon d-cgpt-button" src="https://andreclerigo.github.io/duolingo-chatgpt-assets/icons/close-thick.png">
				</div>
			</div>
		`;
	};

	const toggleExtension = value => {
		const extensionTab = document.querySelector(".d-cgpt-tab");
		if (extensionTab) {
			if (value && !extensionTab.querySelector("a").classList.contains("active")) {
				console.log("Enabling extension");
				extensionTab.querySelector("a").classList.add("active");
			}
			else if (!value && extensionTab.querySelector("a").classList.contains("active")) {
				console.log("Disabling extension");
				extensionTab.querySelector("a").classList.remove("active");
			}
		}
	}

	navigation.addEventListener("navigate", (event) => {
		// check if entering a lesson
		if (event.destination.url.split("duolingo.com/")[1] === "lesson") {
			const prompt = document.querySelector(".d-cgpt-prompt");
			if (prompt)
				prompt.remove();
		}
	});

	chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
		if (request.type === "TOGGLE_EXTENSION") {
			chrome.storage.sync.get("API_KEY", data =>
				toggleExtension(data.API_KEY && request.value)
			);
		}

		if (request.type === "RESET") {
			chrome.storage.sync.remove("API_KEY", () => {
				const newTab = document.querySelector(".d-cgpt-tab");
				if (newTab)
					setupPrompt(newTab);

				setTimeout(() => toggleExtension(false), 500);

				chrome.runtime.sendMessage({ type: "RELOAD" });
			});
		}

		if (request.type === "SAVED_KEY") {
			chrome.runtime.sendMessage({ type: "SET_API_KEY", apiKey: request.key }, response => {
				if (response) {
					const prompt = document.querySelector(".d-cgpt-prompt");
					if (prompt)
						prompt.remove();

					toggleExtension(true);

					chrome.runtime.sendMessage({ type: "RELOAD" });
				}
			});
		}
	});

	window.addEventListener("message", event => {
		if (event.data.type === "DUO") {
			chrome.storage.sync.set({ "UI_LANGUAGE": event.data.language});
		}
	});
})();
