document.addEventListener('DOMContentLoaded', () => {
    console.log('Popup initialized');

    // Responsive Viewer
    document.getElementById('btn-responsive-viewer').addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
            chrome.tabs.create({ url: 'responsive-viewer.html' });
        }
    });

    // Generic tool launcher for content scripts
    const launchTool = (toolName) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                func: (name) => {
                    window.dispatchEvent(new CustomEvent('toolbox-tool-launch', { detail: name }));
                },
                args: [toolName]
            });
        });
    };

    document.getElementById('btn-css-inspector').addEventListener('click', () => launchTool('css-inspector'));
    document.getElementById('btn-text-editor').addEventListener('click', () => launchTool('text-editor'));
    document.getElementById('btn-font-changer').addEventListener('click', () => launchTool('font-changer'));
    document.getElementById('btn-move-element').addEventListener('click', () => launchTool('move-element'));
    document.getElementById('btn-delete-element').addEventListener('click', () => launchTool('delete-element'));
    document.getElementById('btn-color-picker').addEventListener('click', () => launchTool('color-picker'));
    document.getElementById('btn-seo-inspector').addEventListener('click', () => launchTool('seo-inspector'));
    document.getElementById('btn-email-finder').addEventListener('click', () => launchTool('email-finder'));
    document.getElementById('btn-markdown-export').addEventListener('click', () => launchTool('markdown-export'));
    document.getElementById('btn-todo-tasks').addEventListener('click', () => {
        chrome.tabs.create({ url: 'options.html' }); // Temporary redirect to options for todo
    });
});
