class UtilityTools {
    constructor() {
        this.active = false;
        this.mode = 'reader';
        this.panel = null;
        this.dragState = null;
        this.handleDragStart = this.handleDragStart.bind(this);
        this.handleDragMove = this.handleDragMove.bind(this);
        this.handleDragEnd = this.handleDragEnd.bind(this);
        this.init();
    }

    init() {
        this.createPanel();
    }

    createPanel() {
        if (document.getElementById('toolbox-utility-tools-style')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'toolbox-utility-tools-style';
        style.textContent = `
            .toolbox-utility-panel {
                position: fixed;
                top: 20px;
                right: 20px;
                width: min(480px, calc(100vw - 32px));
                max-height: min(88vh, 860px);
                background: #ffffff;
                color: #111827;
                border: 1px solid #dbe3ef;
                border-radius: 14px;
                box-shadow: 0 20px 48px rgba(15, 23, 42, 0.22);
                z-index: 2147483647;
                display: none;
                flex-direction: column;
                overflow: hidden;
                font-family: Arial, sans-serif;
            }
            .toolbox-utility-panel.reader-mode {
                inset: 18px;
                width: auto;
                max-height: none;
                right: 18px;
                top: 18px;
            }
            .toolbox-utility-header {
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
            .toolbox-utility-title {
                font-size: 14px;
                font-weight: 700;
            }
            .toolbox-utility-actions {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .toolbox-utility-copy,
            .toolbox-utility-download,
            .toolbox-utility-close {
                border: 1px solid #d0dbec;
                border-radius: 8px;
                background: #fff;
                color: #0f172a;
                cursor: pointer;
            }
            .toolbox-utility-copy,
            .toolbox-utility-download {
                padding: 6px 10px;
                font-size: 12px;
                font-weight: 600;
            }
            .toolbox-utility-close {
                width: 34px;
                height: 34px;
                font-size: 20px;
                line-height: 1;
            }
            .toolbox-utility-content {
                padding: 14px;
                overflow: auto;
            }
            .toolbox-utility-lead {
                margin: 0 0 12px;
                color: #475569;
                line-height: 1.45;
                font-size: 13px;
            }
            .toolbox-utility-summary {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-bottom: 14px;
            }
            .toolbox-utility-pill {
                background: #eff6ff;
                color: #1d4ed8;
                border-radius: 999px;
                padding: 5px 10px;
                font-size: 12px;
                font-weight: 700;
            }
            .toolbox-utility-reader {
                display: grid;
                gap: 14px;
            }
            .toolbox-utility-reader h1,
            .toolbox-utility-reader h2,
            .toolbox-utility-reader h3 {
                line-height: 1.25;
                margin: 0;
            }
            .toolbox-utility-reader p,
            .toolbox-utility-reader li,
            .toolbox-utility-reader blockquote,
            .toolbox-utility-reader pre {
                font-size: 16px;
                line-height: 1.75;
                color: #172033;
            }
            .toolbox-utility-reader ul {
                margin: 0;
                padding-left: 1.2rem;
            }
            .toolbox-utility-reader blockquote {
                margin: 0;
                border-left: 3px solid #93c5fd;
                padding-left: 12px;
                color: #334155;
                background: #f8fbff;
            }
            .toolbox-utility-reader pre {
                background: #0f172a;
                color: #e2e8f0;
                padding: 12px;
                border-radius: 10px;
                overflow: auto;
                white-space: pre-wrap;
            }
            .toolbox-utility-reader figure {
                margin: 0;
                display: grid;
                gap: 8px;
            }
            .toolbox-utility-reader img,
            .toolbox-utility-image-thumb {
                max-width: 100%;
                border-radius: 10px;
                border: 1px solid #dbe3ef;
                background: #f8fafc;
            }
            .toolbox-utility-empty {
                padding: 18px;
                text-align: center;
                border: 1px dashed #cbd5e1;
                border-radius: 12px;
                color: #64748b;
                background: #f8fafc;
            }
            .toolbox-utility-markdown {
                width: 100%;
                min-height: 360px;
                border-radius: 10px;
                border: 1px solid #dbe3ef;
                padding: 12px;
                font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
                font-size: 12px;
                line-height: 1.55;
                resize: vertical;
                background: #fbfdff;
                color: #111827;
            }
            .toolbox-utility-image-grid {
                display: grid;
                gap: 10px;
            }
            .toolbox-utility-image-card {
                display: grid;
                gap: 10px;
                grid-template-columns: 96px 1fr;
                padding: 10px;
                border: 1px solid #dbe3ef;
                border-radius: 12px;
                background: #fbfdff;
            }
            .toolbox-utility-image-meta {
                display: grid;
                gap: 4px;
                font-size: 12px;
                min-width: 0;
            }
            .toolbox-utility-image-link {
                color: #2563eb;
                font-weight: 700;
                text-decoration: none;
            }
            .toolbox-utility-image-code {
                word-break: break-all;
                color: #475569;
            }
            .toolbox-utility-toast {
                position: absolute;
                left: 14px;
                bottom: 14px;
                background: rgba(15, 23, 42, 0.92);
                color: #fff;
                font-size: 12px;
                padding: 8px 10px;
                border-radius: 10px;
            }
        `;
        document.head.appendChild(style);

        this.panel = document.createElement('aside');
        this.panel.className = 'toolbox-utility-panel';
        this.panel.setAttribute('data-toolbox-ui', 'true');
        this.panel.innerHTML = `
            <div class="toolbox-utility-header">
                <strong class="toolbox-utility-title">Reader Mode</strong>
                <div class="toolbox-utility-actions">
                    <button class="toolbox-utility-copy">Copy</button>
                    <button class="toolbox-utility-download">Download</button>
                    <button class="toolbox-utility-close">&times;</button>
                </div>
            </div>
            <div class="toolbox-utility-content">
                <p class="toolbox-utility-lead"></p>
                <div class="toolbox-utility-body"></div>
            </div>
        `;

        document.body.appendChild(this.panel);

        this.panel.querySelector('.toolbox-utility-header').addEventListener('pointerdown', this.handleDragStart);
        this.panel.querySelector('.toolbox-utility-close').addEventListener('click', () => this.close());
        this.panel.querySelector('.toolbox-utility-copy').addEventListener('click', () => this.copyCurrentMode());
        this.panel.querySelector('.toolbox-utility-download').addEventListener('click', () => this.downloadCurrentMode());
    }

    escapeHTML(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    safeUrl(value) {
        if (!value) {
            return '';
        }

        try {
            const url = new URL(value, window.location.href);
            const allowedProtocols = ['http:', 'https:', 'data:', 'blob:'];
            return allowedProtocols.includes(url.protocol) ? url.href : '';
        } catch (error) {
            return '';
        }
    }

    handleDragStart(event) {
        if (event.target.closest('.toolbox-utility-close') || event.target.closest('.toolbox-utility-copy') || event.target.closest('.toolbox-utility-download')) {
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
        this.panel.style.bottom = 'auto';

        window.addEventListener('pointermove', this.handleDragMove);
        window.addEventListener('pointerup', this.handleDragEnd);
        event.preventDefault();
        event.stopPropagation();
    }

    handleDragMove(event) {
        if (!this.dragState || this.panel.classList.contains('reader-mode')) {
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

    toggle(mode = 'reader') {
        if (this.active && this.mode === mode) {
            this.close();
            return;
        }

        this.active = true;
        this.mode = mode;
        this.panel.style.display = 'flex';
        this.panel.classList.toggle('reader-mode', mode === 'reader');

        if (mode === 'reader') {
            this.panel.style.left = '';
            this.panel.style.top = '';
            this.panel.style.right = '';
            this.panel.style.bottom = '';
        }

        this.renderMode();
    }

    close() {
        this.active = false;
        this.handleDragEnd();
        this.panel.style.display = 'none';
        this.panel.classList.remove('reader-mode');
    }

    getTitleForMode() {
        switch (this.mode) {
            case 'markdown':
                return 'Webpage to Markdown';
            case 'images':
                return 'Extract Images';
            default:
                return 'Reader Mode';
        }
    }

    setLead(text) {
        this.panel.querySelector('.toolbox-utility-lead').textContent = text;
    }

    setBodyHTML(html) {
        this.panel.querySelector('.toolbox-utility-body').innerHTML = html;
    }

    setToast(message) {
        const existingToast = this.panel.querySelector('.toolbox-utility-toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'toolbox-utility-toast';
        toast.textContent = message;
        this.panel.appendChild(toast);

        window.setTimeout(() => {
            toast.remove();
        }, 1800);
    }

    renderMode() {
        this.panel.querySelector('.toolbox-utility-title').textContent = this.getTitleForMode();

        switch (this.mode) {
            case 'markdown':
                this.renderMarkdownExport();
                break;
            case 'images':
                this.renderImageExtractor();
                break;
            default:
                this.renderReaderMode();
                break;
        }
    }

    collectRootCandidate() {
        const preferredSelectors = [
            'article',
            'main',
            '[role="main"]',
            '.post-content',
            '.entry-content',
            '.article-content',
            '.content'
        ];

        const preferred = preferredSelectors
            .map((selector) => document.querySelector(selector))
            .filter(Boolean)
            .find((node) => (node.innerText || '').trim().length > 280);

        if (preferred) {
            return preferred;
        }

        const candidates = Array.from(document.body.querySelectorAll('article, main, section, div'));
        let bestNode = document.body;
        let bestScore = 0;

        for (const node of candidates) {
            if (node.closest('[data-toolbox-ui="true"]')) {
                continue;
            }

            const text = (node.innerText || '').trim();
            if (text.length < 280) {
                continue;
            }

            const paragraphCount = node.querySelectorAll('p').length;
            const headingCount = node.querySelectorAll('h1, h2, h3').length;
            const linkCount = node.querySelectorAll('a').length;
            const score = text.length + paragraphCount * 140 + headingCount * 60 - linkCount * 12;

            if (score > bestScore) {
                bestScore = score;
                bestNode = node;
            }
        }

        return bestNode;
    }

    collectBlocks() {
        const root = this.collectRootCandidate();
        const nodes = Array.from(root.querySelectorAll('h1, h2, h3, p, li, blockquote, pre, img'));
        const blocks = [];

        for (const node of nodes) {
            if (node.closest('[data-toolbox-ui="true"]')) {
                continue;
            }

            if (node.tagName === 'IMG') {
                const src = this.safeUrl(node.currentSrc || node.src);
                if (!src) {
                    continue;
                }

                blocks.push({
                    type: 'image',
                    src,
                    alt: (node.getAttribute('alt') || '').trim()
                });
                continue;
            }

            const text = (node.innerText || node.textContent || '').replace(/\s+/g, ' ').trim();
            if (text.length < 20 && !/^H[1-3]$/.test(node.tagName)) {
                continue;
            }

            blocks.push({
                type: node.tagName.toLowerCase(),
                text
            });
        }

        return blocks.slice(0, 120);
    }

    getReaderData() {
        const blocks = this.collectBlocks();
        const fullText = blocks
            .filter((block) => block.text)
            .map((block) => block.text)
            .join(' ')
            .trim();

        const wordCount = fullText ? fullText.split(/\s+/).filter(Boolean).length : 0;
        const minutes = Math.max(1, Math.round(wordCount / 220));

        return {
            title: document.title || 'Untitled page',
            url: window.location.href,
            blocks,
            wordCount,
            minutes,
            text: fullText
        };
    }

    blockToReaderHTML(block) {
        if (block.type === 'image') {
            const caption = block.alt ? `<figcaption>${this.escapeHTML(block.alt)}</figcaption>` : '';
            return `<figure><img src="${this.escapeHTML(block.src)}" alt="${this.escapeHTML(block.alt)}">${caption}</figure>`;
        }

        if (block.type === 'h1') {
            return `<h1>${this.escapeHTML(block.text)}</h1>`;
        }

        if (block.type === 'h2') {
            return `<h2>${this.escapeHTML(block.text)}</h2>`;
        }

        if (block.type === 'h3') {
            return `<h3>${this.escapeHTML(block.text)}</h3>`;
        }

        if (block.type === 'li') {
            return `<ul><li>${this.escapeHTML(block.text)}</li></ul>`;
        }

        if (block.type === 'blockquote') {
            return `<blockquote>${this.escapeHTML(block.text)}</blockquote>`;
        }

        if (block.type === 'pre') {
            return `<pre>${this.escapeHTML(block.text)}</pre>`;
        }

        return `<p>${this.escapeHTML(block.text)}</p>`;
    }

    renderReaderMode() {
        const data = this.getReaderData();

        this.setLead('Clean reading view generated from the current page using the extension content script. It strips most navigation noise and keeps the main text readable.');

        if (!data.blocks.length) {
            this.setBodyHTML('<div class="toolbox-utility-empty">No readable content was detected on this page.</div>');
            return;
        }

        const summary = `
            <div class="toolbox-utility-summary">
                <span class="toolbox-utility-pill">${data.wordCount} words</span>
                <span class="toolbox-utility-pill">~${data.minutes} min read</span>
                <span class="toolbox-utility-pill">${this.escapeHTML(window.location.hostname)}</span>
            </div>
        `;

        const content = data.blocks.map((block) => this.blockToReaderHTML(block)).join('');
        this.setBodyHTML(`
            ${summary}
            <div class="toolbox-utility-reader">
                <h1>${this.escapeHTML(data.title)}</h1>
                ${content}
            </div>
        `);
    }

    getMarkdownOutput() {
        const data = this.getReaderData();
        const lines = [
            `# ${data.title}`,
            '',
            `Source: ${data.url}`,
            '',
            '---',
            ''
        ];

        for (const block of data.blocks) {
            switch (block.type) {
                case 'h1':
                    lines.push(`# ${block.text}`, '');
                    break;
                case 'h2':
                    lines.push(`## ${block.text}`, '');
                    break;
                case 'h3':
                    lines.push(`### ${block.text}`, '');
                    break;
                case 'li':
                    lines.push(`- ${block.text}`);
                    break;
                case 'blockquote':
                    lines.push(`> ${block.text}`, '');
                    break;
                case 'pre':
                    lines.push('```', block.text, '```', '');
                    break;
                case 'image':
                    lines.push(`![${block.alt || 'image'}](${block.src})`, '');
                    break;
                default:
                    lines.push(block.text, '');
                    break;
            }
        }

        return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
    }

    renderMarkdownExport() {
        const markdown = this.getMarkdownOutput();
        this.setLead('Portable Markdown generated from the current page content. Use copy or download to reuse it in docs, notes, or tickets.');
        this.setBodyHTML('<textarea class="toolbox-utility-markdown" readonly></textarea>');
        this.panel.querySelector('.toolbox-utility-markdown').value = markdown;
    }

    getImagesData() {
        const imageMap = new Map();
        const elements = Array.from(document.images);

        for (const image of elements) {
            const src = this.safeUrl(image.currentSrc || image.src);
            if (!src || imageMap.has(src)) {
                continue;
            }

            imageMap.set(src, {
                src,
                alt: (image.getAttribute('alt') || '').trim(),
                width: image.naturalWidth || image.width || 0,
                height: image.naturalHeight || image.height || 0
            });
        }

        return Array.from(imageMap.values()).slice(0, 80);
    }

    renderImageExtractor() {
        const images = this.getImagesData();
        this.setLead('Quick image inventory for the current page. Open images directly or copy the full asset list for review.');

        if (!images.length) {
            this.setBodyHTML('<div class="toolbox-utility-empty">No usable images were found on this page.</div>');
            return;
        }

        const summary = `
            <div class="toolbox-utility-summary">
                <span class="toolbox-utility-pill">${images.length} image(s)</span>
            </div>
        `;

        const cards = images.map((image, index) => `
            <div class="toolbox-utility-image-card">
                <img class="toolbox-utility-image-thumb" src="${this.escapeHTML(image.src)}" alt="${this.escapeHTML(image.alt || `Image ${index + 1}`)}">
                <div class="toolbox-utility-image-meta">
                    <strong>${this.escapeHTML(image.alt || `Image ${index + 1}`)}</strong>
                    <span>${image.width || '?'} × ${image.height || '?'}</span>
                    <span class="toolbox-utility-image-code">${this.escapeHTML(image.src)}</span>
                    <a class="toolbox-utility-image-link" href="${this.escapeHTML(image.src)}" target="_blank" rel="noreferrer">Open image</a>
                </div>
            </div>
        `).join('');

        this.setBodyHTML(`${summary}<div class="toolbox-utility-image-grid">${cards}</div>`);
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

    getCurrentExportText() {
        if (this.mode === 'markdown') {
            return this.getMarkdownOutput();
        }

        if (this.mode === 'images') {
            return this.getImagesData()
                .map((image) => `${image.alt || 'Untitled image'} | ${image.width || '?'}x${image.height || '?'} | ${image.src}`)
                .join('\n');
        }

        return this.getReaderData().text || '';
    }

    copyCurrentMode() {
        const text = this.getCurrentExportText();
        this.copyText(text || '');
    }

    downloadCurrentMode() {
        const content = this.getCurrentExportText();
        const hostname = (window.location.hostname || 'page').replace(/[^a-z0-9.-]/gi, '-');
        const filename = this.mode === 'markdown'
            ? `${hostname}.md`
            : this.mode === 'images'
                ? `${hostname}-images.txt`
                : `${hostname}-reader.txt`;

        chrome.runtime.sendMessage(
            {
                action: 'downloadText',
                content,
                filename
            },
            (response) => {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError.message);
                    this.setToast('Download failed');
                    return;
                }

                if (response && response.status === 'download-started') {
                    this.setToast('Download started');
                } else {
                    this.setToast('Download could not start');
                }
            }
        );
    }
}

export default new UtilityTools();