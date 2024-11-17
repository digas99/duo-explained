/**
 * @fileoverview Background script for handling messages from the content scripts and querying the OpenAI API.
 */

importScripts(
    "/scripts/ai/chatgpt.js",
    "/scripts/ai/query.js",
    "/scripts/settings.js"
)

chrome.runtime.onInstalled.addListener(details => {
    if (details.reason == "update") {
        const version = chrome.runtime.getManifest().version;
        if (details.previousVersion != version && version.split('.').length < 4) {
            chrome.storage.sync.set({ "SHOW_CHANGELOG": true });
        }
    }
});

let agent = new OpenAIAgent();

/**
 * Load local storage values from user settings for API key and model chosen for ChatGPT.
 * This is useful for persisting the API key and model across browser sessions.
 */
chrome.storage.sync.get(["API_KEY", "MODEL"], (result) => {
    const apiKey = result.API_KEY;
    console.log("API_KEY currently is " + apiKey);

    // Load the model from local storage
    const model = result.MODEL;
    console.log("MODEL currently is " + model);

    // Instantiate OpenAIAgent once the API_KEY and MODEL are loaded
    agent.init(apiKey, model);
});

/**
 * Listen for messages from the content script.
 * If the message type is "QUERY", a message is sent to the agent to query the OpenAI API.
 * If the message type is "SET_API_KEY, the API key is set in the agent and stored in local storage.
 * If the message type is "CHECK_API_KEY", the API key is checked for validity.
 * If the message type is "SET_MODEL", the model is set in the agent and stored in local storage.
 * If the message type is "RELOAD", the content scripts are reloaded.
 * If the message type is "UPDATE_THEME", this same message is sent to the popup.
 * If the message type is "EXTENSION_VERSION", the extension version is sent as a response.
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "QUERY") {
        (async () => {
            if (agent) {
                try {
                    // Generate the prompt using QueryGenerator
                    const prompt = QueryGenerator.generatePrompt(request.data);
                    console.log(prompt);
                    const response = await agent.query(agent.model, prompt);
                    // const response = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi.";
                    sendResponse(response);
                } catch (error) {
                    sendResponse({ error: error.message });
                }
            } else {
                sendResponse({ error: "Agent not initialized yet." });
            }
        })();
    }

    // Set the API key
    if (request.type === "SET_API_KEY") {
        const apiKey = request.apiKey;
        (async () => {
            if (agent) {
                agent.setApiKey(apiKey);
                await chrome.storage.sync.set({ API_KEY: apiKey });
                sendResponse({ message: "API Key set" });

                chrome.storage.sync.get(["SETTINGS"], result => {
                    const settings = result.SETTINGS || {};
                    settings["extension-enabled"] = true;
                    chrome.storage.sync.set({ SETTINGS: settings }, () => {
                        chrome.runtime.sendMessage({ type: "RELOAD" });
                    });
                    
                });
            } else {
                sendResponse({ error: "Agent not initialized yet." });
            }
        })();
    }

    // Validate the API Key
    if (request.type === "CHECK_API_KEY") {
        const apiKey = request.apiKey;
        (async () => {
            if (agent) {
                const result = await agent.validateApiKey(apiKey);
                sendResponse(result);
            } else {
                sendResponse({
                    valid: false,
                    message: "Something went wrong. Please try again."
                });
            }
        })();
    }

    // Set the model
    if (request.type === "SET_MODEL") {
        agent.setModel(request.model);
        // Model value is managed by the content script, therefore always in accordance with the available models
        chrome.storage.sync.set({ MODEL: request.model }, () => {
            sendResponse({ message: "Model set." });
        });
    }

    // Reoload the content scripts
    if (request.type === "RELOAD") {
        // inject the content scripts again
        chrome.scripting.executeScript({
            target: { tabId: sender.tab?.id },
            files: [
                "/scripts/content/lesson/answer.js",
                "/scripts/content/lesson/challenge.js",
                "/scripts/content/lesson/lesson.js",
            ]
        });
    }

    // Drive update theme to the popup
    if (request.type === "UPDATE_THEME") chrome.runtime.sendMessage(request);

    // Extension version
    if (request.type === "EXTENSION_VERSION") {
        const version = chrome.runtime.getManifest().version;
        sendResponse({ version });
    }

    if (request.type === "GET_UPDATE_REVIEW") {
        chrome.storage.sync.get(["SHOW_CHANGELOG"], result => {
            const showChangelog = result.SHOW_CHANGELOG;
            if (showChangelog) {
                fetch("/CHANGELOG.md")
                    .then(response => response.text())
                    .then(text => {
                        sendResponse({ data: text });
                        chrome.storage.sync.set({ SHOW_CHANGELOG: false });
                    });
            }
        });
    }

    return true;
});


chrome.runtime.onInstalled.addListener(details => {
    console.log("Extension Reloaded");
    if (details.reason === "install" ||
        details.reason === "update") {

        // set defaults for settings
       chrome.storage.sync.get(["SETTINGS"], result => {
            const loadedSettings = result.SETTINGS || {};
            const settings = new Settings(loadedSettings, null, "SETTINGS");
            settings.setDefaults();
       });
    }
});