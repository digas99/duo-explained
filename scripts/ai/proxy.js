/**
 * @fileoverview ProxyAgent class for interacting with your backend proxy server.
 */

class ProxyAgent {
  /**
   * Constructs an instance of the ProxyAgent.
   */
  constructor() {
    /**
     * The endpoint of your proxy server.
     * @type {string}
     */
    this.endpoint = "https://your-proxy-server.com/api/explain"; // Change to your actual proxy URL
  }

  /**
   * Initializes the agent (in case you want to load dynamic config later).
   * This can be omitted if you want to hardcode the endpoint.
   * @param {string} endpoint - (Optional) Proxy server URL.
   */
  init(endpoint) {
    if (endpoint) {
      this.endpoint = endpoint;
      console.log(`Proxy endpoint set to ${endpoint}`);
    }
  }

  /**
   * Sends a query to the proxy server.
   * @param {string} prompt - The prompt or query to send.
   * @returns {Promise<string|null>} - The response from the proxy server, or null if an error occurred.
   */
  async query(prompt) {
    const body = JSON.stringify({ prompt });

    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: body,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Proxy request failed: ${response.status} ${errorText}`);
        return null;
      }

      const data = await response.json();
      console.log("Proxy Response:", data);

      return {
        content: data.response, // assuming your proxy returns {response: "text here"}
        model: data.model || "unknown", // optional if you want to track model info
        usage: data.usage || null, // optional if you want to track token usage
      };
    } catch (error) {
      console.error(
        "There has been a problem with the proxy fetch operation:",
        error
      );
      return null;
    }
  }
}
