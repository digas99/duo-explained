/**
 * @fileoverview OpenAIAgent class for interacting with the OpenAI API.
 */


class OpenAIAgent {
    /**
     * Constructs an instance of the OpenAIAgent.
     */
    constructor() {
        /**
         * Your OpenAI API key.
         * @type {string}
         */
        this.apiKey = "";

        /**
         * The default model to use for completions.
         * @type {string}
         */
        this.model = "gpt-4o-mini";

        /**
         * List of available models fetched from OpenAI API.
         * @type {string[]}
         */
        this.availableModels = [
            "chatgpt-4o-latest",
            "gpt-3.5-turbo",
            "gpt-4o-mini",
            "gpt-4o",
            "gpt-4",
            "gpt-4-turbo",
        ];
    }

    /**
     * Initializes the agent with the provided API key and model from user settings.
     * @param {string} apiKey - Your OpenAI API key.
     * @param {string} model - The model to use for the completion (e.g., "gpt-4").
     */
    init(apiKey, model) {
        // Check if the API key is a string
        if (typeof apiKey !== "string") {
            console.error("No OpenAI API key provided.");
        } else {
            // Set the API key
            this.apiKey = apiKey;
            console.log("Local OpenAI API Key set to OpenAIAgent.");
        }

        // Check if the model is correct
        if (!this.availableModels.includes(model)) {
            console.error(`Model "${model}" is not available. Using GPT 4o mini.`);
            model = "gpt-4o-mini";
        } else {
            // Set the model
            this.model = model;
            console.log(`Local OpenAI Model (${model}) set to OpenAIAgent.`);
        }
    }

    /**
     * Sets the API key for the agent.
     * @param {string} apiKey - Your OpenAI API key.
     */
    setApiKey(apiKey) {
        this.apiKey = apiKey;
        console.log("New OpenAI API Key set to OpenAIAgent.");
    }

    /**
     * Sets the model for the agent after verifying its availability.
     * @param {string} model - The model to use for the completion (e.g., "gpt-4").
     */
    setModel(model) {
        if (this.availableModels.includes(model)) {
            this.model = model;
            console.log(`New OpenAI Model (${model}) set in OpenAIAgent.`);
        } else {
            console.error(
            `Model "${model}" is not available. Please choose a valid model.`
            );
        }
    }

    /**
     * Sends a query to the OpenAI API with the specified model and prompt.
     * @param {string} model - The model to use for the completion (e.g., "gpt-4").
     * @param {string} prompt - The prompt or query to send to the model.
     * @param {number} [temperature=0.7] - Sampling temperature to use.
     * @returns {Promise<string|null>} - The response from the OpenAI API, or null if an error occurred.
     */
    async query(model, prompt, temperature = 0.2) {
        const url = "https://api.openai.com/v1/chat/completions";
        
        const body = JSON.stringify({
            model: model,
            messages: [{ role: "user", content: prompt }],
            temperature: temperature,
        });

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.apiKey}`,
                },
                body: body,
            });

            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(data);
            const content = data.choices[0].message.content;
            console.log(content);
            return {
                content,
                model: data.model,
                usage: data.usage
            }
        } catch (error) {
            console.error(
                "There has been a problem with your fetch operation:",
                error
            );
            return null;
        }
    }
}
