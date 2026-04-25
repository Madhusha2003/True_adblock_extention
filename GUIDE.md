# 🛡️ True Rule-Based Ad Blocker - Developer Guide

Welcome to the development guide for the **True Ad Blocker (V5.1)**. This extension focuses on high-performance network filtering and cosmetic DOM cleaning.

---

## 🏗️ Architecture Overview

The extension operates on two primary layers of protection:

1.  **Network Layer (DNR)**: Uses Chrome's `declarativeNetRequest` API to block trackers and ad scripts before they even download. (Fastest)
2.  **Cosmetic Layer**: Uses hardcoded CSS selectors and a MutationObserver to hide/remove ad containers in real-time.

---

## 📂 File Breakdown

### 1. `manifest.json`
The configuration hub. It defines permissions, background scripts, and content scripts.

### 2. `rules.json`
Contains **Static Network Rules**. If you want to block a new domain, add a new rule here with a unique `id`.

### 3. `content.js`
The **Cosmetic Engine**.
*   **MutationObserver**: Watches the page for new elements.
*   **applyStaticRules()**: Scans the page for known ad classes/IDs and removes them from the DOM.

### 4. `scriptlet.js`
Runs in the **MAIN world**.
*   Intercepts `window.open` to block popups.
*   Intercepts suspicious clicks to prevent redirects.

### 5. `background.js`
The **Service Worker**.
*   Listens for the Global Toggle.
*   Tracks the "Total Blocked" statistics.

---

## 🛠️ How to Add Features

### Adding a new domain to block
Update `rules.json` with a new object.

### Adding a new CSS selector
Update `this.staticSelectors` in the constructor inside `content.js`.

---

*Happy Coding!* 🚀
