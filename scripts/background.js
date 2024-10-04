import { OpenAIAgent } from "./chatgpt.js";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request);
  if (request.type === "QUERY") {
    // const agent = new OpenAIAgent();
    // agent.init();
  }
});
