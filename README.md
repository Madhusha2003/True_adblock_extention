# 🛡️ True AD Blocker

True AD Blocker is a lightweight, high-performance, and fully Manifest V3 compliant ad-blocking extension for Chromium browsers. Built from the ground up for maximum speed and privacy, it leverages Chrome's native `declarativeNetRequest` API to block ads at the network level without slowing down your browser.

## ✨ Features

*   **⚡ Blazing Fast Network Engine**: Uses Chrome's built-in `declarativeNetRequest` API to intercept and block tracking scripts and ad payloads before they even load.
*   **🎨 High-Performance Cosmetic Filtering**: Instead of relying on slow JavaScript loops to hide elements, it injects native CSS into the page (and Pierces Shadow DOMs) to instantly hide thousands of ad containers using hardware-accelerated styling.
*   **🛡️ Aggressive Scriptlet Injection**: Neutralizes sneaky anti-adblockers, fake `window.open` background popups, and click-hijacking `<a>` tags before they execute.
*   **📝 Professional Rule Parser**: Automatically converts industry-standard filter formats (like `||domain^`, `@@||whitelist^`, and `/regex/`) into native Chrome rules, automatically discarding rules that are too memory-intensive.
*   **✅ Smart Whitelisting**: Instantly bypasses both network blocking and cosmetic CSS hiding for sites you choose to support.
*   **📦 Massive Capacity**: Currently pre-loaded with over 66,000 highly optimized rules spanning across split, memory-safe static files.

## 📜 Rule Sources & Credits

The core filtering rules included in this extension are sourced from the incredible work of the **[EasyList](https://easylist.to/)** community. 

True AD Blocker utilizes the EasyList standard format to ensure the highest quality ad blocking and tracking protection available on the web. A massive thank you to the maintainers and contributors of EasyList!

## ⚙️ How It Works

True AD Blocker utilizes a "Dual-Core" architecture:
1.  **Static Layer (`rules/rules_1.json`, `rules/rules_2.json`)**: Handles massive amounts of community rules (like EasyList) perfectly split to keep under Chrome's memory limits.
2.  **Dynamic Layer (`chrome.storage`)**: Manages your personal blocklists, whitelists, and custom parsed rules dynamically, guaranteeing zero ID overlaps with an automatic synchronization lock.

## 🚀 Installation (Developer Mode)

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked** and select the `True_AD_blocker` folder.
5. Enjoy an ad-free experience!

## 🔧 Managing Custom Rules

You can add your own domains to block or whitelist by clicking on the extension icon to open the Popup, or by navigating to the **Options Page**. 

The advanced rule parser in the Options page allows you to paste raw EasyList syntax. It will automatically compile them, strip out any memory-heavy Regex, and save them as optimized Dynamic Rules!

---
*Built for the modern, privacy-respecting web.*
