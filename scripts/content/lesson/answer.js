(() => {
	// detect answers
	const observer = new MutationObserver((mutationsList, observer) => {
		const lessonFooter = document.getElementById("session/PlayerFooter");
		if (lessonFooter) {
			answered(mutationsList, "incorrect");
			answered(mutationsList, "correct");
		}
	});
	
	observer.observe(document.body, { childList: true, subtree: true });

	const answered = (mutations, state) => {
		const lessonFooter = document.getElementById("session/PlayerFooter");
		
		const validMutation = mutation =>
			mutation.type === "childList" &&
			mutation.target == lessonFooter.firstElementChild &&
			mutation.addedNodes.length > 0;


		const answerMutation = mutation => {
			const nodes = Array.from(mutation.addedNodes);
			return nodes.find(node => node.querySelector(`div[data-test='blame blame-${state}']`));
		}
		
		const validMutations = mutations.filter(validMutation);
		if (validMutations.length > 0) {
			const selectedMutation = validMutations.find(answerMutation);
			if (selectedMutation) {
				const answerContent = answerMutation(selectedMutation);
				
				const data = {
					state: state,
					wrapper: lessonFooter,
					button: lessonFooter.querySelector(`button[data-test='player-next']`),
				}

				if (state === "incorrect") {
					data.language = answerContent.querySelector("div[dir='ltr']")?.lang;
					data.answer = answerContent.querySelector("div[dir='ltr']")?.textContent;
				}

				const event = new CustomEvent("answer", { detail: data });
				document.dispatchEvent(event);
			}
		}
	}
})();