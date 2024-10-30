/**
 * @fileoverview This class takes the lesson data (answer and challenge) and generates the appropriate prompt for ChatGPT regarding Duolingo's question and the user's response.
 */

/*
| Exercise Type              |  Before Responding | After Responding ✅ | After Responding ❌ |
|----------------------------|--------------------|---------------------|---------------------|
| syllableTap                |  ❌ (not handled)  |          ❌         |          ❌         |
| translate                  |         ✅         |          ✅         |          ✅         |
| characterMatch             |         ✅         |          ✅         |         N/A         |
| match                      |         ✅         |          ✅         |         N/A         |
| tapComplete                |         ✅         |          ✅         |          ✅         |
| gapFill                    |         ✅         |          ✅         |          ✅         |
| completeReverseTranslation |         ✅         |          ✅         |          ✅         |
| readComprehension          |         ✅         |          ✅         |          ✅         |
| dialogue                   |         ✅         |          ✅         |          ✅         |
| speak                      |  ❌ (not handled)  |          ❌         |          ❌         |
| transliterationAssist      |  ❌ (not handled)  |          ❌         |          ❌         |
| reverseAssist              |  ❌ (not handled)  |          ❌         |          ❌         |
| assist                     |  ❌ (not handled)  |          ❌         |          ❌         |
| characterSelect            |         ✅         |          ✅         |          ✅         |
| select                     |         ✅         |          ✅         |          ✅         |
| transliterate              | ✅ (add language)  |          ✅         |          ✅         |
| partialReverseTranslate    |         ✅         |          ✅         |          ✅         |
*/


class QueryGenerator {

    /**
     * Generates a prompt for ChatGPT to explain the exercise or the user's answer.
     * @param {Object} lessonData - The lesson data containing the answer and challenge information.
     * @param {Object} [lessonData.answer] - The answer data, including user's answer and correctness.
     * @param {Object} lessonData.challenge - The challenge data parsed from the exercise.
     * @returns {string} The generated prompt for ChatGPT.
     */
    static generatePrompt(lessonData) {
        console.log("LessonData", lessonData);
        // Extract challenge data
        const { type, exercise, content, language } = lessonData.challenge;
        const question = content.sentence;

        // Initialize prompt
        let prompt = "";
        const promptEnd = `
Please provide an explanation to help the user understand.
Do not refer to the user as the user, address the user as the person who made this prompt.
Be short and concise.
`;

        // Check if the user has answered the question
        if (!lessonData.answer || lessonData.answer === null) {
            // The user's answer is not available (lessonData.answer is null)
            // Generate a prompt that provides a full explanation of the exercise
            prompt += "Please provide a full explanation of the following exercise.\n\n";
            prompt += `Exercise type: ${type}\n`;
            prompt += `Description: ${exercise}\n`;
            // prompt += `Language: ${language}\n`;
            // if (question) prompt += `Question: '${question}'\n`;

            // Build prompt based on exercise type
            switch (type) {
                case "translate":
                case "completeReverseTranslation":
                case "partialReverseTranslate":
                    prompt += this.handleTranslateExerciseExplanation(content);
                    break;
                case "match":
                case "characterMatch":
                    prompt += this.handleMatchExerciseExplanation(content);
                    break;
                case "tapComplete":
                    prompt += this.handleTapCompleteExerciseExplanation(content);
                    break;
                case "gapFill":
                    prompt += this.handleGapFillExerciseExplanation(content);
                    break;
                case "readComprehension":
                case "dialogue":
                    prompt += this.handleReadComprehensionExerciseExplanation(content);
                    break;
                case "select":
                case "characterSelect":
                    prompt += this.handleSelectExerciseExplanation(content);
                    break;
                case "speak":
                    prompt += this.handleSpeakExerciseExplanation(content);
                    break;
                case "transliterate":
                    prompt += this.handleTransliterateExerciseExplanation(content);
                    break;
                // Add other cases as needed
                default:
                    prompt += "This exercise type is not supported yet for full explanations.\n";
            }
        } else {
            // The user has answered the question
            const state = lessonData.answer.details.state;
            const userAnswer = lessonData.answer.challenge.content.answer;
            const solution = lessonData.answer.solution;

            if (state === "incorrect") {
                // User answered incorrectly
                prompt += "The user answered incorrectly. Please explain the error they made and why. Provide the correct answer.\n\n";
            } else {
                // User answered correctly
                prompt += "The user answered correctly. Please explain why their answer is correct.\n\n";
            }

            prompt += `Exercise type: ${type}\n`;
            prompt += `Description: ${exercise}\n`;
            // prompt += `Language: ${language}\n`;
            if (question) prompt += `Question: '${question}'\n`;
            if (userAnswer) {
                if (userAnswer.text)
                    prompt += `User's answer: '${userAnswer.text}'\n`;
                else
                    prompt += `User's answer: '${Array.isArray(userAnswer) ? userAnswer.join(' ') : userAnswer}'\n`;
            }
            if (solution) prompt += `Correct answer: '${solution}'\n`;

            // Build prompt based on exercise type
            switch (type) {
                case "translate":
                case "completeReverseTranslation":
                case "partialReverseTranslate":
                    prompt += this.handleTranslateAnswerExplanation(content, userAnswer, solution, state);
                    break;
                case "match":
                case "characterMatch":
                    prompt += this.handleMatchAnswerExplanation(content, userAnswer, solution, state);
                    break;
                case "tapComplete":
                    prompt += this.handleTapCompleteAnswerExplanation(content, userAnswer, solution, state);
                    break;
                case "gapFill":
                    prompt += this.handleGapFillAnswerExplanation(content, userAnswer, solution, state);
                    break;
                case "readComprehension":
                case "dialogue":
                    prompt += this.handleReadComprehensionAnswerExplanation(content, userAnswer, solution, state);
                    break;
                case "select":
                case "characterSelect":
                    prompt += this.handleSelectAnswerExplanation(content, userAnswer, solution, state);
                    break;
                case "speak":
                    prompt += this.handleSpeakAnswerExplanation(content, userAnswer, solution, state);
                    break;
                case "transliterate":
                    prompt += this.handleTransliterateAnswerExplanation(content, userAnswer, solution, state);
                    break;
                // Add other cases as needed
                default:
                    prompt += "This exercise type is not supported yet for answer explanations.\n";
            }
        }

        prompt += promptEnd;

        console.log("Generated Prompt", prompt);
        return prompt;
    }

    /**
     * Handles the prompt generation for a full explanation of translate exercises when the user hasn't answered yet.
     * @param {Object} content - The content of the challenge.
     * @returns {string} The generated prompt.
     */
    static handleTranslateExerciseExplanation(content) {
        const { sentence, wordBank, prompt, answer } = content;
        let queryPrompt = "";

        if (sentence) queryPrompt += `Sentence to translate: '${sentence}'\n`;
        if (prompt) queryPrompt += `Prompt: '${prompt}'\n`;
        if (answer) queryPrompt += `Prompt: '${answer}'\n`;

        if (wordBank && wordBank.length > 0) {
            queryPrompt += `Available words: ${wordBank.join(', ')}\n`;
        }

        return queryPrompt;
    }

    /**
     * Handles the prompt generation for explaining the user's answer in translate exercises.
     * @param {Object} content - The content of the challenge.
     * @param {string} userAnswer - The user's answer.
     * @param {string} solution - The correct answer.
     * @param {string} state - The state of the user's answer ("correct" or "incorrect").
     * @returns {string} The generated prompt.
     */
    static handleTranslateAnswerExplanation(content, userAnswer, solution, state) {
        const { sentence, wordBank } = content;
        let prompt = "";

        if (sentence) prompt += `Sentence to translate: '${sentence}'\n`;

        if (wordBank && wordBank.length > 0) {
            prompt += `Available words: ${wordBank.join(', ')}\n`;
        }

        return prompt;
    }

    /**
     * Handles the prompt generation for a full explanation of match exercises when the user hasn't answered yet.
     * @param {Object} content - The content of the challenge.
     * @returns {string} The generated prompt.
     */
    static handleMatchExerciseExplanation(content) {
        const { source, target } = content;
        let prompt = "";

        prompt += `Please explain how to correctly match the following items.\n\n`;

        prompt += `Source items:\n`;
        source.choices.forEach(choice => {
            prompt += ` - Option ${choice.option}: ${choice.text}\n`;
        });

        prompt += `Target items:\n`;
        target.choices.forEach(choice => {
            prompt += ` - Option ${choice.option}: ${choice.text}\n`;
        });

        return prompt;
    }

    /**
     * Handles the prompt generation for explaining the user's answer in match exercises.
     * @param {Object} content - The content of the challenge.
     * @param {Array} userAnswer - The user's answer.
     * @param {Array} solution - The correct matches.
     * @param {string} state - The state of the user's answer ("correct" or "incorrect").
     * @returns {string} The generated prompt.
     */
    static handleMatchAnswerExplanation(content, userAnswer, solution, state) {
        const { source, target } = content;
        let prompt = "";

        prompt += `Source items:\n`;
        source.choices.forEach(choice => {
            prompt += ` - Option ${choice.option}: ${choice.text}\n`;
        });

        prompt += `Target items:\n`;
        target.choices.forEach(choice => {
            prompt += ` - Option ${choice.option}: ${choice.text}\n`;
        });

        if (userAnswer) {
            prompt += `User's matches:\n`;
            userAnswer.forEach(match => {
                prompt += ` - ${match.source} matched with ${match.target}\n`;
            });
        }

        if (solution) {
            prompt += `Correct matches:\n`;
            solution.forEach(match => {
                prompt += ` - ${match.source} should be matched with ${match.target}\n`;
            });
        }

        return prompt;
    }

    /**
     * Handles the prompt generation for a full explanation of tapComplete exercises when the user hasn't answered yet.
     * @param {Object} content - The content of the challenge.
     * @returns {string} The generated prompt.
     */
    static handleTapCompleteExerciseExplanation(content) {
        const { sentence, wordBank } = content;
        let prompt = "";

        if (sentence) prompt += `Sentence to complete: '${sentence}'\n`;

        if (wordBank && wordBank.length > 0) {
            prompt += `Available words: ${wordBank.join(', ')}\n`;
        }

        return prompt;
    }

    /**
     * Handles the prompt generation for explaining the user's answer in tapComplete exercises.
     * @param {Object} content - The content of the challenge.
     * @param {Array} userAnswer - The user's answer, the exercise's sentence with the selected words.
     * @param {Array} solution - The correct sequence of words.
     * @param {string} state - The state of the user's answer ("correct" or "incorrect").
     * @returns {string} The generated prompt.
     */
    static handleTapCompleteAnswerExplanation(content, userAnswer, solution, state) {
        const { sentence, wordBank } = content;
        let prompt = "";

        if (sentence) prompt += `Sentence to complete: '${sentence}'\n`;

        if (wordBank && wordBank.length > 0) prompt += `Available words: ${wordBank.join(', ')}\n`;
  
        if (userAnswer) prompt += `User's answer: ${userAnswer}\n`;

        if (solution) prompt += `Correct completion: ${solution}\n`;
        
        return prompt;
    }

    /**
     * Handles the prompt generation for a full explanation of gapFill exercises when the user hasn't answered yet.
     * @param {Object} content - The content of the challenge.
     * @returns {string} The generated prompt.
     */
    static handleGapFillExerciseExplanation(content) {
        const { sentence, choices: options } = content;
        let prompt = "";
 
        if (sentence) prompt += `Sentence with gaps: '${sentence}'\n`;

        if (options && options.length > 0) {
            prompt += `Options for blanks:\n`;
            options.forEach((opt, idx) => {
                prompt += `Blank ${idx + 1} choices: ${opt.choices.join(', ')}\n`;
            });
        }

        return prompt;
    }

    /**
     * Handles the prompt generation for explaining the user's answer in gapFill exercises.
     * @param {Object} content - The content of the challenge.
     * @param {Array} userAnswer - The user's selected options.
     * @param {Array} solution - The correct options.
     * @param {string} state - The state of the user's answer ("correct" or "incorrect").
     * @returns {string} The generated prompt.
     */
    static handleGapFillAnswerExplanation(content, userAnswer, solution, state) {
        const { sentence, choices: options } = content;
        let prompt = "";

        if (sentence) prompt += `Sentence with gaps: '${sentence}'\n`;
        
        if (options && options.length > 0) {
            prompt += `Options for blanks:\n`;
            options.forEach((opt, idx) => {
                prompt += `Blank ${idx + 1} choices: ${opt.choices.join(", ")}\n`;
            });
        }

        if (userAnswer) {
            prompt += `User's answer: Option ${userAnswer}\n`;
        }

        if (solution) {
            prompt += `Correct choice: Option ${solution}\n`;
        }

        return prompt;
    }

    /**
     * Handles the prompt generation for a full explanation of readComprehension exercises when the user hasn't answered yet.
     * @param {Object} content - The content of the challenge.
     * @returns {string} The generated prompt.
     */
    static handleReadComprehensionExerciseExplanation(content) {
        const { passage, question, choices, prompt, sentence } = content;
        let queryPrompt = "";

        if (sentence) queryPrompt += `Sentence to read: '${sentence}'\n`;
        if (prompt) queryPrompt += `Prompt: '${prompt}'\n`;
        if (passage) queryPrompt += `Passage to read: '${passage}'\n`;
        if (question) queryPrompt += `Question: '${question}'\n`;

        if (choices && choices.length > 0) {
            queryPrompt += `Choices:\n`;
            choices.forEach(choice => {
                queryPrompt += ` - Option ${choice.option}: ${choice.text}\n`;
            });
        }

        return queryPrompt;
    }

    /**
     * Handles the prompt generation for explaining the user's answer in readComprehension exercises.
     * @param {Object} content - The content of the challenge.
     * @param {string} userAnswer - The user's selected option.
     * @param {string} solution - The correct option.
     * @param {string} state - The state of the user's answer ("correct" or "incorrect").
     * @returns {string} The generated prompt.
     */
    static handleReadComprehensionAnswerExplanation(content, userAnswer, solution, state) {
        const { passage, question, choices, prompt, sentence } = content;
        let queryPrompt = "";

        if (sentence) queryPrompt += `Sentence to read: '${sentence}'\n`;
        if (prompt) queryPrompt += `Prompt: '${prompt}'\n`;
        if (passage) queryPrompt += `Passage to read: '${passage}'\n`;
        if (question) queryPrompt += `Question: '${question}'\n`;

        if (choices && choices.length > 0) {
            queryPrompt += `Choices:\n`;
            choices.forEach(choice => {
                queryPrompt += ` - Option ${choice.option}: ${choice.text}\n`;
            });
        }

        if (userAnswer) {
            queryPrompt += `User's choice: Option ${userAnswer.option} - ${userAnswer.text}\n`;
        }

        if (solution) {
            queryPrompt += `Correct choice: Option ${solution}\n`;
        }

        return queryPrompt;
    }

    /**
     * Handles the prompt generation for a full explanation of select exercises when the user hasn't answered yet.
     * @param {Object} content - The content of the challenge.
     * @returns {string} The generated prompt.
     */
    static handleSelectExerciseExplanation(content) {
        const { choices } = content;
        let prompt = "";

        prompt += `Please select the correct option from the following choices.\n\n`;

        if (choices && choices.length > 0) {
            choices.forEach(choice => {
                prompt += ` - Option ${choice.option}: ${choice.text}\n`;
            });
        }

        return prompt;
    }

    /**
     * Handles the prompt generation for explaining the user's answer in select exercises.
     * @param {Object} content - The content of the challenge.
     * @param {string} userAnswer - The user's selected option.
     * @param {string} solution - The correct option.
     * @param {string} state - The state of the user's answer ("correct" or "incorrect").
     * @returns {string} The generated prompt.
     */
    static handleSelectAnswerExplanation(content, userAnswer, solution, state) {
        const { choices } = content;
        let prompt = "";

        if (choices && choices.length > 0) {
            prompt += `Choices:\n`;
            choices.forEach(choice => {
                prompt += ` - Option ${choice.option}: ${choice.text}\n`;
            });
        }

        if (userAnswer) {
            prompt += `User's choice: Option ${userAnswer.option} - ${userAnswer.text}\n`;
        }

        if (solution) {
            prompt += `Correct choice: Option ${solution}\n`;
        }

        return prompt;
    }

    /**
     * Handles the prompt generation for a full explanation of speak exercises when the user hasn't answered yet.
     * @param {Object} content - The content of the challenge.
     * @returns {string} The generated prompt.
     */
    static handleSpeakExerciseExplanation(content) {
        const { sentence } = content;
        let prompt = "";

        if (sentence) prompt += `Sentence to speak: '${sentence}'\n`;

        return prompt;
    }

    /**
     * Handles the prompt generation for explaining the user's answer in speak exercises.
     * @param {Object} content - The content of the challenge.
     * @param {string} userAnswer - The user's spoken response (could be transcribed text).
     * @param {string} solution - The correct sentence.
     * @param {string} state - The state of the user's answer ("correct" or "incorrect").
     * @returns {string} The generated prompt.
     */
    static handleSpeakAnswerExplanation(content, userAnswer, solution, state) {
        const { sentence } = content;
        let prompt = "";

        if (sentence) prompt += `Sentence to speak: '${sentence}'\n`;

        if (userAnswer) {
            prompt += `User's spoken response: '${userAnswer}'\n`;
        }

        if (solution) {
            prompt += `Correct sentence: '${solution}'\n`;
        }

        return prompt;
    }

    /**
     * Handles the prompt generation for a full explanation of transliterate exercises when the user hasn't answered yet.
     * @param {Object} content - The content of the challenge.
     * @returns {string} The generated prompt.
     */
    static handleTransliterateExerciseExplanation(content) {
        const { word } = content;
        let prompt = "";

        if (word) prompt += `Word to transliterate: '${word}'\n`;

        return prompt;
    }

    /**
     * Handles the prompt generation for explaining the user's answer in transliterate exercises.
     * @param {Object} content - The content of the challenge.
     * @param {string} userAnswer - The user's transliteration.
     * @param {string} solution - The correct transliteration.
     * @param {string} state - The state of the user's answer ("correct" or "incorrect").
     * @returns {string} The generated prompt.
     */
    static handleTransliterateAnswerExplanation(content, userAnswer, solution, state) {
        const { word } = content;
        let prompt = "";

        if (word) prompt += `Word to transliterate: '${word}'\n`;

        if (userAnswer) {
            prompt += `User's transliteration: '${userAnswer}'\n`;
        }

        if (solution) {
            prompt += `Correct transliteration: '${solution}'\n`;
        }

        return prompt;
    }
}
