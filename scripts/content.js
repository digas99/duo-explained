chrome.runtime.sendMessage({ type: "QUERY" });

window.onload = () => {
	// Duo ChatGPT tab
	const moreNav = document.querySelector("a[data-test='home-nav']")?.parentElement;
	const navbar = moreNav?.parentElement;
	let newTab;
	if (navbar) {
		newTab = makeTab(moreNav);
		navbar.insertBefore(newTab, navbar.firstElementChild);
	}

	// API Key prompt
	chrome.storage.sync.get("API_KEY", data => {
		const apiKey = data.API_KEY;
		console.log(apiKey);
		if (!apiKey) {
			const prompt = makePrompt();
			const root = document.querySelector("#root");
			root.insertAdjacentHTML("beforeend", prompt);
			const promptButton = document.querySelector(".d-cgpt-prompt button");
			promptButton.addEventListener("click", () => {
				const apiKey = document.querySelector(".d-cgpt-prompt input").value;
				if (!apiKey) {
					return;
				}
		
				chrome.runtime.sendMessage({ type: "SET_API_KEY", apiKey: apiKey }, (response) => {
					console.log(response);
					if (response) {
						document.querySelector(".d-cgpt-prompt").remove();
						if (newTab) {
							newTab.querySelector("a").classList.add("active");
						}
					}
				});
			});
		}
		else {
			if (newTab) {
				newTab.querySelector("a").classList.add("active");
			}
		}
	});

}

const makeTab = (template) => {
	const tab = template.cloneNode(true);
	tab.className = "d-cgpt-tab";
	const tabLink = tab.querySelector("a");
	delete tabLink.dataset.test;
	tabLink.href = "javascript: void(0)";
	const tabText = tab.querySelector("span span");
	tabText.innerText = "Duo ChatGPT";
	const tabIcon = tab.querySelector("img");
	tabIcon.src = "https://andreclerigo.github.io/duolingo-chatgpt-assets/logo.png";
	return tab;
}

const makePrompt = () => {
	return /* html */`
		<div class="d-cgpt-prompt">
			<div>
				<img src="https://andreclerigo.github.io/duolingo-chatgpt-assets/logo.png">
				<input type="text" placeholder="API Key">
				<button>Submit</button>
				<img src="https://andreclerigo.github.io/duolingo-chatgpt-assets/icons/close-thick.png">
			</div>
		</div>
	`;
};