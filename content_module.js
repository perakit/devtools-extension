console.log('Web Dev Toolbox content script loaded');

import cssInspector from './tools/css-inspector.js';
import textEditor from './tools/text-editor.js';
import domTools from './tools/dom-tools.js';
import fontTools from './tools/font-tools.js';

// Listen for tool launch events from the popup
window.addEventListener('toolbox-tool-launch', (event) => {
    const toolName = event.detail;
    console.log(`Launching tool: ${toolName}`);
    
    // This will be expanded as we implement each tool in Milestone 2-4
    switch (toolName) {
        case 'css-inspector':
            cssInspector.toggle();
            break;
        case 'text-editor':
            textEditor.toggle();
            break;
        case 'font-changer':
            fontTools.toggle();
            break;
        case 'move-element':
            domTools.toggle('move');
            break;
        case 'delete-element':
            domTools.toggle('delete');
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
