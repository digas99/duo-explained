/**
 * @fileoverview Content script for all the interactions with the Duolingo lesson page.
 */

/**
 * Lesson data object used in query.js.
 * @typedef {Object} LessonData
 * @example
 * {
 *	   "answer": @instance {AnswerData},			// The answer object from answer.js
 *     "challenge": @instance {Challenge}			// The challenge object from challenge.js
 *     "extra": "Why is this sentence like this?"	// The extra input from the user
 * }
 */


(async () => {
    // Expose init to global scope if necessary
    window.init = init;

    document.addEventListener("REFETCH_DATA", async function (event) {
        await init();
    });

	let answerData, challengeData;

    init();

	async function init() {
		if (typeof extensionActive == "function" && !(await extensionActive())) {
			clearAll();
			return;
		}

		// listen for the answer event
		document.addEventListener("answer", async event => {
			if (typeof extensionActive == "function" && !(await extensionActive())) return; 

			answerData = event.detail;

			const footer = document.getElementById("session/PlayerFooter");
			footer.classList.add("d-cgpt-footer");

			addExplainButton(answerData.challenge.content === undefined);
			toggleExtraInput(false);
		});

		// listen for the challenge event
		document.addEventListener("challenge", async event => {
			if (typeof extensionActive == "function" && !(await extensionActive())) return; 

			challengeData = event.detail;

			const footer = document.getElementById("session/PlayerFooter");
			footer.classList.add("d-cgpt-footer");

			// clear from previous challenge
			clearAll();

			addExplainButton(challengeData.content === undefined);
			toggleExtraInput(false);

			// add report button if not present
			const reportButton = document.querySelector(".d-cgpt-bug-report");
			if (!reportButton) {
				const quitButton = document.querySelector("button[data-test='quit-button']");
				const wrapper = quitButton?.parentElement;
				if (wrapper)
					addReportButton(wrapper, quitButton);
			}
			else {
				// update report button title
				const exerciseType = document.querySelector("div[data-test^='challenge']")?.dataset.test.replace("challenge challenge-", "") || "unknown";
				reportButton.title = `Duo Explained - Report a bug\nExercise Type: ${exerciseType}\nExtension Version: ${reportButton.dataset.version}`;
				reportButton.dataset.type = exerciseType;
			}
		});

		// listen for the session complete event
		document.addEventListener("lessonend", async event => {
			if (typeof extensionActive == "function" && !(await extensionActive())) return; 

			chrome.storage.sync.get("SETTINGS", data => {
				const showUsedTokens = data.SETTINGS?.["show-used-tokens"];
				
				if (showUsedTokens) {
					// add the stats of the number of tokens used
					const statsWrapper = event.detail.statsWrapper;
					const observer = new MutationObserver((mutationsList, observer) => {
						if (!statsWrapper.querySelector(".d-cgpt-stat-entry")) {
							if (statsWrapper.children.length > 1) {
								const tokens = parseInt(localStorage.getItem("d-cgpt-tokens")) || 0;
								const lastStat = statsWrapper.lastElementChild;
								const statEntry = makeStatEntry(lastStat, {
									"title": "Tokens used",
									"icon": "https://andreclerigo.github.io/duolingo-chatgpt-assets/icons/token.png",
									"value": tokens
								});
								if (statEntry) {
									statsWrapper.classList.add("d-cgpt-stat-entries");
									statsWrapper.appendChild(statEntry);
			
									// clear tokens
									localStorage.removeItem("d-cgpt-tokens");
									
									observer.disconnect();
								}
							}		
						}
					});
					observer.observe(statsWrapper, { childList: true, subtree: true });
				}
			});
		});

		document.addEventListener("click", async event => {
			const target = event.target;
			
			if (window.innerWidth <= 1050) {
				if (!target.closest(".d-cgpt-explain-area") && document.querySelector(".d-cgpt-explain-area")?.dataset.mouseDown !== "true" && !target.closest(".d-cgpt-explain-button") && !target.closest(".d-cgpt-swipe-icon")) {
					hideExplainArea();
				}
			}

			// close context menu
			if (!(target.closest(".d-cgpt-context-menu") || target.closest(".d-cgpt-bug-report"))) {
				const contextMenu = document.querySelector(".d-cgpt-context-menu");
				if (contextMenu) {
					contextMenu.remove();
				}
			}

			// clicked on data object copy button
			if (target.closest(".d-cgpt-context-menu-button")) {
				const button = target.closest(".d-cgpt-context-menu-button");
				const type = button.dataset.type;
				let data;
				if (type === "challenge") {
					data = challengeData;
				}
				else if (type === "answer") {
					data = answerData;
				}
				
				if (data) {
					button.classList.add("d-cgpt-button-active");
					setTimeout(() => button.classList.remove("d-cgpt-button-active"), 1000);
					
					navigator.clipboard.writeText(JSON.stringify(data, null, 2));
				}
			}
		});

		document.addEventListener("mouseover", async event => {
			const target = event.target;
			
			// toggle extra input
			if (target.closest(".d-cgpt-footer") && document.querySelector(".d-cgpt-explain-button-enabled")) {
				toggleExtraInput(true);
			}
			else {
				if (!target.closest(".d-cgpt-speech-bubble") &&
					document.querySelector(".d-cgpt-speech-bubble textarea")?.value === "" &&
					document.activeElement !== document.querySelector(".d-cgpt-speech-bubble textarea")) {
					toggleExtraInput(false);
				}
			}
		});

		document.addEventListener("mousedown", handleDownEvent);
		document.addEventListener("touchstart", handleDownEvent);

		document.addEventListener("mouseup", handleUpEvent);
		document.addEventListener("touchend", handleUpEvent);

		document.addEventListener("swiped-up", e => {
			if (window.innerWidth <= 700) {
				const explainArea = document.querySelector(".d-cgpt-explain-area");
				if (explainArea && explainArea.classList.contains("d-cgpt-explain-area-closed")) {
					showExplainArea();
				}
			}
		});

		document.addEventListener("swiped-down", e => {
			if (window.innerWidth <= 700) {
				const explainArea = document.querySelector(".d-cgpt-explain-area");
				if (explainArea && !explainArea.classList.contains("d-cgpt-explain-area-closed")) {
					hideExplainArea();
				}
			}
		});

		window.addEventListener("resize", () => {
			// show/hide explain area on resize
			const explainArea = document.querySelector(".d-cgpt-explain-area");
			const exercise = explainArea?.previousElementSibling;
			if (explainArea && exercise) {
				if (window.innerWidth <= 700) {
					if (!explainArea.classList.contains("d-cgpt-explain-area-closed"))
						exercise.style.display = "none";
				}
				else {
					exercise.style.removeProperty("display");
				}
			}
		});

		// clear localstorage tokens before page leave
		window.addEventListener("beforeunload", e => {
			localStorage.removeItem("d-cgpt-tokens");
		});

		document.addEventListener("keydown", e => {
			const speechBubble = document.querySelector(".d-cgpt-speech-bubble");
			if (speechBubble && speechBubble.style.display !== "none") {
				const inputPrompt = document.querySelector(".d-cgpt-speech-bubble textarea");
				inputPrompt.focus();

				const key = e.key;

				e.preventDefault();
				e.stopImmediatePropagation();

				if (key === "Backspace") {
					// clear entire word
					if (e.ctrlKey) {
						const lastSpace = inputPrompt.value.lastIndexOf(" ");
						if (lastSpace !== -1) {
							inputPrompt.value = inputPrompt.value.slice(0, lastSpace+2);
						}
						else {
							inputPrompt.value = "";
						}
					}

					inputPrompt.value = inputPrompt.value.slice(0, -1);
					return;
				}
				
				// if keys are unicode letters or numbers
				if (key.length === 1) {
					inputPrompt.value += key;
				}

				if (key === "Escape") {
					toggleExtraInput(false);
				}

				if (key === "Enter") {
					e.preventDefault();

					// click explain button
					const explainButton = document.getElementById("d-cgpt-explain-button");
					if (explainButton && !explainButton.disabled) {
						explainButton.click();
					}
				}
			}
		}, true);
	}

	let mouseDownTime = 0;

	const clearAll = () => {
		const explainButton = document.querySelector("#d-cgpt-explain-button");
		if (explainButton) {
			explainButton.remove();
		}
	
		const extraInput = document.querySelector(".d-cgpt-speech-bubble");
		if (extraInput) {
			extraInput.remove();
		}
	
		const explainArea = document.querySelector(".d-cgpt-explain-area");
		if (explainArea) {
			explainArea.remove();
			const challengeWrapper = document.querySelector("div[data-test^='challenge']");
			if (challengeWrapper) {
				challengeWrapper.classList.remove("d-cgpt-explain-area-wrapper");
			}
		}
	
		const swipeIcon = document.querySelector(".d-cgpt-swipe-icon");
		if (swipeIcon) {
			swipeIcon.remove();
		}
	
		answerData = null;
	}

	const hideExplainArea = () => {
		const explainArea = document.querySelector(".d-cgpt-explain-area");
		if (explainArea) {
			explainArea.style.removeProperty("right");
			explainArea.classList.add("d-cgpt-explain-area-closed");

			const closeButton = document.querySelector(".d-cgpt-explain-close");
			closeButton.classList.remove("d-cgpt-explain-close-accent");

			if (window.innerWidth <= 700) {
				explainArea.previousElementSibling.style.removeProperty("display");
				
				switchSwipeIcon("up");
			}
		}
	}

	const showExplainArea = () => {
		const explainArea = document.querySelector(".d-cgpt-explain-area");
		if (explainArea) {
			explainArea.classList.remove("d-cgpt-explain-area-closed");
			const closeButton = document.querySelector(".d-cgpt-explain-close");
			setTimeout(() => closeButton.classList.add("d-cgpt-explain-close-accent"), 400);

			if (window.innerWidth <= 700) {
				explainArea.previousElementSibling.style.setProperty("display", "none", "important");
				
				switchSwipeIcon("down");
			}
		}
	}

	const handleDownEvent = event => {
		mouseDownTime = new Date().getTime();

		const target = event.target;
		if (target.closest(".d-cgpt-explain-close")) {
			hideExplainArea();	
			const explainArea = document.querySelector(".d-cgpt-explain-area");
			if (explainArea) {
				explainArea.dataset.mouseDown = "true";
			}
		}
	}

	const handleUpEvent = () => {
		const mouseUpTime = new Date().getTime();
		const timeDiff = mouseUpTime - mouseDownTime;
		
		const explainArea = document.querySelector(".d-cgpt-explain-area");
		if (timeDiff > 500 && explainArea && explainArea.dataset.mouseDown == "true" && explainArea.classList.contains("d-cgpt-explain-area-closed")) {
			showExplainArea();
			setTimeout(() => explainArea.dataset.mouseDown = "false");
		}

		if (timeDiff <= 500 && explainArea)
			explainArea.dataset.mouseDown = "false";

		mouseDownTime = 0;
	}

	const handleExplanation = callback => {
		const lesson = {
			"answer": answerData,
			"challenge": challengeData
		}

		const extraInput = document.querySelector(".d-cgpt-speech-bubble textarea");
		if (extraInput) {
			lesson["extra"] = extraInput.value;
		}

		console.log(lesson);

		const challengeWrapper = document.querySelector('div[data-test^="challenge"]');
		if (challengeWrapper) {
			challengeWrapper.classList.add("d-cgpt-explain-area-wrapper");
			challengeWrapper.insertAdjacentHTML("beforeend", explanationPrompt("Loading explanation..."));

			if (window.innerWidth <= 700) {
				const explainArea = document.querySelector(".d-cgpt-explain-area");
				explainArea.previousElementSibling.style.setProperty("display", "none", "important");
			}

			chrome.runtime.sendMessage({ type: "QUERY", data: lesson }, response => {
				const explainArea = document.querySelector(".d-cgpt-explain-area");
				
				// slide in explanation
				if (explainArea && window.innerWidth <= 1050) {
					explainArea.style.setProperty("right", "-420px", "important");
					setTimeout(() => explainArea.style.removeProperty("right"));
				}

				const explanationClose = document.querySelector(".d-cgpt-explain-close");
				explanationClose.addEventListener("click", () => {
					const explainArea = document.querySelector(".d-cgpt-explain-area");
					if (explainArea) {
						explainArea.style.removeProperty("right");
						explainArea.classList.toggle("d-cgpt-explain-area-closed");

						const closeButton = document.querySelector(".d-cgpt-explain-close");
						closeButton.classList.remove("d-cgpt-explain-close-accent");
					}
				});
				explanationClose.addEventListener("mouseover", () => {
					if (window.innerWidth <= 700) return;

					const explainArea = document.querySelector(".d-cgpt-explain-area");
					if (explainArea && explainArea.classList.contains("d-cgpt-explain-area-closed")) {
						explainArea.style.setProperty("right", "-380px", "important");
					}
				});
				explanationClose.addEventListener("mouseout", () => {
					if (window.innerWidth <= 700) return;

					const explainArea = document.querySelector(".d-cgpt-explain-area");
					if (explainArea) {
						explainArea.style.removeProperty("right");
					}
				});

				if (response) {
					// model
					const explainModel = document.querySelector(".d-cgpt-explain-model span");
					if (explainModel && response.model) {
						explainModel.textContent = response.model;
						explainModel.parentElement.style.removeProperty("display");
					}
	
					// tokens
					const explainTokens = document.querySelector(".d-cgpt-explain-tokens span");
					if (explainTokens && response.usage) {
						explainTokens.textContent = response.usage.total_tokens;

						const lessonTokens = parseInt(localStorage.getItem("d-cgpt-tokens")) || 0;
						localStorage.setItem("d-cgpt-tokens", lessonTokens + response.usage.total_tokens);
					}
				}

				// answer content
				const explainContent = document.querySelector(".d-cgpt-explain-content");
				if (explainContent) {
					explainContent.innerHTML = "";
					if (response && response.content) {
						// const text = response.content.split(". ").join(".\n");
						const text = response.content;
						const htmlContent = markdownToHtml(text);
						const sanitizedHtmlContent = DOMPurify.sanitize(htmlContent);
						chrome.storage.sync.get("SETTINGS", data => {
							const typeAnimation = data.SETTINGS?.["typing-animation"];
							if (typeAnimation) {
								type(explainContent, sanitizedHtmlContent);
							}
							else {
								explainContent.innerHTML = sanitizedHtmlContent;
								explainContent.scrollTo({ top: explainContent.scrollHeight, behavior: "smooth" });
							}
						});
					}
					else
						explainContent.innerHTML = "Something went wrong. Could not get an explanation.\nWe appologize for the inconvenience.";
				}
				if (callback)
					callback();
			});
		}
			
	}

	const addExplainButton = disabled => {
		const answerButtonsWrapper = document.querySelector("button[data-test='player-next']")?.parentElement;
		const answerWrapper = document.getElementById("session/PlayerFooter");
		if (answerButtonsWrapper) {
			answerButtonsWrapper.classList.add("d-cgpt-explain-button-wrapper");
			answerButtonsWrapper.insertBefore(makeButton(answerButtonsWrapper.lastElementChild, disabled), answerButtonsWrapper.lastElementChild);
			answerWrapper?.parentElement.insertAdjacentHTML("beforeend", extraInputPrompt());
		}
	}

	const makeButton = (template, disabled) => {
		removeAllElements(".d-cgpt-explain-button");

		const button = template.cloneNode(true);
		delete button.dataset.test;
		button.id = "d-cgpt-explain-button";
		button.classList.add("d-cgpt-explain-button");
		button.querySelector("span").textContent = "Explain";
		button.dataset.hasclick = false;
		if (disabled) {
			disableButton(button);
		}
		else {
			enableButton(button);
		}
		return button;
	}

	const explanationPrompt = content => {
		removeAllElements(".d-cgpt-explain-area");

		return /*html*/`
			<div class="d-cgpt-explain-area">
				<div class="d-cgpt-explain-header">
					<h3>Explanation from ChatGPT</h3>
				</div>
				<div class="d-cgpt-explain-content">${content}</div>
				<div class="d-cgpt-explain-close">
					<div class="d-cgpt-explain-close-border"></div>
					<img class="d-cgpt-icon" src="https://andreclerigo.github.io/duolingo-chatgpt-assets/icons/arrow-circle.png">
				</div>
				<div class="d-cgpt-explain-bottom">
					<div class="d-cgpt-explain-model" style="display: none;"><span></span></div>
					<div class="d-cgpt-explain-tokens"><img class="d-cgpt-icon-accent" src="https://andreclerigo.github.io/duolingo-chatgpt-assets/icons/token.png"><span>0</span></div>
				</div>
			</div>
		`;
	}

	const disableButton = button => {
		button.disabled = true;
		button.setAttribute('aria-disabled', 'true');
		button.classList.remove("d-cgpt-explain-button-enabled");
		button.classList.add("d-cgpt-explain-button-disabled", "_1NM1Q");

		const explainBubble = document.querySelector(".d-cgpt-speech-bubble");
		if (explainBubble) {
			explainBubble.style.display = "none";
		}
	}

	const enableButton = button => {
		button.disabled = false;
		button.setAttribute('aria-disabled', 'false');
		button.classList.remove("d-cgpt-explain-button-disabled", "_1NM1Q");
		button.classList.add("d-cgpt-explain-button-enabled");

		if (!button.dataset.hasclick || button.dataset.hasclick === "false") {
			button.addEventListener("click", () => {
				// swipe button
				document.body.insertAdjacentHTML("beforeend", createSwipeIcon("down"));

				const swipeIcon = document.querySelector(".d-cgpt-swipe-icon");
				swipeIcon.addEventListener("click", () => {
					const explainArea = document.querySelector(".d-cgpt-explain-area");
					if (explainArea) {
						if (explainArea.classList.contains("d-cgpt-explain-area-closed")) {
							showExplainArea();
						}
						else {
							hideExplainArea();
						}
					}
				});

				handleExplanation();
				disableButton(button);
			});
		}
		
		button.dataset.hasclick = true;
	}

	const createSwipeIcon = orientation => {
		removeAllElements(".d-cgpt-swipe-icon");

		return /*html*/`
			<div class="d-cgpt-swipe-icon">
				<img class="d-cgpt-icon-accent" src="https://andreclerigo.github.io/duolingo-chatgpt-assets/icons/swipe-${orientation}.png">
				<span>${orientation === "down" ? "Hide" : "Show"}</span>
			</div>
		`;
	}

	const switchSwipeIcon = orientation => {
		const swipeIcon = document.querySelector(".d-cgpt-swipe-icon img");
		if (swipeIcon) {
			swipeIcon.src = `https://andreclerigo.github.io/duolingo-chatgpt-assets/icons/swipe-${orientation}.png`;
		}
		const swipeText = document.querySelector(".d-cgpt-swipe-icon span");
		if (swipeText) {
			swipeText.textContent = orientation === "down" ? "Hide" : "Show";
		}
	}

	const extraInputPrompt = () => {
		removeAllElements(".d-cgpt-speech-bubble");
		const answerWrapper = document.getElementById("session/PlayerFooter");
		const height = answerWrapper.offsetHeight;

		return /*html*/`
			<div class="d-cgpt-speech-bubble" style="bottom: ${height-10}px;">
				<div>
					<textarea placeholder="If you want, add to the query to ChatGPT..."></textarea>
					<div class="d-cgpt-speech-bubble-tip"></div>
				</div>
			</div>
		`;
	}

	const toggleExtraInput = show => {
		const extraInput = document.querySelector(".d-cgpt-speech-bubble");
		if (extraInput) {
			if (show == null) {
				if (extraInput.style.display == "none") {
					extraInput.style.removeProperty("display");
				}
				else {
					extraInput.style.display = "none";
				}
				return;
			}

			if (show) {
				extraInput.style.removeProperty("display");
			}
			else {
				extraInput.style.display = "none";
			}
		}
	}

	const makeStatEntry = (template, data) => {
		const entry = template.cloneNode(true);
		entry.classList.add("d-cgpt-stat-entry");
		const header = entry.firstElementChild;
		if (!header) return null;
		header.style.backgroundColor = "var(--d-cgpt-accent-color)";
		const headerText = header.nextElementSibling;
		if (!headerText) return null;
		headerText.textContent = data.title;
		const valueWrapper = entry.lastElementChild;
		if (!valueWrapper) return null;
		valueWrapper.style.borderColor = "var(--d-cgpt-accent-color)";
		valueWrapper.style.color = "var(--d-cgpt-accent-color)";
		const icon = valueWrapper.querySelector("img");
		if (!icon) return null;
		icon.src = data.icon;
		icon.style.width = "23px";
		icon.classList.add("d-cgpt-icon-accent");
		const value = icon.nextElementSibling;
		if (!value) return null;
		value.textContent = data.value;
		return entry;
	}

	const makeReportButton = template => {
		const button = document.createElement("button");
		button.className = template.className;
		button.classList.add("d-cgpt-bug-report");
		button.target = "_blank";
		button.href = "https://github.com/digas99/duo-explained/issues/new?assignees=&labels=bug&projects=&template=bug_report.yml";
		const img = document.createElement("img");
		img.src = "https://andreclerigo.github.io/duolingo-chatgpt-assets/icons/bug.png";
		img.classList.add("d-cgpt-icon-duo-ui");
		button.appendChild(img);
		return button;
	}

	const adjustNavigationGridLayout = (wrapper, progressBar) => {
		// number of items until the progress bar
		let itemsBefore = 0, itemsAfter = 0;
		for (let i = 0; i < wrapper.children.length; i++) {
			if (wrapper.children[i] === progressBar) {
				itemsAfter = wrapper.children.length - i;
				break;
			}
			itemsBefore++;
		}

		wrapper.style.gridTemplateColumns = `${'min-content '.repeat(itemsBefore)}1fr${' min-content'.repeat(itemsAfter)}`;
	}

	const addReportButton = (wrapper, template) => {
		// add exercise type to report button
		const exerciseType = document.querySelector("div[data-test^='challenge']")?.dataset.test.replace("challenge challenge-", "") || "unknown";
		const reportButton = makeReportButton(template);
		reportButton.title = "Duo Explained - Report a bug\nExercise Type: " + exerciseType;
		reportButton.dataset.type = exerciseType;
		
		// add extension version to report
		chrome.runtime.sendMessage({ type: "EXTENSION_VERSION" }, response => {
			if (response.version) {
				const version = response.version;
				reportButton.title += `\nExtension Version: ${version}`;
				reportButton.dataset.version = version;
			}
		});

		const progressBar = document.querySelector("div[role='progressbar']");
		if (progressBar) {
			wrapper.insertBefore(reportButton, progressBar);
			adjustNavigationGridLayout(wrapper, progressBar);
		}

		// show a context menu
		reportButton.addEventListener("click", event => {
			const version = reportButton.dataset.version;
			const type = reportButton.dataset.type;
			const url = `
				https://github.com/digas99/duo-explained/issues/new?assignees=&labels=bug&projects=&template=bug_report.yml
				&title=[
					Exercise Type: ${type}%3B Extension Version: ${version}
					- use this info to complete the fields below
				] 
				(UPDATE THIS FIELD WITH YOUR TITLE AFTERWARDS)
			`;

			const contextMenu = /*html*/`
				<div class="d-cgpt-context-menu">
					<a href="${url}" target="_blank">
						<img src="https://andreclerigo.github.io/duolingo-chatgpt-assets/logo.png">
						<span>Report a Bug</span>
						<img class="d-cgpt-icon-duo-ui external-link-icon" src="https://andreclerigo.github.io/duolingo-chatgpt-assets/icons/foreign.png">
					</a>
					<div><b>Exercise Type:</b> ${type}</div>
					<div><b>Extension Version:</b> ${version}</div>
					<div class="d-cgpt-context-menu-button ${!challengeData ? 'd-cgpt-button-inactive' : ''}" data-type="challenge">
						<img class="d-cgpt-icon-duo-ui" src="https://andreclerigo.github.io/duolingo-chatgpt-assets/icons/copy.png">
						<span>Challenge Data Object</span>
					</div>
					<div class="d-cgpt-context-menu-button ${!answerData ? 'd-cgpt-button-inactive' : ''}" data-type="answer">
						<img class="d-cgpt-icon-duo-ui" src="https://andreclerigo.github.io/duolingo-chatgpt-assets/icons/copy.png">
						<span>Answer Data Object</span>
					</div>
				</div>
			`;

			if (document.querySelector(".d-cgpt-context-menu"))
				document.querySelector(".d-cgpt-context-menu").remove();
			else
				reportButton.insertAdjacentHTML("afterend", contextMenu);
		});
	}
})();
