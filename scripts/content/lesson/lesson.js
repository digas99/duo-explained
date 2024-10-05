(() => {
	// listen for the answer event
	document.addEventListener("answer", event => {
		console.log("Answer event detected");
		const data = event.detail;
		console.log(data);
		
		data.button.parentElement.classList.add("d-cgpt-explain-button-wrapper");
		data.button.parentElement.insertBefore(makeButton(data.button, data, data.state === "correct"), data.button);

		// clear for next question
		data.button.addEventListener("click", () => {
			const explainButton = document.querySelector("#d-cgpt-explain-button");
			if (explainButton) {
				explainButton.remove();
			}

			document.removeEventListener("answer", event);
		});
	});

	const makeButton = (template, data, disabled) => {
		const button = template.cloneNode(true);
		delete button.dataset.test;
		button.id = "d-cgpt-explain-button";
		button.querySelector("span").textContent = "Explain";
		if (disabled) {
			button.disabled = true;
			button.setAttribute('aria-disabled', 'true');
			button.classList.add("d-cgpt-explain-button-disabled"); 
		}
		else {
			button.classList.add("d-cgpt-explain-button-enabled");
			button.addEventListener("click", () => {
				const query = {
					state: data.state,
				}
				chrome.runtime.sendMessage({ type: "QUERY", query: query }, response => {
					console.log(response);
				});
			});
		}
		return button;
	}
})();
