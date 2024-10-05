
const parseCharacterSelect = wrapper => {
	const choices = wrapper.querySelector("div[aria-label='choice']");
	let result = { "choices": [] };
	if (choices) {
		result["choices"] = Array.from(choices.children).map(choice => {
			const [text, option] = choice.innerText.split("\n");
			return {
				option,
				text
			};
		});
	}
	return result
}

const parseCharacterMatch = wrapper => {

}

const parseTranslate = wrapper => {

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