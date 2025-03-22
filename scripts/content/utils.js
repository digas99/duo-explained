const extensionActive = async () => {
    const storage = chrome.storage.sync || chrome.storage.local;
	const data = await storage.get("SETTINGS");
	return data.SETTINGS?.["extension-enabled"];
}

const parseJapaneseFurigana = textWrapper => {
	textWrapper = textWrapper.querySelector("ruby") || textWrapper;
	const nonFuriganaSpans = Array.from(textWrapper.querySelectorAll("span")).filter(span => span.lang);
	return nonFuriganaSpans.map(span => span.innerText).join("")
}

function markdownToHtml(text) {
    const options = {
        disableForced4SpacesIndentedSublists: true,
    };

    const converter = new showdown.Converter(options);
    let html = converter.makeHtml(text);
    return html;
  }

function type(element, htmlContent, delay = 10) {
    htmlContent = htmlContent
      .replace(/<blank>/g, "<span>&lt;blank&gt;</span>")
      .replace(/<\/blank>/g, "</span>");

    // Parse the HTML content into a DOM tree
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");

    // Array to hold text nodes and their text content
    const textNodes = [];

    // Flags to detect user-initiated scrolling
    let userScrolled = false;

    // Event listener to detect user scrolling up
    element.addEventListener('scroll', () => {
        if (element.scrollTop < element.scrollHeight - element.clientHeight) {
            userScrolled = true
        }
    });

    // Recursive function to clone nodes and collect text nodes
    function cloneNodeWithEmptyText(node) {
        let clone = null;
        if (node.nodeType === Node.ELEMENT_NODE) {
            clone = document.createElement(node.tagName);
            // Copy attributes
            for (let attr of node.attributes) {
                clone.setAttribute(attr.name, attr.value);
            }
            // For <li> elements, set visibility: hidden to hide bullets or numbers
            if (node.tagName.toLowerCase() === "li") {
                clone.style.visibility = "hidden";
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

        // If the node's parent is a <li> element that is currently hidden, set it to visible
        let liAncestor = node.parentNode;
        while (
            liAncestor &&
            liAncestor !== element &&
            liAncestor.tagName &&
            liAncestor.tagName.toLowerCase() !== "li"
        ) {
            liAncestor = liAncestor.parentNode;
        }
        
        if (
            liAncestor &&
            liAncestor.tagName &&
            liAncestor.tagName.toLowerCase() === "li"
        ) {
            if (liAncestor.style.visibility === "hidden") {
                liAncestor.style.visibility = "visible";
                // Adjust scroll position if necessary
                if (element.scrollHeight > element.clientHeight) {
                    element.scrollTop += liAncestor.offsetHeight;
                }

                const list = liAncestor.parentElement;
                const listParent = liAncestor.parentElement.parentElement;
                if (listParent.tagName.toLowerCase() === "li") {
                    const listTop = list.getBoundingClientRect().top;
                    const listParentTop = listParent.getBoundingClientRect().top;
                    if (listTop - listParentTop >= 40)
                        list.style.marginTop = "-20px";
                }
                else if (list.previousSibling.tagName || list.previousElementSibling.tagNamei) {
                    const listTop = list.getBoundingClientRect().top;
                    const previousElement = list.previousElementSibling;
                    if (previousElement) {
                        const previousElementTop = previousElement.getBoundingClientRect().top;
                        if (listTop - previousElementTop >= 40)
                            list.style.marginTop = "-20px";
                    }

                    const nextElementSibling = list.nextElementSibling;
                    if (nextElementSibling) {
                        const nextElementSiblingTop = nextElementSibling.getBoundingClientRect().top;
                        if (nextElementSiblingTop - listTop >= 40)
                            list.style.marginBottom = "-20px";
                    }
                }
            }
        }

        let currentText = nodeTextMap.get(node) || "";
        currentText += char;
        nodeTextMap.set(node, currentText);
        node.textContent = currentText;
        
        // Only scroll if the content overflows the container and user hasn't scrolled manually
        if (!userScrolled && element.scrollHeight > element.clientHeight) {
            element.scrollTop = element.scrollHeight;
        }

        index++;
    }

    let typingInterval = setInterval(typeNextChar, delay);
}

const removeAllElements = (selector) => {
	const elements = document.querySelectorAll(selector);
	if (elements)
		elements.forEach(element => element.remove());
}
