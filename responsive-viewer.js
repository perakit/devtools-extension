document.addEventListener('DOMContentLoaded', async () => {
    const RULE_ID = 1;
    const container = document.getElementById('viewer-container');
    const btnGrid = document.getElementById('btn-grid-view');
    const btnList = document.getElementById('btn-list-view');
    const btnRefresh = document.getElementById('btn-refresh');
    const urlInput = document.getElementById('url-input');
    const btnApplyUrl = document.getElementById('btn-apply-url');
    const btnToggleDark = document.getElementById('btn-toggle-dark');
    const btnAddDevice = document.getElementById('btn-add-device');
    const deviceModal = new bootstrap.Modal(document.getElementById('deviceModal'));
    const deviceLibraryList = document.getElementById('device-library-list');
    const deviceFiltersContainer = document.getElementById('device-filters');

    const DEVICE_LIBRARY = [
        { id: 'iphone-15-pro-max', name: 'iPhone 15 Pro Max', brand: 'Apple', category: 'mobile', width: 430, height: 932, icon: 'pi pi-mobile' },
        { id: 'iphone-15-pro', name: 'iPhone 15 Pro', brand: 'Apple', category: 'mobile', width: 393, height: 852, icon: 'pi pi-mobile' },
        { id: 'iphone-15', name: 'iPhone 15', brand: 'Apple', category: 'mobile', width: 390, height: 844, icon: 'pi pi-mobile' },
        { id: 'iphone-14-pro', name: 'iPhone 14 Pro', brand: 'Apple', category: 'mobile', width: 393, height: 852, icon: 'pi pi-mobile' },
        { id: 'iphone-se', name: 'iPhone SE', brand: 'Apple', category: 'mobile', width: 375, height: 667, icon: 'pi pi-mobile' },
        { id: 'galaxy-s24-ultra', name: 'Galaxy S24 Ultra', brand: 'Samsung', category: 'mobile', width: 412, height: 915, icon: 'pi pi-mobile' },
        { id: 'galaxy-s24', name: 'Galaxy S24', brand: 'Samsung', category: 'mobile', width: 360, height: 800, icon: 'pi pi-mobile' },
        { id: 'galaxy-s23', name: 'Galaxy S23', brand: 'Samsung', category: 'mobile', width: 360, height: 780, icon: 'pi pi-mobile' },
        { id: 'pixel-8-pro', name: 'Pixel 8 Pro', brand: 'Google', category: 'mobile', width: 412, height: 915, icon: 'pi pi-mobile' },
        { id: 'pixel-8', name: 'Pixel 8', brand: 'Google', category: 'mobile', width: 412, height: 915, icon: 'pi pi-mobile' },
        { id: 'pixel-7', name: 'Pixel 7', brand: 'Google', category: 'mobile', width: 412, height: 915, icon: 'pi pi-mobile' },
        { id: 'ipad-pro-129', name: 'iPad Pro 12.9"', brand: 'Apple', category: 'tablet', width: 1024, height: 1366, icon: 'pi pi-tablet' },
        { id: 'ipad-air', name: 'iPad Air', brand: 'Apple', category: 'tablet', width: 820, height: 1180, icon: 'pi pi-tablet' },
        { id: 'galaxy-tab-s9', name: 'Galaxy Tab S9', brand: 'Samsung', category: 'tablet', width: 800, height: 1280, icon: 'pi pi-tablet' },
        { id: 'macbook-air-13', name: 'MacBook Air 13', brand: 'Apple', category: 'laptop', width: 1280, height: 800, icon: 'pi pi-desktop' },
        { id: 'surface-laptop-5', name: 'Surface Laptop 5', brand: 'Microsoft', category: 'laptop', width: 1365, height: 768, icon: 'pi pi-desktop' },
        { id: 'desktop-hd', name: 'Desktop HD', brand: 'Desktop', category: 'desktop', width: 1440, height: 900, icon: 'pi pi-desktop' },
        { id: 'desktop-fullhd', name: 'Desktop Full HD', brand: 'Desktop', category: 'desktop', width: 1920, height: 1080, icon: 'pi pi-desktop' }
    ];

    const DEVICE_FILTERS = [
        { key: 'all', label: 'All' },
        { key: 'mobile', label: 'Mobile' },
        { key: 'tablet', label: 'Tablet' },
        { key: 'laptop', label: 'Laptop' },
        { key: 'desktop', label: 'Desktop' }
    ];

    let activeDevices = [
        { id: 'iphone-se', name: 'iPhone SE', width: 375, height: 667 },
        { id: 'ipad-air', name: 'iPad Air', width: 820, height: 1180 },
        { id: 'desktop-hd', name: 'Desktop HD', width: 1440, height: 900 }
    ];

    const presets = {
        phone: { width: 375, height: 667, label: 'iPhone SE' },
        tablet: { width: 768, height: 1024, label: 'iPad' },
        desktop: { width: 1280, height: 800, label: 'Desktop' }
    };

    let currentUrl = '';

    // Get the URL of the active tab
    async function getCurrentTabUrl() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        return 'https://www.google.com';
    }

    async function init() {
        // Remove iframe restrictions for this tab
        try {
            const tab = await chrome.tabs.getCurrent();
            const tabId = tab ? tab.id : (await chrome.tabs.query({ active: true, currentWindow: true }))[0].id;

            const rule = {
                id: RULE_ID,
                priority: 1,
                action: {
                    type: "modifyHeaders",
                    responseHeaders: [
                        { header: "x-frame-options", operation: "remove" },
                        { header: "content-security-policy", operation: "remove" },
                        { header: "cross-origin-resource-policy", operation: "remove" },
                        { header: "content-security-policy-report-only", operation: "remove" },
                        { header: "frame-ancestors", operation: "remove" }
                    ],
                    requestHeaders: [
                        { header: "sec-fetch-dest", operation: "set", value: "document" },
                        { header: "sec-fetch-mode", operation: "set", value: "navigate" },
                        { header: "sec-fetch-site", operation: "set", value: "none" },
                        { header: "sec-fetch-user", operation: "set", value: "?1" }
                    ]
                },
                condition: {
                    resourceTypes: ["sub_frame", "script", "xmlhttprequest", "other"],
                    tabIds: [tabId]
                }
            };

            await chrome.declarativeNetRequest.updateSessionRules({
                removeRuleIds: [RULE_ID],
                addRules: [rule]
            });
            
            // Also try dynamic rules for broader coverage
            await chrome.declarativeNetRequest.updateDynamicRules({
                removeRuleIds: [RULE_ID]
            });
        } catch (e) {
            console.error('Error setting up header rules:', e);
        }

        currentUrl = await getCurrentTabUrl();
        urlInput.value = currentUrl;
        renderDevices();
    }

    function renderDevices() {
        const targetUrl = urlInput.value.trim();
        if (!targetUrl) return;
        
        container.innerHTML = '';
        
        activeDevices.forEach((device) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'device-wrapper';
            
            wrapper.innerHTML = `
                <div class="device-info">
                    <span>${device.name} (${device.width} x ${device.height})</span>
                    <div class="device-controls">
                        <button class="btn btn-sm btn-outline-secondary btn-reload" title="Reload">↻</button>
                        <button class="btn btn-sm btn-outline-secondary btn-open" title="Open Link">↗</button>
                        <button class="btn btn-sm btn-outline-danger btn-remove" title="Remove">×</button>
                    </div>
                </div>
                <div class="iframe-container" style="width: ${device.width}px; height: ${device.height}px;">
                    <iframe src="${targetUrl}" width="100%" height="100%" loading="lazy"></iframe>
                </div>
            `;
            
            // Add event listeners for the buttons
            wrapper.querySelector('.btn-reload').addEventListener('click', () => {
                const iframe = wrapper.querySelector('iframe');
                iframe.src = iframe.src;
            });
            
            wrapper.querySelector('.btn-open').addEventListener('click', () => {
                window.open(targetUrl, '_blank');
            });

            wrapper.querySelector('.btn-remove').addEventListener('click', () => {
                activeDevices = activeDevices.filter(d => d.id !== device.id);
                renderDevices();
            });

            container.appendChild(wrapper);
        });
    }

    function renderDeviceLibrary(filter = 'all') {
        deviceLibraryList.innerHTML = '';
        
        const filteredDevices = filter === 'all' 
            ? DEVICE_LIBRARY 
            : DEVICE_LIBRARY.filter(d => d.category === filter);

        filteredDevices.forEach(device => {
            const col = document.createElement('div');
            col.className = 'col-6 col-md-4 col-lg-3';
            
            const isActive = activeDevices.some(d => d.id === device.id);
            
            col.innerHTML = `
                <div class="card h-100 text-center ${isActive ? 'border-primary bg-light' : ''}" style="cursor: pointer; transition: transform 0.2s;">
                    <div class="card-body p-3">
                        <div class="mb-2" style="font-size: 24px;">
                            ${getDeviceIcon(device.category)}
                        </div>
                        <div class="fw-bold" style="font-size: 13px;">${device.name}</div>
                        <div class="text-muted" style="font-size: 11px;">${device.width} x ${device.height}</div>
                        <button class="btn btn-sm w-100 mt-3 ${isActive ? 'btn-secondary' : 'btn-primary'}" style="font-size: 11px;">
                            ${isActive ? 'Remove' : 'Add'}
                        </button>
                    </div>
                </div>
            `;

            col.addEventListener('click', (e) => {
                if (e.target.tagName !== 'BUTTON') {
                    toggleDevice(device);
                }
            });

            col.querySelector('button').addEventListener('click', (e) => {
                e.stopPropagation();
                toggleDevice(device);
            });

            deviceLibraryList.appendChild(col);
        });
    }

    function getDeviceIcon(category) {
        switch(category) {
            case 'mobile': return '📱';
            case 'tablet': return '📱'; // Fixed from '平板'
            case 'laptop': return '💻';
            case 'desktop': return '🖥️';
            default: return '📱';
        }
    }

    function toggleDevice(device) {
        const index = activeDevices.findIndex(d => d.id === device.id);
        if (index === -1) {
            activeDevices.push({ id: device.id, name: device.name, width: device.width, height: device.height });
        } else {
            activeDevices.splice(index, 1);
        }
        renderDevices();
        renderDeviceLibrary(getCurrentFilter());
    }

    function getCurrentFilter() {
        const activeFilterBtn = deviceFiltersContainer.querySelector('.active');
        return activeFilterBtn ? activeFilterBtn.dataset.filter : 'all';
    }

    function initDeviceModal() {
        DEVICE_FILTERS.forEach(filter => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-sm btn-outline-secondary mx-1';
            if (filter.key === 'all') btn.classList.add('active');
            btn.textContent = filter.label;
            btn.dataset.filter = filter.key;
            
            btn.addEventListener('click', () => {
                deviceFiltersContainer.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderDeviceLibrary(filter.key);
            });
            
            deviceFiltersContainer.appendChild(btn);
        });

        btnAddDevice.addEventListener('click', () => {
            renderDeviceLibrary();
            deviceModal.show();
        });
    }

    // Layout Toggles
    btnGrid.addEventListener('click', () => {
        container.className = 'layout-grid';
        btnGrid.classList.add('active');
        btnList.classList.remove('active');
    });

    btnList.addEventListener('click', () => {
        container.className = 'layout-list';
        btnList.classList.add('active');
        btnGrid.classList.remove('active');
    });

    // Dark Mode Toggle
    btnToggleDark.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        btnToggleDark.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
        localStorage.setItem('responsive-viewer-dark-mode', isDark);
    });

    // Load saved dark mode preference
    if (localStorage.getItem('responsive-viewer-dark-mode') === 'true') {
        document.body.classList.add('dark-mode');
        btnToggleDark.textContent = '☀️ Light Mode';
    }

    btnRefresh.addEventListener('click', renderDevices);
    btnApplyUrl.addEventListener('click', renderDevices);

    initDeviceModal();

    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            renderDevices();
        }
    });

    init();
});
