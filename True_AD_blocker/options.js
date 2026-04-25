document.addEventListener('DOMContentLoaded', async () => {
    const toggles = {
        'rule-mode': document.getElementById('rule-mode'),
        'experimental-features': document.getElementById('experimental-features')
    };

    const settings = await chrome.storage.local.get({
        ruleEnabled: true,
        experimentalEnabled: false
    });

    toggles['rule-mode'].checked = settings.ruleEnabled;
    toggles['experimental-features'].checked = settings.experimentalEnabled;

    Object.keys(toggles).forEach(key => {
        toggles[key].onchange = async () => {
            const saveKey = key.replace('-mode', 'Enabled').replace('experimental-features', 'experimentalEnabled');
            await chrome.storage.local.set({ [saveKey]: toggles[key].checked });
        };
    });
});
