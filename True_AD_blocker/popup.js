document.addEventListener('DOMContentLoaded', async () => {
    const domainInput = document.getElementById('domain-input');
    const addBtn = document.getElementById('add-btn');
    const whitelistList = document.getElementById('whitelist-items');
    const blockedCountEl = document.getElementById('blocked-count');

    const mainToggle = document.getElementById('main-toggle');
    const statusText = document.getElementById('status-text');
    const whitelistSiteBtn = document.getElementById('whitelist-site-btn');

    // 1. Initial State
    const { enabled = true } = await chrome.storage.local.get('enabled');
    mainToggle.checked = enabled;
    statusText.textContent = enabled ? 'PROTECTED' : 'DISABLED';
    statusText.style.color = enabled ? '#22c55e' : '#ef4444';

    // 2. Load Whitelist
    const updateWhitelistUI = async () => {
        const { whitelist = [] } = await chrome.storage.local.get('whitelist');
        whitelistList.innerHTML = '';
        whitelist.forEach(domain => {
            const li = document.createElement('li');
            li.className = 'whitelist-item';
            li.innerHTML = `
                <span>${domain}</span>
                <button class="remove-btn" data-domain="${domain}">Remove</button>
            `;
            whitelistList.appendChild(li);
        });

        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.onclick = async () => {
                const domainToRemove = btn.getAttribute('data-domain');
                const { whitelist = [] } = await chrome.storage.local.get('whitelist');
                const newWhitelist = whitelist.filter(d => d !== domainToRemove);
                await chrome.storage.local.set({ whitelist: newWhitelist });
                updateWhitelistUI();
            };
        });
    };

    // 3. Toggle System
    mainToggle.onchange = async () => {
        const isEnabled = mainToggle.checked;
        await chrome.storage.local.set({ enabled: isEnabled });
        statusText.textContent = isEnabled ? 'PROTECTED' : 'DISABLED';
        statusText.style.color = isEnabled ? '#22c55e' : '#ef4444';
    };

    // 4. Whitelist Current Site
    whitelistSiteBtn.onclick = async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url) {
            try {
                const url = new URL(tab.url);
                const domain = url.hostname;
                const { whitelist = [] } = await chrome.storage.local.get('whitelist');
                if (!whitelist.includes(domain)) {
                    whitelist.push(domain);
                    await chrome.storage.local.set({ whitelist });
                    updateWhitelistUI();
                }
            } catch (e) {}
        }
    };

    // 5. Add Domain Manually
    addBtn.onclick = async () => {
        const domain = domainInput.value.trim().toLowerCase();
        if (domain) {
            const { whitelist = [] } = await chrome.storage.local.get('whitelist');
            if (!whitelist.includes(domain)) {
                whitelist.push(domain);
                await chrome.storage.local.set({ whitelist });
                domainInput.value = '';
                updateWhitelistUI();
            }
        }
    };

    // 3. Load Stats (Placeholder or fetch from background)
    // In a real scenario, we'd message the background for stats
    const { blockedCount = 0 } = await chrome.storage.local.get('blockedCount');
    blockedCountEl.textContent = blockedCount;

    updateWhitelistUI();
});
