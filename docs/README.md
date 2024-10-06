# Duolingo ChatGPT Documentation

Documentation to assist in the development of the Duolingo ChatGPT project.

# Table of Contents
1. [Project Structure](#project-structure)
2. [Service Worker](#service-worker)
3. [Content Scripts](#content-scripts)
   1. [Lesson](#lesson)
      1. [Question](#question)
      2. [Challenge Parsers](#challenge-parsers)
		 1. [assist](#assist)
		 2. [characterMatch](#match)
         3. [characterSelect](#select)
         4. [completeReverseTranslation](#completereversetranslation)
         5. [gapFill](#gapfill)
         6. [match](#match)
		 7. [readComprehension](#readcomprehension)
		 8. [select](#select)
		 9. [speak](#speka)
		 10. [tapComplete](#tapcomplete)
		 11. [translate](#translate)
4. [ChatGPT Module](#chatgpt-module)

# Project Structure


# Content Scripts

The content scripts are responsible for injecting data into the Duolingo web application and handling the communication between the Duolingo exercises and our [ChatGPT module](#chatgpt-module).

## Lesson

The lesson module parses the exercises and provides the necessary context for the exaplantion.

Two sections of the page are parsed, the `Question` (or `Challenge`, as it is called in the Duolingo codebase) and the `Answer`. Two **Events** are also introduced, that carry the parsed data and are triggered when each of the data is available.

### Question

The `Question` section is parsed by the [Challenge Parsers](#challenge-parsers) and the parsed data is carried by the `challenge` event.

```javascript
document.addEventListener('challenge', (event) => {
  const challenge = event.detail;
  console.log(challenge);
});
```

This event is triggered whenever a new question is presented to the user.

The `event.detail` object has the following structure:

```javascript
{
  type: 'translate',
  question: 'Write this in English',
  wrapper: '<HTMLElement>',
  content: '<parsed data>'
}
```

### Challenge Parsers

The `Challenge Parsers` are responsible for parsing the `Question` section of the page and extracting the necessary data. The parsed data is then carried by the `challenge` event.

Because Duolingo exercises are dynamic and can change, the `Challenge Parsers` are divided into different parsers, each responsible for a different type of exercise.

The challenges and their respective data are:

#### assist

Select the correct option that translates the sentence provided.

[Visual reference](/docs/types/duolingo-assist.png)

```javascript
{
	choices: [
		{option: 1, text: '固く'},
		...
	],
	sentence: 'hard',
	userAnswer: {option: 1, text: '固く'}
}
```

#### completeReverseTranslation

Type the missing word from a translation.

[Visual reference](/docs/types/duolingo-completeReverseTranslation.png)

```javascript
{
	sentence: 'an important street',
	answer: 'une <blank> importante',
	userAnswer: 'une rue importante'
}
```

#### gapFill

Fill in the blanks in a sentence using one of the options provided.

[Visual reference](/docs/types/duolingo-gapFill.png)

```javascript
{
	options: [
		{
			option: 1,
			choices: ['marcher', 'la voiture']
		},
		...
	],
	sentence: "j'aime <blank>, je ne prends pas <blank>.",
	userAnswer: "j'aime marcher, je ne prends pas la voiture."
}
```

#### match

Same approach goes to `characterMatch`.

Select the matching pairs between a source list and a target list.

[VIsual reference](/docs/types/duolingo-match.png)

```javascript
{
	source: {
		choices: [
			{option: 1, text: '固く'},
			...
		],
		language: 'ja'
	},
	target: {
		choices: [
			{option: 6, text: 'human'},
			...
		],
		language: 'en'
	}
}
```

#### readComprehension

Read the sentence and complete the answer provided with one of the options.

[Visual reference](/docs/types/duolingo-readComprehension.png)

```javascript
{
	answer: "Aujourd'hui, il...",
	choices: [
		{option: 1, text: 'prend le métro'},
		...
	],
	sentence: "Je dois travailler aujourd'hui...",
	userAnswer: {option: 1, text: 'prend le métro'}
}
```

#### select

Same approach goes to `characterSelect`.

Select the correct option from a list of vocabulary.

The `choices` may contain an image.

[Visual reference[1]](/docs/types/duolingo-select.png) [[2]](/docs/types/duolingo-characterSelect.png)

```javascript
{
	choices: [
		{option: 1, text: '固く', image: 'https://...'},
		...
	],
	userAnswer: {option: 1, text: '固く', image: 'https://...'}
}
```

#### speak

Speak the sentence that is presented.

[Visual reference](/docs/types/duolingo-speak.png)

```javascript
{
	sentence: "Émile! Tu n'as pas...",
	language: 'fr'
}
```

#### tapComplete

Complete the sentence by tapping the words from the word bank in the correct order.

The `sentence` object provides the sentence with the `<blank>` placeholders.

The `userAnswer` array contains the words that the user selected in that exact order.

[Visual reference](/docs/types/duolingo-tapComplete.png) 

```javascript
{
	sentence: "Je dois <blank> à la gare. Nous <blank> à Paris.",
	userAnswer: ["aller", "allons"],
	wordBank: ["allons", "aller"]
}
```

#### translate

Translate a sentence from one language to another.

This may or may not have a `word bank` (it will be an empty array if it doesn't). The user answer will also be an array if word bank is present.

[Visual reference [1]](/docs/types/duolingo-translate.png) [[2]](/docs/types/duolingo-translate-wordbank.png)

```javascript
{
	sentence: 'Paris est une ville importante.',
	userAnswer: ['Paris', 'is', ...], // or 'Paris is an important city.'
	wordBank: ['Where', 'important', ...] // or []

}
```



# ChatGPT Module

