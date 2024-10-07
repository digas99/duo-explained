/**
 * @fileoverview Content script for all the interactions with the Duolingo lesson page.
 */

(async () => {
	if (!(await extensionActive())) return; 

	let answerData, challengeData;

	// listen for the answer event
	document.addEventListener("answer", async event => {
		if (!(await extensionActive())) return; 

		console.log("Answer event detected");
		answerData = event.detail;
		console.log(answerData);


		const footer = document.getElementById("session/PlayerFooter");
		footer.classList.add("d-cgpt-footer");

		addExplainButton(answerData.question.content === undefined);
		toggleExtraInput(false);
	});

	// listen for the challenge event
	document.addEventListener("challenge", async event => {
		if (!(await extensionActive())) return; 

		console.log("Challenge event detected");
		challengeData = event.detail;
		console.log(challengeData);

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
		
		if (!target.closest(".d-cgpt-explain-area") && !(document.querySelector(".d-cgpt-explain-area")?.dataset.mouseDown == "true") && window.innerWidth <= 1050) {
			const explainArea = document.querySelector(".d-cgpt-explain-area");
			if (explainArea) {
				explainArea.style.removeProperty("right");
				explainArea.classList.add("d-cgpt-explain-area-closed");
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
			}
		}
	});

	document.addEventListener("mouseup", async event => {
		const mouseUpTime = new Date().getTime();
		const timeDiff = mouseUpTime - mouseDownTime;
		
		const explainArea = document.querySelector(".d-cgpt-explain-area");
		if (timeDiff > 500 && explainArea && explainArea.dataset.mouseDown == "true" && explainArea.classList.contains("d-cgpt-explain-area-closed")) {
			explainArea.classList.remove("d-cgpt-explain-area-closed");
			setTimeout(() => explainArea.dataset.mouseDown = false);
		}
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

		chrome.runtime.sendMessage({ type: "QUERY", lesson: lesson }, response => {
			console.log(response);
			const challangeWrapper = document.querySelector('div[data-test^="challenge"]');
			if (challangeWrapper) {
				challangeWrapper.classList.add("d-cgpt-explain-area-wrapper");
				challangeWrapper.insertAdjacentHTML("beforeend", explanationPrompt());
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

				const explainContent = document.querySelector(".d-cgpt-explain-content");
				if (explainContent) {
					type(explainContent, response);
				}
			}
			if (callback)
				callback();
		});
			
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
			const challangeWrapper = document.querySelector("div[data-test^='challenge']");
			if (challangeWrapper) {
				challangeWrapper.classList.remove("d-cgpt-explain-area-wrapper");
			}
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

	const explanationPrompt = () => {
		removeAllElements(".d-cgpt-explain-area");

		return /*html*/`
			<div class="d-cgpt-explain-area">
				<div class="d-cgpt-explain-header">
					<h3>Explanation from ChatGPT</h3>
				</div>
				<div class="d-cgpt-explain-content">
				</div>
				<div class="d-cgpt-explain-close">
					<img class="d-cgpt-icon" src="https://andreclerigo.github.io/duolingo-chatgpt-assets/icons/arrow-circle.png">
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
