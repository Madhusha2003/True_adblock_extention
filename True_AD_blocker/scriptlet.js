(function() {
    // 1. Block suspicious popups
    const originalOpen = window.open;
    window.open = function(url, name, specs) {
        if (!url) return originalOpen.apply(window, arguments);
        const urlString = String(url).toLowerCase();
        const suspicious = ['ads', 'pop', 'track', 'click', 'affiliate', 'doubleclick', 'adservice'];
        
        if (suspicious.some(p => urlString.includes(p))) {
            console.log('[AI Adblock] Blocked popup:', url);
            return { closed: true, focus: () => {}, close: () => {} };
        }
        return originalOpen.apply(window, arguments);
    };

    // 2. Prevent malicious redirects
    document.addEventListener('click', (e) => {
        const a = e.target.closest('a');
        if (a && a.href && (a.href.includes('popunder') || a.href.includes('adclick'))) {
            console.log('[AI Adblock] Blocked redirect:', a.href);
            e.preventDefault();
        }
    }, true);
})();
