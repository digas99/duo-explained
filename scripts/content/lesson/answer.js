/**
 * @fileoverview Script to setup the 'answer' event listener on a Duolingo lesson.
 */

/**
 * Answer data object used in lesson.js as lesson.answer.
 * @typedef {Object} AnswerData
 * @example
 * {
 *     "details": {
 *!        "language": "fr",					// The language of the solution maybe
 *         "state": "correct",					// The state of the answer (correct or incorrect)
 *     	   "wrapper": <HTMLElement>,
 * 	   	   "button": <HTMLElement>,
 *     },
 *     "challenge": @instance {Challenge}		// The challenge object from challenge.js
 *     "solution": "Je suis un homme.",	    	// The correct answer from Duolingo
 * }
 */

 class AnswerData {
	
 }

(async () => {
	if (!(await extensionActive())) return; 
	
	// detect answers
	const observer = new MutationObserver(async (mutationsList, observer) => {
		if (!(await extensionActive())) return; 

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
				let solution;
				
				const answerData = {
					state: state,
					wrapper: lessonFooter,
					button: lessonFooter.querySelector(`button[data-test='player-next']`),
				}

				if (state === "incorrect") {
					answerData.language = answerContent.querySelector("div[dir='ltr']")?.lang;
					solution = answerContent.querySelector("div[dir='ltr']")?.textContent;
				}

				const challenge = document.querySelector("div[data-test^='challenge']");
				const challengeType = challenge?.dataset.test.replace("challenge challenge-", "");

				const event = new CustomEvent("answer", { detail: {
					"details": answerData,
					"challenge": ChallengeParser.parse(challengeType, challenge),
					"solution": solution
				} });
				document.dispatchEvent(event);
			}
		}
	}
})();
