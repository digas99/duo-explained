/**
 * @fileoverview Script to handle the theme change event on Duolingo.
 */

const duolingoTheme = () => {
	const blackWhiteValue = getComputedStyle(document.documentElement).getPropertyValue("--color-black-white");
	return blackWhiteValue === '0, 0, 0' ? 'light' : 'dark';
}

const INTERFACE_COLORS = {
	"light": {
		"accent-color": "#00ffa1",
		"secondary-color": "#cff2e5",
		"styles": [
			`
				.d-cgpt-icon {
					filter: invert(100%) sepia(46%) saturate(136%) hue-rotate(294deg) brightness(116%) contrast(80%);
					background-color: #5d4d29;
				}
			`
		]
	},
	"dark": {
		"accent-color": "#00ffa1",
		"secondary-color": "#0e0e0e",
		"styles": [
			`
				.d-cgpt-icon {
					filter: invert(26%) sepia(33%) saturate(298%) hue-rotate(158deg) brightness(88%) contrast(94%);
					background-color: rgb(147, 163, 173);
				}
			`
		]
	}
}

const updateTheme = theme => {
	// set custom colors
	const colors = INTERFACE_COLORS[theme];
	for (const [key, value] of Object.entries(colors)) {
		document.documentElement.style.setProperty(`--d-cgpt-${key}`, value);
	}

	// add custom styles
	colors["styles"].forEach(style => {
		const element = document.createElement("style");
		element.innerHTML = style;
		document.head.appendChild(element);
	});
}

(async () => {
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
