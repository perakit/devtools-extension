console.log('Web Dev Toolbox content script loaded');

import cssInspector from './tools/css-inspector.js';
import textEditor from './tools/text-editor.js';
import domTools from './tools/dom-tools.js';
import fontTools from './tools/font-tools.js';
import colorTools from './tools/color-tools.js';
import seoTools from './tools/seo-tools.js';

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
        case 'list-fonts':
            fontTools.toggle('list');
            break;
        case 'move-element':
            domTools.toggle('move');
            break;
        case 'delete-element':
            domTools.toggle('delete');
            break;
        case 'color-picker':
            colorTools.toggle('picker');
            break;
        case 'color-palette':
            colorTools.toggle('palette');
            break;
        case 'seo-inspector':
            seoTools.toggle('seo');
            break;
        case 'meta-tags-preview':
            seoTools.toggle('meta-preview');
            break;
        case 'email-finder':
            seoTools.toggle('email');
            break;
        case 'markdown-export':
            alert('Markdown Export coming soon!');
            break;
        default:
            console.warn(`Tool ${toolName} is not yet implemented.`);
    }
});
