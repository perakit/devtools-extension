console.log('Web Dev Toolbox content script loaded');

// Listen for tool launch events from the popup
window.addEventListener('toolbox-tool-launch', (event) => {
    const toolName = event.detail;
    console.log(`Launching tool: ${toolName}`);
    
    // This will be expanded as we implement each tool in Milestone 2-4
    switch (toolName) {
        case 'css-inspector':
            alert('CSS Inspector coming soon!');
            break;
        case 'text-editor':
            alert('Live Text Editor coming soon!');
            break;
        case 'font-changer':
            alert('Fonts Changer coming soon!');
            break;
        case 'move-element':
            alert('Move Element coming soon!');
            break;
        case 'delete-element':
            alert('Delete Element coming soon!');
            break;
        case 'color-picker':
            alert('Color Picker coming soon!');
            break;
        case 'seo-inspector':
            alert('SEO Inspector coming soon!');
            break;
        case 'email-finder':
            alert('Email Finder coming soon!');
            break;
        case 'markdown-export':
            alert('Markdown Export coming soon!');
            break;
        default:
            console.warn(`Tool ${toolName} is not yet implemented.`);
    }
});
