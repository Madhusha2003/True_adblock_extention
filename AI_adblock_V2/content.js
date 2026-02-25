function getFeatures(el) {
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);

    const links = el.querySelectorAll('a');
    const numLinks = links.length;

    // Count links that go to a different domain
    const crossDomain = Array.from(links).filter(a =>
        a.hostname && a.hostname !== window.location.hostname
    ).length;

    const hasIframe = el.tagName === 'IFRAME' ? 1 : 0;

    // 1. Normalise string (e.g., "adContainer" -> "ad-container", "top_ad" -> "top-ad")
    const classNameAndId = (el.getAttribute('class') || '') + ' ' + (el.getAttribute('id') || '');
    const cleanStr = classNameAndId.replace(/[A-Z]/g, m => '-' + m.toLowerCase()).replace(/_/g, '-');

    // 2. Expanded Vocabulary with strict word boundaries (\b) to prevent false positives
    const adKeywords = [
        'ad', 'ads', 'advertisement', 'advert',
        'promo', 'promoted', 'sponsored', 'sponsor',
        'banner', 'campaign', 'partner', 'taboola', 'outbrain',
        'dfp', 'native-ad', 'media-net', 'ad-slot', 'ad-container'
    ];
    const keywordRegex = new RegExp(`\\b(${adKeywords.join('|')})\\b`, 'i');
    const hasKeyword = keywordRegex.test(cleanStr) ? 1 : 0;
    const textLen = el.innerText ? el.innerText.length : 0;
    const numImages = el.querySelectorAll('img').length;

    // New behavioral features
    const isFixed = (style.position === 'fixed' || style.position === 'sticky') ? 1 : 0;
    const zIndexHigh = (parseInt(style.zIndex) > 100) ? 1 : 0;

    // MUST MATCH PYTHON ORDER:
    // [width, height, num_links, has_iframe, has_keyword, text_length, num_images, is_fixed_pos, z_index_high, cross_domain_links]
    return [
        rect.width, rect.height, numLinks, hasIframe, hasKeyword,
        textLen, numImages, isFixed, zIndexHigh, crossDomain
    ];
}

function scanWithAI() {
    const elements = document.querySelectorAll('div, ins, iframe, aside, section');

    elements.forEach(el => {
        if (el.offsetWidth > 10 && el.offsetHeight > 10) {
            const features = getFeatures(el);
            const predictionArray = score(features); // From model_logic.js
            const adProbability = predictionArray[1];

            // Safety check: Don't block if there's a lot of text (like a search result)
            if (features[5] > 500) return;

            if (adProbability > 0.5) {
                el.style.setProperty('display', 'none', 'important');
            }
        }
    });
}

// Check if current hostname ends with any of the excluded domains
const EXCLUDE_LIST = [
    'example.com',
    'google.com',
    'support-this-creator.org',
    // 'youtube.com' // Example: Uncomment to disable adblocking on YouTube
];

const currentDomain = window.location.hostname;
const isExcluded = EXCLUDE_LIST.some(domain =>
    currentDomain === domain || currentDomain.endsWith('.' + domain)
);

// Only initialize the adblocker if the site is not on the exclude list
if (!isExcluded) {
    // Watch for scrolling and new ads
    const observer = new MutationObserver(scanWithAI);
    observer.observe(document.body, { childList: true, subtree: true });
    scanWithAI();
} else {
    console.log('[AI Adblock] Site is on the exclude list. Adblocking disabled.');
}