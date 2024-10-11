(() => {
	const getDuo = () => {
		const duoObject = window.duo;
		if (!duoObject) return;

		console.log("Duo Object", duoObject);
		window.postMessage({
			type: "DUO",
			language: duoObject.uiLanguage
		}, "*");
	};

	// inject in the page
	const script = document.createElement("script");
	script.textContent = `(${getDuo.toString()})();`;
	document.documentElement.appendChild(script);
	script.remove();
})();