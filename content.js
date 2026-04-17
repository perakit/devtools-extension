(async () => {
    await import(chrome.runtime.getURL('content_module.js'));
})();