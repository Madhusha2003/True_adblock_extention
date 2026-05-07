/**
 * Content Script - Cosmetic Ad Blocker
 * This script runs on every page and hides ad containers using CSS.
 * Simplified for beginners.
 */
class AdBlocker {
    constructor() {
        // Standard CSS selectors for common ad elements
        this.staticSelectors = [
            '.adbox', '.banner_ads', '.adsbox', '.textads',
            'ins.adsbygoogle', 'div[id^="google_ads"]',
            'iframe[id^="google_ads"]', 'iframe[src*="doubleclick.net"]',
            '.modal-ad', '.premium-ad-container',
            '[id^="ad-"]', '[class^="ad-"]', '[class*="-ad-"]',
            '.sponsored-content', '.promoted-item'
        ];
        
        this.debounceTimer = null;
        this.customCosmeticRules = [];
        this.init();
    }

    async init() {
        // 1. Fetch bundled cosmetic rules (baked-in list)
        let bundledCosmetic = [];
        try {
            const response = await fetch(chrome.runtime.getURL('rules/cosmetic_rules.json'));
            if (response.ok) {
                bundledCosmetic = await response.json();
            }
        } catch (e) {
            // File might not exist yet, that's fine
        }

        // 2. Fetch custom cosmetic rules added by the user
        const settings = await chrome.storage.local.get({
            enabled: true,
            customCosmeticRules: [],
            whitelist: []
        });

        // If the blocker is turned off, stop here
        if (!settings.enabled) return;

        // If the current site is whitelisted, stop here
        const currentHost = window.location.hostname;
        const isWhitelisted = settings.whitelist.some(domain => currentHost.includes(domain));
        if (isWhitelisted) {
            console.log('[True AD Blocker] Site is whitelisted. Cosmetic blocking disabled.');
            return;
        }

        // Combine both lists
        this.customCosmeticRules = [...bundledCosmetic, ...settings.customCosmeticRules];

        // Apply rules immediately on load
        this.applyCosmeticFiltering();

        // Setup an observer to catch new ads that load dynamically
        this.setupObserver();
    }

    /**
     * Watches the page for changes (like endless scrolling) and hides new ads.
     * We use a "debounce" timer so it doesn't slow down the browser by running too often.
     */
    setupObserver() {
        const observer = new MutationObserver(() => {
            if (this.debounceTimer) clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.applyCosmeticFiltering();
            }, 150); // Wait 150ms after the page stops changing before running
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Finds ad elements on the page and applies CSS to hide them.
     */
    applyCosmeticFiltering() {
        // 1. Hide elements matching the static selectors
        const selectorString = this.staticSelectors.join(', ');
        document.querySelectorAll(selectorString).forEach(el => this.hideElement(el));

        // 2. Hide elements matching the custom cosmetic rules (e.g. example.com##.ad-banner)
        const currentHost = window.location.hostname;
        
        this.customCosmeticRules.forEach(rule => {
            try {
                // Check if the rule is a standard cosmetic rule containing '##'
                if (rule && rule.includes('##')) {
                    const [domain, cssSelector] = rule.split('##');
                    
                    // If there is no domain, it applies to all sites.
                    // Otherwise, we check if the current site matches the domain.
                    if (!domain || currentHost.includes(domain)) {
                        document.querySelectorAll(cssSelector).forEach(el => this.hideElement(el));
                    }
                }
            } catch (e) {
                // If a selector is invalid, just silently skip it
            }
        });
    }

    /**
     * Helper function to hide an element using CSS.
     */
    hideElement(el) {
        if (el && el.style.display !== 'none') {
            el.style.setProperty('display', 'none', 'important');
        }
    }
}

// Start the blocker!
new AdBlocker();