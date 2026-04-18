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
    const iframeUrlModal = new bootstrap.Modal(document.getElementById('iframeUrlModal'));
    const deviceLibraryList = document.getElementById('device-library-list');
    const activeDeviceList = document.getElementById('active-device-list');
    const deviceFiltersContainer = document.getElementById('device-filters');
    const iframeUrlInput = document.getElementById('iframe-url-input');
    const iframeUrlDeviceName = document.getElementById('iframe-url-device-name');
    const btnSaveIframeUrl = document.getElementById('btn-save-iframe-url');

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
        { instanceId: 'iphone-se-1', modelId: 'iphone-se', name: 'iPhone SE', width: 375, height: 667, url: '' },
        { instanceId: 'ipad-air-1', modelId: 'ipad-air', name: 'iPad Air', width: 820, height: 1180, url: '' },
        { instanceId: 'desktop-hd-1', modelId: 'desktop-hd', name: 'Desktop HD', width: 1440, height: 900, url: '' }
    ];

    const presets = {
        phone: { width: 375, height: 667, label: 'iPhone SE' },
        tablet: { width: 768, height: 1024, label: 'iPad' },
        desktop: { width: 1280, height: 800, label: 'Desktop' }
    };

    let currentUrl = '';
    let instanceCounter = activeDevices.length + 1;
    let editingDeviceInstanceId = null;
    const deviceElements = new Map();

    function normalizeUrl(input) {
        const value = (input || '').trim();
        if (!value) return '';
        if (/^https?:\/\//i.test(value)) return value;
        return `https://${value}`;
    }

    function openDeviceUrlModal(device, currentFrameUrl) {
        editingDeviceInstanceId = device.instanceId;
        iframeUrlDeviceName.textContent = `${device.name} (${device.width} x ${device.height})`;
        iframeUrlInput.value = currentFrameUrl;
        iframeUrlInput.classList.remove('is-invalid');
        iframeUrlModal.show();

        setTimeout(() => {
            iframeUrlInput.focus();
            iframeUrlInput.select();
        }, 100);
    }

    function saveDeviceUrlFromModal() {
        if (!editingDeviceInstanceId) return;

        const normalized = normalizeUrl(iframeUrlInput.value);
        if (!normalized) {
            iframeUrlInput.classList.add('is-invalid');
            return;
        }

        const device = activeDevices.find(d => d.instanceId === editingDeviceInstanceId);
        if (!device) return;

        device.url = normalized;
        iframeUrlInput.classList.remove('is-invalid');
        iframeUrlModal.hide();
        editingDeviceInstanceId = null;

        renderDevices();
        renderActiveDeviceList();
    }

    function getDeviceByInstanceId(instanceId) {
        return activeDevices.find(d => d.instanceId === instanceId);
    }

    function getFrameUrl(device, targetUrl) {
        return device.url || targetUrl;
    }

    function createDeviceElement(device, targetUrl) {
        const wrapper = document.createElement('div');
        wrapper.className = 'device-wrapper';
        wrapper.dataset.instanceId = device.instanceId;
        wrapper.innerHTML = `
            <div class="device-info">
                <span class="device-title"></span>
                <div class="device-controls">
                    <button class="btn btn-sm btn-outline-secondary btn-url" title="Set URL">URL</button>
                    <button class="btn btn-sm btn-outline-secondary btn-reload" title="Reload">↻</button>
                    <button class="btn btn-sm btn-outline-secondary btn-open" title="Open Link">↗</button>
                    <button class="btn btn-sm btn-outline-danger btn-remove" title="Remove">×</button>
                </div>
            </div>
            <div class="iframe-container" style="width: ${device.width}px; height: ${device.height}px;">
                <iframe width="100%" height="100%" loading="lazy"></iframe>
            </div>
        `;

        wrapper.querySelector('.btn-url').addEventListener('click', () => {
            const currentDevice = getDeviceByInstanceId(device.instanceId);
            if (!currentDevice) return;
            const iframe = wrapper.querySelector('iframe');
            openDeviceUrlModal(currentDevice, iframe.dataset.currentUrl || targetUrl);
        });

        wrapper.querySelector('.btn-reload').addEventListener('click', () => {
            const iframe = wrapper.querySelector('iframe');
            iframe.src = iframe.src;
        });

        wrapper.querySelector('.btn-open').addEventListener('click', () => {
            const iframe = wrapper.querySelector('iframe');
            window.open(iframe.dataset.currentUrl || targetUrl, '_blank');
        });

        wrapper.querySelector('.btn-remove').addEventListener('click', () => {
            removeDeviceInstance(device.instanceId);
            renderDevices();
            renderActiveDeviceList();
            renderDeviceLibrary(getCurrentFilter());
        });

        updateDeviceElement(wrapper, device, targetUrl);
        return wrapper;
    }

    function updateDeviceElement(wrapper, device, targetUrl) {
        const title = wrapper.querySelector('.device-title');
        title.textContent = `${device.name} (${device.width} x ${device.height})`;

        const frameContainer = wrapper.querySelector('.iframe-container');
        frameContainer.style.width = `${device.width}px`;
        frameContainer.style.height = `${device.height}px`;

        const iframe = wrapper.querySelector('iframe');
        const frameUrl = getFrameUrl(device, targetUrl);
        if (iframe.dataset.currentUrl !== frameUrl) {
            iframe.dataset.currentUrl = frameUrl;
            iframe.src = frameUrl;
        }
    }

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
        const targetUrl = normalizeUrl(urlInput.value.trim());
        if (!targetUrl) return;

        const activeIds = new Set(activeDevices.map(device => device.instanceId));

        activeDevices.forEach((device, index) => {
            let wrapper = deviceElements.get(device.instanceId);
            if (!wrapper) {
                wrapper = createDeviceElement(device, targetUrl);
                deviceElements.set(device.instanceId, wrapper);
                container.appendChild(wrapper);
            } else {
                updateDeviceElement(wrapper, device, targetUrl);
            }

            // Reorder visually without moving iframe DOM nodes.
            wrapper.style.order = String(index);
        });

        for (const [instanceId, wrapper] of deviceElements.entries()) {
            if (!activeIds.has(instanceId)) {
                wrapper.remove();
                deviceElements.delete(instanceId);
            }
        }
    }

    function renderDeviceLibrary(filter = 'all') {
        deviceLibraryList.innerHTML = '';
        
        const filteredDevices = filter === 'all' 
            ? DEVICE_LIBRARY 
            : DEVICE_LIBRARY.filter(d => d.category === filter);

        filteredDevices.forEach(device => {
            const col = document.createElement('div');
            col.className = 'col-6 col-md-4 col-lg-3';
            const activeCount = activeDevices.filter(d => d.modelId === device.id).length;
            
            col.innerHTML = `
                <div class="card h-100 text-center" style="transition: transform 0.2s;">
                    <div class="card-body p-3">
                        <div class="mb-2" style="font-size: 24px;">
                            ${getDeviceIcon(device.category)}
                        </div>
                        <div class="fw-bold" style="font-size: 13px;">${device.name}</div>
                        <div class="text-muted" style="font-size: 11px;">${device.width} x ${device.height}</div>
                        <div class="text-muted mt-2" style="font-size: 11px;">Active: ${activeCount}</div>
                        <button class="btn btn-sm btn-primary w-100 mt-2" style="font-size: 11px;">
                            Add Instance
                        </button>
                    </div>
                </div>
            `;

            col.querySelector('button').addEventListener('click', (e) => {
                e.stopPropagation();
                addDeviceInstance(device);
            });

            deviceLibraryList.appendChild(col);
        });
    }

    function renderActiveDeviceList() {
        activeDeviceList.innerHTML = '';

        if (!activeDevices.length) {
            activeDeviceList.innerHTML = '<div class="text-muted" style="font-size: 12px;">No active devices yet.</div>';
            return;
        }

        activeDevices.forEach((device, index) => {
            const row = document.createElement('div');
            row.className = 'd-flex justify-content-between align-items-center border rounded px-2 py-1 mb-2';
            row.innerHTML = `
                <div>
                    <div style="font-size: 12px; font-weight: 600;">${index + 1}. ${device.name}</div>
                    <div class="text-muted" style="font-size: 11px;">${device.width} x ${device.height} • Instance ${device.instanceId}</div>
                </div>
                <div class="d-flex align-items-center gap-1">
                    <button class="btn btn-sm btn-outline-secondary btn-move-up" style="font-size: 11px;" title="Move Up">↑</button>
                    <button class="btn btn-sm btn-outline-secondary btn-move-down" style="font-size: 11px;" title="Move Down">↓</button>
                    <button class="btn btn-sm btn-outline-danger btn-remove" style="font-size: 11px;">Remove</button>
                </div>
            `;

            const btnMoveUp = row.querySelector('.btn-move-up');
            const btnMoveDown = row.querySelector('.btn-move-down');
            const btnRemove = row.querySelector('.btn-remove');

            btnMoveUp.disabled = index === 0;
            btnMoveDown.disabled = index === activeDevices.length - 1;

            btnMoveUp.addEventListener('click', () => {
                moveDeviceInstance(device.instanceId, -1);
            });

            btnMoveDown.addEventListener('click', () => {
                moveDeviceInstance(device.instanceId, 1);
            });

            btnRemove.addEventListener('click', () => {
                removeDeviceInstance(device.instanceId);
                renderDevices();
                renderActiveDeviceList();
                renderDeviceLibrary(getCurrentFilter());
            });

            activeDeviceList.appendChild(row);
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

    function addDeviceInstance(device) {
        activeDevices.push({
            instanceId: `${device.id}-${instanceCounter++}`,
            modelId: device.id,
            name: device.name,
            width: device.width,
            height: device.height,
            url: normalizeUrl(urlInput.value.trim()) || currentUrl
        });
        renderDevices();
        renderActiveDeviceList();
        renderDeviceLibrary(getCurrentFilter());
    }

    function applyGlobalUrlToAllDevices() {
        const normalized = normalizeUrl(urlInput.value.trim());
        if (!normalized) return;

        currentUrl = normalized;
        urlInput.value = normalized;
        activeDevices.forEach((device) => {
            device.url = normalized;
        });

        renderDevices();
        renderActiveDeviceList();
    }

    function removeDeviceInstance(instanceId) {
        activeDevices = activeDevices.filter(d => d.instanceId !== instanceId);
    }

    function moveDeviceInstance(instanceId, offset) {
        const currentIndex = activeDevices.findIndex(d => d.instanceId === instanceId);
        if (currentIndex === -1) return;

        const nextIndex = currentIndex + offset;
        if (nextIndex < 0 || nextIndex >= activeDevices.length) return;

        const [movedDevice] = activeDevices.splice(currentIndex, 1);
        activeDevices.splice(nextIndex, 0, movedDevice);

        renderDevices();
        renderActiveDeviceList();
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
            renderActiveDeviceList();
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
    btnApplyUrl.addEventListener('click', applyGlobalUrlToAllDevices);
    btnSaveIframeUrl.addEventListener('click', saveDeviceUrlFromModal);

    document.getElementById('iframeUrlModal').addEventListener('hidden.bs.modal', () => {
        editingDeviceInstanceId = null;
        iframeUrlInput.classList.remove('is-invalid');
    });

    iframeUrlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveDeviceUrlFromModal();
        }
    });

    initDeviceModal();

    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            applyGlobalUrlToAllDevices();
        }
    });

    init();
});
