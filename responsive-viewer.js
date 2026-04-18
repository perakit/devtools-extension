document.addEventListener('DOMContentLoaded', async () => {
    const RULE_ID = 1;
    const VIEWER_STATE_KEY = 'responsive-viewer-state-v2';
    const WORKSPACES_KEY = 'responsive-viewer-workspaces-v1';
    const container = document.getElementById('viewer-container');
    const btnGrid = document.getElementById('btn-grid-view');
    const btnList = document.getElementById('btn-list-view');
    const btnRefresh = document.getElementById('btn-refresh');
    const urlInput = document.getElementById('url-input');
    const btnApplyUrl = document.getElementById('btn-apply-url');
    const btnToggleDark = document.getElementById('btn-toggle-dark');
    const btnAddDevice = document.getElementById('btn-add-device');
    const workspaceTabs = document.getElementById('workspace-tabs');
    const btnWorkspaceAdd = document.getElementById('btn-workspace-add');
    const btnWorkspaceRename = document.getElementById('btn-workspace-rename');
    const btnWorkspaceDelete = document.getElementById('btn-workspace-delete');
    const deviceModal = new bootstrap.Modal(document.getElementById('deviceModal'));
    const iframeUrlModal = new bootstrap.Modal(document.getElementById('iframeUrlModal'));
    const workspaceAddModalElement = document.getElementById('workspaceAddModal');
    const workspaceRenameModalElement = document.getElementById('workspaceRenameModal');
    const workspaceDeleteModalElement = document.getElementById('workspaceDeleteModal');
    const workspaceAddModal = new bootstrap.Modal(workspaceAddModalElement);
    const workspaceRenameModal = new bootstrap.Modal(workspaceRenameModalElement);
    const workspaceDeleteModal = new bootstrap.Modal(workspaceDeleteModalElement);
    const workspaceAddNameInput = document.getElementById('workspace-add-name');
    const workspaceRenameNameInput = document.getElementById('workspace-rename-name');
    const workspaceDeleteName = document.getElementById('workspace-delete-name');
    const btnWorkspaceAddConfirm = document.getElementById('btn-workspace-add-confirm');
    const btnWorkspaceRenameConfirm = document.getElementById('btn-workspace-rename-confirm');
    const btnWorkspaceDeleteConfirm = document.getElementById('btn-workspace-delete-confirm');
    const deviceLibraryList = document.getElementById('device-library-list');
    const activeDeviceList = document.getElementById('active-device-list');
    const deviceFiltersContainer = document.getElementById('device-filters');
    const iframeUrlInput = document.getElementById('iframe-url-input');
    const iframeUrlDeviceName = document.getElementById('iframe-url-device-name');

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
    let editingDeviceInstanceId = null;
    const deviceElements = new Map();
    let layoutMode = 'grid';
    let workspaces = [];
    let activeWorkspaceId = '';

    function normalizeUrl(input) {
        const value = (input || '').trim();
        if (!value) return '';
        if (/^https?:\/\//i.test(value)) return value;
        return `https://${value}`;
    }

    function getQueryUrl() {
        try {
            const params = new URLSearchParams(window.location.search);
            return normalizeUrl(params.get('url') || '');
        } catch (error) {
            return '';
        }
    }

    function createWorkspaceId() {
        return `ws-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    }

    function cloneDefaultDevices(url = '') {
        return [
            { instanceId: 'iphone-se-1', modelId: 'iphone-se', name: 'iPhone SE', width: 375, height: 667, url },
            { instanceId: 'ipad-air-1', modelId: 'ipad-air', name: 'iPad Air', width: 820, height: 1180, url },
            { instanceId: 'desktop-hd-1', modelId: 'desktop-hd', name: 'Desktop HD', width: 1440, height: 900, url }
        ];
    }

    function getNextInstanceCounter() {
        const maxSuffix = activeDevices
            .map((device) => {
                const parts = String(device.instanceId || '').split('-');
                const maybeNumber = Number(parts[parts.length - 1]);
                return Number.isFinite(maybeNumber) ? maybeNumber : 1;
            })
            .reduce((acc, value) => Math.max(acc, value), 1);

        return maxSuffix + 1;
    }

    function getActiveWorkspace() {
        return workspaces.find((workspace) => workspace.id === activeWorkspaceId) || null;
    }

    function saveWorkspacesState() {
        const payload = {
            activeWorkspaceId,
            workspaces
        };
        localStorage.setItem(WORKSPACES_KEY, JSON.stringify(payload));
    }

    function loadWorkspacesState() {
        const raw = localStorage.getItem(WORKSPACES_KEY);
        if (!raw) {
            return false;
        }

        try {
            const parsed = JSON.parse(raw);
            const parsedWorkspaces = Array.isArray(parsed.workspaces) ? parsed.workspaces : [];
            const normalizedWorkspaces = parsedWorkspaces
                .map((workspace, index) => {
                    const id = String(workspace.id || '').trim() || createWorkspaceId();
                    const name = String(workspace.name || '').trim() || `Workspace ${index + 1}`;
                    const state = workspace.state || {};
                    const stateDevices = Array.isArray(state.activeDevices) ? state.activeDevices : [];
                    const devices = stateDevices.length
                        ? stateDevices
                            .map((device) => ({
                                instanceId: String(device.instanceId || ''),
                                modelId: String(device.modelId || 'custom'),
                                name: String(device.name || 'Custom Device'),
                                width: Number(device.width) || 375,
                                height: Number(device.height) || 667,
                                url: normalizeUrl(device.url || '')
                            }))
                            .filter((device) => device.instanceId)
                        : cloneDefaultDevices(normalizeUrl(state.currentUrl || ''));

                    return {
                        id,
                        name,
                        state: {
                            layoutMode: state.layoutMode === 'list' ? 'list' : 'grid',
                            currentUrl: normalizeUrl(state.currentUrl || ''),
                            activeDevices: devices
                        }
                    };
                })
                .filter((workspace) => workspace.id);

            if (!normalizedWorkspaces.length) {
                return false;
            }

            workspaces = normalizedWorkspaces;
            const candidateActiveId = String(parsed.activeWorkspaceId || '').trim();
            const activeExists = workspaces.some((workspace) => workspace.id === candidateActiveId);
            activeWorkspaceId = activeExists ? candidateActiveId : workspaces[0].id;
            return true;
        } catch (error) {
            console.warn('Failed to parse workspace state', error);
            return false;
        }
    }

    function migrateLegacyState(initialUrl) {
        loadViewerState();

        const fallbackUrl = getQueryUrl() || currentUrl || normalizeUrl(initialUrl) || 'https://perakit.com';
        const firstWorkspace = {
            id: createWorkspaceId(),
            name: 'Workspace 1',
            state: {
                layoutMode,
                currentUrl: fallbackUrl,
                activeDevices: (activeDevices && activeDevices.length) ? activeDevices : cloneDefaultDevices(fallbackUrl)
            }
        };

        workspaces = [firstWorkspace];
        activeWorkspaceId = firstWorkspace.id;
        saveWorkspacesState();
    }

    function applyWorkspaceState(workspaceId) {
        const workspace = workspaces.find((item) => item.id === workspaceId);
        if (!workspace) {
            return;
        }

        activeWorkspaceId = workspace.id;
        layoutMode = workspace.state.layoutMode === 'list' ? 'list' : 'grid';
        currentUrl = normalizeUrl(workspace.state.currentUrl || '') || 'https://perakit.com';
        activeDevices = (workspace.state.activeDevices || []).map((device) => ({ ...device }));

        if (!activeDevices.length) {
            activeDevices = cloneDefaultDevices(currentUrl);
        }

        for (const wrapper of deviceElements.values()) {
            wrapper.remove();
        }
        deviceElements.clear();

        urlInput.value = currentUrl;
        setLayoutMode(layoutMode);
        renderWorkspaceTabs();
        renderDevices();
        renderActiveDeviceList();
    }

    function persistActiveWorkspaceState() {
        const workspace = getActiveWorkspace();
        if (!workspace) {
            return;
        }

        workspace.state = {
            layoutMode,
            currentUrl: normalizeUrl(urlInput.value.trim()) || currentUrl,
            activeDevices: activeDevices.map((device) => ({ ...device }))
        };

        saveWorkspacesState();
    }

    function renderWorkspaceTabs() {
        workspaceTabs.innerHTML = '';

        workspaces.forEach((workspace) => {
            const tab = document.createElement('button');
            tab.type = 'button';
            tab.className = `workspace-tab${workspace.id === activeWorkspaceId ? ' active' : ''}`;
            tab.textContent = workspace.name;
            tab.title = workspace.name;
            tab.addEventListener('click', () => {
                if (workspace.id === activeWorkspaceId) {
                    return;
                }

                persistActiveWorkspaceState();
                applyWorkspaceState(workspace.id);
                saveWorkspacesState();
            });
            workspaceTabs.appendChild(tab);
        });

        btnWorkspaceDelete.disabled = workspaces.length <= 1;
    }

    function addWorkspace(name) {
        persistActiveWorkspaceState();
        const trimmedName = (name || '').trim() || `Workspace ${workspaces.length + 1}`;
        const baseUrl = normalizeUrl(urlInput.value.trim()) || currentUrl || 'https://perakit.com';

        const workspace = {
            id: createWorkspaceId(),
            name: trimmedName,
            state: {
                layoutMode: 'grid',
                currentUrl: baseUrl,
                activeDevices: cloneDefaultDevices(baseUrl)
            }
        };

        workspaces.push(workspace);
        applyWorkspaceState(workspace.id);
        saveWorkspacesState();
    }

    function renameWorkspace(name) {
        const workspace = getActiveWorkspace();
        if (!workspace) {
            return;
        }

        const trimmedName = String(name || '').trim();
        if (!trimmedName) {
            return;
        }

        workspace.name = trimmedName;
        renderWorkspaceTabs();
        saveWorkspacesState();
    }

    function deleteWorkspace() {
        if (workspaces.length <= 1) {
            return;
        }

        const workspace = getActiveWorkspace();
        if (!workspace) {
            return;
        }

        const currentIndex = workspaces.findIndex((item) => item.id === workspace.id);
        if (currentIndex === -1) {
            return;
        }

        workspaces.splice(currentIndex, 1);
        const nextWorkspace = workspaces[Math.max(0, currentIndex - 1)] || workspaces[0];
        applyWorkspaceState(nextWorkspace.id);
        saveWorkspacesState();
    }

    function openAddWorkspaceModal() {
        workspaceAddNameInput.value = `Workspace ${workspaces.length + 1}`;
        workspaceAddNameInput.classList.remove('is-invalid');
        workspaceAddModal.show();
        setTimeout(() => {
            workspaceAddNameInput.focus();
            workspaceAddNameInput.select();
        }, 120);
    }

    function openRenameWorkspaceModal() {
        const workspace = getActiveWorkspace();
        if (!workspace) {
            return;
        }

        workspaceRenameNameInput.value = workspace.name;
        workspaceRenameNameInput.classList.remove('is-invalid');
        workspaceRenameModal.show();
        setTimeout(() => {
            workspaceRenameNameInput.focus();
            workspaceRenameNameInput.select();
        }, 120);
    }

    function openDeleteWorkspaceModal() {
        const workspace = getActiveWorkspace();
        if (!workspace || workspaces.length <= 1) {
            return;
        }

        workspaceDeleteName.textContent = workspace.name;
        workspaceDeleteModal.show();
    }

    function submitAddWorkspace() {
        const value = workspaceAddNameInput.value.trim();
        if (!value) {
            workspaceAddNameInput.classList.add('is-invalid');
            return;
        }

        workspaceAddNameInput.classList.remove('is-invalid');
        addWorkspace(value);
        workspaceAddModal.hide();
    }

    function submitRenameWorkspace() {
        const value = workspaceRenameNameInput.value.trim();
        if (!value) {
            workspaceRenameNameInput.classList.add('is-invalid');
            return;
        }

        workspaceRenameNameInput.classList.remove('is-invalid');
        renameWorkspace(value);
        workspaceRenameModal.hide();
    }

    function submitDeleteWorkspace() {
        deleteWorkspace();
        workspaceDeleteModal.hide();
    }

    function saveViewerState() {
        persistActiveWorkspaceState();

        // Keep legacy key updated so downgrade/older sessions still load cleanly.
        const legacyState = {
            layoutMode,
            darkMode: document.body.classList.contains('dark-mode'),
            currentUrl: normalizeUrl(urlInput.value.trim()) || currentUrl,
            activeDevices
        };
        localStorage.setItem(VIEWER_STATE_KEY, JSON.stringify(legacyState));
    }

    function loadViewerState() {
        const raw = localStorage.getItem(VIEWER_STATE_KEY);
        if (!raw) {
            return;
        }

        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed.activeDevices) && parsed.activeDevices.length) {
                activeDevices = parsed.activeDevices
                    .map((device) => ({
                        instanceId: String(device.instanceId || ''),
                        modelId: String(device.modelId || 'custom'),
                        name: String(device.name || 'Custom Device'),
                        width: Number(device.width) || 375,
                        height: Number(device.height) || 667,
                        url: normalizeUrl(device.url || '')
                    }))
                    .filter((device) => device.instanceId);
            }

            if (parsed.layoutMode === 'list' || parsed.layoutMode === 'grid') {
                layoutMode = parsed.layoutMode;
            }

            if (typeof parsed.darkMode === 'boolean') {
                document.body.classList.toggle('dark-mode', parsed.darkMode);
                btnToggleDark.textContent = parsed.darkMode ? '☀️ Light Mode' : '🌙 Dark Mode';
                localStorage.setItem('responsive-viewer-dark-mode', parsed.darkMode ? 'true' : 'false');
            }

            if (normalizeUrl(parsed.currentUrl)) {
                currentUrl = normalizeUrl(parsed.currentUrl);
            }
        } catch (error) {
            console.warn('Failed to parse saved viewer state', error);
        }
    }

    function setLayoutMode(mode) {
        layoutMode = mode === 'list' ? 'list' : 'grid';
        container.className = layoutMode === 'list' ? 'layout-list' : 'layout-grid';
        btnGrid.classList.toggle('active', layoutMode === 'grid');
        btnList.classList.toggle('active', layoutMode === 'list');
        saveViewerState();
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
        saveViewerState();
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
                    <button class="btn btn-sm btn-outline-secondary btn-rotate" title="Rotate">⤾</button>
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

        wrapper.querySelector('.btn-rotate').addEventListener('click', () => {
            const currentDevice = getDeviceByInstanceId(device.instanceId);
            if (!currentDevice) return;
            const nextWidth = currentDevice.height;
            const nextHeight = currentDevice.width;
            currentDevice.width = nextWidth;
            currentDevice.height = nextHeight;
            updateDeviceElement(wrapper, currentDevice, targetUrl);
            renderActiveDeviceList();
            saveViewerState();
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
        const queryUrl = getQueryUrl();
        if (queryUrl) {
            return queryUrl;
        }

        const savedUrl = normalizeUrl(localStorage.getItem('responsive-viewer-last-url') || '');
        if (savedUrl) {
            return savedUrl;
        }

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            return normalizeUrl(tab?.url || '') || 'https://perakit.com';
        } catch (error) {
            return 'https://perakit.com';
        }
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

        const initialUrl = await getCurrentTabUrl();
        const hasWorkspaceState = loadWorkspacesState();

        if (!hasWorkspaceState) {
            migrateLegacyState(initialUrl);
        }

        applyWorkspaceState(activeWorkspaceId || workspaces[0]?.id);

        const queryUrl = getQueryUrl();
        if (queryUrl) {
            currentUrl = queryUrl;
            urlInput.value = queryUrl;
            localStorage.setItem('responsive-viewer-last-url', queryUrl);
            saveViewerState();
            renderDevices();
        }
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
        const nextInstanceCounter = getNextInstanceCounter();
        activeDevices.push({
            instanceId: `${device.id}-${nextInstanceCounter}`,
            modelId: device.id,
            name: device.name,
            width: device.width,
            height: device.height,
            url: normalizeUrl(urlInput.value.trim()) || currentUrl
        });
        renderDevices();
        renderActiveDeviceList();
        renderDeviceLibrary(getCurrentFilter());
        saveViewerState();
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
        localStorage.setItem('responsive-viewer-last-url', normalized);
        saveViewerState();
    }

    function removeDeviceInstance(instanceId) {
        activeDevices = activeDevices.filter(d => d.instanceId !== instanceId);
        saveViewerState();
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
        saveViewerState();
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
        setLayoutMode('grid');
    });

    btnList.addEventListener('click', () => {
        setLayoutMode('list');
    });

    // Dark Mode Toggle
    btnToggleDark.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        btnToggleDark.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
        localStorage.setItem('responsive-viewer-dark-mode', isDark);
        saveViewerState();
    });

    // Load saved dark mode preference
    if (localStorage.getItem('responsive-viewer-dark-mode') === 'true') {
        document.body.classList.add('dark-mode');
        btnToggleDark.textContent = '☀️ Light Mode';
    }

    btnRefresh.addEventListener('click', renderDevices);
    btnApplyUrl.addEventListener('click', applyGlobalUrlToAllDevices);
    btnWorkspaceAdd.addEventListener('click', openAddWorkspaceModal);
    btnWorkspaceRename.addEventListener('click', openRenameWorkspaceModal);
    btnWorkspaceDelete.addEventListener('click', openDeleteWorkspaceModal);
    btnWorkspaceAddConfirm.addEventListener('click', submitAddWorkspace);
    btnWorkspaceRenameConfirm.addEventListener('click', submitRenameWorkspace);
    btnWorkspaceDeleteConfirm.addEventListener('click', submitDeleteWorkspace);

    workspaceAddNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitAddWorkspace();
        }
    });

    workspaceRenameNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitRenameWorkspace();
        }
    });

    workspaceAddModalElement.addEventListener('hidden.bs.modal', () => {
        workspaceAddNameInput.classList.remove('is-invalid');
    });

    workspaceRenameModalElement.addEventListener('hidden.bs.modal', () => {
        workspaceRenameNameInput.classList.remove('is-invalid');
    });
    document.getElementById('btn-save-iframe-url').addEventListener('click', saveDeviceUrlFromModal);

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
