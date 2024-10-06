(() => {
	// listen for the answer event
	document.addEventListener("answer", event => {
		console.log("Answer event detected");
		const data = event.detail;
		console.log(data);

		const footer = document.getElementById("session/PlayerFooter");
		footer.classList.add("d-cgpt-footer");

		addExplainButton(data);
		toggleExtraInput(false);
	});

	// listen for the challenge event
	document.addEventListener("challenge", event => {
		console.log("Challenge event detected");
		const data = event.detail;
		console.log(data);

		const footer = document.getElementById("session/PlayerFooter");
		footer.classList.add("d-cgpt-footer");

		// clear from previous challenge
		clearAll();

		addExplainButton(data);
		toggleExtraInput(false);
	});


	document.addEventListener("mouseover", event => {
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


	/* Functions */

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

	const addExplainButton = data => {
		const answerButtonsWrapper = document.querySelector("button[data-test='player-next']")?.parentElement;
		const answerWrapper = document.getElementById("session/PlayerFooter");
		if (answerButtonsWrapper) {
			answerButtonsWrapper.classList.add("d-cgpt-explain-button-wrapper");
			answerButtonsWrapper.insertBefore(makeButton(answerButtonsWrapper.firstElementChild, data, false), answerButtonsWrapper.lastElementChild);
			answerWrapper?.parentElement.insertAdjacentHTML("beforeend", extraInputPrompt());
		}
	}

	const makeButton = (template, data, disabled) => {
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
				<div class="d-cgpt-explain-content">
					${content}
				</div>
			</div>
		`;
	}

	const disableButton = button => {
		button.disabled = true;
		button.setAttribute('aria-disabled', 'true');
		button.classList.remove("d-cgpt-explain-button-enabled");
		button.classList.add("d-cgpt-explain-button-disabled");

		const explainBubble = document.querySelector(".d-cgpt-speech-bubble");
		if (explainBubble) {
			explainBubble.style.display = "none";
		}
	}

	const enableButton = button => {
		button.disabled = false;
		button.setAttribute('aria-disabled', 'false');
		button.classList.remove("d-cgpt-explain-button-disabled");
		button.classList.add("d-cgpt-explain-button-enabled");

		if (!button.dataset.hasclick || button.dataset.hasclick === "false") {
			button.addEventListener("click", () => {
				const query = {
				}
				chrome.runtime.sendMessage({ type: "QUERY", query: query }, response => {
					console.log(response);
					const challangeWrapper = document.querySelector('div[data-test^="challenge"]');
					if (challangeWrapper) {
						challangeWrapper.classList.add("d-cgpt-explain-area-wrapper");
						challangeWrapper.insertAdjacentHTML("beforeend", explanationPrompt(response));
					}

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
