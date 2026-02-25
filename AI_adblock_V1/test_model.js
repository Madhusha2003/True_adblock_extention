const fs = require('fs');

// Load the model logic
const code = fs.readFileSync('model_logic.js', 'utf8');
// Evaluate it so the `score` function is available in this scope
eval(code);

// Feature Order: [width, height, num_links, has_iframe, contains_ads_keyword]

const testCases = [
    { name: 'Standard Ad', features: [300, 250, 1, 0, 1] },
    { name: 'Large Ad', features: [728, 90, 1, 0, 1] },
    { name: 'Sidebar Ad', features: [160, 600, 1, 0, 1] },

    { name: 'Normal Paragraph', features: [800, 100, 0, 0, 0] },
    { name: 'Normal Header', features: [1200, 80, 5, 0, 0] },

    { name: 'Huge Main Article Area', features: [800, 3000, 25, 0, 0] },
    { name: 'Small Span', features: [50, 20, 0, 0, 0] },

    // Let's test varying combinations of size and links without keywords or iframes
    { name: 'Square div (small)', features: [200, 200, 0, 0, 0] },
    { name: 'Square div (medium)', features: [400, 400, 2, 0, 0] },
    { name: 'Square div (large)', features: [800, 800, 10, 0, 0] },

    // Test with variations of links
    { name: 'Div with many links', features: [600, 200, 50, 0, 0] },
    { name: 'Div with 1 link', features: [600, 200, 1, 0, 0] },

    // Iframe with normal content size (embedded video maybe)
    { name: 'YouTube Embed', features: [560, 315, 0, 1, 0] }
];

console.log('Testing model predictions:\n');

testCases.forEach(tc => {
    const scores = score(tc.features);
    const pNotAd = scores[0];
    const pAd = scores[1];
    const isBlocked = pAd > 0.5 ? 'BLOCKED' : 'ALLOWED';

    console.log(`[${isBlocked}] ${tc.name}`);
    console.log(`   Features: [${tc.features.join(', ')}] -> p(Ad): ${(pAd * 100).toFixed(2)}%\n`);
});
