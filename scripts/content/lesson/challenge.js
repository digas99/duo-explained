/**
 * @fileoverview Script to setup the 'challenge' event listener on a Duolingo lesson.
 */

/**
 * Challenge data object used in lesson.js as lesson.challenge as the snapshot of challenge not answered by the user.
 * Challenge data ojbect can also be used in answer.js as answer.challenge as the challenge answered by the user. 
 * @typedef {Object} ChallengeData
 * @example
 * {
 *     "content": {
 * 	       "sentence": "I am student",						// The sentence of question itself
 *         (optional) "prompt":								// The prompt of the exercise
 *         (optional) "answer":
 *         (optional) "wordBank":
 * 	       (optional) "choices":
 *     },
 *     "wrapper": <HTMLElement>,							// The wrapper of the challenge
 *TODO:"language": {
 *	       "source": "en",									// The source language of the sentence
 *	       "target": "fr"									// The target language of the user answer
 *		},
 *      "exercise": "Translate the sentence.",				// The description of the exercise 
 *      "type": "translate",								// The type of the exercise
 * }
 */

class ChallengeData {

}

(async () => {
	if (!(await extensionActive())) return; 

	// observe mutations to the content of div[data-test^="challenge"]
	const observer = new MutationObserver(async (mutationsList, observer) => {
		if (!(await extensionActive())) return; 

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
					const data = ChallengeParser.parse(type, challengeContent);
					const event = new CustomEvent("challenge", { detail: data });
					document.dispatchEvent(event);
				}
			}
		}
	}
})();
