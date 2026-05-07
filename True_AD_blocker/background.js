// Background script for True AD Blocker
console.log('[True AD Blocker] Background service worker initialized.');

chrome.runtime.onInstalled.addListener(() => {
  console.log('[True AD Blocker] Extension installed/updated.');
  chrome.storage.local.set({ enabled: true, blockedSites: [] });
  syncRules();
});

// Sync rules on startup and when storage changes
chrome.storage.onChanged.addListener((changes) => {
    // If the user toggles the extension, updates block sites, adds custom rules, OR updates whitelist
    if (changes.enabled || changes.blockedSites || changes.customNetworkRules || changes.whitelist) {
        syncRules();
    }
});

// Message listener for manual sync triggers
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'sync-rules') {
        syncRules();
    }
});

importScripts('rule_parser.js');

let isSyncing = false;
let syncQueued = false;

async function syncRules() {
    if (isSyncing) {
        syncQueued = true;
        return;
    }
    isSyncing = true;

    try {
        do {
            syncQueued = false;
            await performSync();
        } while (syncQueued);
    } finally {
        isSyncing = false;
    }
}

async function performSync() {
    const data = await chrome.storage.local.get({ 
        enabled: true, 
        blockedSites: [],
        customNetworkRules: [],
        whitelist: [] // Get the whitelist array from storage
    });
    
    // 1. Handle Global Static Ruleset
    await chrome.declarativeNetRequest.updateEnabledRulesets({
        [data.enabled ? 'enableRulesetIds' : 'disableRulesetIds']: ['ruleset_1']
    });

    // 2. Handle Custom Rules (Dynamic Rules)
    const currentRules = await chrome.declarativeNetRequest.getDynamicRules();
    const currentRuleIds = currentRules.map(rule => rule.id);

    let newRules = [];
    if (data.enabled) {
        // Legacy site blocking rules (IDs start at 10,000)
        const siteRules = RuleParser.domainsToRules(data.blockedSites, 10000);
        
        // Custom EasyList network rules (loaded from options)
        const easyListRules = data.customNetworkRules || [];

        // Beginner Tip: Chrome declarativeNetRequest restricts us to a certain number of active dynamic rules.
        // We cap custom lists at 15,000 to keep the browser running smoothly without lag.
        newRules = [...siteRules, ...easyListRules].slice(0, 15000);

        // --- Whitelist Logic (Override Blocking) ---
        // Whitelist rules need a very high priority to override the block rules.
        // We create an 'allowAllRequests' rule for every domain in the whitelist.
        const whitelistRules = (data.whitelist || []).map((domain, index) => ({
            id: 30000 + index, // Give whitelist rules a separate ID range
            priority: 100, // Very high priority overrides standard block rules (priority 1 or 2)
            action: { type: 'allowAllRequests' },
            condition: {
                urlFilter: `||${domain}^`,
                resourceTypes: ['main_frame', 'sub_frame']
            }
        }));

        // Add whitelist rules into the dynamic rules array
        newRules = [...newRules, ...whitelistRules];
    }

    try {
        // Guarantee unique IDs for all dynamic rules to prevent conflicts 
        // from multiple imports or overlaps.
        let uniqueId = 100000;
        newRules.forEach(rule => {
            rule.id = uniqueId++;
        });

        await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: currentRuleIds,
            addRules: newRules
        });
        console.log(`[True AD Blocker] Rules synced. Total Active Rules: ${newRules.length}`);
    } catch (err) {
        console.error('[True AD Blocker] Error syncing rules:', err);
    }
}

// Initial sync
syncRules();
