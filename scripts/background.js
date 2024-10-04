import { OpenAIAgent } from "./chatgpt.js";

let injected = false;

chrome.webNavigation.onDOMContentLoaded.addListener((details) => {
  if (injected) return;
  const tabId = details.tabId;
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ["scripts/content.js"],
  });
  injected = true;
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request);
  if (request.type === "QUERY") {
    const agent = new OpenAIAgent();
    agent.init();
  }
});
