/**
 * @fileoverview Script to setup the 'answer' event listener on a Duolingo lesson.
 */

/**
 * Answer data object used in lesson.js as lesson.answer.
 * @typedef {Object} AnswerData
 * @example
 * {
 *     "details": {
 *!        (optional) "language": "fr",					// The language of the solution maybe
 *         "state": "correct",					// The state of the answer (correct or incorrect)
 *     	   "wrapper": <HTMLElement>,
 * 	   	   "button": <HTMLElement>,
 *     },
 *     "challenge": @instance {Challenge}		// The challenge object from challenge.js
 *     (optional) "solution": "Je suis un homme.",	    	// The correct answer from Duolingo
 * }
 */

class AnswerData {
	constructor(data) {
		if (!data)
			throw new Error("AnswerData constructor requires an object.");

		this.details = data.details;
		this.challenge = data.challenge;
		this.solution = data.solution;

		this.validate();
	}
	
	get() {
		return {
			details: this.details,
			challenge: this.challenge,
			solution: this.solution
		}
	}

	validate() {
		this.validateDetails();
		this.validateChallenge();
		this.validateSolution();
	}

	validateDetails() {
		if (!this.details)
			throw new Error("AnswerData details is required.");

		if (!this.details.state)
			throw new Error("AnswerData details.state is required.");

		if (this.details.state === "incorrect" && !this.details.language)
			throw new Error("AnswerData details.language is required for incorrect answers.");

		if (this.details.language && typeof this.details.language !== "string")
			throw new Error("AnswerData details.language must be a string.");

		if (this.details.state && typeof this.details.state !== "string")
			throw new Error("AnswerData details.state must be a string.");

		if (this.details.state !== "correct" && this.details.state !== "incorrect")
			throw new Error("AnswerData details.state must be 'correct' or 'incorrect'.");
	}

	validateChallenge() {
		if (!this.challenge)
			throw new Error("AnswerData challenge is required.");
	
		if (this.challenge && !(this.challenge instanceof ChallengeData))
			throw new Error("AnswerData challenge must be an instance of ChallengeData.");
	}

	validateSolution() {
		if (this.details.state === "incorrect" && !(this.solution && typeof this.solution === "string"))
			throw new Error("AnswerData solution is required for incorrect answers and must be a string.");
	}
}

if (typeof window !== 'undefined') {
    window.AnswerData = AnswerData;
}

(async () => {
	const { storage } = await import(chrome.runtime.getURL("scripts/config.js"));

	let observer;

	// Expose init to global scope if necessary
	window.init = init;

	document.addEventListener("REFETCH_DATA", async function (event) {
		await init();
	});

	init();

	async function init() {
		try {
            if (typeof extensionActive === "function") {
				if (!(await extensionActive())) return;
            }

            if (typeof MutationObserver === "undefined") return;

			// Disconnect existing observer if it exists
			if (observer) observer.disconnect();

			// detect answers
			observer = new MutationObserver((mutationsList) => {
				const lessonFooter = document.getElementById("session/PlayerFooter");
				if (lessonFooter) {
					answered(mutationsList, "incorrect");
					answered(mutationsList, "correct");
				}
			});
			
			observer.observe(document.body, { childList: true, subtree: true });
			
			// Process current content if already present
			const lessonFooter = document.getElementById("session/PlayerFooter");
			if (lessonFooter) {
				answered([], "incorrect");
				answered([], "correct");
			}
		} catch (error) {
			console.error("Error in init():", error);
		}

		function answered(mutations, state) {
			const lessonFooter = document.getElementById("session/PlayerFooter");
			const answerContent = mutations.length === 0 ? lessonFooter.querySelector(`div[data-test='blame blame-${state}']`) : findAnswerInMutation(mutations, lessonFooter, state);

			if (answerContent) {
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

				const event = new CustomEvent("answer", { detail:
					new AnswerData({
						details: answerData,
						challenge: new ChallengeData(ChallengeParser.parse(challengeType, challenge)),
						solution: solution
					})
				});
				document.dispatchEvent(event);
			}
		}
	}

	function findAnswerInMutation(mutations, lessonFooter, state) {
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
			if (selectedMutation)
				return answerMutation(selectedMutation);
		}
		
		return null
	}

	async function extensionActive() {
        return new Promise((resolve) => {
            storage.get("SETTINGS", (data) => {
            	resolve(data.SETTINGS?.["extension-enabled"]);
            });
        });
    }
})();
