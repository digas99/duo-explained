(() => {
	// listen for the answer event
	document.addEventListener("answer", event => {
		console.log("Answer event detected");
		const data = event.detail;
		console.log(data);
		
		data.button.parentElement.classList.add("d-cgpt-explain-button-wrapper");
		data.button.parentElement.insertBefore(makeButton(data.button, data, data.state === "correct"), data.button);
		data.wrapper.parentElement.insertAdjacentHTML("beforeend", extraInputPrompt());

		// clear for next question
		data.button.addEventListener("click", () => {
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

			document.removeEventListener("answer", event);
		});
	});

	// listen for the challenge event
	document.addEventListener("challenge", event => {
		console.log("Challenge event detected");
		const data = event.detail;
		console.log(data);
	});

	const makeButton = (template, data, disabled) => {
		const button = template.cloneNode(true);
		delete button.dataset.test;
		button.id = "d-cgpt-explain-button";
		button.querySelector("span").textContent = "Explain";
		if (disabled) {
			disableButton(button);
		}
		else {
			button.classList.add("d-cgpt-explain-button-enabled");
			button.addEventListener("click", () => {
				const query = {
					state: data.state,
				}
				chrome.runtime.sendMessage({ type: "QUERY", query: query }, response => {
					console.log(response);
					const challangeWrapper = document.querySelector('div[data-test^="challenge"]');
					if (challangeWrapper) {
						challangeWrapper.classList.add("d-cgpt-explain-area-wrapper");
						challangeWrapper.insertAdjacentHTML("beforeend", explanationPrompt(response));
					}
	
					disableButton(button);
					const extraInput = document.querySelector(".d-cgpt-speech-bubble");
					if (extraInput) {
						extraInput.remove();
					}
				});
			});
		}
		return button;
	}

	const explanationPrompt = content => {
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
		button.classList.add("d-cgpt-explain-button-disabled");
	}

	const extraInputPrompt = () => {
		return /*html*/`
			<div class="d-cgpt-speech-bubble">
				<div>
					<textarea placeholder="If you want, add to the query to ChatGPT..."></textarea>
					<div class="d-cgpt-speech-bubble-tip"></div>
				</div>
			</div>
		`;
	}
})();
