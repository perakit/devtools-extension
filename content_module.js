console.log('Web Dev Toolbox content script loaded');

import cssInspector from './tools/css-inspector.js';
import textEditor from './tools/text-editor.js';
import domTools from './tools/dom-tools.js';
import fontTools from './tools/font-tools.js';
import colorTools from './tools/color-tools.js';
import seoTools from './tools/seo-tools.js';
import utilityTools from './tools/utility-tools.js';
import browserTools from './tools/browser-tools.js';

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
        case 'reader-mode':
            utilityTools.toggle('reader');
            break;
        case 'markdown-export':
            utilityTools.toggle('markdown');
            break;
        case 'extract-images':
            utilityTools.toggle('images');
            break;
        case 'export-element':
            browserTools.toggle('export-element');
            break;
        case 'page-ruler':
            browserTools.toggle('page-ruler');
            break;
        case 'page-outliner':
            browserTools.toggle('page-outliner');
            break;
        case 'image-replacer':
            browserTools.toggle('image-replacer');
            break;
        case 'open-multiple-urls':
            browserTools.toggle('open-multiple-urls');
            break;
        case 'table-capture':
            browserTools.toggle('table-capture');
            break;
        case 'cookie-editor':
            browserTools.toggle('cookie-editor');
            break;
        case 'api-tester':
            browserTools.toggle('api-tester');
            break;
        case 'currency-converter':
            browserTools.toggle('currency-converter');
            break;
        case 'accessibility-tools':
            browserTools.toggle('accessibility-tools');
            break;
        case 'site-stack':
            browserTools.toggle('site-stack');
            break;
        case 'broken-links':
            browserTools.toggle('broken-links');
            break;
        case 'redirect-path':
            browserTools.toggle('redirect-path');
            break;
        case 'pagespeed-insights':
            browserTools.toggle('pagespeed-insights');
            break;
        case 'stripe-analytics':
            browserTools.toggle('stripe-analytics');
            break;
        default:
            console.warn(`Tool ${toolName} is not yet implemented.`);
    }
});
