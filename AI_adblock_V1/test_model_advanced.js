const fs = require('fs');

const code = fs.readFileSync('model_logic.js', 'utf8');
eval(code);

const testCases = [
    { name: 'Standard Ad', features: [300, 250, 1, 0, 1] },
    { name: 'Large Ad', features: [728, 90, 1, 0, 1] },
    { name: 'Sidebar Ad', features: [160, 600, 1, 0, 1] },
    { name: 'Normal Paragraph', features: [800, 100, 0, 0, 0] },
    { name: 'Normal Header', features: [1200, 80, 5, 0, 0] },
    { name: 'Huge Main Article Area', features: [800, 3000, 25, 0, 0] },
    { name: 'Small Span', features: [50, 20, 0, 0, 0] },
    { name: 'Square div (small)', features: [200, 200, 0, 0, 0] },
    { name: 'Square div (medium)', features: [400, 400, 2, 0, 0] },
    { name: 'Square div (large)', features: [800, 800, 10, 0, 0] },
    { name: 'Div with many links', features: [600, 200, 50, 0, 0] },
    { name: 'Div with 1 link', features: [600, 200, 1, 0, 0] },
    { name: 'YouTube Embed', features: [560, 315, 0, 1, 0] }
];

let out = '';
testCases.forEach(tc => {
    const scores = score(tc.features);
    const pAd = scores[1];
    out += `[${pAd > 0.5 ? 'BLOCKED' : 'ALLOWED'}] ${tc.name} | Feat: ${tc.features} -> p(Ad): ${(pAd * 100).toFixed(2)}%\n`;
});

fs.writeFileSync('out.txt', out, 'utf8');
