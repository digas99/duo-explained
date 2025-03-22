/**
 * @fileoverview Class to parse the challenges from a Duolingo lesson.
 */

class ChallengeParser {
	
	/**
	 * Parses the challenge content.
	 * @returns {Object} The parsed challenge content.
	 */
	static parse(type, wrapper) {
		const exerciseHeader = wrapper.querySelector("h1[data-test='challenge-header']");
		const exercise = exerciseHeader?.innerText;
	
		let content, language;
		switch(type) {
			case "syllableTap":
			case "translate":
				content = this.parseTranslate(wrapper);
				break;
			case "characterMatch":
			case "match":
				content = this.parseMatch(wrapper);
				break;
			case "tapComplete":
				content = this.parseTapComplete(wrapper);
				break;
			case "gapFill":
				content = this.parseGapFill(wrapper);
				break;
			case "completeReverseTranslation":
				content = this.parseCompleteReverseTranslation(wrapper);
				break;
			case "readComprehension":
			case "dialogue":
				content = this.parseReadComprehension(wrapper);
				break;
			case "speak":
				content = this.parseSpeak(wrapper);
				break;
			case "transliterationAssist":
			case "reverseAssist":
			case "assist":
				content = this.parseAssist(wrapper);
				break;
			case "characterSelect":
			case "select":
				content = this.parseSelect(wrapper);
				break;
			case "transliterate":
				content = this.parseTransliterate(wrapper);
				break;
			case "partialReverseTranslate":
				content = this.parsePartialReverseTranslate(wrapper);
				content.answer = content.answer.replace(/\\n|\n/g, "");
				break;
			default:
				content = undefined;
				break;
		}

		// handle source and target language
		if (content && content.language) {
			language = content.language;
			delete content.language;
			
			try {
				language.ui = {
					document: document?.documentElement.lang,
					client: {
						main: window?.navigator?.language,
						options: window?.navigator?.languages
					}
				};
			} catch (error) {
				console.error(error);
			}
		}


		return {
			type,
			wrapper,
			exercise,
			content,
			language
		};
	}

	/**
	 * Parses data from a translation exercise where the user needs to translate a sentence using a word bank or typing.
	 * @param {Element} wrapper - The DOM element containing the exercise.
	 * @returns {Object} An object containing:
	 *   - sentence: {string} The sentence to be translated.
	 *   - answer: {Array<string>|string} The user's answer, either as an array of selected words or a typed string.
	 *   - wordBank: {Array<string>} The available words in the word bank.
	 * @example
	 * {
	 *   sentence: "I am a student.",
	 *   answer: ["I", "am", "a", "student"],
	 *   wordBank: ["I", "am", "a", "student", "teacher", "you"]
	 * }
	 */
	static parseTranslate(wrapper) {
		let wordBank = [], language = {};
		const wordBankWrapper = wrapper.querySelector("div[data-test='word-bank']");
		language.target = wordBankWrapper?.querySelector("button")?.lang;
		if (wordBankWrapper) {
			wordBank = Array.from(wordBankWrapper.children).map(wordElem => wordElem.innerText);
		}
	
		const sections = wrapper.querySelectorAll("div[dir='ltr']");
		let sentence = sections[0]?.innerText;
		language.source = sections[0]?.lang;
	
		let answer = sections[1] ? sections[1].innerText : wrapper.querySelector("textarea[data-test='challenge-translate-input']").value; 
		if (wordBankWrapper)
			answer = answer?.split("\n");
		else
			language.target = wrapper.querySelector("textarea[data-test='challenge-translate-input']")?.lang;
	
		return {sentence, answer, wordBank, language}
	}

	/**
	 * Parses data from a matching exercise where the user needs to match words or phrases from two columns.
	 * @param {Element} wrapper - The DOM element containing the exercise.
	 * @returns {Object} An object containing:
	 *   - source: {Object} The source column data.
	 *     - choices: {Array<Choice>} Array of source choices.
	 *     - language: {string} Language code of the source text.
	 *   - target: {Object} The target column data.
	 *     - choices: {Array<Choice>} Array of target choices.
	 *     - language: {string} Language code of the target text.
	 * @typedef {Object} Choice
	 * @property {number} option - The option number.
	 * @property {string} text - The text of the choice.
	 * @example
	 * {
	 *   source: {
	 *     choices: [{ option: 1, text: "Hello" }, { option: 2, text: "Goodbye" }],
	 *     language: "en"
	 *   },
	 *   target: {
	 *     choices: [{ option: 1, text: "Hola" }, { option: 2, text: "Adiós" }],
	 *     language: "es"
	 *   }
	 * }
	 */
	static parseMatch(wrapper) {
		const choices = wrapper.querySelectorAll("button");
		if (choices) {
			const nMatches = choices.length / 2;
			const source = Array.from(choices).slice(0, nMatches);
			const target = Array.from(choices).slice(nMatches);

			const parseChoice = (choice, lang) => {
				let [option, text] = choice.innerText.split("\n");
				if (lang === "ja")
					text = parseJapaneseFurigana(choice);

				return {
					"option": parseInt(option),
					text
				};
			}

			return {
				"source": {
					"choices": source.map(choice => parseChoice(choice, source[0].lang)),
					"language": source[0].lang
				},
				"target": {
					"choices": target.map(choice => parseChoice(choice, target[0].lang)),
					"language": target[0].lang
				}
			};
		}

		return {
			"source": {},
			"target": {}
		};
	}

	/**
	 * Parses data from a tap-to-complete exercise where the user completes a sentence by tapping words from a word bank.
	 * @param {Element} wrapper - The DOM element containing the exercise.
	 * @returns {Object} An object containing:
	 *   - sentence: {string} The sentence with blanks indicated by "<blank>".
	 *   - answer: {string|Array<string>} The user's answer, either as a string or array of selected words.
	 *   - wordBank: {Array<string>} The available words in the word bank.
	 * @example
	 * {
	 *   sentence: "She is <blank> teacher.",
	 *   answer: ["She", "is", "a", "teacher"],
	 *   wordBank: ["a", "an", "the", "teacher", "student"]
	 * }
	 */
	static parseTapComplete(wrapper) {
		let sentence = "", answer = [], language = {};

		const questionSection = wrapper.querySelector("div[dir='ltr']");
		language.source = questionSection?.firstElementChild.lang;
		if (questionSection) {
			sentence = Array.from(questionSection.children)
				.filter(span => !span.querySelector("button"))
				.map(span => span.textContent)
				.join("").split("  ").join(" <blank> ");

			answer = Array.from(questionSection.children)
				.map(span => {
					if (span.tagName === "DIV") {
						const button = Array.from(span.querySelectorAll("button"))
							.find(button => getComputedStyle(button.parentElement.parentElement).getPropertyValue("visibility") !== "hidden");

						return button?.textContent || "<blank>";
					}
					return span.textContent;
				})
				.join("").split("  ").join(" <blank> ");
		}
	
		let wordBank = [];
		const wordBankWrapper = wrapper.querySelector("div[data-test='word-bank']");
		language.target = wordBankWrapper?.querySelector("button")?.lang;
		if (wordBankWrapper) {
			wordBank = Array.from(wordBankWrapper.children).map(wordElem => wordElem.textContent);
		}
	
		return {sentence, answer, wordBank, language};
	}

	/**
	 * Parses data from a gap-fill exercise where the user fills in missing words in a sentence.
	 * @param {Element} wrapper - The DOM element containing the exercise.
	 * @returns {Object} An object containing:
	 *   - sentence: {string} The sentence with blanks indicated by "<blank>".
	 *   - answer: {string} The user's answer with filled words.
	 *   - options: {Array<Object>} Options for each blank.
	 *     - option: {string} The option identifier (e.g., "A", "B").
	 *     - choices: {Array<string>} The choices available for the blank.
	 * @example
	 * {
	 *   sentence: "He <blank> to school.",
	 *   answer: "He goes to school.",
	 *   choices: [
	 *     { option: "A", choices: ["goes", "go", "gone"] }
	 *   ]
	 * }
	 */
	static parseGapFill(wrapper) {
		let sentence = "", language = {};
	
		const questionSection = wrapper.querySelector("div[dir='ltr']");
		language.source = questionSection.firstElementChild.lang;
		if (questionSection) {
			sentence = Array.from(questionSection.children)
				.map(span => span.textContent)
				.map(text => text == '' ? "<blank>" : text)
				.join("");
		}
	
		let options = [];
		const optionsWrapper = wrapper.querySelector("div[aria-label='choice']");
		language.target = optionsWrapper?.querySelector("span[dir='ltr']")?.lang;
		if (optionsWrapper) {
			options = Array.from(optionsWrapper.children).map(child => {
				const option = parseInt(child.children[0].textContent);
				const choices = child.children[1]?.textContent.split(" ... ");

				if (child.ariaChecked === "true") {
					choices.forEach(choice => {
						sentence = sentence.replace("<blank>", choice);
					});
				}

				return {option, choices};
			});
		}
	
		// recover original if duolingo auto-filled with user answer
		let original = sentence;
		options.map(option => option.choices)
			.forEach(choices => {
				let temp = original;
				choices.forEach(choice => {
					temp = original.replace(choice, "<blank>");
				});
	
				if (temp !== sentence)
					original = temp;
			});
	
		return {
			sentence: original,
			answer: sentence,
			choices: options,
			language
		};
	}

	/**
	 * Parses data from a complete reverse translation exercise with blanks to fill.
	 * @param {Element} wrapper - The DOM element containing the exercise.
	 * @returns {Object} An object containing:
	 *   - sentence: {string} The original sentence in the source language.
	 *   - prompt: {string} The translation with blanks indicated by "<blank>".
	 *   - answer: {string} The user's filled-in translation.
	 * @example
	 * {
	 *   sentence: "Je suis un étudiant.",
	 *   prompt: "I am <blank> student.",
	 *   answer: "I am a student."
	 * }
	 */
	static parseCompleteReverseTranslation(wrapper) {
		const language = {};

		const sentence = wrapper.querySelector("div[dir='ltr']").innerText;
		language.source = wrapper.querySelector("div[dir='ltr']").lang;
		
		const answerWrapper = wrapper.querySelector("label[dir='ltr']");
		language.target = answerWrapper?.lang;
		let original = "", answer = "";
		if (answerWrapper) {
			Array.from(answerWrapper.children).forEach(span => {
				if (span.querySelector("input")) {
					original += "<blank>";
					answer += (span.querySelector("input").value || "<blank>");
				}
				else {
					original += span.textContent;
					answer += span.textContent;
				}
			});
		}
		else {
			language.target = wrapper.querySelector("textarea[data-test='challenge-translate-input']")?.lang;
		}
	
		return {
			sentence,
			prompt: original,
			answer,
			language
		}
	}

	/**
	 * Parses data from a reading comprehension exercise where the user answers a question based on a text.
	 * @param {Element} wrapper - The DOM element containing the exercise.
	 * @returns {Object} An object containing:
	 *   - sentence: {string} The text to read.
	 *   - prompt: {string} The correct answer.
	 *   - choices: {Array<Choice>} Possible answer choices.
	 *   - answer: {Choice} The choice selected by the user.
	 * @example
	 * {
	 *   sentence: "The cat sat on the mat.",
	 *   prompt: "The cat is sitting.",
	 *   choices: [
	 *     { option: 1, text: "The cat is sleeping." },
	 *     { option: 2, text: "The cat is sitting." },
	 *     { option: 3, text: "The cat is eating." }
	 *   ],
	 *   answer: { option: 2, text: "The cat is sitting." }
	 * }
	 */
	static parseReadComprehension(wrapper) {
		const sections = wrapper.querySelectorAll("div[dir='ltr']");
		const sentence = sections[0].innerText;
	
		const prompt = sections[1].innerText;
		const choicesWrapper = wrapper.querySelector("div[aria-label='choice']");
		const {choices, answer} = choiceParser(choicesWrapper);
		
		if (Object.keys(answer).length === 0)
			return { sentence, prompt, choices };
	
		return { sentence, prompt, choices, answer };
	}

	/**
	 * Parses data from a speaking exercise where the user needs to speak a given sentence.
	 * @param {Element} wrapper - The DOM element containing the exercise.
	 * @returns {Object} An object containing:
	 *   - sentence: {string} The sentence to be spoken.
	 *   - language: {string} The language code of the sentence.
	 * @example
	 * {
	 *   sentence: "Bonjour",
	 *   language: "fr"
	 * }
	 */
	static parseSpeak(wrapper) {
		const sentenceWrapper = wrapper.querySelector("div[dir='ltr']");
		const sentence = sentenceWrapper.innerText;
		const language = sentenceWrapper.lang;
		return {sentence, language};
	}
	
	/**
	 * Parses data from an assist exercise where the user selects the correct answer from multiple choices.
	 * @param {Element} wrapper - The DOM element containing the exercise.
	 * @returns {Object} An object containing:
	 *   - sentence: {string} The question or prompt.
	 *   - choices: {Array<Choice>} Possible answer choices.
	 *   - answer: {Choice} The choice selected by the user.
	 * @example
	 * {
	 *   sentence: "Select the correct translation for 'apple'.",
	 *   choices: [
	 *     { option: 1, text: "pomme" },
	 *     { option: 2, text: "banane" },
	 *     { option: 3, text: "orange" }
	 *   ],
	 *   answer: { option: 1, text: "pomme" }
	 * }
	 */
	static parseAssist(wrapper) {
		const sentence = wrapper.querySelector("div[dir='ltr']").innerText;
		const choicesWrapper = wrapper.querySelector("div[aria-label='choice']");
		const {choices, answer} = choiceParser(choicesWrapper);
		return {sentence, choices, answer};
	}

	/**
	 * Parses data from a selection exercise where the user selects the correct option from choices.
	 * @param {Element} wrapper - The DOM element containing the exercise.
	 * @returns {Object} An object containing:
	 *   - choices: {Array<Choice>} Possible answer choices.
	 *   - answer: {Choice} The choice selected by the user.
	 * @example
	 * {
	 *   choices: [
	 *     { option: 1, text: "Dog" },
	 *     { option: 2, text: "Cat" },
	 *     { option: 3, text: "Bird" }
	 *   ],
	 *   answer: { option: 2, text: "Cat" }
	 * }
	 */
	static parseSelect(wrapper) {
		const choicesWrapper = wrapper.querySelector("div[aria-label='choice']");
		const {choices, answer} = choiceParser(choicesWrapper, true);

		if (Object.keys(answer).length === 0)
			return {choices};
		return {choices, answer};
	}

	/**
	 * Parses data from a transliteration exercise where the user transliterates a word.
	 * @param {Element} wrapper - The DOM element containing the exercise.
	 * @returns {Object} An object containing:
	 *   - word: {string} The word to transliterate.
	 *   - language: {string} The language code of the word.
	 *   - answer: {string} The user's transliteration.
	 * @example
	 * {
	 *   word: "こんにちは",
	 *   language: "ja",
	 *   answer: "konnichiwa"
	 * }
	 */
	static parseTransliterate(wrapper) {
		const wordWrapper = wrapper.querySelector("span[dir='ltr']");
		const word = wordWrapper.innerText;
		const language = wordWrapper.lang;
		const answer = wrapper.querySelector("input[data-test='challenge-text-input']").value;
		return {word, language, answer};
	}

	/**
	 * Parses data from a partial reverse translation exercise with partial assistance.
	 * @param {Element} wrapper - The DOM element containing the exercise.
	 * @returns {Object} An object containing:
	 *   - sentence: {string} The sentence in the source language.
	 *   - answer: {string} The expected translation with some words provided.
	 *   - language: {string} The language code of the translation.
	 * @example
	 * {
	 *   sentence: "Elle est une étudiante.",
	 *   answer: "She is a <blank>.",
	 *   language: "en"
	 * }
	 */
	static parsePartialReverseTranslate(wrapper) {
		const sentence = wrapper.querySelector("div[dir='ltr']").innerText;
		const answerWrapper = wrapper.querySelector("label[dir='ltr']");
		const answer = (answerWrapper.innerText).replace(/\\n|\nl/g, '');
		const language = answerWrapper.lang;
		return {sentence, answer, language}
	}
}

if (typeof window !== 'undefined') {
    window.ChallengeParser = ChallengeParser;
}


/* Auxiliar parsing functions */

const choiceParser = (wrapper, reverse=false) => {
	let choices = [], answer = {};
	if (wrapper) {
		choices = Array.from(wrapper.children).map(choice => {
			let [option, text] = choice.innerText.split("\n");
			if (reverse)
				[option, text] = [text, option];
			
			// if it has an image
			let image;
			const img = choice.querySelector("div[style^='background-image']");
			if (img)
				image = img.style.backgroundImage.match(/url\("(.*)"\)/)[1];

			const object = {
				"option": parseInt(option),
				text
			}

			if (image) object.image = image;

			if (choice.ariaChecked === "true") {
				answer = object;
			}

			return object;
		});
	}
	return {choices, answer};
}
