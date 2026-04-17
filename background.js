chrome.runtime.onInstalled.addListener(() => {
    console.log('Web Dev Toolbox extension installed');
});

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Message received in background:', message);
    
    if (message.action === 'openResponsiveViewer') {
        chrome.tabs.create({ url: 'responsive-viewer.html' });
    }
    
    sendResponse({ status: 'received' });
    return true;
});
