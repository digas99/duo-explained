# Contributing to Duo Explained

First off, thank you for considering contributing to **Duo Explained**! It's people like you that make Duo Explained such a great tool to increase your language skills.

Following these guidelines helps to communicate that you respect the time of the developers managing and developing this open-source project. In return, they should reciprocate that respect in addressing your issue, assessing changes, and helping you finalize your pull requests.

# Pull requests
**Please ask first before starting work on any significant new features.**

It's never a fun experience to have your pull request declined after investing a lot of time and effort into a new feature. To avoid this from happening, we request that contributors create a feature request to first discuss any new ideas. Your ideas and suggestions are welcome!

Please ensure that the tests are passing when submitting a pull request. If you're adding new features, please include tests.



# Table of Contents
- [Contributing to Duo Explained](#contributing-to-duo-explained)
- [Pull requests](#pull-requests)
- [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Ground Rules](#ground-rules)
  - [Your First Contribution](#your-first-contribution)
  - [Getting Started](#getting-started)
    - [How to load an unpacked extension](#how-to-load-an-unpacked-extension)
    - [Reload the extension](#reload-the-extension)
    - [When to reload the extension](#when-to-reload-the-extension)
    - [Debugging](#debugging)
  - [Small or Obvious Fixes](#small-or-obvious-fixes)
  - [How to Report a Bug](#how-to-report-a-bug)
  - [How to Suggest a Feature or Enhancement](#how-to-suggest-a-feature-or-enhancement)
  - [Code Review Process](#code-review-process)
  - [License](#license)

## Introduction

We love to receive contributions from our community — you! There are many ways to contribute, from writing tutorials or blog posts, improving documentation, submitting bug reports, feature requests, or even writing code that can be incorporated into **Duo Explained**.

Feel free to use the issue tracker for support questions

## Ground Rules

- **Be Respectful**: This project adheres to a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.
- **Responsibilities**:
  - Create issues for any major changes and get community feedback.
  - Keep feature versions small.
- **Testing**: Ensure that your changes are tested.

## Your First Contribution

If you are new to contributing to open-source projects, we recommend starting by looking through these beginner-friendly issues:

- **Beginner Issues**: Issues which require only a few lines of code and a test or two.
- **Help Wanted Issues**: More involved issues that require additional expertise.

**Working on your first Pull Request?** You can learn how from this *free* series [How to Contribute to an Open Source Project on GitHub](https://kcd.im/pull-request)

## Getting Started

For something that is bigger than a one or two line fix:

1. **Fork** the repository.
2. **Create a branch** with your changes.
3. Ensure that your code follows the current code style and tests have been added.
4. Submit a pull request.

### How to load an unpacked extension
To load an unpacked extension in developer mode:

1. Go to the Extensions page by entering `chrome://extensions` in a new tab. (By design `chrome://` URLs are not linkable.)
   - Alternatively, click the Extensions menu puzzle button and select **Manage Extensions** at the bottom of the menu.
   - Or, click the Chrome menu, hover over **More Tools**, then select **Extensions**.
2. Enable Developer **Mode** by clicking the toggle switch next to **Developer mode**.
3. Click the **Load unpacked** button and select the extension directory.

<p align="center">
  <img src="https://developer.chrome.com/static/docs/extensions/get-started/tutorial/hello-world/image/extensions-page-e0d64d89a6acf_856.png" width="400" alt="Load unpacked extension">
</p>

### Reload the extension
Go back to the code and change it.

After saving the file, to see this change in the browser you also have to refresh the extension. Go to the Extensions page and click the refresh icon next to the **on/off** toggle:

<p align="center">
  <img src="https://developer.chrome.com/static/docs/extensions/get-started/tutorial/hello-world/image/reload-extension-241cc5378fffb_856.png" width="400" alt="Load unpacked extension">
</p>

### When to reload the extension
The following table shows which components need to be reloaded to see changes:

| Extension component	        | Requires extension reload |
-----------------------------|---------------------------| 
| The manifest	              | Yes                       | 
| Service worker	            | Yes                       | 
| Content scripts	            | Yes (plus the host page)  | 
| The popup	                  | No                        |     
| Options page	              | No                        | 
| Other extension HTML pages  | No                        |

### Debugging
To debug the extension, you can use the Chrome DevTools. To open the DevTools, right-click on the extension icon and select **Inspect popup**.

To debug content scripts, you can access the browser's console by right-clicking on the page and selecting **Inspect**.


## Small or Obvious Fixes
As a rule of thumb, changes are obvious fixes if they do not introduce any new functionality or creative thinking. As long as the change does not affect functionality, some likely examples include the following:

- Spelling / grammar fixes
- Typo correction, white space and formatting changes
- Comment clean up
- Bug fixes that change default return values or error codes stored in constants
- Adding logging messages or debugging output
- Changes to ‘metadata’ files like .gitignore, build scripts, etc.
- Moving source files from one directory or package to another


## How to Report a Bug

If you find a security vulnerability, **do not** open an issue. Instead, email us directly at **andreclerigo@outlook.com** or **digas_correia@hotmail.com**.

To file a bug report:

1. **Check existing issues** to avoid duplicates.
2. Open a new issue and include:
   - What you did.
   - What you expected to see.
   - What you actually saw.

## How to Suggest a Feature or Enhancement

If you have a feature you'd like to see, open an issue to describe:

1. **The feature you would like** to see.
2. **Why you need it**.
3. **How it should work**.

We value features that align with our project philosophy: lightweight, robust, and versatile.

## Code Review Process

After submitting a pull request:

- The core team will review your contribution.
- We may close pull requests that do not show activity.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
