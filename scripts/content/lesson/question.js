(() => {
	// observe mutations to the content of div[data-test^="challenge"]
	const observer = new MutationObserver((mutationsList, observer) => {
		const challengeWrapper = document.querySelector("div[data-test^='challenge']");
		if (challengeWrapper) {
			nextChallenge(mutationsList);
		}
	});

	observer.observe(document.body, { childList: true, subtree: true });

	const nextChallenge = (mutations) => {
		const challengeWrapper = document.querySelector("div[data-test^='challenge']");
		
		const validMutation = mutation =>
			mutation.type === "childList" &&
			mutation.addedNodes.length > 0;

		const challengeMutation = mutation => {
			const nodes = Array.from(mutation.addedNodes);
			const challengeMutation = nodes.find(node => node && node instanceof HTMLElement && node.querySelector("div[data-test^='challenge']") === challengeWrapper);
			return challengeMutation?.querySelector("div[data-test^='challenge']");
		}

		const validMutations = mutations.filter(validMutation);
		if (validMutations.length > 0) {
			const selectedMutation = validMutations.find(challengeMutation);
			if (selectedMutation) {
				const challengeContent = challengeMutation(selectedMutation);
				const type = challengeContent?.dataset.test.replace("challenge challenge-", "");
				if (type) {
					const data = parseChallenge(type, challengeContent);
					const event = new CustomEvent("challenge", { detail: data });
					document.dispatchEvent(event);
				}
			}
		}
	}
})();

const parseChallenge = (type, wrapper) => {
	const questionHeader = wrapper.querySelector("h1[data-test='challenge-header']");
	const question = questionHeader?.innerText;

	let content;
	switch(type) {
		case "characterSelect":
			content = parseCharacterSelect(wrapper);
			break;
		case "translate":
			content = parseTranslate(wrapper);
			break;
		case "listenTap":
			content = parseListenTap(wrapper);
			break;
		case "characterMatch":
		case "match":
			content = parseMatch(wrapper);
			break;
		case "selectPronunciation":
			content = parseSelectPronunciation(wrapper);
			break;
		case "tapComplete":
			content = parseTapComplete(wrapper);
			break;
		case "gapFill":
			content = parseGapFill(wrapper);
			break;
		case "completeReverseTranslation":
			content = parseCompleteReverseTranslation(wrapper);
			break;
		case "readComprehension":
			content = parseReadComprehension(wrapper);
			break;
		case "selectTranscription":
			content = parseSelectTranscription(wrapper);
			break;
		case "listenIsolation":
			content = parseListenIsolation(wrapper);
			break;
		case "listenComplete":
			content = parseListenComplete(wrapper);
			break;
		default:
			content = undefined;
			break;
	}

	return {
		type,
		wrapper,
		question,
		content
	};
}