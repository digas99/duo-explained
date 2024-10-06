
const parseCharacterSelect = wrapper => {
	const choicesWrapper = wrapper.querySelector("div[aria-label='choice']");
	return choiceParser(choicesWrapper, true);
}

const parseCharacterMatch = wrapper => {

}

const parseTranslate = wrapper => {
	let wordBank = [];
	const wordBankWrapper = wrapper.querySelector("div[data-test='word-bank']");
	if (wordBankWrapper) {
		wordBank = Array.from(wordBankWrapper.children).map(wordElem => wordElem.innerText);
	}

	const sections = wrapper.querySelectorAll("div[dir='ltr']");
	let sentence = sections[0]?.innerText;
	if (sections[0].lang === "ja")
		sentence = parseJapaneseFurigana(sections[0]);

	let userAnswer = sections[1] ? sections[1].innerText : wrapper.querySelector("textarea[data-test='challenge-translate-input']").value; 
	if (wordBankWrapper)
		userAnswer = userAnswer.split("\n");

	return {sentence, userAnswer, wordBank};
}

const parseListenTap = wrapper => {
	
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
				option,
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

const parseSelectPronunciation = wrapper => {querySelector("div[dir='ltr']").innerText.split("\n \n").map(text => text.replaceAll("\n", ""))
	
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

const parseSelectTranscription = wrapper => {

}

const parseListenIsolation = wrapper => {

}

const parseListenComplete = wrapper => {

}

const parseSpeak = wrapper => {
	const sentence = wrapper.querySelector("div[dir='ltr']").innerText;
	return {sentence};
}

/* Auxiliar parsing functions */

const choiceParser = (wrapper, reverse=false) => {
	let choices = [], userAnswer = {};
	if (wrapper) {
		choices = Array.from(wrapper.children).map(choice => {
			let [option, text] = choice.innerText.split("\n");
			if (reverse)
				[option, text] = [text, option];
			
			const object = {
				option,
				text
			}

			if (choice.ariaChecked === "true") {
				userAnswer = object;
			}

			return object;
		});
	}
	return {choices, userAnswer};
}