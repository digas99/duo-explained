
const parseCharacterSelect = wrapper => {
	const choices = wrapper.querySelector("div[aria-label='choice']");
	let result = [], userAnswer = {};
	if (choices) {
		result = Array.from(choices.children).map(choice => {
			const [text, option] = choice.innerText.split("\n");
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
	return {
		"choices": result,
		"userAnswer": userAnswer
	};
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
	let question = sections[0]?.innerText;
	if (sections[0].lang === "ja")
		question = parseJapaneseFurigana(sections[0]);

	let answer = sections[1] ? sections[1].innerText : wrapper.querySelector("textarea[data-test='challenge-translate-input']").value; 
	if (wordBankWrapper)
		answer = answer.split("\n");

	return {
		"question": question,
		"userAnswer": answer,
		"wordBank": wordBank
	};
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

const parseSelectPronunciation = wrapper => {
	
}

const parseTapComplete = wrapper => {

}

const parseGapFill = wrapper => {

}

const parseCompleteReverseTranslation = wrapper => {

}