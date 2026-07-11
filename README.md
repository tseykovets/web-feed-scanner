# Web Feed Scanner

A browser extension (WebExtensions Manifest V3) that detects declared web feeds for the currently loaded page. It parses `<link>` tags and exposes found feeds on a separate tab, which opens when you click on a button on the toolbar or an item in the context menu.

## Instructions

The project uses the [extension.js framework](https://extension.js.org).

### Prerequisites

* [Git](https://git-scm.com)
* [Node.js with npm](https://nodejs.org)

### Getting Started

1. Clone the repository:
	```bash
	git clone https://github.com/tseykovets/web-feed-scanner.git
	cd web-feed-scanner
	```
2. Install dependencies:
	```bash
	npm install
	```

### Development

Use `npm run dev` to launch the extension with hot reloading: changes in code appear instantly without manual reloads. For example:

* To test in Chrome:
	```bash
	npm run dev -- --browser=chrome
	```
	or just
	```bash
	npm run dev
	```
* To test in Firefox:
	```bash
	npm run dev -- --browser=firefox
	```

### Build

The project supports building for different browsers via dedicated npm scripts:

* For Chromium-based browsers (Chrome, Edge, Yandex Browser, etc.):
	```bash
	npm run build:chromium-based
	```
	The built extension will be located in: `dist/chromium-based/`
* For Gecko-based browsers (Firefox, LibreWolf, Waterfox, etc.):
	```bash
	npm run build:gecko-based
	```
	The built extension will be located in: `dist/gecko-based/`
