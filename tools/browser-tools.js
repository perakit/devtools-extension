class BrowserTools {
    constructor() {
        this.active = false;
        this.mode = '';
        this.panel = null;
        this.dragState = null;
        this.pickState = null;
        this.rulerState = null;
        this.lastPickedElement = null;

        this.handleDragStart = this.handleDragStart.bind(this);
        this.handleDragMove = this.handleDragMove.bind(this);
        this.handleDragEnd = this.handleDragEnd.bind(this);
        this.handleRulerKeydown = this.handleRulerKeydown.bind(this);

        this.init();
    }

    init() {
        this.injectStyle();
        this.createPanel();
    }

    injectStyle() {
        if (document.getElementById('toolbox-browser-tools-style')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'toolbox-browser-tools-style';
        style.textContent = `
            .toolbox-browser-panel {
                position: fixed;
                top: 20px;
                right: 20px;
                width: min(540px, calc(100vw - 32px));
                max-height: min(88vh, 860px);
                background: #ffffff;
                color: #0f172a;
                border: 1px solid #dbe3ef;
                border-radius: 14px;
                box-shadow: 0 20px 48px rgba(15, 23, 42, 0.22);
                z-index: 2147483647;
                display: none;
                flex-direction: column;
                overflow: hidden;
                font-family: Arial, sans-serif;
            }
            .toolbox-browser-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 10px;
                padding: 10px 12px;
                border-bottom: 1px solid #e5e7eb;
                background: linear-gradient(180deg, #f8fbff, #eef4fb);
                cursor: move;
                user-select: none;
            }
            .toolbox-browser-title {
                font-size: 14px;
                font-weight: 700;
            }
            .toolbox-browser-actions {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .toolbox-browser-close,
            .toolbox-browser-copy,
            .toolbox-browser-download,
            .toolbox-browser-btn,
            .toolbox-browser-body button {
                border: 1px solid #d0dbec;
                border-radius: 8px;
                background: #fff;
                color: #0f172a;
                cursor: pointer;
                font-size: 12px;
                font-weight: 600;
                padding: 6px 10px;
            }
            .toolbox-browser-close {
                width: 34px;
                height: 34px;
                font-size: 20px;
                line-height: 1;
                padding: 0;
            }
            .toolbox-browser-content {
                padding: 14px;
                overflow: auto;
            }
            .toolbox-browser-lead {
                margin: 0 0 12px;
                color: #475569;
                line-height: 1.45;
                font-size: 13px;
            }
            .toolbox-browser-grid {
                display: grid;
                gap: 10px;
            }
            .toolbox-browser-row {
                display: grid;
                gap: 8px;
            }
            .toolbox-browser-two-col {
                display: grid;
                gap: 8px;
                grid-template-columns: 1fr 1fr;
            }
            .toolbox-browser-input,
            .toolbox-browser-select,
            .toolbox-browser-textarea {
                width: 100%;
                border: 1px solid #dbe3ef;
                border-radius: 8px;
                padding: 8px 10px;
                font-size: 12px;
                line-height: 1.4;
                background: #fbfdff;
                color: #111827;
                box-sizing: border-box;
                font-family: Arial, sans-serif;
            }
            .toolbox-browser-textarea {
                min-height: 160px;
                resize: vertical;
                font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
            }
            .toolbox-browser-kv {
                display: grid;
                gap: 8px;
                border: 1px solid #e5e7eb;
                border-radius: 10px;
                background: #f9fbff;
                padding: 10px;
            }
            .toolbox-browser-muted {
                color: #64748b;
                font-size: 12px;
            }
            .toolbox-browser-block {
                border: 1px solid #e5e7eb;
                border-radius: 10px;
                background: #fbfcfe;
                padding: 10px;
            }
            .toolbox-browser-pill {
                display: inline-block;
                background: #eff6ff;
                color: #1d4ed8;
                border-radius: 999px;
                padding: 4px 8px;
                font-size: 11px;
                font-weight: 700;
                margin-right: 6px;
            }
            .toolbox-browser-empty {
                padding: 16px;
                text-align: center;
                border: 1px dashed #cbd5e1;
                border-radius: 10px;
                color: #64748b;
                background: #f8fafc;
            }
            .toolbox-browser-list {
                display: grid;
                gap: 8px;
            }
            .toolbox-browser-list-item {
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 8px 10px;
                background: #fff;
                display: grid;
                gap: 4px;
            }
            .toolbox-browser-list-item a {
                color: #2563eb;
                text-decoration: none;
                font-size: 12px;
                word-break: break-all;
            }
            .toolbox-browser-cookie-row {
                display: grid;
                gap: 6px;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 8px 10px;
                background: #fff;
            }
            .toolbox-browser-cookie-meta {
                font-size: 11px;
                color: #64748b;
            }
            .toolbox-browser-toast {
                position: absolute;
                left: 14px;
                bottom: 14px;
                background: rgba(15, 23, 42, 0.92);
                color: #fff;
                font-size: 12px;
                padding: 8px 10px;
                border-radius: 10px;
            }
            .toolbox-browser-picker-outline {
                position: fixed;
                border: 2px solid #2563eb;
                background: rgba(37, 99, 235, 0.08);
                pointer-events: none;
                z-index: 2147483646;
            }
            .toolbox-browser-ruler-overlay {
                position: fixed;
                inset: 0;
                z-index: 2147483645;
                cursor: crosshair;
                background: rgba(15, 23, 42, 0.02);
            }
            .toolbox-browser-ruler-box {
                position: fixed;
                border: 2px dashed #ef4444;
                background: rgba(239, 68, 68, 0.12);
                pointer-events: none;
                z-index: 2147483646;
            }
            .toolbox-browser-ruler-label {
                position: fixed;
                background: rgba(15, 23, 42, 0.92);
                color: #fff;
                padding: 4px 8px;
                border-radius: 8px;
                font-size: 11px;
                z-index: 2147483647;
                pointer-events: none;
            }
            .toolbox-browser-heading-mark {
                outline: 2px solid #3b82f6;
                outline-offset: 2px;
            }
        `;

        document.head.appendChild(style);
    }

    createPanel() {
        this.panel = document.createElement('aside');
        this.panel.className = 'toolbox-browser-panel';
        this.panel.setAttribute('data-toolbox-ui', 'true');
        this.panel.innerHTML = `
            <div class="toolbox-browser-header" data-toolbox-ui="true">
                <strong class="toolbox-browser-title">Browser Utility</strong>
                <div class="toolbox-browser-actions">
                    <button class="toolbox-browser-copy" type="button">Copy</button>
                    <button class="toolbox-browser-download" type="button">Download</button>
                    <button class="toolbox-browser-close" type="button">&times;</button>
                </div>
            </div>
            <div class="toolbox-browser-content" data-toolbox-ui="true">
                <p class="toolbox-browser-lead"></p>
                <div class="toolbox-browser-body"></div>
            </div>
        `;

        document.body.appendChild(this.panel);

        this.panel.querySelector('.toolbox-browser-header').addEventListener('pointerdown', this.handleDragStart);
        this.panel.querySelector('.toolbox-browser-close').addEventListener('click', () => this.close());
        this.panel.querySelector('.toolbox-browser-copy').addEventListener('click', () => this.copyCurrentMode());
        this.panel.querySelector('.toolbox-browser-download').addEventListener('click', () => this.downloadCurrentMode());
    }

    escapeHTML(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    safeUrl(urlLike) {
        try {
            const url = new URL(urlLike, window.location.href);
            if (url.protocol === 'http:' || url.protocol === 'https:') {
                return url.href;
            }
        } catch (error) {
            return '';
        }

        return '';
    }

    setLead(text) {
        this.panel.querySelector('.toolbox-browser-lead').textContent = text;
    }

    setBodyHTML(html) {
        this.panel.querySelector('.toolbox-browser-body').innerHTML = html;
    }

    setToast(message) {
        const existing = this.panel.querySelector('.toolbox-browser-toast');
        if (existing) {
            existing.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'toolbox-browser-toast';
        toast.textContent = message;
        this.panel.appendChild(toast);

        window.setTimeout(() => {
            toast.remove();
        }, 1800);
    }

    handleDragStart(event) {
        if (event.target.closest('.toolbox-browser-close') || event.target.closest('.toolbox-browser-copy') || event.target.closest('.toolbox-browser-download')) {
            return;
        }

        const rect = this.panel.getBoundingClientRect();
        this.dragState = {
            offsetX: event.clientX - rect.left,
            offsetY: event.clientY - rect.top
        };

        this.panel.style.left = `${rect.left}px`;
        this.panel.style.top = `${rect.top}px`;
        this.panel.style.right = 'auto';

        window.addEventListener('pointermove', this.handleDragMove);
        window.addEventListener('pointerup', this.handleDragEnd);

        event.preventDefault();
        event.stopPropagation();
    }

    handleDragMove(event) {
        if (!this.dragState) {
            return;
        }

        const rect = this.panel.getBoundingClientRect();
        const maxLeft = Math.max(0, window.innerWidth - rect.width);
        const maxTop = Math.max(0, window.innerHeight - rect.height);
        const left = Math.min(Math.max(0, event.clientX - this.dragState.offsetX), maxLeft);
        const top = Math.min(Math.max(0, event.clientY - this.dragState.offsetY), maxTop);

        this.panel.style.left = `${left}px`;
        this.panel.style.top = `${top}px`;
    }

    handleDragEnd() {
        this.dragState = null;
        window.removeEventListener('pointermove', this.handleDragMove);
        window.removeEventListener('pointerup', this.handleDragEnd);
    }

    showPanel() {
        this.panel.style.display = 'flex';
    }

    hidePanel() {
        this.panel.style.display = 'none';
    }

    toggle(mode) {
        if (mode === 'page-ruler') {
            if (this.rulerState) {
                this.disableRuler();
                return;
            }

            this.active = true;
            this.mode = mode;
            this.enableRuler();
            return;
        }

        if (this.active && this.mode === mode) {
            this.close();
            return;
        }

        this.disableRuler();
        this.stopPicker();

        this.active = true;
        this.mode = mode;
        this.showPanel();
        this.panel.querySelector('.toolbox-browser-title').textContent = this.getTitleForMode(mode);
        this.renderMode();
    }

    close() {
        this.active = false;
        this.handleDragEnd();
        this.stopPicker();
        this.disableRuler();
        this.clearHeadingHighlights();
        this.hidePanel();
    }

    getTitleForMode(mode) {
        const titleMap = {
            'export-element': 'Export Element',
            'page-outliner': 'Page Outliner',
            'image-replacer': 'Image Replacer',
            'open-multiple-urls': 'Open Multiple URLs',
            'table-capture': 'Table Capture',
            'cookie-editor': 'Cookie Editor',
            'api-tester': 'API Tester',
            'currency-converter': 'Currency Converter',
            'accessibility-tools': 'Accessibility Tools',
            'site-stack': 'Site Stack Detection',
            'broken-links': 'Broken Link Checker',
            'redirect-path': 'Redirect Path',
            'pagespeed-insights': 'PageSpeed Insights',
            'stripe-analytics': 'Stripe Analytics Module'
        };

        return titleMap[mode] || 'Browser Utility';
    }

    renderMode() {
        switch (this.mode) {
            case 'export-element':
                this.renderExportElement();
                break;
            case 'page-outliner':
                this.renderPageOutliner();
                break;
            case 'image-replacer':
                this.renderImageReplacer();
                break;
            case 'open-multiple-urls':
                this.renderOpenMultipleUrls();
                break;
            case 'table-capture':
                this.renderTableCapture();
                break;
            case 'cookie-editor':
                this.renderCookieEditor();
                break;
            case 'api-tester':
                this.renderApiTester();
                break;
            case 'currency-converter':
                this.renderCurrencyConverter();
                break;
            case 'accessibility-tools':
                this.renderAccessibilityTools();
                break;
            case 'site-stack':
                this.renderSiteStack();
                break;
            case 'broken-links':
                this.renderBrokenLinks();
                break;
            case 'redirect-path':
                this.renderRedirectPath();
                break;
            case 'pagespeed-insights':
                this.renderPageSpeedInsights();
                break;
            case 'stripe-analytics':
                this.renderStripeAnalyticsModule();
                break;
            default:
                this.setLead('This tool is not available yet.');
                this.setBodyHTML('<div class="toolbox-browser-empty">Choose a valid utility from the popup.</div>');
                break;
        }
    }

    beginPick(onPick, filter) {
        this.stopPicker();

        const outline = document.createElement('div');
        outline.className = 'toolbox-browser-picker-outline';
        outline.setAttribute('data-toolbox-ui', 'true');
        document.body.appendChild(outline);

        const updateOutline = (element) => {
            const rect = element.getBoundingClientRect();
            outline.style.left = `${rect.left}px`;
            outline.style.top = `${rect.top}px`;
            outline.style.width = `${rect.width}px`;
            outline.style.height = `${rect.height}px`;
        };

        const onMouseMove = (event) => {
            const target = event.target;
            if (!(target instanceof Element)) {
                return;
            }

            if (target.closest('[data-toolbox-ui="true"]')) {
                return;
            }

            if (typeof filter === 'function' && !filter(target)) {
                return;
            }

            updateOutline(target);
            this.lastPickedElement = target;
        };

        const onClick = (event) => {
            const target = event.target;
            if (!(target instanceof Element)) {
                return;
            }

            if (target.closest('[data-toolbox-ui="true"]')) {
                return;
            }

            if (typeof filter === 'function' && !filter(target)) {
                this.setToast('That element does not match this tool');
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            this.stopPicker();
            this.lastPickedElement = target;
            onPick(target);
        };

        const onKeydown = (event) => {
            if (event.key === 'Escape') {
                this.stopPicker();
                this.setToast('Picker cancelled');
            }
        };

        window.addEventListener('mousemove', onMouseMove, true);
        window.addEventListener('click', onClick, true);
        window.addEventListener('keydown', onKeydown, true);

        this.pickState = {
            outline,
            onMouseMove,
            onClick,
            onKeydown
        };

        this.setToast('Click an element on the page');
    }

    stopPicker() {
        if (!this.pickState) {
            return;
        }

        const { outline, onMouseMove, onClick, onKeydown } = this.pickState;
        window.removeEventListener('mousemove', onMouseMove, true);
        window.removeEventListener('click', onClick, true);
        window.removeEventListener('keydown', onKeydown, true);
        outline.remove();
        this.pickState = null;
    }

    getSelectorForElement(element) {
        if (!element || !(element instanceof Element)) {
            return '';
        }

        if (element.id) {
            return `#${element.id}`;
        }

        const parts = [];
        let current = element;
        while (current && current.nodeType === Node.ELEMENT_NODE && parts.length < 5) {
            let part = current.tagName.toLowerCase();
            const classes = Array.from(current.classList || []).filter(Boolean).slice(0, 2);
            if (classes.length) {
                part += `.${classes.join('.')}`;
            } else if (current.parentElement) {
                const siblings = Array.from(current.parentElement.children).filter((sibling) => sibling.tagName === current.tagName);
                if (siblings.length > 1) {
                    const index = siblings.indexOf(current) + 1;
                    part += `:nth-of-type(${index})`;
                }
            }

            parts.unshift(part);
            current = current.parentElement;

            if (current && current.id) {
                parts.unshift(`#${current.id}`);
                break;
            }
        }

        return parts.join(' > ');
    }

    async copyText(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                document.execCommand('copy');
                textarea.remove();
            }

            this.setToast('Copied to clipboard');
        } catch (error) {
            console.error('Copy failed', error);
            this.setToast('Copy failed on this page');
        }
    }

    downloadText(filename, content) {
        chrome.runtime.sendMessage(
            {
                action: 'downloadText',
                filename,
                content
            },
            (response) => {
                if (chrome.runtime.lastError) {
                    this.setToast('Download failed');
                    return;
                }

                if (response?.status === 'download-started') {
                    this.setToast('Download started');
                } else {
                    this.setToast('Download could not start');
                }
            }
        );
    }

    getCurrentExportText() {
        if (this.mode === 'export-element') {
            return this.panel.querySelector('#toolbox-export-output')?.value || '';
        }

        if (this.mode === 'table-capture') {
            return this.panel.querySelector('#toolbox-table-output')?.value || '';
        }

        if (this.mode === 'api-tester') {
            return this.panel.querySelector('#toolbox-api-response')?.value || '';
        }

        if (this.mode === 'broken-links') {
            return this.panel.querySelector('#toolbox-broken-output')?.value || '';
        }

        if (this.mode === 'redirect-path') {
            return this.panel.querySelector('#toolbox-redirect-output')?.value || '';
        }

        if (this.mode === 'pagespeed-insights') {
            return this.panel.querySelector('#toolbox-pagespeed-output')?.value || '';
        }

        if (this.mode === 'stripe-analytics') {
            return this.panel.querySelector('#toolbox-stripe-blueprint')?.value || '';
        }

        if (this.mode === 'cookie-editor') {
            return this.collectCookieText();
        }

        if (this.mode === 'page-outliner') {
            return this.collectHeadingText();
        }

        return '';
    }

    copyCurrentMode() {
        const text = this.getCurrentExportText();
        if (!text) {
            this.setToast('No text to copy for this mode');
            return;
        }

        this.copyText(text);
    }

    downloadCurrentMode() {
        const text = this.getCurrentExportText();
        if (!text) {
            this.setToast('No export available for this mode');
            return;
        }

        const host = (window.location.hostname || 'page').replace(/[^a-z0-9.-]/gi, '-');
        this.downloadText(`${host}-${this.mode}.txt`, text);
    }

    renderExportElement() {
        this.setLead('Pick any element on the page, then export its selector, text, and HTML markup.');
        this.setBodyHTML(`
            <div class="toolbox-browser-grid">
                <div class="toolbox-browser-row">
                    <button class="toolbox-browser-btn" id="toolbox-export-pick" type="button">Pick element</button>
                    <span class="toolbox-browser-muted" id="toolbox-export-meta">No element selected yet.</span>
                </div>
                <textarea id="toolbox-export-output" class="toolbox-browser-textarea" readonly></textarea>
            </div>
        `);

        const pickButton = this.panel.querySelector('#toolbox-export-pick');
        const meta = this.panel.querySelector('#toolbox-export-meta');
        const output = this.panel.querySelector('#toolbox-export-output');

        pickButton.addEventListener('click', () => {
            this.beginPick((element) => {
                const selector = this.getSelectorForElement(element);
                const text = (element.innerText || element.textContent || '').replace(/\s+/g, ' ').trim();
                const html = element.outerHTML || '';
                const payload = [
                    `URL: ${window.location.href}`,
                    `Selector: ${selector}`,
                    `Tag: ${element.tagName.toLowerCase()}`,
                    `Text:`,
                    text || '[empty]',
                    '',
                    'HTML:',
                    html
                ].join('\n');

                meta.textContent = `${element.tagName.toLowerCase()} exported from ${selector}`;
                output.value = payload;
            });
        });
    }

    collectHeadings() {
        return Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
            .filter((heading) => !heading.closest('[data-toolbox-ui="true"]'))
            .slice(0, 300)
            .map((heading, index) => ({
                index,
                level: Number(heading.tagName.substring(1)),
                text: (heading.innerText || heading.textContent || '').replace(/\s+/g, ' ').trim(),
                element: heading
            }));
    }

    clearHeadingHighlights() {
        const highlighted = document.querySelectorAll('.toolbox-browser-heading-mark');
        for (const element of highlighted) {
            element.classList.remove('toolbox-browser-heading-mark');
        }
    }

    collectHeadingText() {
        return this.collectHeadings()
            .map((heading) => `${'#'.repeat(Math.max(1, heading.level))} ${heading.text}`)
            .join('\n');
    }

    renderPageOutliner() {
        this.setLead('Outline all headings on the page and jump to any section quickly.');

        const headings = this.collectHeadings();
        if (!headings.length) {
            this.setBodyHTML('<div class="toolbox-browser-empty">No headings were found on this page.</div>');
            return;
        }

        const items = headings.map((heading) => {
            const indent = Math.max(0, heading.level - 1) * 14;
            const safeText = this.escapeHTML(heading.text || '(empty heading)');
            return `
                <button class="toolbox-browser-list-item" type="button" data-heading-index="${heading.index}" style="text-align:left; padding-left:${10 + indent}px;">
                    <strong>H${heading.level}</strong>
                    <span>${safeText}</span>
                </button>
            `;
        }).join('');

        this.setBodyHTML(`
            <div class="toolbox-browser-grid">
                <div>
                    <span class="toolbox-browser-pill">${headings.length} heading(s)</span>
                    <button class="toolbox-browser-btn" id="toolbox-outline-refresh" type="button">Refresh</button>
                </div>
                <div class="toolbox-browser-list">${items}</div>
            </div>
        `);

        this.clearHeadingHighlights();

        this.panel.querySelector('#toolbox-outline-refresh').addEventListener('click', () => this.renderPageOutliner());
        this.panel.querySelectorAll('[data-heading-index]').forEach((button) => {
            button.addEventListener('click', () => {
                const index = Number(button.getAttribute('data-heading-index'));
                const heading = headings.find((item) => item.index === index);
                if (!heading?.element) {
                    return;
                }

                this.clearHeadingHighlights();
                heading.element.classList.add('toolbox-browser-heading-mark');
                heading.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        });
    }

    renderImageReplacer() {
        this.setLead('Select an image, enter a new image URL, and replace it live on the page.');
        this.setBodyHTML(`
            <div class="toolbox-browser-grid">
                <div class="toolbox-browser-row">
                    <button class="toolbox-browser-btn" id="toolbox-image-pick" type="button">Pick image</button>
                    <span class="toolbox-browser-muted" id="toolbox-image-meta">No image selected yet.</span>
                </div>
                <div class="toolbox-browser-row">
                    <label class="toolbox-browser-muted" for="toolbox-image-url">Replacement URL</label>
                    <input id="toolbox-image-url" class="toolbox-browser-input" type="url" placeholder="https://example.com/replacement.jpg">
                </div>
                <div class="toolbox-browser-two-col">
                    <button class="toolbox-browser-btn" id="toolbox-image-apply" type="button">Apply replacement</button>
                    <button class="toolbox-browser-btn" id="toolbox-image-reset" type="button">Reset selected image</button>
                </div>
            </div>
        `);

        const pickButton = this.panel.querySelector('#toolbox-image-pick');
        const meta = this.panel.querySelector('#toolbox-image-meta');
        const input = this.panel.querySelector('#toolbox-image-url');

        pickButton.addEventListener('click', () => {
            this.beginPick((element) => {
                this.lastPickedElement = element;
                if (!element.dataset.toolboxOriginalSrc) {
                    element.dataset.toolboxOriginalSrc = element.getAttribute('src') || '';
                }

                meta.textContent = `Selected ${element.tagName.toLowerCase()} (${element.naturalWidth || '?'}x${element.naturalHeight || '?'})`;
                input.value = element.currentSrc || element.src || '';
            }, (element) => element.tagName === 'IMG');
        });

        this.panel.querySelector('#toolbox-image-apply').addEventListener('click', () => {
            const image = this.lastPickedElement;
            if (!image || image.tagName !== 'IMG') {
                this.setToast('Pick an image first');
                return;
            }

            const url = this.safeUrl(input.value.trim());
            if (!url) {
                this.setToast('Enter a valid image URL');
                return;
            }

            image.setAttribute('src', url);
            image.setAttribute('srcset', '');
            this.setToast('Image replaced');
        });

        this.panel.querySelector('#toolbox-image-reset').addEventListener('click', () => {
            const image = this.lastPickedElement;
            if (!image || image.tagName !== 'IMG') {
                this.setToast('Pick an image first');
                return;
            }

            image.setAttribute('src', image.dataset.toolboxOriginalSrc || '');
            this.setToast('Image reset');
        });
    }

    normalizeUrlList(text) {
        return text
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => this.safeUrl(line.startsWith('http://') || line.startsWith('https://') ? line : `https://${line}`))
            .filter(Boolean);
    }

    renderOpenMultipleUrls() {
        this.setLead('Paste one URL per line and open them in new tabs in this window.');
        this.setBodyHTML(`
            <div class="toolbox-browser-grid">
                <textarea id="toolbox-open-urls" class="toolbox-browser-textarea" placeholder="https://example.com\nnews.ycombinator.com\nhttps://developer.chrome.com"></textarea>
                <button class="toolbox-browser-btn" id="toolbox-open-urls-action" type="button">Open URLs</button>
                <span class="toolbox-browser-muted" id="toolbox-open-urls-status"></span>
            </div>
        `);

        this.panel.querySelector('#toolbox-open-urls-action').addEventListener('click', () => {
            const input = this.panel.querySelector('#toolbox-open-urls');
            const status = this.panel.querySelector('#toolbox-open-urls-status');
            const urls = this.normalizeUrlList(input.value || '');

            if (!urls.length) {
                status.textContent = 'No valid URLs were found.';
                return;
            }

            chrome.runtime.sendMessage({ action: 'openMultipleUrls', urls }, (response) => {
                if (chrome.runtime.lastError) {
                    status.textContent = 'Failed to open URLs';
                    return;
                }

                status.textContent = `Opened ${response?.opened || 0} tab(s).`;
            });
        });
    }

    collectTables() {
        return Array.from(document.querySelectorAll('table'))
            .filter((table) => !table.closest('[data-toolbox-ui="true"]'));
    }

    tableToRows(table) {
        const rows = Array.from(table.querySelectorAll('tr'));
        return rows.map((row) => {
            const cells = Array.from(row.querySelectorAll('th, td'));
            return cells.map((cell) => (cell.innerText || cell.textContent || '').replace(/\s+/g, ' ').trim());
        });
    }

    rowsToCsv(rows) {
        return rows
            .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n');
    }

    rowsToMarkdown(rows) {
        if (!rows.length) {
            return '';
        }

        const header = rows[0];
        const divider = header.map(() => '---');
        const body = rows.slice(1);
        const lines = [header, divider, ...body].map((row) => `| ${row.join(' | ')} |`);
        return lines.join('\n');
    }

    renderTableCapture() {
        this.setLead('Capture table data and export it as CSV or Markdown.');

        const tables = this.collectTables();
        if (!tables.length) {
            this.setBodyHTML('<div class="toolbox-browser-empty">No table elements were found on this page.</div>');
            return;
        }

        const options = tables.map((_, index) => `<option value="${index}">Table ${index + 1}</option>`).join('');
        this.setBodyHTML(`
            <div class="toolbox-browser-grid">
                <div class="toolbox-browser-two-col">
                    <select id="toolbox-table-select" class="toolbox-browser-select">${options}</select>
                    <select id="toolbox-table-format" class="toolbox-browser-select">
                        <option value="csv">CSV</option>
                        <option value="markdown">Markdown</option>
                    </select>
                </div>
                <button class="toolbox-browser-btn" id="toolbox-table-generate" type="button">Generate capture</button>
                <textarea id="toolbox-table-output" class="toolbox-browser-textarea" readonly></textarea>
            </div>
        `);

        const generate = () => {
            const tableIndex = Number(this.panel.querySelector('#toolbox-table-select').value);
            const format = this.panel.querySelector('#toolbox-table-format').value;
            const output = this.panel.querySelector('#toolbox-table-output');
            const rows = this.tableToRows(tables[tableIndex] || tables[0]);

            output.value = format === 'markdown' ? this.rowsToMarkdown(rows) : this.rowsToCsv(rows);
        };

        this.panel.querySelector('#toolbox-table-generate').addEventListener('click', generate);
        generate();
    }

    collectCookieText() {
        const rows = this.panel.querySelectorAll('.toolbox-browser-cookie-row');
        return Array.from(rows).map((row) => {
            const name = row.getAttribute('data-name') || '';
            const value = row.getAttribute('data-value') || '';
            return `${name}=${value}`;
        }).join('\n');
    }

    renderCookieEditor() {
        this.setLead('Inspect cookies for this URL and add or remove values.');
        this.setBodyHTML(`
            <div class="toolbox-browser-grid">
                <div class="toolbox-browser-kv">
                    <span class="toolbox-browser-muted">Current URL</span>
                    <input id="toolbox-cookie-url" class="toolbox-browser-input" type="text" readonly>
                    <button class="toolbox-browser-btn" id="toolbox-cookie-refresh" type="button">Refresh cookies</button>
                </div>
                <div class="toolbox-browser-kv">
                    <div class="toolbox-browser-two-col">
                        <input id="toolbox-cookie-name" class="toolbox-browser-input" type="text" placeholder="Cookie name">
                        <input id="toolbox-cookie-value" class="toolbox-browser-input" type="text" placeholder="Cookie value">
                    </div>
                    <div class="toolbox-browser-two-col">
                        <input id="toolbox-cookie-path" class="toolbox-browser-input" type="text" placeholder="Path" value="/">
                        <select id="toolbox-cookie-samesite" class="toolbox-browser-select">
                            <option value="">SameSite default</option>
                            <option value="lax">Lax</option>
                            <option value="strict">Strict</option>
                            <option value="no_restriction">None</option>
                        </select>
                    </div>
                    <button class="toolbox-browser-btn" id="toolbox-cookie-add" type="button">Set cookie</button>
                </div>
                <div id="toolbox-cookie-list" class="toolbox-browser-list"></div>
            </div>
        `);

        const urlInput = this.panel.querySelector('#toolbox-cookie-url');
        urlInput.value = window.location.href;

        const refreshCookies = () => {
            chrome.runtime.sendMessage({ action: 'getCookiesForUrl', url: window.location.href }, (response) => {
                if (chrome.runtime.lastError) {
                    this.panel.querySelector('#toolbox-cookie-list').innerHTML = '<div class="toolbox-browser-empty">Unable to read cookies for this page.</div>';
                    return;
                }

                const cookies = response?.cookies || [];
                if (!cookies.length) {
                    this.panel.querySelector('#toolbox-cookie-list').innerHTML = '<div class="toolbox-browser-empty">No cookies found for this URL.</div>';
                    return;
                }

                const html = cookies.map((cookie) => `
                    <div class="toolbox-browser-cookie-row" data-name="${this.escapeHTML(cookie.name)}" data-value="${this.escapeHTML(cookie.value)}" data-path="${this.escapeHTML(cookie.path || '/')}" data-store="${this.escapeHTML(cookie.storeId || '')}">
                        <strong>${this.escapeHTML(cookie.name)}</strong>
                        <span class="toolbox-browser-muted">${this.escapeHTML(cookie.value)}</span>
                        <span class="toolbox-browser-cookie-meta">path=${this.escapeHTML(cookie.path || '/')} | domain=${this.escapeHTML(cookie.domain || '')} | secure=${cookie.secure ? 'yes' : 'no'} | httpOnly=${cookie.httpOnly ? 'yes' : 'no'}</span>
                        <button class="toolbox-browser-btn" type="button" data-cookie-delete="${this.escapeHTML(cookie.name)}">Delete</button>
                    </div>
                `).join('');

                this.panel.querySelector('#toolbox-cookie-list').innerHTML = html;

                this.panel.querySelectorAll('[data-cookie-delete]').forEach((button) => {
                    button.addEventListener('click', () => {
                        const row = button.closest('.toolbox-browser-cookie-row');
                        const name = row?.getAttribute('data-name') || '';
                        const path = row?.getAttribute('data-path') || '/';
                        const storeId = row?.getAttribute('data-store') || undefined;

                        chrome.runtime.sendMessage(
                            {
                                action: 'removeCookieForUrl',
                                url: window.location.href,
                                name,
                                path,
                                storeId
                            },
                            () => refreshCookies()
                        );
                    });
                });
            });
        };

        this.panel.querySelector('#toolbox-cookie-refresh').addEventListener('click', refreshCookies);
        this.panel.querySelector('#toolbox-cookie-add').addEventListener('click', () => {
            const name = this.panel.querySelector('#toolbox-cookie-name').value.trim();
            const value = this.panel.querySelector('#toolbox-cookie-value').value;
            const path = this.panel.querySelector('#toolbox-cookie-path').value.trim() || '/';
            const sameSite = this.panel.querySelector('#toolbox-cookie-samesite').value;

            if (!name) {
                this.setToast('Cookie name is required');
                return;
            }

            chrome.runtime.sendMessage(
                {
                    action: 'setCookieForUrl',
                    url: window.location.href,
                    name,
                    value,
                    path,
                    sameSite
                },
                (response) => {
                    if (chrome.runtime.lastError || response?.status === 'error') {
                        this.setToast('Failed to set cookie');
                        return;
                    }

                    this.setToast('Cookie saved');
                    refreshCookies();
                }
            );
        });

        refreshCookies();
    }

    parseHeaders(text) {
        const headers = {};
        const lines = String(text || '').split('\n').map((line) => line.trim()).filter(Boolean);

        for (const line of lines) {
            const index = line.indexOf(':');
            if (index === -1) {
                continue;
            }

            const key = line.slice(0, index).trim();
            const value = line.slice(index + 1).trim();
            if (key) {
                headers[key] = value;
            }
        }

        return headers;
    }

    renderApiTester() {
        this.setLead('Run HTTP requests from the extension background context and inspect response data.');
        this.setBodyHTML(`
            <div class="toolbox-browser-grid">
                <div class="toolbox-browser-two-col">
                    <select id="toolbox-api-method" class="toolbox-browser-select">
                        <option>GET</option>
                        <option>POST</option>
                        <option>PUT</option>
                        <option>PATCH</option>
                        <option>DELETE</option>
                        <option>HEAD</option>
                    </select>
                    <input id="toolbox-api-url" class="toolbox-browser-input" type="url" placeholder="https://httpbin.org/get">
                </div>
                <div class="toolbox-browser-row">
                    <label class="toolbox-browser-muted" for="toolbox-api-headers">Headers (one per line: Key: Value)</label>
                    <textarea id="toolbox-api-headers" class="toolbox-browser-textarea" style="min-height:100px;"></textarea>
                </div>
                <div class="toolbox-browser-row">
                    <label class="toolbox-browser-muted" for="toolbox-api-body">Request body</label>
                    <textarea id="toolbox-api-body" class="toolbox-browser-textarea" style="min-height:120px;"></textarea>
                </div>
                <button class="toolbox-browser-btn" id="toolbox-api-send" type="button">Send request</button>
                <div class="toolbox-browser-block">
                    <div id="toolbox-api-meta" class="toolbox-browser-muted">No request sent yet.</div>
                    <textarea id="toolbox-api-response" class="toolbox-browser-textarea" readonly style="min-height:180px;"></textarea>
                </div>
            </div>
        `);

        this.panel.querySelector('#toolbox-api-send').addEventListener('click', () => {
            const method = this.panel.querySelector('#toolbox-api-method').value;
            const url = this.safeUrl(this.panel.querySelector('#toolbox-api-url').value.trim());
            const headers = this.parseHeaders(this.panel.querySelector('#toolbox-api-headers').value);
            const bodyText = this.panel.querySelector('#toolbox-api-body').value;
            const meta = this.panel.querySelector('#toolbox-api-meta');
            const output = this.panel.querySelector('#toolbox-api-response');

            if (!url) {
                meta.textContent = 'Please enter a valid HTTP or HTTPS URL.';
                return;
            }

            meta.textContent = `Sending ${method} request...`;

            chrome.runtime.sendMessage(
                {
                    action: 'proxyFetch',
                    url,
                    method,
                    headers,
                    body: method === 'GET' || method === 'HEAD' ? '' : bodyText
                },
                (response) => {
                    if (chrome.runtime.lastError || response?.status === 'error') {
                        meta.textContent = response?.message || chrome.runtime.lastError?.message || 'Request failed';
                        output.value = '';
                        return;
                    }

                    const statusLine = `${response.statusCode} ${response.statusText}`;
                    meta.textContent = `${statusLine} | ${response.finalUrl}`;
                    output.value = this.formatApiResponse(response);
                }
            );
        });
    }

    formatApiResponse(response) {
        const lines = [];
        lines.push(`Status: ${response.statusCode} ${response.statusText}`);
        lines.push(`URL: ${response.finalUrl}`);
        lines.push('');
        lines.push('Headers:');

        const headers = response.headers || {};
        for (const key of Object.keys(headers)) {
            lines.push(`${key}: ${headers[key]}`);
        }

        lines.push('');
        lines.push('Body:');

        const bodyText = response.body || '';
        try {
            const parsed = JSON.parse(bodyText);
            lines.push(JSON.stringify(parsed, null, 2));
        } catch (error) {
            lines.push(bodyText);
        }

        return lines.join('\n').trim();
    }

    renderCurrencyConverter() {
        this.setLead('Convert values between currencies using the Frankfurter exchange rate API.');
        this.setBodyHTML(`
            <div class="toolbox-browser-grid">
                <div class="toolbox-browser-two-col">
                    <input id="toolbox-currency-amount" class="toolbox-browser-input" type="number" step="0.01" min="0" value="1">
                    <div class="toolbox-browser-two-col">
                        <input id="toolbox-currency-from" class="toolbox-browser-input" type="text" maxlength="3" value="USD" placeholder="USD">
                        <input id="toolbox-currency-to" class="toolbox-browser-input" type="text" maxlength="3" value="EUR" placeholder="EUR">
                    </div>
                </div>
                <button class="toolbox-browser-btn" id="toolbox-currency-convert" type="button">Convert</button>
                <div class="toolbox-browser-block" id="toolbox-currency-result">No conversion yet.</div>
            </div>
        `);

        this.panel.querySelector('#toolbox-currency-convert').addEventListener('click', () => {
            const amount = Number(this.panel.querySelector('#toolbox-currency-amount').value || '0');
            const from = this.panel.querySelector('#toolbox-currency-from').value.trim().toUpperCase();
            const to = this.panel.querySelector('#toolbox-currency-to').value.trim().toUpperCase();
            const result = this.panel.querySelector('#toolbox-currency-result');

            if (!amount || !from || !to || from.length !== 3 || to.length !== 3) {
                result.textContent = 'Enter a valid amount and 3-letter currency codes.';
                return;
            }

            const apiUrl = `https://api.frankfurter.app/latest?amount=${encodeURIComponent(amount)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;

            chrome.runtime.sendMessage(
                {
                    action: 'proxyFetch',
                    url: apiUrl,
                    method: 'GET',
                    headers: {},
                    body: ''
                },
                (response) => {
                    if (chrome.runtime.lastError || response?.status === 'error') {
                        result.textContent = 'Currency lookup failed.';
                        return;
                    }

                    try {
                        const data = JSON.parse(response.body || '{}');
                        const value = data?.rates?.[to];
                        if (typeof value !== 'number') {
                            result.textContent = 'No rate returned for that pair.';
                            return;
                        }

                        result.innerHTML = `
                            <div><span class="toolbox-browser-pill">${amount} ${from}</span> = <span class="toolbox-browser-pill">${value.toFixed(4)} ${to}</span></div>
                            <div class="toolbox-browser-muted">Rate date: ${this.escapeHTML(data.date || 'unknown')}</div>
                        `;
                    } catch (error) {
                        result.textContent = 'Unable to parse currency response.';
                    }
                }
            );
        });
    }

    rgbToHex(color) {
        const parts = String(color || '').match(/rgba?\(([^)]+)\)/i);
        if (!parts) {
            return '';
        }

        const [r, g, b] = parts[1]
            .split(',')
            .slice(0, 3)
            .map((value) => Math.max(0, Math.min(255, Number.parseFloat(value) || 0)));

        const toHex = (value) => value.toString(16).padStart(2, '0');
        return `#${toHex(Math.round(r))}${toHex(Math.round(g))}${toHex(Math.round(b))}`;
    }

    parseRgb(color) {
        const parts = String(color || '').match(/rgba?\(([^)]+)\)/i);
        if (!parts) {
            return null;
        }

        const channels = parts[1].split(',').map((value) => Number.parseFloat(value.trim()));
        return {
            r: Math.max(0, Math.min(255, channels[0] || 0)),
            g: Math.max(0, Math.min(255, channels[1] || 0)),
            b: Math.max(0, Math.min(255, channels[2] || 0)),
            a: Number.isFinite(channels[3]) ? Math.max(0, Math.min(1, channels[3])) : 1
        };
    }

    isTransparentColor(color) {
        const parsed = this.parseRgb(color);
        if (!parsed) {
            return false;
        }

        return parsed.a === 0;
    }

    getEffectiveBackgroundColor(element) {
        let current = element;
        while (current && current instanceof Element) {
            const bg = getComputedStyle(current).backgroundColor;
            if (bg && !this.isTransparentColor(bg)) {
                return bg;
            }
            current = current.parentElement;
        }

        return 'rgb(255, 255, 255)';
    }

    getLuminance({ r, g, b }) {
        const transform = (channel) => {
            const value = channel / 255;
            return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
        };

        const rs = transform(r);
        const gs = transform(g);
        const bs = transform(b);
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }

    getContrastRatio(foreground, background) {
        const fg = this.parseRgb(foreground);
        const bg = this.parseRgb(background);

        if (!fg || !bg) {
            return 21;
        }

        const l1 = this.getLuminance(fg);
        const l2 = this.getLuminance(bg);
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
    }

    collectAccessibilityData() {
        const images = Array.from(document.querySelectorAll('img')).filter((img) => !img.closest('[data-toolbox-ui="true"]'));
        const missingAlt = images.filter((img) => {
            if (img.getAttribute('role') === 'presentation') {
                return false;
            }

            return !img.hasAttribute('alt') || img.getAttribute('alt') === null;
        });

        const controls = Array.from(document.querySelectorAll('input, select, textarea'))
            .filter((control) => !control.closest('[data-toolbox-ui="true"]'))
            .filter((control) => !['hidden', 'submit', 'reset', 'button', 'image'].includes((control.type || '').toLowerCase()));

        const unlabeledControls = controls.filter((control) => {
            const hasLabelTag = control.labels && control.labels.length > 0;
            const hasAria = control.hasAttribute('aria-label') || control.hasAttribute('aria-labelledby');
            const hasTitle = control.hasAttribute('title');
            return !(hasLabelTag || hasAria || hasTitle);
        });

        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
            .filter((heading) => !heading.closest('[data-toolbox-ui="true"]'));

        const headingOrderIssues = [];
        let previousLevel = 0;
        headings.forEach((heading) => {
            const level = Number(heading.tagName.substring(1));
            if (previousLevel && level - previousLevel > 1) {
                headingOrderIssues.push({
                    text: (heading.innerText || heading.textContent || '').replace(/\s+/g, ' ').trim() || '(empty heading)',
                    from: previousLevel,
                    to: level
                });
            }

            previousLevel = level;
        });

        const links = Array.from(document.querySelectorAll('a[href]')).filter((link) => !link.closest('[data-toolbox-ui="true"]'));
        const weakLinks = links.filter((link) => {
            const label = (link.innerText || link.textContent || '').replace(/\s+/g, '').trim();
            const hasAria = link.hasAttribute('aria-label') || link.hasAttribute('aria-labelledby');
            return !label && !hasAria;
        });

        const contrastCandidates = Array.from(document.querySelectorAll('p, span, a, button, li, label, h1, h2, h3, h4, h5, h6'))
            .filter((element) => !element.closest('[data-toolbox-ui="true"]'))
            .slice(0, 240);

        const contrastIssues = [];
        for (const element of contrastCandidates) {
            const text = (element.innerText || element.textContent || '').replace(/\s+/g, ' ').trim();
            if (!text) {
                continue;
            }

            const style = getComputedStyle(element);
            if (style.visibility === 'hidden' || style.display === 'none' || Number.parseFloat(style.opacity || '1') < 0.05) {
                continue;
            }

            const color = style.color;
            const background = this.getEffectiveBackgroundColor(element);
            const ratio = this.getContrastRatio(color, background);
            const fontSize = Number.parseFloat(style.fontSize || '16');
            const fontWeight = Number.parseInt(style.fontWeight || '400', 10);
            const isLargeText = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700);
            const threshold = isLargeText ? 3 : 4.5;

            if (ratio < threshold) {
                contrastIssues.push({
                    text: text.slice(0, 120),
                    ratio,
                    color: this.rgbToHex(color) || color,
                    background: this.rgbToHex(background) || background
                });
            }

            if (contrastIssues.length >= 25) {
                break;
            }
        }

        return {
            totals: {
                images: images.length,
                controls: controls.length,
                headings: headings.length,
                links: links.length
            },
            missingAlt,
            unlabeledControls,
            headingOrderIssues,
            weakLinks,
            contrastIssues
        };
    }

    renderAccessibilityTools() {
        this.setLead('Run a fast accessibility pass for alt text, labels, heading order, and potential color contrast issues.');

        const data = this.collectAccessibilityData();
        const summary = [
            `Images: ${data.totals.images} (missing alt: ${data.missingAlt.length})`,
            `Form controls: ${data.totals.controls} (unlabeled: ${data.unlabeledControls.length})`,
            `Headings: ${data.totals.headings} (order issues: ${data.headingOrderIssues.length})`,
            `Links: ${data.totals.links} (empty labels: ${data.weakLinks.length})`,
            `Contrast warnings: ${data.contrastIssues.length}`
        ];

        const contrastRows = data.contrastIssues.length
            ? data.contrastIssues.map((item) => `
                <div class="toolbox-browser-list-item">
                    <strong>Ratio ${item.ratio.toFixed(2)}:1</strong>
                    <span>${this.escapeHTML(item.text)}</span>
                    <span class="toolbox-browser-muted">Text ${this.escapeHTML(item.color)} on ${this.escapeHTML(item.background)}</span>
                </div>
            `).join('')
            : '<div class="toolbox-browser-empty">No low-contrast samples were detected in the inspected elements.</div>';

        const headingRows = data.headingOrderIssues.length
            ? data.headingOrderIssues.map((item) => `
                <div class="toolbox-browser-list-item">
                    <strong>Heading jump H${item.from} to H${item.to}</strong>
                    <span>${this.escapeHTML(item.text)}</span>
                </div>
            `).join('')
            : '<div class="toolbox-browser-empty">No heading order jumps were found.</div>';

        this.setBodyHTML(`
            <div class="toolbox-browser-grid">
                <div class="toolbox-browser-kv">
                    <strong>Audit Summary</strong>
                    ${summary.map((row) => `<span class="toolbox-browser-muted">${this.escapeHTML(row)}</span>`).join('')}
                    <button class="toolbox-browser-btn" id="toolbox-a11y-refresh" type="button">Run audit again</button>
                </div>
                <div class="toolbox-browser-kv">
                    <strong>Heading Structure</strong>
                    <div class="toolbox-browser-list">${headingRows}</div>
                </div>
                <div class="toolbox-browser-kv">
                    <strong>Contrast Warnings</strong>
                    <div class="toolbox-browser-list">${contrastRows}</div>
                </div>
            </div>
        `);

        this.panel.querySelector('#toolbox-a11y-refresh').addEventListener('click', () => this.renderAccessibilityTools());
    }

    detectSiteStack() {
        const html = document.documentElement.outerHTML.slice(0, 200000).toLowerCase();
        const scripts = Array.from(document.scripts).map((script) => (script.src || '').toLowerCase());
        const generators = Array.from(document.querySelectorAll('meta[name="generator"]'))
            .map((meta) => (meta.getAttribute('content') || '').toLowerCase());

        const hasScript = (pattern) => scripts.some((src) => pattern.test(src));
        const hasHtml = (pattern) => pattern.test(html);
        const hasGenerator = (pattern) => generators.some((value) => pattern.test(value));

        const detections = [
            ['WordPress', hasGenerator(/wordpress/) || hasHtml(/wp-content|wp-includes|wp-json/)],
            ['Shopify', hasHtml(/cdn\.shopify\.com|shopify\.theme/) || hasGenerator(/shopify/)],
            ['Wix', hasHtml(/wixstatic|_wix/) || hasGenerator(/wix/)],
            ['Squarespace', hasHtml(/squarespace\.com|static\.squarespace/) || hasGenerator(/squarespace/)],
            ['React', Boolean(window.__REACT_DEVTOOLS_GLOBAL_HOOK__) || hasHtml(/data-reactroot|react-dom/) || hasScript(/react(\.min)?\.js/)],
            ['Vue', Boolean(window.__VUE_DEVTOOLS_GLOBAL_HOOK__) || hasHtml(/data-v-/) || hasScript(/vue(\.runtime)?(\.min)?\.js/)],
            ['Angular', hasHtml(/ng-version|ng-app/) || hasScript(/angular(\.min)?\.js/)],
            ['Next.js', hasHtml(/_next\//) || Boolean(window.__NEXT_DATA__)],
            ['Nuxt', hasHtml(/__nuxt|_nuxt\//) || Boolean(window.__NUXT__)],
            ['jQuery', Boolean(window.jQuery) || hasScript(/jquery/)],
            ['Bootstrap', hasScript(/bootstrap/) || hasHtml(/class="[^"]*\bcontainer(-fluid)?\b/)],
            ['Tailwind CSS', hasHtml(/tailwindcss|class="[^"]*(?:\s|^)md:|lg:|xl:/)],
            ['Google Analytics', hasScript(/google-analytics|gtag\/js/) || hasHtml(/gtag\(|ga\('create'/)],
            ['Google Tag Manager', hasScript(/googletagmanager/) || hasHtml(/gtm\.js|google tag manager/)],
            ['Cloudflare', hasScript(/cloudflare/) || hasHtml(/cf-ray|__cf_bm|cdn-cgi/)],
            ['Hotjar', hasScript(/hotjar/) || hasHtml(/hj\('trigger'/)],
            ['Segment', hasScript(/segment\.com|cdn\.segment\.com/) || hasHtml(/analytics\.load\(/)]
        ];

        return detections
            .filter(([, matched]) => Boolean(matched))
            .map(([label]) => label);
    }

    renderSiteStack() {
        this.setLead('Detect likely frameworks, CMS, analytics, and platform signals from the current page.');
        const matches = this.detectSiteStack();

        if (!matches.length) {
            this.setBodyHTML(`
                <div class="toolbox-browser-grid">
                    <div class="toolbox-browser-empty">No known stack signatures were detected from this heuristic pass.</div>
                    <button class="toolbox-browser-btn" id="toolbox-stack-refresh" type="button">Run detection again</button>
                </div>
            `);
            this.panel.querySelector('#toolbox-stack-refresh').addEventListener('click', () => this.renderSiteStack());
            return;
        }

        const rows = matches
            .map((match) => `<div class="toolbox-browser-list-item"><strong>${this.escapeHTML(match)}</strong><span class="toolbox-browser-muted">Heuristic signature matched</span></div>`)
            .join('');

        this.setBodyHTML(`
            <div class="toolbox-browser-grid">
                <div>
                    <span class="toolbox-browser-pill">${matches.length} detection(s)</span>
                    <button class="toolbox-browser-btn" id="toolbox-stack-refresh" type="button">Run detection again</button>
                </div>
                <div class="toolbox-browser-list">${rows}</div>
            </div>
        `);

        this.panel.querySelector('#toolbox-stack-refresh').addEventListener('click', () => this.renderSiteStack());
    }

    collectPageLinks(limit = 120) {
        const links = Array.from(document.querySelectorAll('a[href]'))
            .filter((link) => !link.closest('[data-toolbox-ui="true"]'))
            .map((link) => link.getAttribute('href') || '')
            .map((href) => this.safeUrl(href))
            .filter(Boolean);

        const unique = Array.from(new Set(links));
        return {
            urls: unique.slice(0, limit),
            totalUnique: unique.length
        };
    }

    renderBrokenLinks() {
        this.setLead('Check links on the current page and report broken or blocked responses.');
        this.setBodyHTML(`
            <div class="toolbox-browser-grid">
                <div class="toolbox-browser-kv">
                    <strong>Broken Link Scan</strong>
                    <span class="toolbox-browser-muted" id="toolbox-broken-meta">Ready to scan this page.</span>
                    <button class="toolbox-browser-btn" id="toolbox-broken-run" type="button">Scan links</button>
                </div>
                <div id="toolbox-broken-list" class="toolbox-browser-list"></div>
                <textarea id="toolbox-broken-output" class="toolbox-browser-textarea" readonly style="min-height:180px;"></textarea>
            </div>
        `);

        this.panel.querySelector('#toolbox-broken-run').addEventListener('click', () => {
            const meta = this.panel.querySelector('#toolbox-broken-meta');
            const list = this.panel.querySelector('#toolbox-broken-list');
            const output = this.panel.querySelector('#toolbox-broken-output');
            const payload = this.collectPageLinks();

            if (!payload.urls.length) {
                meta.textContent = 'No valid HTTP/HTTPS links were found on this page.';
                list.innerHTML = '<div class="toolbox-browser-empty">Nothing to scan.</div>';
                output.value = '';
                return;
            }

            meta.textContent = `Checking ${payload.urls.length} link(s)...`;
            list.innerHTML = '';

            chrome.runtime.sendMessage(
                {
                    action: 'checkBrokenLinks',
                    urls: payload.urls
                },
                (response) => {
                    if (chrome.runtime.lastError || response?.status === 'error') {
                        meta.textContent = response?.message || chrome.runtime.lastError?.message || 'Link scan failed.';
                        list.innerHTML = '<div class="toolbox-browser-empty">Unable to complete link scan.</div>';
                        return;
                    }

                    const items = Array.isArray(response.results) ? response.results : [];
                    const broken = items.filter((item) => item.broken);
                    meta.textContent = `Scanned ${items.length} / ${payload.totalUnique} unique link(s). Broken or blocked: ${broken.length}.`;

                    if (!broken.length) {
                        list.innerHTML = '<div class="toolbox-browser-empty">No broken links found in this scan sample.</div>';
                    } else {
                        list.innerHTML = broken.map((item) => `
                            <div class="toolbox-browser-list-item">
                                <strong>${this.escapeHTML(item.statusLabel || 'Request failed')}</strong>
                                <a href="${this.escapeHTML(item.url)}" target="_blank" rel="noreferrer">${this.escapeHTML(item.url)}</a>
                                <span class="toolbox-browser-muted">${this.escapeHTML(item.note || '')}</span>
                            </div>
                        `).join('');
                    }

                    const lines = items.map((item) => {
                        const status = item.statusCode ? `${item.statusCode}` : 'ERR';
                        return `[${status}] ${item.url}${item.note ? ` (${item.note})` : ''}`;
                    });
                    output.value = lines.join('\n');
                }
            );
        });
    }

    renderRedirectPath() {
        this.setLead('Trace the redirect path for a URL and inspect each status transition.');
        this.setBodyHTML(`
            <div class="toolbox-browser-grid">
                <div class="toolbox-browser-kv">
                    <label class="toolbox-browser-muted" for="toolbox-redirect-url">Start URL</label>
                    <input id="toolbox-redirect-url" class="toolbox-browser-input" type="url" value="${this.escapeHTML(window.location.href)}">
                    <button class="toolbox-browser-btn" id="toolbox-redirect-run" type="button">Trace redirects</button>
                    <span class="toolbox-browser-muted" id="toolbox-redirect-meta">Ready.</span>
                </div>
                <div id="toolbox-redirect-list" class="toolbox-browser-list"></div>
                <textarea id="toolbox-redirect-output" class="toolbox-browser-textarea" readonly style="min-height:180px;"></textarea>
            </div>
        `);

        this.panel.querySelector('#toolbox-redirect-run').addEventListener('click', () => {
            const url = this.safeUrl(this.panel.querySelector('#toolbox-redirect-url').value.trim());
            const meta = this.panel.querySelector('#toolbox-redirect-meta');
            const list = this.panel.querySelector('#toolbox-redirect-list');
            const output = this.panel.querySelector('#toolbox-redirect-output');

            if (!url) {
                meta.textContent = 'Enter a valid HTTP/HTTPS URL.';
                return;
            }

            meta.textContent = 'Tracing redirect chain...';
            list.innerHTML = '';

            chrome.runtime.sendMessage(
                {
                    action: 'traceRedirectPath',
                    url,
                    maxHops: 10
                },
                (response) => {
                    if (chrome.runtime.lastError || response?.status === 'error') {
                        meta.textContent = response?.message || chrome.runtime.lastError?.message || 'Redirect trace failed.';
                        return;
                    }

                    const hops = Array.isArray(response.hops) ? response.hops : [];
                    if (!hops.length) {
                        meta.textContent = 'No redirect data available.';
                        list.innerHTML = '<div class="toolbox-browser-empty">No hops returned.</div>';
                        output.value = '';
                        return;
                    }

                    meta.textContent = `Captured ${hops.length} hop(s). Final URL: ${response.finalUrl || hops[hops.length - 1].url}`;
                    list.innerHTML = hops.map((hop, index) => `
                        <div class="toolbox-browser-list-item">
                            <strong>Hop ${index + 1}: ${this.escapeHTML(String(hop.statusCode || 'ERR'))} ${this.escapeHTML(hop.statusText || '')}</strong>
                            <a href="${this.escapeHTML(hop.url)}" target="_blank" rel="noreferrer">${this.escapeHTML(hop.url)}</a>
                            ${hop.location ? `<span class="toolbox-browser-muted">Location: ${this.escapeHTML(hop.location)}</span>` : ''}
                        </div>
                    `).join('');

                    output.value = hops
                        .map((hop, index) => `${index + 1}. [${hop.statusCode || 'ERR'}] ${hop.url}${hop.location ? ` -> ${hop.location}` : ''}`)
                        .join('\n');
                }
            );
        });
    }

    renderPageSpeedInsights() {
        this.setLead('Run Google PageSpeed Insights for the current URL (API key optional, but recommended for reliability).');
        this.setBodyHTML(`
            <div class="toolbox-browser-grid">
                <div class="toolbox-browser-kv">
                    <label class="toolbox-browser-muted" for="toolbox-pagespeed-url">Page URL</label>
                    <input id="toolbox-pagespeed-url" class="toolbox-browser-input" type="url" value="${this.escapeHTML(window.location.href)}">
                    <div class="toolbox-browser-two-col">
                        <select id="toolbox-pagespeed-strategy" class="toolbox-browser-select">
                            <option value="mobile">Mobile</option>
                            <option value="desktop">Desktop</option>
                        </select>
                        <input id="toolbox-pagespeed-key" class="toolbox-browser-input" type="text" placeholder="Optional API key">
                    </div>
                    <button class="toolbox-browser-btn" id="toolbox-pagespeed-run" type="button">Run PSI</button>
                    <span class="toolbox-browser-muted" id="toolbox-pagespeed-meta">Ready.</span>
                </div>
                <div id="toolbox-pagespeed-summary" class="toolbox-browser-list"></div>
                <textarea id="toolbox-pagespeed-output" class="toolbox-browser-textarea" readonly style="min-height:200px;"></textarea>
            </div>
        `);

        chrome.storage.local.get(['toolboxPageSpeedApiKey'], (result) => {
            if (result?.toolboxPageSpeedApiKey) {
                this.panel.querySelector('#toolbox-pagespeed-key').value = result.toolboxPageSpeedApiKey;
            }
        });

        this.panel.querySelector('#toolbox-pagespeed-run').addEventListener('click', () => {
            const url = this.safeUrl(this.panel.querySelector('#toolbox-pagespeed-url').value.trim());
            const strategy = this.panel.querySelector('#toolbox-pagespeed-strategy').value;
            const apiKey = this.panel.querySelector('#toolbox-pagespeed-key').value.trim();
            const meta = this.panel.querySelector('#toolbox-pagespeed-meta');
            const summary = this.panel.querySelector('#toolbox-pagespeed-summary');
            const output = this.panel.querySelector('#toolbox-pagespeed-output');

            if (!url) {
                meta.textContent = 'Enter a valid HTTP/HTTPS URL.';
                return;
            }

            chrome.storage.local.set({ toolboxPageSpeedApiKey: apiKey });

            const endpoint = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
            endpoint.searchParams.set('url', url);
            endpoint.searchParams.set('strategy', strategy);
            endpoint.searchParams.set('category', 'performance');
            endpoint.searchParams.set('category', 'accessibility');
            endpoint.searchParams.set('category', 'best-practices');
            endpoint.searchParams.set('category', 'seo');
            if (apiKey) {
                endpoint.searchParams.set('key', apiKey);
            }

            meta.textContent = 'Running PageSpeed Insights...';
            summary.innerHTML = '';

            chrome.runtime.sendMessage(
                {
                    action: 'proxyFetch',
                    url: endpoint.toString(),
                    method: 'GET',
                    headers: {},
                    body: ''
                },
                (response) => {
                    if (chrome.runtime.lastError || response?.status === 'error') {
                        meta.textContent = response?.message || chrome.runtime.lastError?.message || 'PSI request failed.';
                        output.value = '';
                        return;
                    }

                    try {
                        const parsed = JSON.parse(response.body || '{}');
                        const categories = parsed?.lighthouseResult?.categories || {};
                        const metrics = parsed?.loadingExperience?.metrics || {};
                        const categoryKeys = ['performance', 'accessibility', 'best-practices', 'seo'];

                        const rows = categoryKeys.map((key) => {
                            const score = Number(categories?.[key]?.score);
                            const normalized = Number.isFinite(score) ? Math.round(score * 100) : null;
                            return {
                                key,
                                score: normalized
                            };
                        });

                        summary.innerHTML = rows.map((row) => `
                            <div class="toolbox-browser-list-item">
                                <strong>${this.escapeHTML(row.key.replace('-', ' '))}</strong>
                                <span>${row.score === null ? 'N/A' : `${row.score}/100`}</span>
                            </div>
                        `).join('');

                        const metricsLines = Object.keys(metrics).slice(0, 6).map((name) => {
                            const item = metrics[name] || {};
                            const value = item.percentile || item.category || 'n/a';
                            return `${name}: ${value}`;
                        });

                        output.value = [
                            `URL: ${url}`,
                            `Strategy: ${strategy}`,
                            '',
                            'Scores:',
                            ...rows.map((row) => `- ${row.key}: ${row.score === null ? 'N/A' : `${row.score}/100`}`),
                            '',
                            'Field metrics (sample):',
                            ...(metricsLines.length ? metricsLines : ['No CrUX metrics returned.'])
                        ].join('\n');

                        meta.textContent = 'PageSpeed results loaded.';
                    } catch (error) {
                        meta.textContent = 'Unable to parse PSI response.';
                        output.value = response.body || '';
                    }
                }
            );
        });
    }

    renderStripeAnalyticsModule() {
        this.setLead('Design and configure an optional Stripe analytics module blueprint. This does not call Stripe APIs directly from page context.');
        this.setBodyHTML(`
            <div class="toolbox-browser-grid">
                <div class="toolbox-browser-kv">
                    <strong>Module Configuration</strong>
                    <div class="toolbox-browser-two-col">
                        <input id="toolbox-stripe-account" class="toolbox-browser-input" type="text" placeholder="Stripe account id (acct_...)">
                        <input id="toolbox-stripe-dashboard" class="toolbox-browser-input" type="url" placeholder="https://dashboard.stripe.com">
                    </div>
                    <textarea id="toolbox-stripe-metrics" class="toolbox-browser-textarea" style="min-height:90px;" placeholder="Metrics to track (one per line)\nMRR\nNet Revenue\nFailed Payments\nChurn"></textarea>
                    <button class="toolbox-browser-btn" id="toolbox-stripe-save" type="button">Save module config</button>
                    <button class="toolbox-browser-btn" id="toolbox-stripe-open" type="button">Open Stripe Dashboard</button>
                    <span class="toolbox-browser-muted" id="toolbox-stripe-meta">Saved locally in extension storage.</span>
                </div>
                <div class="toolbox-browser-kv">
                    <strong>Integration Blueprint</strong>
                    <textarea id="toolbox-stripe-blueprint" class="toolbox-browser-textarea" readonly style="min-height:220px;"></textarea>
                </div>
            </div>
        `);

        const buildBlueprint = (config) => {
            const metrics = String(config.metrics || '')
                .split('\n')
                .map((line) => line.trim())
                .filter(Boolean);

            return {
                module: 'stripe-analytics',
                enabled: true,
                scope: 'optional',
                accountId: config.accountId || '',
                dashboardUrl: config.dashboardUrl || 'https://dashboard.stripe.com',
                metrics,
                dataSource: 'server-side Stripe API proxy recommended',
                notes: [
                    'Do not call secret Stripe endpoints directly from content scripts.',
                    'Prefer a user-managed backend endpoint with restricted keys.',
                    'Persist only non-sensitive module preferences in extension storage.'
                ],
                createdAt: new Date().toISOString()
            };
        };

        const writeBlueprint = (config) => {
            const output = this.panel.querySelector('#toolbox-stripe-blueprint');
            output.value = JSON.stringify(buildBlueprint(config), null, 2);
        };

        chrome.storage.local.get(['toolboxStripeModuleConfig'], (result) => {
            const config = result?.toolboxStripeModuleConfig || {};
            this.panel.querySelector('#toolbox-stripe-account').value = config.accountId || '';
            this.panel.querySelector('#toolbox-stripe-dashboard').value = config.dashboardUrl || 'https://dashboard.stripe.com';
            this.panel.querySelector('#toolbox-stripe-metrics').value = config.metrics || 'MRR\nNet Revenue\nFailed Payments\nChurn';
            writeBlueprint({
                accountId: this.panel.querySelector('#toolbox-stripe-account').value,
                dashboardUrl: this.panel.querySelector('#toolbox-stripe-dashboard').value,
                metrics: this.panel.querySelector('#toolbox-stripe-metrics').value
            });
        });

        const refreshBlueprint = () => {
            writeBlueprint({
                accountId: this.panel.querySelector('#toolbox-stripe-account').value.trim(),
                dashboardUrl: this.panel.querySelector('#toolbox-stripe-dashboard').value.trim(),
                metrics: this.panel.querySelector('#toolbox-stripe-metrics').value
            });
        };

        this.panel.querySelector('#toolbox-stripe-account').addEventListener('input', refreshBlueprint);
        this.panel.querySelector('#toolbox-stripe-dashboard').addEventListener('input', refreshBlueprint);
        this.panel.querySelector('#toolbox-stripe-metrics').addEventListener('input', refreshBlueprint);

        this.panel.querySelector('#toolbox-stripe-save').addEventListener('click', () => {
            const config = {
                accountId: this.panel.querySelector('#toolbox-stripe-account').value.trim(),
                dashboardUrl: this.panel.querySelector('#toolbox-stripe-dashboard').value.trim() || 'https://dashboard.stripe.com',
                metrics: this.panel.querySelector('#toolbox-stripe-metrics').value
            };

            chrome.storage.local.set({ toolboxStripeModuleConfig: config }, () => {
                const meta = this.panel.querySelector('#toolbox-stripe-meta');
                if (chrome.runtime.lastError) {
                    meta.textContent = `Failed to save config: ${chrome.runtime.lastError.message}`;
                    return;
                }

                meta.textContent = 'Module config saved.';
                writeBlueprint(config);
            });
        });

        this.panel.querySelector('#toolbox-stripe-open').addEventListener('click', () => {
            const dashboardUrl = this.safeUrl(this.panel.querySelector('#toolbox-stripe-dashboard').value.trim() || 'https://dashboard.stripe.com');
            if (!dashboardUrl) {
                this.setToast('Enter a valid dashboard URL');
                return;
            }

            chrome.runtime.sendMessage({ action: 'openMultipleUrls', urls: [dashboardUrl] }, () => {
                this.setToast('Stripe dashboard opened in a new tab');
            });
        });
    }

    enableRuler() {
        if (this.rulerState) {
            return;
        }

        const overlay = document.createElement('div');
        overlay.className = 'toolbox-browser-ruler-overlay';
        overlay.setAttribute('data-toolbox-ui', 'true');

        const box = document.createElement('div');
        box.className = 'toolbox-browser-ruler-box';
        box.setAttribute('data-toolbox-ui', 'true');

        const label = document.createElement('div');
        label.className = 'toolbox-browser-ruler-label';
        label.setAttribute('data-toolbox-ui', 'true');
        label.textContent = 'Drag to measure. Esc to exit.';

        document.body.appendChild(overlay);
        document.body.appendChild(box);
        document.body.appendChild(label);

        const state = {
            overlay,
            box,
            label,
            measuring: false,
            startX: 0,
            startY: 0
        };

        const updateBox = (x, y) => {
            const left = Math.min(state.startX, x);
            const top = Math.min(state.startY, y);
            const width = Math.abs(x - state.startX);
            const height = Math.abs(y - state.startY);
            box.style.left = `${left}px`;
            box.style.top = `${top}px`;
            box.style.width = `${width}px`;
            box.style.height = `${height}px`;
            label.style.left = `${Math.min(window.innerWidth - 150, left + 8)}px`;
            label.style.top = `${Math.max(8, top - 26)}px`;
            label.textContent = `${width}px × ${height}px`;
        };

        const onMouseDown = (event) => {
            state.measuring = true;
            state.startX = event.clientX;
            state.startY = event.clientY;
            updateBox(event.clientX, event.clientY);
            event.preventDefault();
        };

        const onMouseMove = (event) => {
            if (!state.measuring) {
                label.style.left = `${Math.min(window.innerWidth - 150, event.clientX + 8)}px`;
                label.style.top = `${Math.max(8, event.clientY + 8)}px`;
                return;
            }

            updateBox(event.clientX, event.clientY);
        };

        const onMouseUp = () => {
            state.measuring = false;
        };

        overlay.addEventListener('mousedown', onMouseDown);
        overlay.addEventListener('mousemove', onMouseMove);
        overlay.addEventListener('mouseup', onMouseUp);
        window.addEventListener('keydown', this.handleRulerKeydown, true);

        this.rulerState = {
            overlay,
            box,
            label,
            onMouseDown,
            onMouseMove,
            onMouseUp
        };
    }

    handleRulerKeydown(event) {
        if (event.key === 'Escape') {
            this.disableRuler();
        }
    }

    disableRuler() {
        if (!this.rulerState) {
            return;
        }

        const { overlay, box, label, onMouseDown, onMouseMove, onMouseUp } = this.rulerState;
        overlay.removeEventListener('mousedown', onMouseDown);
        overlay.removeEventListener('mousemove', onMouseMove);
        overlay.removeEventListener('mouseup', onMouseUp);
        window.removeEventListener('keydown', this.handleRulerKeydown, true);
        overlay.remove();
        box.remove();
        label.remove();
        this.rulerState = null;

        if (this.mode === 'page-ruler') {
            this.active = false;
            this.mode = '';
        }
    }
}

export default new BrowserTools();
