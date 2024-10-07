const extensionActive = async () => {
	const data = await chrome.storage.sync.get("EXTENSION_ACTIVE");
	return data.EXTENSION_ACTIVE;
}

const parseJapaneseFurigana = textWrapper => {
	textWrapper = textWrapper.querySelector("ruby") || textWrapper;
	const nonFuriganaSpans = Array.from(textWrapper.querySelectorAll("span")).filter(span => span.lang);
	return nonFuriganaSpans.map(span => span.innerText).join("")
}

const type = (element, text, delay = 10) => {
	let trimmed = false;
	const interval = setInterval(() => {
		if (text?.length > 0) {
			removeCursor(element);

			element.innerHTML += `<span class="cursor">${text[0]}</span>`;
			text = text.slice(1);
		}
		else {
			clearInterval(interval);
			setTimeout(() => removeCursor(element), 1200);
		}

		if (!trimmed) {
			element.innerText = element.innerText.trim();
			trimmed = true;
		}
	}, delay);
}

const removeCursor = element => {
	const cursor = element.querySelector(".cursor");
	if (cursor) {
		const text = cursor.textContent;
		cursor.remove();
		element.innerText += text;
	}
}
