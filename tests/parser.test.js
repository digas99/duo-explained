const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const ChallengeParser = require('../scripts/content/lesson/parser');
const ChallengeData = require('../scripts/content/lesson/challenge');

describe('Duolingo Challenge Parsing Tests with DOM', () => {
	let browser, page, expectedResults;

	const puppeteer_options = {
		headless: true,
		args: ['--no-sandbox', '--disable-setuid-sandbox']
	};

	// load challenges as the name of the files from pages/
	const challenges = fs.readdirSync(path.resolve(__dirname, 'pages'));

	beforeAll(async () => {
		browser = await puppeteer.launch(puppeteer_options);
		page = await browser.newPage();

		// load expected results
		expectedResults = loadExpectedResults(challenges);
	});

	afterAll(async () => {
		await browser.close();
	});

	// test each challenge
	test.each(challenges)('should parse %s', async challenge => {
		const html = fs.readFileSync(path.resolve(__dirname, 'pages', challenge), 'utf8');
		
		await page.setContent(html);			

		const challengeContent = await page.$("div[data-test^='challenge']");
		
		const parserString = ChallengeParser.toString();
		const type = challenge.replace('.html', '');
		const result = await page.evaluate((parserString, challengeContent, type) => {
			const ChallengeParser = new Function(`return ${parserString}`)();
			return ChallengeParser.parse(type, challengeContent);
		}, parserString, challengeContent, type);

		expect(new ChallengeData(result)).toEqual(expectedResults[type]);
	});
});

const loadExpectedResults = challenges => {
	const expectedResults = {};
	challenges.forEach(challenge => {
		const type = challenge.replace('.html', '');
		expectedResults[type] = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'expected', `${type}.json`), 'utf8'));
	});
	return expectedResults;
}