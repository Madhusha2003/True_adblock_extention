(function() {
    'use strict';

    console.log('[True AD Blocker] Professional Layer: Scriptlet injection active.');

    /**
     * LAYER 5: SCRIPTLET INJECTION
     * Neutralizing common popup and tracking APIs at the source.
     */

    // 1. Advanced Popup Protection (User-Gesture Enforcement)
    const originalOpen = window.open;
    window.open = function(url, name, specs) {
        // Professional Layer: Check if the call is actually from a user click
        // If it's a suspicious background script trying to pop a window, block it.
        if (!window.event || window.event.type !== 'click') {
            console.log('[True AD Blocker] Blocked a background popup attempt.');
            return null;
        }
        return originalOpen.apply(this, arguments);
    };

    // 2. Link Hijack Prevention
    // Prevents scripts from creating <a> tags and clicking them automatically
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
        const el = originalCreateElement.apply(this, arguments);
        if (tagName.toLowerCase() === 'a') {
            const originalClick = el.click;
            el.click = function() {
                // If the link has a target="_blank" and is being clicked programmatically
                if (el.target === '_blank' && (!window.event || window.event.type !== 'click')) {
                    console.log('[True AD Blocker] Blocked a phantom link click.');
                    return;
                }
                return originalClick.apply(this, arguments);
            };
        }
        return el;
    };

    // 3. Redirection Trap (Neutralizing 'Are you sure you want to leave?' popups)
    window.onbeforeunload = null;
    Object.defineProperty(window, 'onbeforeunload', {
        get: () => null,
        set: () => {},
        configurable: false
    });

    // 4. Anti-Anti-Adblock (Neutralizing common detection variables)
    window.google_ad_client = 'ca-pub-0000000000000000';
    window.adsbygoogle = {
        push: function(obj) { console.log('[True AD Blocker] Neutralized adsbygoogle.'); },
        loaded: true
    };

    // 3. Tracking Signal Neutralization
    // Faking responses for common analytics heartbeats
    if (window.navigator && window.navigator.sendBeacon) {
        const originalSendBeacon = window.navigator.sendBeacon;
        window.navigator.sendBeacon = function(url, data) {
            if (url.includes('analytics') || url.includes('tracker')) {
                console.log('[True AD Blocker] Neutralized a tracking beacon.');
                return true; // Pretend it worked
            }
            return originalSendBeacon.apply(this, arguments);
        };
    }

    // 4. Mutation Observer protection for "Adblock Detected" overlays
    // We'll add more specific heuristic logic here later.

})();
