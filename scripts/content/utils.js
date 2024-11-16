const extensionActive = async () => {
	const data = await chrome.storage.sync.get("SETTINGS");
	return data.SETTINGS?.["extension-enabled"];
}

const parseJapaneseFurigana = textWrapper => {
	textWrapper = textWrapper.querySelector("ruby") || textWrapper;
	const nonFuriganaSpans = Array.from(textWrapper.querySelectorAll("span")).filter(span => span.lang);
	return nonFuriganaSpans.map(span => span.innerText).join("")
}

const type = (element, htmlContent, delay = 10) => {
    // Parse the HTML content into a DOM tree
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");

    // Array to hold text nodes and their text content
    const textNodes = [];

    // Recursive function to clone nodes and collect text nodes
    function cloneNodeWithEmptyText(node) {
        let clone = null;
        if (node.nodeType === Node.ELEMENT_NODE) {
            clone = document.createElement(node.tagName);
            // Copy attributes
            for (let attr of node.attributes) {
            clone.setAttribute(attr.name, attr.value);
            }
            // Recursively clone and append child nodes
            for (let child of node.childNodes) {
            let childClone = cloneNodeWithEmptyText(child);
            clone.appendChild(childClone);
            }
        } else if (node.nodeType === Node.TEXT_NODE) {
            clone = document.createTextNode("");
            textNodes.push({ node: clone, text: node.textContent });
        }
        return clone;
    }

    // Clone the body content
    let contentClone = cloneNodeWithEmptyText(doc.body);

    // Clear the element and append the cloned content
    element.innerHTML = "";
    while (contentClone.firstChild) {
        element.appendChild(contentClone.firstChild);
    }

    // Create the character array
    let charArray = [];
    for (let nodeInfo of textNodes) {
        let text = nodeInfo.text;
        let node = nodeInfo.node;
        for (let i = 0; i < text.length; i++) {
            charArray.push({ char: text[i], node: node });
        }
    }

    // Map to keep track of current text content for each node
    let nodeTextMap = new Map();

    let index = 0;

    function typeNextChar() {
        if (index >= charArray.length) {
            // Typing complete
            clearInterval(typingInterval);
            return;
        }
        let charInfo = charArray[index];
        let node = charInfo.node;
        let char = charInfo.char;

        let currentText = nodeTextMap.get(node) || "";
        currentText += char;
        nodeTextMap.set(node, currentText);
        node.textContent = currentText;

        // Scroll the container to the bottom
        element.scrollTop = element.scrollHeight;

        index++;
    }

    let typingInterval = setInterval(typeNextChar, delay);
};

const removeAllElements = (selector) => {
	const elements = document.querySelectorAll(selector);
	if (elements)
		elements.forEach(element => element.remove());
}
