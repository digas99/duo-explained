import { OpenAIAgent } from "./chatgpt.js";


let agent = new OpenAIAgent();


/**
 * Load local storage values from user settings for API key and model chosen for ChatGPT.
 * This is useful for persisting the API key and model across browser sessions.
 */
chrome.storage.sync.get("API_KEY", (apiKey) => {
  console.log("API_KEY currently is " + apiKey);

  chrome.storage.sync.get("MODEL", (model) => {
    console.log("MODEL currently is " + model);

    // Instantiate OpenAIAgent once the API_KEY and MODEL are loaded
    agent.init(apiKey, model);
  });
});

/**
 * Listen for messages from the content script.
 * If the message type is "QUERY", a message is sent to the agent to query the OpenAI API.
 * If the message type is "SET_API_KEY, the API key is set in the agent and stored in local storage.
 * If the message type is "SET_MODEL", the model is set in the agent and stored in local storage.
 */
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.type === "QUERY") {
    if (agent) {
      try {
        const response = await agent.query();
        sendResponse(response);
      } catch (error) {
        sendResponse({ error: error.message });
      }
    } else {
      sendResponse({ error: "Agent not initialized yet." });
    }
  }

  // Set the API key
  if (request.type === "SET_API_KEY") {
    agent.setApiKey(request.apiKey);
    chrome.storage.sync.set({ API_KEY: request.apiKey }, () => {
      sendResponse({ message: "API key set." });
    });
  }

  // Set the model
  if (request.type === "SET_MODEL") {
    agent.setModel(request.model);
    // Model value is managed by the content script, therefore always in accordance with the available models
    chrome.storage.sync.set({ MODEL: request.model }, () => {
      sendResponse({ message: "Model set." });
    });
  }

  // Indicate that the response will be sent asynchronously
  return true;
});
