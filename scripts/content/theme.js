const duolingoTheme = () => {
	const blackWhiteValue = getComputedStyle(document.documentElement).getPropertyValue("--color-black-white");
	return blackWhiteValue === '0, 0, 0' ? 'light' : 'dark';
}

(() => {
	let event;
	window.onload = () => {
		event = new CustomEvent("duotheme", { detail: {
			theme: duolingoTheme(),
			context: 'onload',
		} });
		document.dispatchEvent(event);
	}

	// watch for dark mode change
	document.addEventListener("input", e => {
		const target = e.target;

		if (target.closest("select[data-test='dark-mode']")) {
			setTimeout(() => {
				const theme = duolingoTheme();
				event = new CustomEvent("duotheme", { detail: {
					selection: theme,
					theme: theme,
					context: 'change',
				} });
				document.dispatchEvent(event);
			}, 100);
		}
	});
})();
