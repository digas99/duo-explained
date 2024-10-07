const parseChallenge = (type, wrapper) => {
	const questionHeader = wrapper.querySelector("h1[data-test='challenge-header']");
	const question = questionHeader?.innerText;

	let content;
	switch(type) {
		case "syllableTap":
		case "translate":
			content = parseTranslate(wrapper);
			break;
		case "characterMatch":
		case "match":
			content = parseMatch(wrapper);
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
		case "speak":
			content = parseSpeak(wrapper);
			break;
		case "transliterationAssist":
		case "reverseAssist":
		case "assist":
			content = parseAssist(wrapper);
			break;
		case "characterSelect":
		case "select":
			content = parseSelect(wrapper);
			break;
		case "transliterate":
			content = parseTransliterate(wrapper);
			break;
		case "partialReverseTranslate":
			content = parsePartialReverseTranslate(wrapper);
			content.answer = content.answer.replace(/\\n|\n/g, "");
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


const parseTranslate = wrapper => {
	let wordBank = [];
	const wordBankWrapper = wrapper.querySelector("div[data-test='word-bank']");
	if (wordBankWrapper) {
		wordBank = Array.from(wordBankWrapper.children).map(wordElem => wordElem.innerText);
	}

	const sections = wrapper.querySelectorAll("div[dir='ltr']");
	let sentence = sections[0]?.innerText;

	let userAnswer = sections[1] ? sections[1].innerText : wrapper.querySelector("textarea[data-test='challenge-translate-input']").value; 
	if (wordBankWrapper)
		userAnswer = userAnswer.split("\n");

	return {sentence, userAnswer, wordBank};
}

const parseMatch = wrapper => {
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

const parseTapComplete = wrapper => {
	let sentence = "", userAnswer = [];

	const questionSection = wrapper.querySelector("div[dir='ltr']");
	if (questionSection) {
		sentence = Array.from(questionSection.children)
			.filter(span => !span.querySelector("button"))
			.map(span => span.innerText)
			.join("").split("  ").join(" <blank> ");
;
		userAnswer = Array.from(questionSection.children)
			.map(span => span.innerText)
			.join("").split("  ").join(" <blank> ");
	}

	let wordBank = [];
	const wordBankWrapper = wrapper.querySelector("div[data-test='word-bank']");
	if (wordBankWrapper) {
		wordBank = Array.from(wordBankWrapper.children).map(wordElem => wordElem.innerText);
	}

	return {sentence, userAnswer, wordBank};
}

const parseGapFill = wrapper => {
	let sentence = "";

	const questionSection = wrapper.querySelector("div[dir='ltr']");
	if (questionSection) {
		sentence = Array.from(questionSection.children)
			.map(span => span.innerText)
			.map(text => text == '' ? "<blank>" : text)
			.join("");
	}

	let options = [];
	const optionsWrapper = wrapper.querySelector("div[aria-label='choice']");
	if (optionsWrapper) {
		options = Array.from(optionsWrapper.children).map(child => {
			const innerText = child.innerText.split("\n");
			const option = innerText[0];
			const choices = innerText[1].split(" ... ");
			return {option, choices};
		});
	}

	// recover original if duolingo auto-filled with user answer
	// TODO: not working
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
		userAnswer: sentence,
		options
	};
}

const parseCompleteReverseTranslation = wrapper => {
	const sentence = wrapper.querySelector("div[dir='ltr']").innerText;
	
	const answerWrapper = wrapper.querySelector("label[dir='ltr']");
	let original = "", userAnswer = "";
	if (answerWrapper) {
		Array.from(answerWrapper.children).forEach(span => {
			if (span.querySelector("input")) {
				original += "<blank>";
				userAnswer += (span.querySelector("input").value || "<blank>");
			}
			else {
				original += span.innerText;
				userAnswer += span.innerText;
			}
		});
	}

	return {
		sentence,
		answer: original,
		userAnswer
	}
}

const parseReadComprehension = wrapper => {
	const sections = wrapper.querySelectorAll("div[dir='ltr']");
	const sentence = sections[0].innerText;

	const answer = sections[1].innerText;
	const choicesWrapper = wrapper.querySelector("div[aria-label='choice']");
	const {choices, userAnswer} = choiceParser(choicesWrapper);

	return { sentence, answer, choices, userAnswer };
}

const parseSpeak = wrapper => {
	const sentenceWrapper = wrapper.querySelector("div[dir='ltr']");
	const sentence = sentenceWrapper.innerText;
	const language = sentenceWrapper.lang;
	return {sentence, language};
}

const parseAssist = wrapper => {
	const sentence = wrapper.querySelector("div[dir='ltr']").innerText;
	const choicesWrapper = wrapper.querySelector("div[aria-label='choice']");
	const {choices, userAnswer} = choiceParser(choicesWrapper);
	return {sentence, choices, userAnswer};
}

const parseSelect = wrapper => {
	const choicesWrapper = wrapper.querySelector("div[aria-label='choice']");
	return choiceParser(choicesWrapper, true);
}

const parseTransliterate = wrapper => {
	const wordWrapper = wrapper.querySelector("span[dir='ltr']");
	const word = wordWrapper.innerText;
	const language = wordWrapper.lang;
	const userAnswer = wrapper.querySelector("input[data-test='challenge-text-input']").value;
	return {word, language, userAnswer};
}

const parsePartialReverseTranslate = wrapper => {
	const sentence = wrapper.querySelector("div[dir='ltr']").innerText;
	const answerWrapper = wrapper.querySelector("label[dir='ltr']");
	const answer = (answerWrapper.innerText).replace(/\\n|\nl/g, '');
	const language = answerWrapper.lang;
	return {sentence, answer, language}
}

/* Auxiliar parsing functions */

const choiceParser = (wrapper, reverse=false) => {
	let choices = [], userAnswer = {};
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
				userAnswer = object;
			}

			return object;
		});
	}
	return {choices, userAnswer};
}