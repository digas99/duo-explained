/**
 * @fileoverview Background script for handling messages from the content scripts and querying the OpenAI API.
 */

import { OpenAIAgent } from "./ai/chatgpt.js";
import { QueryGenerator } from "./ai/query.js";
import { SettingsComponent } from "./settings.js";
import { urls } from "./config.js";

chrome.runtime.onInstalled.addListener(details => {
    if (details.reason == "update") {
        const version = chrome.runtime.getManifest().version;
        if (details.previousVersion != version && version.split('.').length < 4) {
            chrome.storage.sync.set({ "SHOW_CHANGELOG": true });
        }

        // Force extension activation to embrace the new API requests approach
        if (version <= "0.0.6") {
            chrome.storage.sync.get(["SETTINGS"], result => {
                const settings = result.SETTINGS || {};
                settings["extension-enabled"] = true;
                chrome.storage.sync.set({ SETTINGS: settings }, () => {
                    chrome.runtime.sendMessage({ type: "RELOAD" });
                });
            });
        }
    }
});

let tabId = null;

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
                    const mode = await chrome.storage.sync.get("API_MODE");
                    if (mode.API_MODE === "personal") {
                        const response = await agent.query(agent.model, prompt);
                        sendResponse(response);
                    } else if (mode.API_MODE === "free") {
                        const id = request.id;
                        if (!id) {
                            sendResponse({ error: "ID not found." });
                            return;
                        }

                        const response = await fetch(urls.API_PROXY, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                source: id,
                                prompt: prompt
                            })
                        })
                        .then(response => response.json())
                        .then(data => {
                                console.log(data);
                                return data;
                            });

                        sendResponse(response);
                    }
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

    // Reload the content scripts
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
                        // 
                        chrome.storage.sync.set({ SHOW_CHANGELOG: false });
                    });
            }
        });
    }

    if (request.type === "SET_MODE") {
        tabId = sender.tab?.id || sender.tab;

        if (tabId !== undefined) {
            updateBadge(tabId, request.mode);
        } else {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs.length > 0 && tabs[0].id !== undefined) {
                    updateBadge(tabs[0].id, request.mode);
                }
            });
        }
    }

    return true;
});

// on tab load
chrome.webNavigation.onDOMContentLoaded.addListener(async details => {
	tabId = details.tabId;
    await updateBadge(tabId);
});

// on tab switch
chrome.tabs.onActivated.addListener(async activeInfo => {
	tabId = activeInfo["tabId"];
    await updateBadge(tabId);
});

const updateBadge = async (tabId, mode) => {
    if (!mode) {
        mode = await chrome.storage.sync.get("API_MODE");
        mode = mode?.API_MODE || "free";
    }

    if (mode === "personal") {
        chrome.action.setBadgeText({text: "🔑", tabId:tabId});
        chrome.action.setBadgeBackgroundColor({color: "#202f36", tabId:tabId});
    } else {
        chrome.action.setBadgeText({text: "", tabId:tabId});
        chrome.action.setBadgeBackgroundColor({color: "#202f36", tabId:tabId});
    }
}

chrome.runtime.onInstalled.addListener(async details => {
    console.log("Extension Reloaded");
    if (details.reason === "install" ||
        details.reason === "update") {

        // set defaults for settings
       chrome.storage.sync.get(["SETTINGS"], result => {
            const loadedSettings = result.SETTINGS || {};
            const settings = new SettingsComponent(
                loadedSettings,
                null,
                "SETTINGS",
                {
                    "duolingo": urls.DUOLINGO,
                    "assets": urls.ASSETS,
                }
            );
            settings.setDefaults();
       });

        // set API mode default
        const mode = await chrome.storage.sync.get("API_MODE");
        if (!mode.API_MODE)
            chrome.storage.sync.set({ API_MODE: "free" });    
    }
});