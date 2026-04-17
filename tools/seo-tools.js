class SEOTools {
    constructor() {
        this.active = false;
        this.mode = 'seo';
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
        const style = document.createElement('style');
        style.textContent = `
            .toolbox-seo-panel {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 360px;
                max-height: 82vh;
                background: white;
                border: 1px solid #ccc;
                border-radius: 8px;
                box-shadow: 0 4px 14px rgba(0,0,0,0.18);
                z-index: 2147483647;
                font-family: sans-serif;
                display: none;
                flex-direction: column;
                overflow: hidden;
            }
            .toolbox-seo-header {
                padding: 8px 12px;
                background: #f8f9fa;
                border-bottom: 1px solid #ddd;
                display: flex;
                align-items: center;
                justify-content: space-between;
                cursor: move;
                user-select: none;
                font-size: 14px;
            }
            .toolbox-seo-actions {
                display: flex;
                gap: 8px;
                align-items: center;
            }
            .toolbox-seo-refresh,
            .toolbox-seo-close {
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
            .toolbox-seo-refresh {
                padding: 4px 8px;
                background: #edf3ff;
                color: #0d6efd;
                font-size: 11px;
                font-weight: 700;
            }
            .toolbox-seo-close {
                background: none;
                font-size: 20px;
                line-height: 1;
            }
            .toolbox-seo-content {
                padding: 12px;
                overflow-y: auto;
                font-size: 12px;
                color: #111827;
            }
            .toolbox-seo-lead {
                color: #6b7280;
                margin-bottom: 12px;
            }
            .toolbox-seo-grid {
                display: grid;
                gap: 8px;
            }
            .toolbox-seo-row,
            .toolbox-seo-card,
            .toolbox-seo-preview {
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                padding: 10px;
                background: #fbfcfe;
            }
            .toolbox-seo-row strong,
            .toolbox-seo-card strong {
                display: block;
                margin-bottom: 4px;
            }
            .toolbox-seo-meta {
                color: #6b7280;
                font-size: 11px;
                margin-top: 4px;
            }
            .toolbox-seo-value {
                word-break: break-word;
                line-height: 1.45;
            }
            .toolbox-seo-preview-url {
                color: #188038;
                margin-bottom: 4px;
            }
            .toolbox-seo-preview-title {
                color: #1a0dab;
                font-size: 18px;
                line-height: 1.3;
                margin-bottom: 4px;
            }
            .toolbox-seo-preview-description {
                color: #4d5156;
                line-height: 1.4;
            }
            .toolbox-seo-badge {
                display: inline-block;
                padding: 2px 6px;
                border-radius: 999px;
                font-size: 11px;
                font-weight: 700;
                margin-top: 4px;
            }
            .toolbox-seo-badge.good {
                background: #e7f7ed;
                color: #137333;
            }
            .toolbox-seo-badge.warn {
                background: #fff4e5;
                color: #b06000;
            }
            .toolbox-seo-empty {
                color: #6b7280;
                text-align: center;
                padding: 16px 12px;
            }
        `;
        document.head.appendChild(style);

        this.panel = document.createElement('div');
        this.panel.className = 'toolbox-seo-panel';
        this.panel.setAttribute('data-toolbox-ui', 'true');
        this.panel.innerHTML = `
            <div class="toolbox-seo-header">
                <strong class="toolbox-seo-title">SEO Meta Inspector</strong>
                <div class="toolbox-seo-actions">
                    <button class="toolbox-seo-refresh">Refresh</button>
                    <button class="toolbox-seo-close">&times;</button>
                </div>
            </div>
            <div class="toolbox-seo-content">
                <div class="toolbox-seo-lead"></div>
                <div class="toolbox-seo-grid"></div>
            </div>
        `;

        document.body.appendChild(this.panel);
        this.panel.querySelector('.toolbox-seo-header').addEventListener('pointerdown', this.handleDragStart);
        this.panel.querySelector('.toolbox-seo-close').onclick = () => this.toggle(this.mode);
        this.panel.querySelector('.toolbox-seo-refresh').onclick = () => this.renderMode();
    }

    getMetaContent(name, attribute = 'name') {
        const selector = `meta[${attribute}="${name}"]`;
        const element = document.head.querySelector(selector);
        return element ? element.getAttribute('content') || '' : '';
    }

    getLinkHref(rel) {
        const element = document.head.querySelector(`link[rel="${rel}"]`);
        return element ? element.href || '' : '';
    }

    createBadge(text, variant) {
        return `<span class="toolbox-seo-badge ${variant}">${text}</span>`;
    }

    escapeHTML(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    handleDragStart(e) {
        if (e.target.closest('.toolbox-seo-close') || e.target.closest('.toolbox-seo-refresh')) {
            return;
        }

        const rect = this.panel.getBoundingClientRect();
        this.dragState = {
            offsetX: e.clientX - rect.left,
            offsetY: e.clientY - rect.top
        };

        this.panel.style.left = `${rect.left}px`;
        this.panel.style.top = `${rect.top}px`;
        this.panel.style.right = 'auto';
        window.addEventListener('pointermove', this.handleDragMove);
        window.addEventListener('pointerup', this.handleDragEnd);
        e.preventDefault();
        e.stopPropagation();
    }

    handleDragMove(e) {
        if (!this.dragState) {
            return;
        }

        const panelRect = this.panel.getBoundingClientRect();
        const maxLeft = Math.max(0, window.innerWidth - panelRect.width);
        const maxTop = Math.max(0, window.innerHeight - panelRect.height);
        const nextLeft = Math.min(Math.max(0, e.clientX - this.dragState.offsetX), maxLeft);
        const nextTop = Math.min(Math.max(0, e.clientY - this.dragState.offsetY), maxTop);

        this.panel.style.left = `${nextLeft}px`;
        this.panel.style.top = `${nextTop}px`;
    }

    handleDragEnd() {
        this.dragState = null;
        window.removeEventListener('pointermove', this.handleDragMove);
        window.removeEventListener('pointerup', this.handleDragEnd);
    }

    collectSEOData() {
        const title = document.title || '';
        const description = this.getMetaContent('description');
        const robots = this.getMetaContent('robots');
        const canonical = this.getLinkHref('canonical');
        const lang = document.documentElement.lang || '';
        const h1s = Array.from(document.querySelectorAll('h1'));
        const images = Array.from(document.images);
        const missingAltCount = images.filter((image) => !image.getAttribute('alt')).length;

        return {
            title,
            titleLength: title.length,
            description,
            descriptionLength: description.length,
            robots,
            canonical,
            lang,
            h1Count: h1s.length,
            h1Text: h1s[0] ? h1s[0].innerText.trim() : '',
            missingAltCount,
            imagesCount: images.length
        };
    }

    renderSEOInspector() {
        const lead = this.panel.querySelector('.toolbox-seo-lead');
        const grid = this.panel.querySelector('.toolbox-seo-grid');
        const data = this.collectSEOData();
        const titleStatus = data.titleLength >= 30 && data.titleLength <= 60 ? this.createBadge('Healthy title length', 'good') : this.createBadge('Title length needs review', 'warn');
        const descriptionStatus = data.descriptionLength >= 70 && data.descriptionLength <= 160 ? this.createBadge('Healthy description length', 'good') : this.createBadge('Description length needs review', 'warn');
        const robotsStatus = data.robots.toLowerCase().includes('noindex') ? this.createBadge('Noindex detected', 'warn') : this.createBadge('Indexable by default', 'good');

        lead.textContent = 'Quick audit of title, description, canonical, headings, and crawl hints from the current document.';
        grid.innerHTML = `
            <div class="toolbox-seo-row">
                <strong>Title</strong>
                <div class="toolbox-seo-value">${this.escapeHTML(data.title || 'Missing')}</div>
                <div class="toolbox-seo-meta">${data.titleLength} characters</div>
                ${titleStatus}
            </div>
            <div class="toolbox-seo-row">
                <strong>Meta description</strong>
                <div class="toolbox-seo-value">${this.escapeHTML(data.description || 'Missing')}</div>
                <div class="toolbox-seo-meta">${data.descriptionLength} characters</div>
                ${descriptionStatus}
            </div>
            <div class="toolbox-seo-row">
                <strong>Canonical</strong>
                <div class="toolbox-seo-value">${this.escapeHTML(data.canonical || 'Missing')}</div>
            </div>
            <div class="toolbox-seo-row">
                <strong>Robots</strong>
                <div class="toolbox-seo-value">${this.escapeHTML(data.robots || 'Not specified')}</div>
                ${robotsStatus}
            </div>
            <div class="toolbox-seo-row">
                <strong>Primary heading</strong>
                <div class="toolbox-seo-value">${this.escapeHTML(data.h1Text || 'No H1 found')}</div>
                <div class="toolbox-seo-meta">${data.h1Count} H1 element(s)</div>
            </div>
            <div class="toolbox-seo-row">
                <strong>Language and media</strong>
                <div class="toolbox-seo-value">Language: ${this.escapeHTML(data.lang || 'Not set')}</div>
                <div class="toolbox-seo-meta">Images: ${data.imagesCount} • Missing alt text: ${data.missingAltCount}</div>
            </div>
        `;
    }

    collectPreviewData() {
        return {
            title: this.getMetaContent('og:title', 'property') || this.getMetaContent('twitter:title') || document.title || '',
            description: this.getMetaContent('og:description', 'property') || this.getMetaContent('twitter:description') || this.getMetaContent('description') || '',
            image: this.getMetaContent('og:image', 'property') || this.getMetaContent('twitter:image') || '',
            canonical: this.getLinkHref('canonical') || window.location.href,
            siteName: this.getMetaContent('og:site_name', 'property') || window.location.hostname,
            twitterCard: this.getMetaContent('twitter:card') || 'summary'
        };
    }

    renderMetaPreview() {
        const lead = this.panel.querySelector('.toolbox-seo-lead');
        const grid = this.panel.querySelector('.toolbox-seo-grid');
        const data = this.collectPreviewData();

        lead.textContent = 'Preview how the page metadata will read in search and social cards using the current document head.';
        grid.innerHTML = `
            <div class="toolbox-seo-preview">
                <div class="toolbox-seo-preview-url">${this.escapeHTML(data.canonical)}</div>
                <div class="toolbox-seo-preview-title">${this.escapeHTML(data.title || 'Missing title')}</div>
                <div class="toolbox-seo-preview-description">${this.escapeHTML(data.description || 'Missing description')}</div>
            </div>
            <div class="toolbox-seo-card">
                <strong>Open Graph</strong>
                <div class="toolbox-seo-value">Site: ${this.escapeHTML(data.siteName)}</div>
                <div class="toolbox-seo-value">Image: ${this.escapeHTML(data.image || 'Missing')}</div>
            </div>
            <div class="toolbox-seo-card">
                <strong>Twitter card</strong>
                <div class="toolbox-seo-value">Card type: ${this.escapeHTML(data.twitterCard)}</div>
                <div class="toolbox-seo-meta">Uses the same title and description fallback chain shown above.</div>
            </div>
        `;
    }

    collectEmails() {
        const textMatches = (document.body ? document.body.innerText : '').match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [];
        const mailtoMatches = Array.from(document.querySelectorAll('a[href^="mailto:"]'))
            .map((link) => link.getAttribute('href') || '')
            .map((href) => href.replace(/^mailto:/i, '').split('?')[0])
            .filter(Boolean);

        return Array.from(new Set([...textMatches, ...mailtoMatches].map((email) => email.trim().toLowerCase()))).sort();
    }

    renderEmailFinder() {
        const lead = this.panel.querySelector('.toolbox-seo-lead');
        const grid = this.panel.querySelector('.toolbox-seo-grid');
        const emails = this.collectEmails();

        lead.textContent = 'Scans page text and mailto links for likely email addresses.';

        if (!emails.length) {
            grid.innerHTML = '<div class="toolbox-seo-empty">No email addresses were found on this page.</div>';
            return;
        }

        grid.innerHTML = emails.map((email) => `
            <div class="toolbox-seo-row">
                <strong>${this.escapeHTML(email)}</strong>
                <div class="toolbox-seo-meta">Detected from visible text or a mailto link.</div>
            </div>
        `).join('');
    }

    renderMode() {
        this.panel.querySelector('.toolbox-seo-title').textContent = this.mode === 'meta-preview'
            ? 'Meta Tags Preview'
            : this.mode === 'email'
                ? 'Email Finder'
                : 'SEO Meta Inspector';

        if (this.mode === 'meta-preview') {
            this.renderMetaPreview();
            return;
        }

        if (this.mode === 'email') {
            this.renderEmailFinder();
            return;
        }

        this.renderSEOInspector();
    }

    openMode(mode) {
        this.active = true;
        this.mode = mode;
        this.panel.style.display = 'flex';
        this.renderMode();
    }

    close() {
        this.active = false;
        this.panel.style.display = 'none';
        this.handleDragEnd();
    }

    toggle(mode = 'seo') {
        if (!this.active) {
            this.openMode(mode);
            return;
        }

        if (this.mode !== mode) {
            this.openMode(mode);
            return;
        }

        this.close();
    }
}

export default new SEOTools();