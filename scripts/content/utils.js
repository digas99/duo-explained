const parseJapaneseFurigana = textWrapper => {
	textWrapper = textWrapper.querySelector("ruby") || textWrapper;
	const nonFuriganaSpans = Array.from(textWrapper.querySelectorAll("span")).filter(span => span.lang);
	return nonFuriganaSpans.map(span => span.innerText).join("")
}