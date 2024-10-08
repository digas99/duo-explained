# Duolingo ChatGPT Tests

This directory contains tests for the Duolingo challenges parsers.

## Setup

### Page Cleaner

1. Create a virtual environment (optional)
	```bash
	python3 -m venv venv
	source venv/bin/activate
	```
2. Install the required packages
	```bash
	pip install -r requirements.txt
	```

### Unit Tests

1. Install npm packages
	```bash
	npm install
	``` 

## Challenge Pages

The challenge web pages are stored in the `pages` directory. These are HTML files that are downloaded from the Duolingo website. The tests use these files to verify that the parser is working correctly.

Upon downloading a challenge page into the `pages` directory, run `clean_page.py` to remove unnecessary elements from the page and the page files folder that is created by the browser.

```bash
python3 clean_page.py <filename>
```

## Running Tests

To run the tests, first make sure that you have the `expected.js` file with the expected output for the test of each challenge. Then, run the following command:

```bash
npx jest
```

To run a specific test, use the following command:

```bash
npx jest -t <challenge>
```