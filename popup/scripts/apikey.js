(async () => {
	const content = await fetch('/docs/help/API_KEY.md').then((response) => response.text()).then((text) => text);
	
	const converter = new showdown.Converter();
	let html = converter.makeHtml(content);
	console.log(html);

	// get title (h1)
	const title = html.match(/<h1(.*?)<\/h1>/)[0];
	html = html.replace(title, '');

	const container = document.querySelector('#apikey-help');
	container.innerHTML = html;

	// handle table of contents
	const toc = document.querySelector('#tableofcontents');
	toc.nextElementSibling.classList.add('table-of-contents');
	const tocLinks = toc.nextElementSibling.querySelectorAll('a');
	tocLinks.forEach(link => {
		console.log(link);
		link.href = `${link.getAttribute("href").split('-').join("")}`;
	});

	// handle external links with target="_blank"
	const links = document.querySelectorAll('a');
	links.forEach(link => {
		if (link.href.startsWith('http')) {
			link.target = '_blank';
		}
	});
})();