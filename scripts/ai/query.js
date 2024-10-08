/**
 * @fileoverview This class takes the lesson data (answer and challenge) and generates the appropriate prompt for ChatGPT regarding Duolingo's question and the user's response.
 */


export class QueryGenerator {
    
    /**
     * Generates a prompt for ChatGPT to explain the exercise.
     * @param {Object} lessonData - The lesson data containing the answer and challenge information.
     * @param {Object} lessonData.answer - The answer data, including user's answer and correctness.
     * @param {Object} lessonData.challenge - The challenge data parsed from the exercise.
     * @returns {string} The generated prompt for ChatGPT.
    */
   static generatePrompt(lessonData) {
        // Extract data
        const { answer, challenge } = lessonData;
        const { type, question, content } = challenge;
        const { state, answer: userAnswer, language } = answer;
        
        // Initialize prompt
        let prompt = "";
        const promptEnd = `
        Please provide an explanation to help the user understand.
        Do not refer to the user as the user, address the user as the person who made this prompt.
        Be short and concise.
        `;

        // Build prompt based on exercise type
        switch (type) {
            case "translate":
            case "completeReverseTranslation":
            case "partialReverseTranslate":
                prompt = this.handleTranslate(type, question, content, answer, language);
                break;
            case "match":
            case "characterMatch":
                prompt = this.handleMatch(type, question, content, answer, language);
                break;
            case "tapComplete":
                prompt = this.handleTapComplete(type, question, content, answer, language);
                break;
            case "gapFill":
                prompt = this.handleGapFill(type, question, content, answer, language);
                break;
            case "readComprehension":
                prompt = this.handleReadComprehension(type, question, content, answer, language);
                break;
            case "select":
            case "characterSelect":
                prompt = this.handleSelect(type, question, content, answer, language);
                break;
            case "speak":
                prompt = this.handleSpeak(type, question, content, answer, language);
                break;
            case "transliterate":
                prompt = this.handleTransliterate(type, question, content, answer, language);
                break;
            // Add other cases as needed
            default:
                prompt = "This exercise type is not supported yet.";
        }
        prompt += promptEnd;

        return prompt;
    }

    /**
     * Handles the prompt generation for translate exercises.
     * @param {string} type - The type of exercise.
     * @param {string} question - The question or instruction.
     * @param {Object} content - The content of the challenge.
     * @param {Object} answer - The answer data, including user's answer and correctness.
     * @param {string} language - The language code.
     * @returns {string} The generated prompt.
     */
    static handleTranslate(type, question, content, answer, language) {
        // Extract content data
        const { sentence, wordBank } = content;
        const userAnswer = answer.answer;
        const state = answer.state;

        // Build prompt
        let prompt = "";

        if (state === "incorrect") {
            prompt += "The user answered incorrectly. Please explain why their answer was incorrect and provide the correct answer.\n\n";
        } else {
            prompt += "The user answered correctly. Please explain why their answer was correct.\n\n";
        }

        prompt += `Exercise type: ${type}\n`;
        prompt += `Language: ${language}\n`;
        if (question) prompt += `Question: ${question}\n`;
        if (sentence) prompt += `Sentence to translate: '${sentence}'\n`;

        if (wordBank && wordBank.length > 0) {
            prompt += `Available words: ${wordBank.join(', ')}\n`;
        }

        if (userAnswer) prompt += `User's answer: '${userAnswer}'\n`;
        
        return prompt;
    }

    /**
     * Handles the prompt generation for match exercises.
     * @param {string} type - The type of exercise.
     * @param {string} question - The question or instruction.
     * @param {Object} content - The content of the challenge.
     * @param {Object} answer - The answer data.
     * @param {string} language - The language code.
     * @returns {string} The generated prompt.
     */
    static handleMatch(type, question, content, answer, language) {
        // Extract content data
        const { source, target } = content;
        const state = answer.state;

        // Build prompt
        let prompt = "";

        if (state === "incorrect") {
            prompt += "The user answered incorrectly. Please explain why their matches were incorrect and provide the correct matches.\n\n";
        } else {
            prompt += "The user answered correctly. Please explain why their matches were correct.\n\n";
        }

        prompt += `Exercise type: ${type}\n`;
        if (question) prompt += `Question: ${question}\n`;

        prompt += `Source choices:\n`;
        source.choices.forEach(choice => {
            prompt += ` - ${choice.option}: ${choice.text}\n`;
        });

        prompt += `Target choices:\n`;
        target.choices.forEach(choice => {
            prompt += ` - ${choice.option}: ${choice.text}\n`;
        });
        
        return prompt;
    }

    /**
     * Handles the prompt generation for tapComplete exercises.
     * @param {string} type - The type of exercise.
     * @param {string} question - The question or instruction.
     * @param {Object} content - The content of the challenge.
     * @param {Object} answer - The answer data.
     * @param {string} language - The language code.
     * @returns {string} The generated prompt.
     */
    static handleTapComplete(type, question, content, answer, language) {
        const { sentence, userAnswer, wordBank } = content;
        const state = answer.state;

        let prompt = "";

        if (state === "incorrect") {
            prompt += "The user answered incorrectly. Please explain why their answer was incorrect and provide the correct completion.\n\n";
        } else {
            prompt += "The user answered correctly. Please explain why their answer was correct.\n\n";
        }

        prompt += `Exercise type: ${type}\n`;
        if (question) prompt += `Question: ${question}\n`;

        if (sentence) prompt += `Sentence to complete: '${sentence}'\n`;

        if (wordBank && wordBank.length > 0) {
            prompt += `Available words: ${wordBank.join(', ')}\n`;
        }

        if (userAnswer) {
            prompt += `User's answer: '${userAnswer}'\n`;
        }

        return prompt;
    }

    /**
     * Handles the prompt generation for gapFill exercises.
     * @param {string} type - The type of exercise.
     * @param {string} question - The question or instruction.
     * @param {Object} content - The content of the challenge.
     * @param {Object} answer - The answer data.
     * @param {string} language - The language code.
     * @returns {string} The generated prompt.
     */
    static handleGapFill(type, question, content, answer, language) {
        const { sentence, userAnswer, options } = content;
        const state = answer.state;

        let prompt = "";

        if (state === "incorrect") {
            prompt += "The user answered incorrectly. Please explain why their answer was incorrect and provide the correct completion.\n\n";
        } else {
            prompt += "The user answered correctly. Please explain why their answer was correct.\n\n";
        }

        prompt += `Exercise type: ${type}\n`;
        if (question) prompt += `Question: ${question}\n`;

        if (sentence) prompt += `Sentence with blanks: '${sentence}'\n`;

        if (options && options.length > 0) {
            prompt += `Options for blanks:\n`;
            options.forEach((opt, idx) => {
                prompt += `Blank ${idx + 1} choices: ${opt.choices.join(', ')}\n`;
            });
        }

        if (userAnswer) {
            prompt += `User's answer: '${userAnswer}'\n`;
        }

        return prompt;
    }

    /**
     * Handles the prompt generation for readComprehension exercises.
     * @param {string} type - The type of exercise.
     * @param {string} question - The question or instruction.
     * @param {Object} content - The content of the challenge.
     * @param {Object} answer - The answer data.
     * @param {string} language - The language code.
     * @returns {string} The generated prompt.
     */
    static handleReadComprehension(type, question, content, answer, language) {
        const { sentence, choices, userAnswer } = content;
        const state = answer.state;

        let prompt = "";

        if (state === "incorrect") {
            prompt += "The user answered incorrectly. Please explain why their choice was incorrect and provide the correct answer.\n\n";
        } else {
            prompt += "The user answered correctly. Please explain why their choice was correct.\n\n";
        }

        prompt += `Exercise type: ${type}\n`;
        if (question) prompt += `Question: ${question}\n`;

        if (sentence) prompt += `Text to read: '${sentence}'\n`;

        if (choices && choices.length > 0) {
            prompt += `Choices:\n`;
            choices.forEach(choice => {
                prompt += ` - Option ${choice.option}: ${choice.text}\n`;
            });
        }

        if (userAnswer) {
            prompt += `User's choice: Option ${userAnswer.option}\n`;
        }

        return prompt;
    }

    /**
     * Handles the prompt generation for select exercises.
     * @param {string} type - The type of exercise.
     * @param {string} question - The question or instruction.
     * @param {Object} content - The content of the challenge.
     * @param {Object} answer - The answer data.
     * @param {string} language - The language code.
     * @returns {string} The generated prompt.
     */
    static handleSelect(type, question, content, answer, language) {
        const { choices, userAnswer } = content;
        const state = answer.state;

        let prompt = "";

        if (state === "incorrect") {
            prompt += "The user selected an incorrect option. Please explain why their choice was incorrect and provide the correct option.\n\n";
        } else {
            prompt += "The user selected the correct option. Please explain why their choice was correct.\n\n";
        }

        prompt += `Exercise type: ${type}\n`;
        if (question) prompt += `Question: ${question}\n`;

        if (choices && choices.length > 0) {
            prompt += `Choices:\n`;
            choices.forEach(choice => {
                prompt += ` - Option ${choice.option}: ${choice.text}\n`;
            });
        }

        if (userAnswer) {
            prompt += `User's choice: Option ${userAnswer.option}\n`;
        }

        return prompt;
    }

    /**
     * Handles the prompt generation for speak exercises.
     * @param {string} type - The type of exercise.
     * @param {string} question - The question or instruction.
     * @param {Object} content - The content of the challenge.
     * @param {Object} answer - The answer data.
     * @param {string} language - The language code.
     * @returns {string} The generated prompt.
     */
    static handleSpeak(type, question, content, answer, language) {
        const { sentence } = content;
        const state = answer.state;

        let prompt = "";

        if (state === "incorrect") {
            prompt += "The user had difficulty speaking the sentence. Please provide guidance on how to pronounce it correctly.\n\n";
        } else {
            prompt += "The user successfully spoke the sentence. Please provide positive feedback and any additional tips if necessary.\n\n";
        }

        prompt += `Exercise type: ${type}\n`;
        if (question) prompt += `Question: ${question}\n`;

        if (sentence) prompt += `Sentence to speak: '${sentence}'\n`;

        return prompt;
    }

    /**
     * Handles the prompt generation for transliterate exercises.
     * @param {string} type - The type of exercise.
     * @param {string} question - The question or instruction.
     * @param {Object} content - The content of the challenge.
     * @param {Object} answer - The answer data.
     * @param {string} language - The language code.
     * @returns {string} The generated prompt.
     */
    static handleTransliterate(type, question, content, answer, language) {
        const { word } = content;
        const userAnswer = answer.answer;
        const state = answer.state;

        let prompt = "";

        if (state === "incorrect") {
            prompt += "The user transliterated the word incorrectly. Please explain the correct transliteration and any pronunciation tips.\n\n";
        } else {
            prompt += "The user transliterated the word correctly. Please confirm and provide any additional helpful information.\n\n";
        }

        prompt += `Exercise type: ${type}\n`;
        if (question) prompt += `Question: ${question}\n`;

        if (word) prompt += `Word to transliterate: '${word}'\n`;

        if (userAnswer) prompt += `User's transliteration: '${userAnswer}'\n`;

        return prompt;
    }
}
