chrome.runtime.onInstalled.addListener(async () => {
    console.log('Web Dev Toolbox extension installed');

    if (chrome.sidePanel?.setOptions) {
        await chrome.sidePanel.setOptions({
            path: 'sidepanel.html',
            enabled: true
        });
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Message received in background:', message);

    if (message.action === 'openResponsiveViewer') {
        chrome.tabs.create({ url: 'responsive-viewer.html' });
        sendResponse({ status: 'opened' });
        return true;
    }

    if (message.action === 'openTodoPanel') {
        const windowId = message.windowId ?? sender.tab?.windowId;

        if (chrome.sidePanel?.open && typeof windowId === 'number') {
            chrome.sidePanel.open({ windowId })
                .then(() => sendResponse({ status: 'opened' }))
                .catch((error) => {
                    console.error('Failed to open side panel:', error);
                    sendResponse({ status: 'error', message: error.message });
                });
            return true;
        }

        sendResponse({ status: 'unsupported' });
        return true;
    }

    if (message.action === 'downloadText') {
        const payload = encodeURIComponent(message.content || '');
        chrome.downloads.download({
            url: `data:text/plain;charset=utf-8,${payload}`,
            filename: message.filename || 'export.txt',
            saveAs: true
        }).then(() => {
            sendResponse({ status: 'download-started' });
        }).catch((error) => {
            console.error('Download failed:', error);
            sendResponse({ status: 'error', message: error.message });
        });
        return true;
    }

    sendResponse({ status: 'received' });
    return true;
});
