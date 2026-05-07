// Background script for True AD Blocker
console.log('[True AD Blocker] Background service worker initialized.');

chrome.runtime.onInstalled.addListener(() => {
  console.log('[True AD Blocker] Extension installed/updated.');
  chrome.storage.local.set({ enabled: true, blockedSites: [] });
  syncRules();
});

// Sync rules on startup and when storage changes
chrome.storage.onChanged.addListener((changes) => {
    if (changes.enabled || changes.blockedSites) {
        syncRules();
    }
});

async function syncRules() {
    const data = await chrome.storage.local.get({ enabled: true, blockedSites: [] });
    
    // 1. Handle Global Static Ruleset
    await chrome.declarativeNetRequest.updateEnabledRulesets({
        [data.enabled ? 'enableRulesetIds' : 'disableRulesetIds']: ['ruleset_1']
    });

    // 2. Handle Custom Blocked Sites (Dynamic Rules)
    const currentRules = await chrome.declarativeNetRequest.getDynamicRules();
    const currentRuleIds = currentRules.map(rule => rule.id);

    const newRules = [];
    if (data.enabled) {
        data.blockedSites.forEach((domain, index) => {
            newRules.push({
                id: 10000 + index,
                priority: 1,
                action: { type: 'block' },
                condition: {
                    urlFilter: `*://${domain}/*`,
                    resourceTypes: ['main_frame', 'sub_frame', 'script', 'image', 'xmlhttprequest', 'ping']
                }
            });
        });
    }

    await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: currentRuleIds,
        addRules: newRules
    });

    console.log(`[True AD Blocker] Rules synced. Enabled: ${data.enabled}, Custom Sites: ${data.blockedSites.length}`);
}

// Initial sync
syncRules();

// Debugging: Track blocked requests
chrome.declarativeNetRequest.onRuleMatchedDebug?.addListener((info) => {
  chrome.storage.local.get('blockedCount', (data) => {
      const count = (data.blockedCount || 0) + 1;
      chrome.storage.local.set({ blockedCount: count });
  });
});
