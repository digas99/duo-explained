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
 * 		"language": {										// The source and target languages of the sentence	
 * 			"source": "en",
 * 			"target": "fr"
 * 		}
 * }
 */

class ChallengeData {
	constructor(data) {
		if (!data) throw new Error("ChallengeData constructor requires an object.");

		this.content = data.content;
		this.wrapper = data.wrapper;
		this.exercise = data.exercise;
		this.type = data.type;
		this.language = data.language;

		console.log("ChallengeData", this.get());

		this.validate();
	}

	get() {
		return {
			content: this.content,
			wrapper: this.wrapper,
			exercise: this.exercise,
			type: this.type,
			language: this.language
		};
	}

	validate() {
		this.validateContent();
		this.validateExcercise();
		this.validateType();
		// this.validateLanguage(); TODO: Uncomment this line when all parser have this implemented
	}

	validateContent() {
		// not having content means the challenge hasn't been dealed with yet
		// so we don't throw an error
		if (!this.content)
			return;

		if (!this.content.sentence &&
			!this.type === "select"
		)
			throw new Error("ChallengeData content.sentence is required.");

		if (this.content.prompt && typeof this.content.prompt !== "string")
			throw new Error("ChallengeData content.prompt must be a string.");

		if (
			this.content.answer &&
			!(typeof this.content.answer.text === "string" || Array.isArray(this.content.answer)) &&
			this.type === "select"
		)
			throw new Error("ChallengeData content.answer must be a string or an array.");

		if (
			this.content.answer &&
			!(typeof this.content.answer === "string" || Array.isArray(this.content.answer) || typeof this.content.answer === "object") &&
			this.type !== "select"
		)
			throw new Error("ChallengeData content.answer must be a string or an array.");

		if (this.content.wordBank && !Array.isArray(this.content.wordBank))
			throw new Error("ChallengeData content.wordBank must be an array.");

		if (this.content.choices && !Array.isArray(this.content.choices))
			throw new Error("ChallengeData content.choices must be an array.");
	}

	validateExcercise() {
		if (!(this.exercise && typeof this.exercise === "string"))
		throw new Error(
			"ChallengeData exercise is required and must be a string."
		);
	}

	validateType() {
		if (!(this.type && typeof this.type === "string"))
			throw new Error("ChallengeData type is required and must be a string.");
	}

	validateLanguage() {
		if (this.content && !(this.language && this.language.source && this.language.target))
			throw new Error("ChallengeData language.source and language.target are required.");
	}
}

if (typeof window !== 'undefined') {
    window.ChallengeData = ChallengeData;
}

(async () => {
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

            // Create a new MutationObserver
            observer = new MutationObserver(async (mutationsList) => {
                if (mutationsList.length > 0) {
					nextChallenge(mutationsList);
	
					mutationsList.forEach(mutation => {
						// detect no challenge screen
						if (mutation.removedNodes && mutation.removedNodes.length > 0) {
							const challenge = document.querySelector("div[data-test^='challenge']");
							if (!challenge) {
								const event = new CustomEvent("nochallenge");

								document.dispatchEvent(event);
							}
						}

						// detect session complete
						mutation.addedNodes.forEach(node => {
							if (node.closest) {
								const sessionCompleteAnimation = node.tagName === "svg" && node.closest("div[data-test='session-complete-slide']");
								if (sessionCompleteAnimation) {
									const statsWrapper = sessionCompleteAnimation.parentElement.lastElementChild;
			
									const event = new CustomEvent("lessonend", { detail: {
										statsWrapper: statsWrapper
									}});
									document.dispatchEvent(event);
								}
							}
						});
					});
				}
            });

            observer.observe(document.body, { childList: true, subtree: true });

            // Process current content if already present
            const challengeWrapper = document.querySelector("div[data-test^='challenge']");
            if (challengeWrapper) {
                nextChallenge([]); // Pass an empty array to indicate initial processing
            }
        } catch (error) {
            console.error("Error in init():", error);
        }
    }

    function nextChallenge(mutations) {
        const challengeWrapper = document.querySelector("div[data-test^='challenge']");
        if (!challengeWrapper) return;

        const challengeContent = mutations.length === 0 ? challengeWrapper : findChallengeInMutations(mutations);

        if (challengeContent) {
            const type = challengeContent.dataset.test.replace("challenge challenge-", "");
            if (type) {
                const data = new ChallengeData(ChallengeParser.parse(type, challengeContent));
                const event = new CustomEvent("challenge", { detail: {
					data,
					reload: mutations.length === 0
				}});
                document.dispatchEvent(event);
            }
        }
    }

    function findChallengeInMutations(mutations) {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node instanceof HTMLElement) {
                    const challengeContent = node.querySelector("div[data-test^='challenge']");
                    if (challengeContent)
                        return challengeContent;
                }
            }
        }
        return null;
    }

	async function extensionActive() {
        return new Promise((resolve) => {
            chrome.storage.sync.get("SETTINGS", (data) => {
            	resolve(data.SETTINGS?.["extension-enabled"]);
            });
        });
    }
})();
