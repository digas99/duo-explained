/**
 * @fileoverview Script to handle the theme change event on Duolingo.
 */

const duolingoTheme = () => {
	if (document.documentElement.hasAttribute("data-duo-theme"))
		return document.documentElement.getAttribute("data-duo-theme");

	const blackWhiteValue = getComputedStyle(document.documentElement).getPropertyValue("--color-black-white");
	return blackWhiteValue === '0, 0, 0' ? 'light' : 'dark';
}

const INTERFACE_COLORS = {
	"light": {
		"accent-color": "#00de8c",
		"secondary-color": "#cff2e5",
		"faded-accent-color": "#cff2e5",
		"styles": [
			`
				.d-cgpt-button {
				 	filter: unset !important;
					opacity: 0.2;
				}

				.d-cgpt-icon {
					filter: invert(100%) sepia(46%) saturate(136%) hue-rotate(294deg) brightness(116%) contrast(80%);
					background-color: #5d4d29;
				}

				.d-cgpt-icon-accent {
					filter: invert(83%) sepia(29%) saturate(5497%) hue-rotate(102deg) brightness(90%) contrast(101%);
				}

				.d-cgpt-icon-duo-ui {
					filter: invert(62%) sepia(13%) saturate(0%) hue-rotate(212deg) brightness(109%) contrast(97%);
				}
			`
		]
	},
	"dark": {
		"accent-color": "#00ffa1",
		"secondary-color": "#0e0e0e",
		"faded-accent-color": "#3d554c",
		"styles": [
			`
				.d-cgpt-button {
					filter: invert(1) !important;
					opacity: 0.2;
				}

				.d-cgpt-icon {
					filter: invert(26%) sepia(33%) saturate(298%) hue-rotate(158deg) brightness(88%) contrast(94%);
					background-color: rgb(147, 163, 173);
				}

				.d-cgpt-icon-accent {
					filter: invert(99%) sepia(74%) saturate(4779%) hue-rotate(76deg) brightness(97%) contrast(117%);
				}

				.d-cgpt-icon-duo-ui {
					filter: invert(38%) sepia(37%) saturate(210%) hue-rotate(152deg) brightness(91%) contrast(91%);
				}
			`
		]
	}
}

const updateTheme = theme => {
	// set custom colors
	const colors = INTERFACE_COLORS[theme];
	for (const [key, value] of Object.entries(colors)) {
		if (key === "styles")
			continue;
		
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
	console.log('theme.js');
	console.log(window);
	window.addEventListener("load", function() {
		console.log('onload');
		event = new CustomEvent("duotheme", { detail: {
			theme: duolingoTheme(),
			context: 'onload',
		} });
		document.dispatchEvent(event);
	});

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
