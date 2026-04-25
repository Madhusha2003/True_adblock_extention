// Background script for True AI Hybrid Ad Blocker
console.log('[AI Adblock] Background service worker initialized.');

chrome.runtime.onInstalled.addListener(() => {
  console.log('[AI Adblock] Extension installed/updated.');
  // Ensure default state is enabled
  chrome.storage.local.set({ enabled: true });
});

// Listen for enabled state changes to toggle DNR rules
chrome.storage.onChanged.addListener((changes) => {
    // 1. Global Enable/Disable
    if (changes.enabled) {
        const isEnabled = changes.enabled.newValue;
        chrome.declarativeNetRequest.updateEnabledRulesets({
            [isEnabled ? 'enableRulesetIds' : 'disableRulesetIds']: ['ruleset_1']
        });
    }
    
    // 2. Rule Mode Enable/Disable
    if (changes.ruleEnabled) {
        const isRuleEnabled = changes.ruleEnabled.newValue;
        chrome.declarativeNetRequest.updateEnabledRulesets({
            [isRuleEnabled ? 'enableRulesetIds' : 'disableRulesetIds']: ['ruleset_1']
        });
    }
});
chrome.declarativeNetRequest.onRuleMatchedDebug?.addListener((info) => {
  console.log('[AI Adblock] Blocked request:', info.request.url);
  
  // Update Global Stats
  chrome.storage.local.get('blockedCount', (data) => {
      const count = (data.blockedCount || 0) + 1;
      chrome.storage.local.set({ blockedCount: count });
  });
});
