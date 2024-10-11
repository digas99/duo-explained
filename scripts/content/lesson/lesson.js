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
	if (typeof extensionActive == "function" && !(await extensionActive())) return; 

	let answerData, challengeData;

	// listen for the answer event
	document.addEventListener("answer", async event => {
		if (typeof extensionActive == "function" && !(await extensionActive())) return; 

		console.log("Answer event detected");
		answerData = event.detail;

		const footer = document.getElementById("session/PlayerFooter");
		footer.classList.add("d-cgpt-footer");

		addExplainButton(answerData.challenge.content === undefined);
		toggleExtraInput(false);
	});

	// listen for the challenge event
	document.addEventListener("challenge", async event => {
		if (typeof extensionActive == "function" && !(await extensionActive())) return; 

		console.log("Challenge event detected");
		challengeData = event.detail;

		const footer = document.getElementById("session/PlayerFooter");
		footer.classList.add("d-cgpt-footer");

		// clear from previous challenge
		clearAll();

		addExplainButton(challengeData.content === undefined);
		toggleExtraInput(false);
	});


	document.addEventListener("mouseover", async event => {
		const target = event.target;
		
		// toggle extra input
		if (target.closest(".d-cgpt-footer") && document.querySelector(".d-cgpt-explain-button-enabled")) {
			toggleExtraInput(true);
		}
		else {
			if (!target.closest(".d-cgpt-speech-bubble")) {
				toggleExtraInput(false);
			}
		}
	});

	document.addEventListener("click", async event => {
		const target = event.target;
		
		if (window.innerWidth <= 1050) {
			if (!target.closest(".d-cgpt-explain-area") && document.querySelector(".d-cgpt-explain-area")?.dataset.mouseDown !== "true" && !target.closest(".d-cgpt-explain-button")) {
				const explainArea = document.querySelector(".d-cgpt-explain-area");
				if (explainArea) {
					explainArea.style.removeProperty("right");
					explainArea.classList.add("d-cgpt-explain-area-closed");

					const closeButton = document.querySelector(".d-cgpt-explain-close");
					closeButton.classList.remove("d-cgpt-explain-close-accent")
				}
			}
		}
	});

	let mouseDownTime = 0;

	document.addEventListener("mousedown", async event => {
		const target = event.target;
		
		mouseDownTime = new Date().getTime();

		if (target.closest(".d-cgpt-explain-close")) {
			const explainArea = document.querySelector(".d-cgpt-explain-area");
			if (explainArea && !explainArea.classList.contains("d-cgpt-explain-area-closed")) {
				explainArea.classList.add("d-cgpt-explain-area-closed");
				explainArea.dataset.mouseDown = true;

				const closeButton = document.querySelector(".d-cgpt-explain-close");
				closeButton.classList.add("d-cgpt-explain-close-accent");
			}
		}
	});

	document.addEventListener("mouseup", async event => {
		const mouseUpTime = new Date().getTime();
		const timeDiff = mouseUpTime - mouseDownTime;
		
		const explainArea = document.querySelector(".d-cgpt-explain-area");
		if (timeDiff > 500 && explainArea && explainArea.dataset.mouseDown == "true" && explainArea.classList.contains("d-cgpt-explain-area-closed")) {
			explainArea.classList.remove("d-cgpt-explain-area-closed");
			
			const closeButton = document.querySelector(".d-cgpt-explain-close");
			setTimeout(() => closeButton.classList.remove("d-cgpt-explain-close-accent"), 400);

			setTimeout(() => explainArea.dataset.mouseDown = false);
		}

		if (timeDiff <= 500 && explainArea)
			explainArea.dataset.mouseDown = false;

		mouseDownTime = 0;
	});

	/* Functions */

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
					const explainArea = document.querySelector(".d-cgpt-explain-area");
					if (explainArea && explainArea.classList.contains("d-cgpt-explain-area-closed")) {
						explainArea.style.setProperty("right", "-360px", "important");
					}
				});
				explanationClose.addEventListener("mouseout", () => {
					const explainArea = document.querySelector(".d-cgpt-explain-area");
					if (explainArea) {
						explainArea.style.removeProperty("right");
					}
				});

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
				}

				// answer content
				const explainContent = document.querySelector(".d-cgpt-explain-content");
				if (explainContent) {
					explainContent.innerHTML = "";
					if (response && response.content) {
						const text = response.content.split(". ").join(".\n");
						chrome.storage.sync.get("SETTINGS", data => {
							const typeAnimation = data.SETTINGS?.["typing-animation"];
							if (typeAnimation) {
								type(explainContent, text);
							}
							else {
								explainContent.textContent = text;
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

		answerData = null;
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
					<img class="d-cgpt-icon" src="https://andreclerigo.github.io/duo-explained-assets/icons/arrow-circle.png">
				</div>
				<div class="d-cgpt-explain-bottom">
					<div class="d-cgpt-explain-model" style="display: none;"><span></span></div>
					<div class="d-cgpt-explain-tokens"><img class="d-cgpt-icon-accent" src="https://andreclerigo.github.io/duo-explained-assets/icons/token.png"><span>0</span></div>
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
				handleExplanation(() => {
					disableButton(button);
				});
			});
		}
		
		button.dataset.hasclick = true;
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

	const removeAllElements = (selector) => {
		const elements = document.querySelectorAll(selector);
		if (elements)
			elements.forEach(element => element.remove());
	}
})();
