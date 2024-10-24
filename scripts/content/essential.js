/**
 * @fileoverview Extension kick starter with only the essential elements to atleast toggle the extension on and off.
 */

(async () => {
	let active = false, showIconMobile = true;

	// kick starter
	let observer = new MutationObserver(mutations => {
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

	// catch open in app popup
	chrome.storage.sync.get("SETTINGS", data => {
		const settings = data.SETTINGS;
		const removeContinueInApp = settings?.["remove-continue-app"];
		if (removeContinueInApp) {
			const overlays = document.querySelector("#overlays");
			if (overlays) {
				observer = new MutationObserver(mutations => {
					mutations.forEach(mutation => {
						const addedNode = mutation.addedNodes[0];
						const continueInBrowser = addedNode?.querySelector("button");
						if (continueInBrowser?.innerText === "CONTINUE IN BROWSER") {
							continueInBrowser.closest("div[data-focus-lock-disabled='false']").style.display = "none";
							const backdrop = document.querySelector("div[data-test='drawer-backdrop']");
							if (backdrop) backdrop.style.display = "none";
		
							// continue in browser
							continueInBrowser.click();
						}
					});
				});
				observer.observe(overlays, { childList: true, subtree: true });
			}
		}
	});

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

		setupTab();	

		chrome.storage.sync.get(["API_KEY", "API_KEY_PROMPT_CLOSED", "SETTINGS"], data => {
			const settings = data.SETTINGS || {};
			showIconMobile = settings?.["mobile-extension-icon"] !== false;

			// hide extension icon on mobile
			if (window.innerWidth <= 700 && !showIconMobile) {
				const extensionTab = document.querySelector(".d-cgpt-tab");
				if (extensionTab) extensionTab.style.display = "none";
			}

			// API Key prompt
			const newTab = document.querySelector(".d-cgpt-tab");
			const apiKey = data.API_KEY;
			const promptClosed = data.API_KEY_PROMPT_CLOSED;
			const extensionActive = settings?.["extension-enabled"];
			if (!apiKey && !promptClosed) {
				setupPrompt(newTab);
			}
			
			if (apiKey && extensionActive) {
				if (newTab) {
					const link = newTab.querySelector("a") || newTab;
					link.classList.add("d-cgpt-active");
					active = true;
				}
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

			chrome.runtime.sendMessage({ type: "CHECK_API_KEY", apiKey }, result => {
				if (result.valid) {
					chrome.runtime.sendMessage({ type: "SET_API_KEY", apiKey: apiKey }, response => {
						if (response) {
							document.querySelector(".d-cgpt-prompt").remove();
							if (newTab) {
								const link = newTab.querySelector("a") || newTab;
								link.classList.add("d-cgpt-active");
								active = true;
							}
						}
					});
				}
				else {
					console.log(result);
					let error = result.message;
					
					if (result.status === 429) {
						error += " Please check <a style='color: rgb(var(--color-macaw));' target='_blank' href='https://github.com/digas99/duo-explained/blob/main/docs/help/API_KEY.md'>here</a> how to solve this issue.";
					}

					const promptMessage = document.querySelector(".d-cgpt-prompt-message");
					promptMessage.innerHTML = error;
					promptMessage.style.height = "100px";
					promptMessage.style.top = "-45px";
					const promptDiv = document.querySelector(".d-cgpt-prompt div");
					promptDiv.style.borderRadius = "0px 0px 16px 16px";
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

	const setupTab = (active=false) => {
		const query = window.innerWidth > 700 ? "a[data-test='home-nav']" : "a[aria-label='Learn'] > div";

		// Duo ChatGPT tab
		const templateTab = document.querySelector(query)?.parentElement;
		const navbar = templateTab?.parentElement;
		let newTab;
		if (navbar) {
			newTab = window.innerWidth > 700 ? makeTab(templateTab, active) : makeTabMobile(templateTab, active);
			navbar.insertBefore(newTab, navbar.firstElementChild);
		}
	}

	const makeTab = (template, active) => {
		removeAllElements(".d-cgpt-tab");		

		const tab = template.cloneNode(true);
		tab.className = "d-cgpt-tab";
		const tabLink = tab.querySelector("a");
		delete tabLink.dataset.test;
		tabLink.href = "javascript: void(0)";
		if (active) tabLink.classList.add("d-cgpt-active");
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

	const makeTabMobile = template => {
		removeAllElements(".d-cgpt-tab");
		template.parentElement.style.overflowX = "auto";
	
		const tab = template.cloneNode(true);
		if (!showIconMobile) tab.style.display = "none";
		tab.classList.remove("_2-WjO");
		tab.classList.add("d-cgpt-tab", "d-cgpt-tab-mobile");
		if (active) tab.classList.add("d-cgpt-active");
		tab.ariaLabel = "Duo Explained";
		tab.href = "javascript: void(0)";
		const BETADiv = document.createElement("div");
		BETADiv.className = "d-cgpt-beta";
		BETADiv.innerText = "BETA";
		tab.appendChild(BETADiv);
		const tabIcon = tab.querySelector("img");
		tabIcon.src = "https://andreclerigo.github.io/duolingo-chatgpt-assets/logo.png";
		return tab;
	}

	const makePrompt = () => {
		return /* html */`
			<div class="d-cgpt-prompt" style="bottom: -100px;">
				<p class="d-cgpt-prompt-message"></p>
				<div>
					<img src="https://andreclerigo.github.io/duolingo-chatgpt-assets/logo-stroke.png">
					<input type="text" placeholder="ChatGPT API Key">
					<button>Submit</button>
					<img id="d-cgpt-prompt-close" class="d-cgpt-prompt-icon d-cgpt-button" src="https://andreclerigo.github.io/duolingo-chatgpt-assets/icons/close-thick.png">
				</div>
			</div>
		`;
	};

	window.toggleExtension = value => {
		const extensionTab = document.querySelector(".d-cgpt-tab");
		if (extensionTab) {
			const link = extensionTab.querySelector("a") || extensionTab;
			if (value && !link.classList.contains("d-cgpt-active")) {
				console.log("Enabling extension");
				link.classList.add("d-cgpt-active");
				active = true;
			}
			else if (!value && link.classList.contains("d-cgpt-active")) {
				console.log("Disabling extension");
				link.classList.remove("d-cgpt-active");
				active = false;
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
		console.log(request);

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

	document.addEventListener("click", event => {
		// clicked on navbar tab
		if (event.target.closest(".d-cgpt-tab")) {
			const newTab = document.querySelector(".d-cgpt-tab");
			chrome.storage.sync.get(["API_KEY", "SETTINGS"], data => {
				const settings = data.SETTINGS || {};
				const apiKey = data.API_KEY;
				if (!apiKey) {
					setupPrompt(newTab, 100);
				} else {
					const link = newTab.querySelector("a") || newTab;
					if (link.classList.contains("d-cgpt-active")) {
						// disable extension
						link.classList.remove("d-cgpt-active");
						active = false;
					}
					else {
						// enable extension
						link.classList.add("d-cgpt-active");
						active = true;
					}

					settings["extension-enabled"] = link.classList.contains("d-cgpt-active");
					chrome.storage.sync.set({"SETTINGS": settings}, () => chrome.runtime.sendMessage({ type: "RELOAD" }));
				}
			});
		}
	});

	window.addEventListener("message", event => {
		if (event.data.type === "DUO") {
			chrome.storage.sync.set({ "UI_LANGUAGE": event.data.language});
		}
	});

	window.addEventListener("resize", () => {
		setupTab(active);
	});
})();
