document.addEventListener('DOMContentLoaded', async () => {
    const mainToggle = document.getElementById('main-toggle');
    const domainInput = document.getElementById('domain-input');
    const addBtn = document.getElementById('add-btn');
    const blockList = document.getElementById('block-list');

    // Load initial settings
    const settings = await chrome.storage.local.get({
        enabled: true,
        blockedSites: []
    });

    mainToggle.checked = settings.enabled;
    renderBlockList(settings.blockedSites);

    // Toggle main protection
    mainToggle.addEventListener('change', () => {
        chrome.storage.local.set({ enabled: mainToggle.checked });
    });

    // Add domain to block list
    addBtn.addEventListener('click', () => {
        let input = domainInput.value.trim().toLowerCase();
        
        // Auto-extract domain if a full URL is pasted
        try {
            if (input.includes('://')) {
                input = new URL(input).hostname;
            } else if (input.includes('/')) {
                input = input.split('/')[0];
            }
        } catch (e) {
            // If URL parsing fails, stick with raw input
        }

        const domain = input;

        if (domain && !isValidDomain(domain)) {
            alert('Please enter a valid domain (e.g., example.com)');
            return;
        }
        
        if (domain) {
            chrome.storage.local.get({ blockedSites: [] }, (data) => {
                const sites = data.blockedSites;
                if (!sites.includes(domain)) {
                    sites.push(domain);
                    chrome.storage.local.set({ blockedSites: sites }, () => {
                        renderBlockList(sites);
                        domainInput.value = '';
                    });
                } else {
                    alert('This site is already in your block list.');
                }
            });
        }
    });

    // Remove domain from block list
    blockList.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-btn')) {
            const domain = e.target.dataset.domain;
            chrome.storage.local.get({ blockedSites: [] }, (data) => {
                const sites = data.blockedSites.filter(s => s !== domain);
                chrome.storage.local.set({ blockedSites: sites }, () => {
                    renderBlockList(sites);
                });
            });
        }
    });

    function renderBlockList(sites) {
        blockList.innerHTML = '';
        sites.forEach(domain => {
            const li = document.createElement('li');
            li.className = 'block-item';
            li.innerHTML = `
                <span class="domain">${domain}</span>
                <button class="remove-btn" data-domain="${domain}">Remove</button>
            `;
            blockList.appendChild(li);
        });
    }

    function isValidDomain(domain) {
        const regex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
        return regex.test(domain);
    }

    // Advanced Import Logic
    const importBtn = document.getElementById('import-btn');
    const importInput = document.getElementById('advanced-rules-input');
    const importStatus = document.getElementById('import-status');

    importBtn.addEventListener('click', async () => {
        const rawInput = importInput.value.trim();
        if (!rawInput) return;

        importStatus.textContent = 'Parsing and validating rules...';
        importStatus.style.color = 'var(--text-dim)';

        try {
            // Professional Parsing
            const { networkRules, cosmeticRules } = RuleParser.processList(rawInput);

            if (networkRules.length > 0 || cosmeticRules.length > 0) {
                chrome.storage.local.get({ customNetworkRules: [], customCosmeticRules: [] }, (data) => {
                    // Safety Cap: Professional blockers often limit custom rules to prevent browser lag
                    // We'll cap at 10,000 for high-performance balance
                    const updatedNetwork = [...data.customNetworkRules, ...networkRules].slice(0, 10000);
                    const updatedCosmetic = [...data.customCosmeticRules, ...cosmeticRules].slice(0, 5000);
                    
                    chrome.storage.local.set({ 
                        customNetworkRules: updatedNetwork,
                        customCosmeticRules: updatedCosmetic 
                    }, () => {
                        importInput.value = '';
                        importStatus.textContent = `Import complete: ${networkRules.length} rules added (Capped at 10k total).`;
                        importStatus.style.color = '#10b981';
                        chrome.runtime.sendMessage({ action: 'sync-rules' });
                    });
                });
            } else {
                importStatus.textContent = 'No valid rules found in input.';
                importStatus.style.color = 'var(--danger)';
            }
        } catch (err) {
            importStatus.textContent = 'Error during parsing: ' + err.message;
            importStatus.style.color = 'var(--danger)';
        }
    });

    // Professional Export to Static Files
    const exportBtn = document.getElementById('export-json-btn');
    exportBtn.addEventListener('click', () => {
        const rawInput = importInput.value.trim();
        if (!rawInput) {
            alert('Please paste some rules into the box first to generate files.');
            return;
        }

        importStatus.textContent = 'Generating static files...';
        
        try {
            const { networkRules, cosmeticRules } = RuleParser.processList(rawInput, 1);
            
            // 1. Export Network Rules (rules.json)
            downloadFile(JSON.stringify(networkRules, null, 2), 'rules.json');
            
            // 2. Export Cosmetic Rules (cosmetic_rules.json)
            downloadFile(JSON.stringify(cosmeticRules, null, 2), 'cosmetic_rules.json');
            
            importStatus.textContent = `Generated rules.json (${networkRules.length} rules) and cosmetic_rules.json (${cosmeticRules.length} rules). Save both to your "rules/" folder.`;
            importStatus.style.color = '#10b981';
        } catch (err) {
            importStatus.textContent = 'Export failed: ' + err.message;
            importStatus.style.color = 'var(--danger)';
        }
    });

    function downloadFile(content, fileName) {
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Reset All Custom Rules
    const resetBtn = document.getElementById('reset-rules-btn');
    resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all custom rules and EasyList data?')) {
            chrome.storage.local.set({ 
                customNetworkRules: [], 
                customCosmeticRules: [],
                blockedSites: [] 
            }, () => {
                renderBlockList([]);
                importStatus.textContent = 'All custom rules have been cleared.';
                importStatus.style.color = 'var(--text-dim)';
                chrome.runtime.sendMessage({ action: 'sync-rules' });
            });
        }
    });
});
