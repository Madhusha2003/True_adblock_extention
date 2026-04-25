class AdBlocker {
    constructor() {
        this.staticSelectors = [
            '.adbox', '.banner_ads', '.adsbox', '.textads',
            'ins.adsbygoogle', 'div[id^="google_ads"]',
            'iframe[id^="google_ads"]', 'iframe[src*="doubleclick.net"]',
            '.modal-ad', '.premium-ad-container'
        ];
        this.init();
    }

    async init() {
        const { enabled = true, ruleEnabled = true } = await chrome.storage.local.get(['enabled', 'ruleEnabled']);
        if (!enabled || !ruleEnabled) return;

        const currentDomain = window.location.hostname;
        const { whitelist = [] } = await chrome.storage.local.get('whitelist');
        if (whitelist.includes(currentDomain)) return;

        this.applyStaticRules();
        this.setupObserver();
        this.neutralizeVideoAds();
    }

    applyStaticRules() {
        const selector = this.staticSelectors.join(', ');
        document.querySelectorAll(selector).forEach(el => el.remove());
    }

    setupObserver() {
        const observer = new MutationObserver(() => {
            this.applyStaticRules();
            this.neutralizeVideoAds();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    neutralizeVideoAds() {
        document.querySelectorAll('video').forEach(video => {
            if (video.closest('.video-ads') || video.closest('.ytp-ad-module')) {
                video.muted = true;
                video.playbackRate = 16.0;
                if (video.currentTime < video.duration) {
                    video.currentTime = video.duration;
                }
            }
        });
    }
}

new AdBlocker();