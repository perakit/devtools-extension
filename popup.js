document.addEventListener('DOMContentLoaded', () => {
    console.log('Popup initialized');

    const queryActiveTab = async () => {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        return tabs[0];
    };

    // Responsive Viewer
    document.getElementById('btn-responsive-viewer').addEventListener('click', async () => {
        const tab = await queryActiveTab();
        if (tab) {
            chrome.tabs.create({ url: 'responsive-viewer.html' });
        }
    });

    // Generic tool launcher for content scripts
    const launchTool = async (toolName) => {
        const activeTab = await queryActiveTab();
        if (!activeTab?.id) {
            return;
        }

        chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            func: (name) => {
                window.dispatchEvent(new CustomEvent('toolbox-tool-launch', { detail: name }));
            },
            args: [toolName]
        });
    };

    const openTodoSidePanel = async () => {
        const activeTab = await queryActiveTab();
        if (!activeTab?.windowId) {
            return;
        }

        chrome.runtime.sendMessage({
            action: 'openTodoPanel',
            windowId: activeTab.windowId
        });

        window.close();
    };

    document.getElementById('btn-reader-mode')?.addEventListener('click', () => launchTool('reader-mode'));
    document.getElementById('btn-css-inspector').addEventListener('click', () => launchTool('css-inspector'));
    document.getElementById('btn-text-editor').addEventListener('click', () => launchTool('text-editor'));
    document.getElementById('btn-font-changer').addEventListener('click', () => launchTool('font-changer'));
    document.getElementById('btn-list-fonts').addEventListener('click', () => launchTool('list-fonts'));
    document.getElementById('btn-move-element').addEventListener('click', () => launchTool('move-element'));
    document.getElementById('btn-delete-element').addEventListener('click', () => launchTool('delete-element'));
    document.getElementById('btn-color-picker').addEventListener('click', () => launchTool('color-picker'));
    document.getElementById('btn-color-palette').addEventListener('click', () => launchTool('color-palette'));
    document.getElementById('btn-seo-inspector').addEventListener('click', () => launchTool('seo-inspector'));
    document.getElementById('btn-meta-preview').addEventListener('click', () => launchTool('meta-tags-preview'));
    document.getElementById('btn-email-finder').addEventListener('click', () => launchTool('email-finder'));
    document.getElementById('btn-markdown-export').addEventListener('click', () => launchTool('markdown-export'));
    document.getElementById('btn-extract-images')?.addEventListener('click', () => launchTool('extract-images'));
    document.getElementById('btn-todo-tasks').addEventListener('click', openTodoSidePanel);
    document.getElementById('btn-open-task-panel')?.addEventListener('click', (event) => {
        event.preventDefault();
        openTodoSidePanel();
    });
});
