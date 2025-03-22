// URLS
export const urls = {
	API_PROXY: "https://duo-explained-proxy.andreclerigo.com/proxy",
	ASSETS: "https://andreclerigo.github.io/duo-explained-assets",
	DUOLINGO: "https://duolingo.com",
	EXTENSION_REPO: "https://github.com/digas99/duo-explained",
};

export const storage = chrome.storage.sync || chrome.storage.local;

if (typeof window !== "undefined") {
    window.urls = urls;
	window.storage = storage;
}