/**
 * Simple EasyList to DNR (Declarative Net Request) Parser
 * Converts text-based Adblock rules into Chrome's native DNR format.
 * Designed for beginners and optimized to avoid DNR validation errors.
 */
const RuleParser = {
    // Map of common Adblock resource types to Chrome DNR resource types.
    // Beginner Tip: If an ABP type doesn't map cleanly, DNR might reject it, so we keep it simple.
    RESOURCE_MAP: {
        'script': 'script',
        'image': 'image',
        'xmlhttprequest': 'xmlhttprequest',
        'subdocument': 'sub_frame',
        'stylesheet': 'stylesheet',
        'media': 'media',
        'font': 'font',
        'other': 'other',
        'ping': 'ping',
        'object': 'other' 
    },

    /**
     * Parses a single line of text from a filter list (like EasyList)
     * and converts it to either a network rule or a cosmetic rule.
     */
    parseLine(line, id) {
        line = line.trim();
        
        // 1. Skip comments and empty lines
        if (!line || line.startsWith('!') || line.startsWith('[Adblock')) return null;

        // Auto-cleanup: If the user just pastes a normal URL, convert it to an Adblock domain format
        if (line.startsWith('http://') || line.startsWith('https://')) {
            try {
                const url = new URL(line);
                line = `||${url.hostname}^`;
            } catch (e) {
                // Stick to the raw line if URL parsing fails
            }
        }

        // 2. Handle Exceptions (Whitelist rules from EasyList)
        // Rules starting with @@ mean "allow this" instead of "block this"
        let isException = false;
        if (line.startsWith('@@')) {
            isException = true;
            line = line.substring(2);
        }

        // 3. Handle Cosmetic Rules (##, #@#, #?#)
        // These rules hide elements using CSS rather than blocking network requests.
        if (line.includes('##') || line.includes('#@#') || line.includes('#?#')) {
            return { type: 'cosmetic', raw: line };
        }

        // 4. Split the pattern from its modifiers (e.g. ||ads.com^$script,domain=example.com)
        let pattern = line;
        let modifiers = [];
        if (line.includes('$')) {
            const parts = line.split('$');
            pattern = parts[0];
            modifiers = parts[1].split(',');
        }

        // If there's no pattern left, this isn't a valid network rule
        if (!pattern || pattern.trim() === '') return null;

        // Simplify for Beginners: Skip Regular Expression rules entirely.
        // Chrome DNR uses the strict RE2 engine, which crashes when it sees many standard JS regex patterns.
        // Skipping them ensures your rules.json always works perfectly!
        if (pattern.startsWith('/') && pattern.endsWith('/')) {
            console.warn(`Skipping regex rule to prevent DNR errors: ${pattern}`);
            return null;
        }
        
        // Base Condition using simple text matching
        const condition = {
            urlFilter: pattern,
            isUrlFilterCaseSensitive: false
        };

        // Construct the base Chrome DNR Rule object
        const rule = {
            id: id,
            priority: isException ? 2 : 1, // Exception rules must override standard block rules
            action: { type: isException ? 'allow' : 'block' },
            condition: condition
        };

        // 5. Parse Modifiers (Options)
        if (modifiers.length > 0) {
            const resourceTypes = [];
            const excludedResourceTypes = [];
            const initiatorDomains = [];
            const excludedInitiatorDomains = [];

            modifiers.forEach(mod => {
                // Handle domain restrictions (e.g., domain=example.com|~safe.com)
                if (mod.startsWith('domain=')) {
                    const domains = mod.substring(7).split('|');
                    domains.forEach(d => {
                        if (d.startsWith('~')) {
                            excludedInitiatorDomains.push(d.substring(1));
                        } else {
                            initiatorDomains.push(d);
                        }
                    });
                } 
                // Handle First/Third party restrictions
                else if (mod === 'third-party') {
                    rule.condition.domainType = 'thirdParty';
                } else if (mod === '~third-party') {
                    rule.condition.domainType = 'firstParty';
                }
                // Handle specific resource types like $script, $image, etc.
                else {
                    const isNegated = mod.startsWith('~');
                    const typeKey = isNegated ? mod.substring(1) : mod;
                    const dnrType = this.RESOURCE_MAP[typeKey];
                    
                    if (dnrType) {
                        if (isNegated) excludedResourceTypes.push(dnrType);
                        else resourceTypes.push(dnrType);
                    }
                }
            });

            // Only add arrays to the condition if they have items
            if (resourceTypes.length > 0) rule.condition.resourceTypes = resourceTypes;
            if (excludedResourceTypes.length > 0) rule.condition.excludedResourceTypes = excludedResourceTypes;
            if (initiatorDomains.length > 0) rule.condition.initiatorDomains = initiatorDomains;
            if (excludedInitiatorDomains.length > 0) rule.condition.excludedInitiatorDomains = excludedInitiatorDomains;
        }

        return { type: 'network', rule: rule };
    },

    /**
     * Processes an entire text block containing hundreds or thousands of lines.
     * Returns separate arrays for network rules (DNR format) and cosmetic rules (raw strings).
     */
    processList(text, startId = 20000) {
        const lines = text.split('\n');
        const networkRules = [];
        const cosmeticRules = [];
        let currentId = startId;

        lines.forEach(line => {
            const result = this.parseLine(line, currentId);
            if (!result) return;

            if (result.type === 'network') {
                networkRules.push(result.rule);
                currentId++; // Increment ID so every rule has a unique number
            } else if (result.type === 'cosmetic') {
                cosmeticRules.push(result.raw);
            }
        });

        return { networkRules, cosmeticRules };
    },

    /**
     * Quickly converts a simple list of domains into strict blocking DNR rules.
     */
    domainsToRules(domains, startId = 10000) {
        return domains.map((domain, index) => ({
            id: startId + index,
            priority: 1,
            action: { type: 'block' },
            condition: {
                urlFilter: `||${domain}^`,
                resourceTypes: ['main_frame', 'sub_frame', 'script', 'image', 'xmlhttprequest', 'ping']
            }
        }));
    }
};

// Export properly whether running in background Service Worker or NodeJS
if (typeof module !== 'undefined') {
    module.exports = RuleParser;
} else {
    self.RuleParser = RuleParser;
}
