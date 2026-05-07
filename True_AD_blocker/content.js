class AdBlocker {
    constructor() {
        this.staticSelectors = [
            '.adbox', '.banner_ads', '.adsbox', '.textads',
            'ins.adsbygoogle', 'div[id^="google_ads"]',
            'iframe[id^="google_ads"]', 'iframe[src*="doubleclick.net"]',
            '.modal-ad', '.premium-ad-container',
            '[id^="ad-"]', '[class^="ad-"]'
        ];
        this.init();
    }

    async init() {
        const settings = await chrome.storage.local.get({ enabled: true });
        if (!settings.enabled) return;

        this.applyStaticRules();
        this.setupObserver();
    }

    applyStaticRules() {
        const selector = this.staticSelectors.join(', ');
        document.querySelectorAll(selector).forEach(el => {
            el.style.display = 'none';
        });
    }

    setupObserver() {
        const observer = new MutationObserver(() => {
            this.applyStaticRules();
        });
        observer.observe(document.documentElement, { 
            childList: true, 
            subtree: true 
        });
    }
}

// Initialize the blocker
new AdBlocker();