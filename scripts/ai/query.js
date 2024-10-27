// /**
//  * @fileoverview This class takes the lesson data (answer and challenge) and generates the appropriate prompt for ChatGPT regarding Duolingo's question and the user's response.
//  */


// class QueryGenerator {

//     //! if lesson.answer not defined/null use lesson.challenge to explain the exercise to the user
//     //! if lesson.answer is defined, ignore challenge 
    
//     /**
//      * Generates a prompt for ChatGPT to explain the exercise.
//      * @param {Object} lessonData - The lesson data containing the answer and challenge information.
//      * @param {Object} lessonData.answer - The answer data, including user's answer and correctness.
//      * @param {Object} lessonData.challenge - The challenge data parsed from the exercise.
//      * @returns {string} The generated prompt for ChatGPT.
//     */
//    static generatePrompt(lessonData) {
//         // Extract data
//         const { type, exercise, content, language } = lessonData.challenge;
//         const { details: state, challenge, solution } = lessonData.answer;

//         console.log("LessonData", lessonData);
        
//         // Initialize prompt
//         let prompt = "";
//         const promptEnd = `
//         Please provide an explanation to help the user understand.
//         Do not refer to the user as the user, address the user as the person who made this prompt.
//         Be short and concise.
//         `;

//         // Build prompt based on exercise type
//         switch (type) {
//             case "translate":
//             case "completeReverseTranslation":
//             case "partialReverseTranslate":
//                 prompt = this.handleTranslate(type, question, content, answer, language);
//                 break;
//             case "match":
//             case "characterMatch":
//                 prompt = this.handleMatch(type, question, content, answer, language);
//                 break;
//             case "tapComplete":
//                 prompt = this.handleTapComplete(type, question, content, answer, language);
//                 break;
//             case "gapFill":
//                 prompt = this.handleGapFill(type, question, content, answer, language);
//                 break;
//             case "readComprehension":
//                 prompt = this.handleReadComprehension(type, question, content, answer, language);
//                 break;
//             case "select":
//             case "characterSelect":
//                 prompt = this.handleSelect(type, question, content, answer, language);
//                 break;
//             case "speak":
//                 prompt = this.handleSpeak(type, question, content, answer, language);
//                 break;
//             case "transliterate":
//                 prompt = this.handleTransliterate(type, question, content, answer, language);
//                 break;
//             // Add other cases as needed
//             default:
//                 prompt = "This exercise type is not supported yet.";
//         }
//         prompt += promptEnd;

//         return prompt;
//     }

//     /**
//      * Handles the prompt generation for translate exercises.
//      * @param {string} type - The type of exercise.
//      * @param {string} question - The question or instruction.
//      * @param {Object} content - The content of the challenge.
//      * @param {Object} answer - The answer data, including user's answer and correctness.
//      * @param {string} language - The language code.
//      * @returns {string} The generated prompt.
//      */
//     static handleTranslate(type, question, content, answer, language) {
//         // Extract content data
//         const { sentence, wordBank } = content;
//         const userAnswer = answer.answer;
//         const state = answer.state;

//         // Build prompt
//         let prompt = "";

//         if (state === "incorrect") {
//             prompt += "The user answered incorrectly. Please explain why their answer was incorrect and provide the correct answer.\n\n";
//         } else {
//             prompt += "The user answered correctly. Please explain why their answer was correct.\n\n";
//         }

//         prompt += `Exercise type: ${type}\n`;
//         prompt += `Language: ${language}\n`;
//         if (question) prompt += `Question: ${question}\n`;
//         if (sentence) prompt += `Sentence to translate: '${sentence}'\n`;

//         if (wordBank && wordBank.length > 0) {
//             prompt += `Available words: ${wordBank.join(', ')}\n`;
//         }

//         if (userAnswer) prompt += `User's answer: '${userAnswer}'\n`;
        
//         return prompt;
//     }

//     /**
//      * Handles the prompt generation for match exercises.
//      * @param {string} type - The type of exercise.
//      * @param {string} question - The question or instruction.
//      * @param {Object} content - The content of the challenge.
//      * @param {Object} answer - The answer data.
//      * @param {string} language - The language code.
//      * @returns {string} The generated prompt.
//      */
//     static handleMatch(type, question, content, answer, language) {
//         // Extract content data
//         const { source, target } = content;
//         const state = answer.state;

//         // Build prompt
//         let prompt = "";

//         if (state === "incorrect") {
//             prompt += "The user answered incorrectly. Please explain why their matches were incorrect and provide the correct matches.\n\n";
//         } else {
//             prompt += "The user answered correctly. Please explain why their matches were correct.\n\n";
//         }

//         prompt += `Exercise type: ${type}\n`;
//         if (question) prompt += `Question: ${question}\n`;

//         prompt += `Source choices:\n`;
//         source.choices.forEach(choice => {
//             prompt += ` - ${choice.option}: ${choice.text}\n`;
//         });

//         prompt += `Target choices:\n`;
//         target.choices.forEach(choice => {
//             prompt += ` - ${choice.option}: ${choice.text}\n`;
//         });
        
//         return prompt;
//     }

//     /**
//      * Handles the prompt generation for tapComplete exercises.
//      * @param {string} type - The type of exercise.
//      * @param {string} question - The question or instruction.
//      * @param {Object} content - The content of the challenge.
//      * @param {Object} answer - The answer data.
//      * @param {string} language - The language code.
//      * @returns {string} The generated prompt.
//      */
//     static handleTapComplete(type, question, content, answer, language) {
//         const { sentence, userAnswer, wordBank } = content;
//         const state = answer.state;

//         let prompt = "";

//         if (state === "incorrect") {
//             prompt += "The user answered incorrectly. Please explain why their answer was incorrect and provide the correct completion.\n\n";
//         } else {
//             prompt += "The user answered correctly. Please explain why their answer was correct.\n\n";
//         }

//         prompt += `Exercise type: ${type}\n`;
//         if (question) prompt += `Question: ${question}\n`;

//         if (sentence) prompt += `Sentence to complete: '${sentence}'\n`;

//         if (wordBank && wordBank.length > 0) {
//             prompt += `Available words: ${wordBank.join(', ')}\n`;
//         }

//         if (userAnswer) {
//             prompt += `User's answer: '${userAnswer}'\n`;
//         }

//         return prompt;
//     }

//     /**
//      * Handles the prompt generation for gapFill exercises.
//      * @param {string} type - The type of exercise.
//      * @param {string} question - The question or instruction.
//      * @param {Object} content - The content of the challenge.
//      * @param {Object} answer - The answer data.
//      * @param {string} language - The language code.
//      * @returns {string} The generated prompt.
//      */
//     static handleGapFill(type, question, content, answer, language) {
//         const { sentence, userAnswer, options } = content;
//         const state = answer.state;

//         let prompt = "";

//         if (state === "incorrect") {
//             prompt += "The user answered incorrectly. Please explain why their answer was incorrect and provide the correct completion.\n\n";
//         } else {
//             prompt += "The user answered correctly. Please explain why their answer was correct.\n\n";
//         }

//         prompt += `Exercise type: ${type}\n`;
//         if (question) prompt += `Question: ${question}\n`;

//         if (sentence) prompt += `Sentence with blanks: '${sentence}'\n`;

//         if (options && options.length > 0) {
//             prompt += `Options for blanks:\n`;
//             options.forEach((opt, idx) => {
//                 prompt += `Blank ${idx + 1} choices: ${opt.choices.join(', ')}\n`;
//             });
//         }

//         if (userAnswer) {
//             prompt += `User's answer: '${userAnswer}'\n`;
//         }

//         return prompt;
//     }

//     /**
//      * Handles the prompt generation for readComprehension exercises.
//      * @param {string} type - The type of exercise.
//      * @param {string} question - The question or instruction.
//      * @param {Object} content - The content of the challenge.
//      * @param {Object} answer - The answer data.
//      * @param {string} language - The language code.
//      * @returns {string} The generated prompt.
//      */
//     static handleReadComprehension(type, question, content, answer, language) {
//         const { sentence, choices, userAnswer } = content;
//         const state = answer.state;

//         let prompt = "";

//         if (state === "incorrect") {
//             prompt += "The user answered incorrectly. Please explain why their choice was incorrect and provide the correct answer.\n\n";
//         } else {
//             prompt += "The user answered correctly. Please explain why their choice was correct.\n\n";
//         }

//         prompt += `Exercise type: ${type}\n`;
//         if (question) prompt += `Question: ${question}\n`;

//         if (sentence) prompt += `Text to read: '${sentence}'\n`;

//         if (choices && choices.length > 0) {
//             prompt += `Choices:\n`;
//             choices.forEach(choice => {
//                 prompt += ` - Option ${choice.option}: ${choice.text}\n`;
//             });
//         }

//         if (userAnswer) {
//             prompt += `User's choice: Option ${userAnswer.option}\n`;
//         }

//         return prompt;
//     }

//     /**
//      * Handles the prompt generation for select exercises.
//      * @param {string} type - The type of exercise.
//      * @param {string} question - The question or instruction.
//      * @param {Object} content - The content of the challenge.
//      * @param {Object} answer - The answer data.
//      * @param {string} language - The language code.
//      * @returns {string} The generated prompt.
//      */
//     static handleSelect(type, question, content, answer, language) {
//         const { choices, userAnswer } = content;
//         const state = answer.state;

//         let prompt = "";

//         if (state === "incorrect") {
//             prompt += "The user selected an incorrect option. Please explain why their choice was incorrect and provide the correct option.\n\n";
//         } else {
//             prompt += "The user selected the correct option. Please explain why their choice was correct.\n\n";
//         }

//         prompt += `Exercise type: ${type}\n`;
//         if (question) prompt += `Question: ${question}\n`;

//         if (choices && choices.length > 0) {
//             prompt += `Choices:\n`;
//             choices.forEach(choice => {
//                 prompt += ` - Option ${choice.option}: ${choice.text}\n`;
//             });
//         }

//         if (userAnswer) {
//             prompt += `User's choice: Option ${userAnswer.option}\n`;
//         }

//         return prompt;
//     }

//     /**
//      * Handles the prompt generation for speak exercises.
//      * @param {string} type - The type of exercise.
//      * @param {string} question - The question or instruction.
//      * @param {Object} content - The content of the challenge.
//      * @param {Object} answer - The answer data.
//      * @param {string} language - The language code.
//      * @returns {string} The generated prompt.
//      */
//     static handleSpeak(type, question, content, answer, language) {
//         const { sentence } = content;
//         const state = answer.state;

//         let prompt = "";

//         if (state === "incorrect") {
//             prompt += "The user had difficulty speaking the sentence. Please provide guidance on how to pronounce it correctly.\n\n";
//         } else {
//             prompt += "The user successfully spoke the sentence. Please provide positive feedback and any additional tips if necessary.\n\n";
//         }

//         prompt += `Exercise type: ${type}\n`;
//         if (question) prompt += `Question: ${question}\n`;

//         if (sentence) prompt += `Sentence to speak: '${sentence}'\n`;

//         return prompt;
//     }

//     /**
//      * Handles the prompt generation for transliterate exercises.
//      * @param {string} type - The type of exercise.
//      * @param {string} question - The question or instruction.
//      * @param {Object} content - The content of the challenge.
//      * @param {Object} answer - The answer data.
//      * @param {string} language - The language code.
//      * @returns {string} The generated prompt.
//      */
//     static handleTransliterate(type, question, content, answer, language) {
//         const { word } = content;
//         const userAnswer = answer.answer;
//         const state = answer.state;

//         let prompt = "";

//         if (state === "incorrect") {
//             prompt += "The user transliterated the word incorrectly. Please explain the correct transliteration and any pronunciation tips.\n\n";
//         } else {
//             prompt += "The user transliterated the word correctly. Please confirm and provide any additional helpful information.\n\n";
//         }

//         prompt += `Exercise type: ${type}\n`;
//         if (question) prompt += `Question: ${question}\n`;

//         if (word) prompt += `Word to transliterate: '${word}'\n`;

//         if (userAnswer) prompt += `User's transliteration: '${userAnswer}'\n`;

//         return prompt;
//     }
// }

/**
 * @fileoverview This class takes the lesson data (answer and challenge) and generates the appropriate prompt for ChatGPT regarding Duolingo's question and the user's response.
 */

/*
| Exercise Type              |  Before Responding | After Responding ✅ | After Responding ❌ |
|----------------------------|--------------------|---------------------|---------------------|
| syllableTap                |         🤷         |          🤷         |          🤷         |
| translate                  |         ✅         |   ✅ (no wordbank)  |          ✅         |
| characterMatch             |         🤷         |          🤷         |          🤷         |
| match                      |         🤷         |          🤷         |          🤷         |
| tapComplete                |         ✅         |          ✅         |          ✅         |
| gapFill                    |         ❌         |          ❌         |          ❌         |
|                            |(not using options) | (answer not passed) | (answer not passed) |
| completeReverseTranslation |         ✅         |(missing user answer)|          🤷         |
| readComprehension          |(button disabled)   |          ❌         |          ❌         |
| dialogue                   |         ✅         |          ✅         |          ✅         |
| speak                      |         🤷         |          🤷         |          🤷         |
| transliterationAssist      |         🤷         |          🤷         |          🤷         |
| reverseAssist              |         🤷         |          🤷         |          🤷         |
| assist                     |❌ (info errada)    |    ❌ (disabled)    |          ❌         |
| characterSelect            |         🤷         |          🤷         |          🤷         |
| select                     |         ✅         |          ✅         |          ✅         |
| transliterate              |         🤷         |          🤷         |          🤷         |
| partialReverseTranslate    |         🤷         |          🤷         |          🤷         |
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
                if (typeof userAnswer === "object") 
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
        const { sentence, wordBank } = content;
        let prompt = "";

        if (sentence) prompt += `Sentence to translate: '${sentence}'\n`;
        console.log("wordbank", wordBank);
        if (wordBank && wordBank.length > 0) {
            prompt += `Available words: ${wordBank.join(', ')}\n`;
        }

        return prompt;
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

        console.log("wordbank", wordBank);
        console.log("userAnswer", userAnswer);

        if (wordBank && wordBank.length > 0) {
            prompt += `Available words: ${wordBank.join(', ')}\n`;
        }

        if (solution) prompt += `Correct translation: '${solution}'\n`;

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
        source.forEach(item => {
            prompt += ` - ${item}\n`;
        });

        prompt += `Target items:\n`;
        target.forEach(item => {
            prompt += ` - ${item}\n`;
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
        source.forEach(item => {
            prompt += ` - ${item}\n`;
        });

        prompt += `Target items:\n`;
        target.forEach(item => {
            prompt += ` - ${item}\n`;
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
        const { sentence_with_gaps, options } = content;
        let prompt = "";

        if (sentence_with_gaps) prompt += `Sentence with gaps: '${sentence_with_gaps}'\n`;

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
        const { sentence_with_gaps, options } = content;
        let prompt = "";

        if (sentence_with_gaps) prompt += `Sentence with gaps: '${sentence_with_gaps}'\n`;

        if (options && options.length > 0) {
            prompt += `Options for blanks:\n`;
            options.forEach((opt, idx) => {
                prompt += `Blank ${idx + 1} choices: ${opt.choices.join(', ')}\n`;
            });
        }

        if (userAnswer) {
            prompt += `User's selections:\n`;
            userAnswer.forEach((answer, idx) => {
                prompt += `Blank ${idx + 1}: '${answer}'\n`;
            });
        }

        if (solution) {
            prompt += `Correct selections:\n`;
            solution.forEach((answer, idx) => {
                prompt += `Blank ${idx + 1}: '${answer}'\n`;
            });
        }

        return prompt;
    }

    /**
     * Handles the prompt generation for a full explanation of readComprehension exercises when the user hasn't answered yet.
     * @param {Object} content - The content of the challenge.
     * @returns {string} The generated prompt.
     */
    static handleReadComprehensionExerciseExplanation(content) {
        const { passage, question, choices, sentence } = content;
        let prompt = "";

        if (sentence) prompt += `Sentence to read: '${sentence}'\n`;
        if (passage) prompt += `Passage to read: '${passage}'\n`;
        if (question) prompt += `Question: '${question}'\n`;

        if (choices && choices.length > 0) {
            prompt += `Choices:\n`;
            choices.forEach(choice => {
                prompt += ` - Option ${choice.option}: ${choice.text}\n`;
            });
        }

        return prompt;
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
        const { passage, question, choices, sentence } = content;
        let prompt = "";

        if (sentence) prompt += `Sentence to read: '${sentence}'\n`;
        if (passage) prompt += `Passage to read: '${passage}'\n`;
        if (question) prompt += `Question: '${question}'\n`;

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
