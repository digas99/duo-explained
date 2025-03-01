# [Changelog v0.0.5 &nbsp; <img src="https://img.shields.io/badge/Latest-0a7fa6">](#)
Released on 1/03/2025

### Bug Fixes
- Fixed an issue where visual assets where not loading correctly because the base url changed

# [Changelog v0.0.4 &nbsp; <img src="https://img.shields.io/badge/Released-11ad2e">](#)
Released on 1/12/2024

### Bug Fixes
- Fixed an issue that disabled the explain button when ChatGPT's explanation failed to load.


# [Changelog v0.0.3 &nbsp; <img src="https://img.shields.io/badge/Released-11ad2e">](#)
Released on 21/11/2024

### New Features
- User Extra Query is now available on mobile devices with right click (long press) on the Explain button
<img class="d-cgpt-changelog-demo" src="https://raw.githubusercontent.com/digas99/duo-explained/refs/heads/main/images/changelog/v003/user-extra-query-mobile.gif" width="400px">

### Bug Fixes
- Fixed issue that prevented stats from being displayed at the end of the lesson
- Removed the "Explain" button when no Challenge is on screen (on motivational messages, for example) [#29](https://github.com/digas99/duo-explained/issues/29)
- Fixed issue where the Show/Hide button on mobile would linger on the screen after the lesson was over [#21](https://github.com/digas99/duo-explained/issues/21)
- Fixed edge case related to issue [#32](https://github.com/digas99/duo-explained/issues/32)


# [Changelog v0.0.2 &nbsp; <img src="https://img.shields.io/badge/Released-11ad2e">](https://github.com/digas99/duo-explained/releases/tag/v0.0.2)
Released on 17/11/2024

### New Features
- Improvements in the explanation window
  - Correctly formatted markdown for bullet/numbered lists
  - Adding emboldened text support
  - Automatic scrolling when the explanation overflows the window
  - Automatic scroll stops when the user scrolls manually
  <img class="d-cgpt-changelog-demo" src="https://raw.githubusercontent.com/digas99/duo-explained/refs/heads/main/images/changelog/v002/explain-window-updates.gif" width="400px">
- Improved typing approach to User Extra Query to ChatGPT  
- Added an update notification when the extension is updated presenting the new features and bug fixes
<img class="d-cgpt-changelog-demo" src="https://raw.githubusercontent.com/digas99/duo-explained/refs/heads/main/images/changelog/v002/update-changelog.png" width="400px">

### Bug Fixes
- The explanation from ChatGPT now takes into consideration the word bank [#15](https://github.com/digas99/duo-explained/issues/15) 
- Pressing ENTER when writing on User Extra Query triggeres explanation instead of answer check [#22](https://github.com/digas99/duo-explained/issues/22)
- Fixed stats at the end of the lesson formating on mobile [#14](https://github.com/digas99/duo-explained/issues/14)
- Fixed choice numbers from select exercises being null when the exercise doesn't number them [#12](https://github.com/digas99/duo-explained/issues/12)
- Disabling and enabling the extension at the middle of a lesson now works correctly [#32](https://github.com/digas99/duo-explained/issues/32)

# [Changelog v0.0.1 &nbsp; <img src="https://img.shields.io/badge/Released-11ad2e">](https://github.com/digas99/duo-explained/releases/tag/v0.0.1)
Released on 11/06/2024

First release including the following features:
- Exercise explanations on some main exercise types
- Settings accessible both in the Extension Popup and in the Duolingo settings page
- Desktop and mobile support

<br>

<p>
	<img src="https://img.shields.io/badge/Latest-0a7fa6">
	<img src="https://img.shields.io/badge/Released-11ad2e">
	<img src="https://img.shields.io/badge/Developing-c7a510">
</p>