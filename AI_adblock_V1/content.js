// Function to extract features exactly like your CSV data
function getFeatures(el) {
    const rect = el.getBoundingClientRect();
    const links = el.querySelectorAll('a').length;
    let hasIframe = el.tagName === 'IFRAME' ? 1 : 0;

    // Prevent model overfitting: The model blindly blocks almost all iframes.
    // Override the iframe flag to 0 if the iframe is very large (e.g., larger than standard 300x600 or 728x90 ad banners) like a YouTube embed.
    if (hasIframe && (rect.width > 800 || rect.height > 600 || (rect.width > 500 && rect.height > 250))) {
        hasIframe = 0;
    }

    // Normalise class and ID attributes (converting camelCase/snake_case to hyphens)
    const classNameAndId = (el.getAttribute('class') || '') + ' ' + (el.getAttribute('id') || '');
    const cleanStr = classNameAndId.replace(/[A-Z]/g, m => '-' + m.toLowerCase()).replace(/_/g, '-');

    // Use strict word boundary matching to avoid matching substrings like "header", "download"
    const hasKeyword = /\b(ad|ads|promo|sponsored|banner)\b/i.test(cleanStr) ? 1 : 0;

    // Feature Order: [width, height, num_links, has_iframe, contains_ads_keyword]
    // Make sure this order matches what you trained in Python!
    return [rect.width, rect.height, links, hasIframe, hasKeyword];
}

function scanWithAI() {
    // We add 'aside' and 'section' as they often contain ads
    const elements = document.querySelectorAll('div, ins, iframe, aside, section');

    elements.forEach(el => {
        if (el.offsetWidth > 10 && el.offsetHeight > 10) {
            const features = getFeatures(el);

            // Your model_logic.js 'score' returns an array: [prob_not_ad, prob_is_ad]
            const predictionArray = score(features);
            const adProbability = predictionArray[1];

            if (adProbability > 0.6) {
                console.log(`[AI Block] Confidence: ${(adProbability * 100).toFixed(1)}% | Element: ${features[0]}x${features[1]}`);
                el.style.setProperty('display', 'none', 'important');
            }
        }
    });
}

// Watch for dynamically loaded ads (like on Facebook or news sites)
const observer = new MutationObserver(scanWithAI);
observer.observe(document.body, { childList: true, subtree: true });

// Initial scan
scanWithAI();