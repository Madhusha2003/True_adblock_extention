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
});
