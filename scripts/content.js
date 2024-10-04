chrome.runtime.sendMessage({ type: "QUERY" }, (response) => {
    console.log(response);
});

window.onload = () => {
	const moreNav = document.querySelector("a[data-test='home-nav']")?.parentElement;
	const navbar = moreNav?.parentElement;
	if (navbar) {
		// clone the moreNav element
		const newTab = makeTab(moreNav);

		// add the new tab to the navbar
		navbar.insertBefore(newTab, navbar.firstElementChild);
	}
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