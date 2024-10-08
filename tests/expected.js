module.exports = {
	'translate': {
		"content": {
			"sentence": "Tu dois aller à New York.",
			"userAnswer": [
				"You",
				"have",
				"to",
				"go",
				"to",
				"New",
				"York"
			],
			"wordBank": [
				"after",
				"for",
				"to",
				"go",
				"streets",
				"You",
				"have",
				"York",
				"tree",
				"New",
				"to"
			]
		},
		"question": "Write this in English",
		"wrapper": {},
		"type": "translate"
	},
	'completeReverseTranslation': {
		"content": {
			"sentence": "I have to turn here.",
			"answer": "Je dois <blank> ici.",
			"userAnswer": "Je dois tourner ici."
		},
		"question": "Type the missing word",
		"wrapper": {},
		"type": "completeReverseTranslation"
	},
	'gapFill': {
		"content": {
			"sentence": "Bonjour Marc, c'est moi, Elsa ; <blank>, devant ta maison.",
			"userAnswer": "Bonjour Marc, c'est moi, Elsa ; je suis ici, devant ta maison.",
			"options": [
				{
					"option": 1,
					"choices": [
						"je suis professeur"
					]
				},
				{
					"option": 2,
					"choices": [
						"j'ai un lit"
					]
				},
				{
					"option": 3,
					"choices": [
						"je suis ici"
					]
				}
			]
		},
		"question": "Fill in the blank",
		"wrapper": {},
		"type": "gapFill"
	}
};