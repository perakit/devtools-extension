class FontTools {
    constructor() {
        this.active = false;
        this.mode = 'changer';
        this.highlightedElement = null;
        this.selectedElement = null;
        this.editorPanel = null;
        this.listPanel = null;
        this.highlightOverlay = null;
        this.dragState = null;
        this.dragPanel = null;
        this.handleMouseOver = this.handleMouseOver.bind(this);
        this.handlePointerDown = this.handlePointerDown.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleDragStart = this.handleDragStart.bind(this);
        this.handleDragMove = this.handleDragMove.bind(this);
        this.handleDragEnd = this.handleDragEnd.bind(this);
        this.init();
    }

    init() {
        this.createPanels();
        this.setupEventListeners();
    }

    createPanels() {
        const style = document.createElement('style');
        style.textContent = `
            .toolbox-fonts-panel {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 300px;
                max-height: 78vh;
                background: white;
                border: 1px solid #ccc;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 2147483647;
                font-family: sans-serif;
                display: none;
                flex-direction: column;
                overflow: hidden;
            }
            .toolbox-fonts-header {
                padding: 8px 12px;
                background: #f8f9fa;
                border-bottom: 1px solid #ddd;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 14px;
                cursor: move;
                user-select: none;
            }
            .toolbox-fonts-title {
                font-weight: 700;
            }
            .toolbox-fonts-actions {
                display: flex;
                gap: 8px;
                align-items: center;
            }
            .toolbox-fonts-refresh,
            .toolbox-fonts-close,
            .toolbox-fonts-apply {
                cursor: pointer;
                border: none;
                border-radius: 4px;
            }
            .toolbox-fonts-refresh {
                padding: 4px 8px;
                background: #edf3ff;
                color: #0d6efd;
                font-size: 11px;
                font-weight: 700;
            }
            .toolbox-fonts-close {
                background: none;
                font-size: 20px;
                line-height: 1;
            }
            .toolbox-fonts-content {
                padding: 12px;
                font-size: 12px;
                overflow-y: auto;
            }
            .toolbox-fonts-info {
                margin-bottom: 10px;
                color: #666;
            }
            .toolbox-fonts-controls {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            .toolbox-fonts-group {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 10px;
            }
            .toolbox-fonts-group label {
                font-weight: bold;
            }
            .toolbox-fonts-group select,
            .toolbox-fonts-group input {
                padding: 4px;
                border: 1px solid #ddd;
                border-radius: 4px;
                min-width: 140px;
            }
            .toolbox-fonts-apply {
                padding: 8px;
                background: #0d6efd;
                color: white;
                font-weight: 700;
            }
            .toolbox-fonts-list {
                display: grid;
                gap: 8px;
            }
            .toolbox-fonts-card {
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                padding: 10px;
                background: #fbfcfe;
            }
            .toolbox-fonts-card strong {
                display: block;
                margin-bottom: 4px;
                color: #111827;
            }
            .toolbox-fonts-meta {
                color: #4b5563;
                font-size: 11px;
                margin-bottom: 6px;
            }
            .toolbox-fonts-sample {
                color: #111827;
                font-size: 16px;
                line-height: 1.4;
            }
            .toolbox-fonts-empty {
                color: #6b7280;
                text-align: center;
                padding: 18px 12px;
            }
            .toolbox-fonts-highlight-overlay {
                position: fixed;
                border: 2px solid #6f42c1;
                background: rgba(111, 66, 193, 0.12);
                box-sizing: border-box;
                pointer-events: none;
                z-index: 2147483646;
                display: none;
            }
        `;
        document.head.appendChild(style);

        this.editorPanel = document.createElement('div');
        this.editorPanel.className = 'toolbox-fonts-panel toolbox-fonts-editor-panel';
        this.editorPanel.setAttribute('data-toolbox-ui', 'true');
        this.editorPanel.innerHTML = `
            <div class="toolbox-fonts-header">
                <span class="toolbox-fonts-title">Fonts Changer</span>
                <div class="toolbox-fonts-actions">
                    <button class="toolbox-fonts-close">&times;</button>
                </div>
            </div>
            <div class="toolbox-fonts-content">
                <div class="toolbox-fonts-info">Select an element to change font.</div>
                <div class="toolbox-fonts-controls" style="display: none;">
                    <div class="toolbox-fonts-group">
                        <label for="toolbox-font-family">Font Family:</label>
                        <select id="toolbox-font-family">
                            <option value="Arial">Arial</option>
                            <option value="'Times New Roman', Times, serif">Times New Roman</option>
                            <option value="'Courier New', Courier, monospace">Courier New</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Verdana">Verdana</option>
                            <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
                            <option value="Impact">Impact</option>
                            <option value="Comic Sans MS">Comic Sans MS</option>
                            <option value="system-ui">System UI</option>
                        </select>
                    </div>
                    <div class="toolbox-fonts-group">
                        <label for="toolbox-font-size">Size (px):</label>
                        <input type="number" id="toolbox-font-size" value="16" min="8" max="144">
                    </div>
                    <button class="toolbox-fonts-apply">Apply Changes</button>
                </div>
            </div>
        `;

        this.listPanel = document.createElement('div');
        this.listPanel.className = 'toolbox-fonts-panel toolbox-fonts-list-panel';
        this.listPanel.setAttribute('data-toolbox-ui', 'true');
        this.listPanel.innerHTML = `
            <div class="toolbox-fonts-header">
                <span class="toolbox-fonts-title">Font Inventory</span>
                <div class="toolbox-fonts-actions">
                    <button class="toolbox-fonts-refresh">Refresh</button>
                    <button class="toolbox-fonts-close">&times;</button>
                </div>
            </div>
            <div class="toolbox-fonts-content">
                <div class="toolbox-fonts-info">Scanning fonts used by visible page elements.</div>
                <div class="toolbox-fonts-list"></div>
            </div>
        `;

        document.body.appendChild(this.editorPanel);
        document.body.appendChild(this.listPanel);

        this.highlightOverlay = document.createElement('div');
        this.highlightOverlay.className = 'toolbox-fonts-highlight-overlay';
        this.highlightOverlay.setAttribute('data-toolbox-ui', 'true');
        document.body.appendChild(this.highlightOverlay);

        this.editorPanel.querySelector('.toolbox-fonts-header').addEventListener('pointerdown', this.handleDragStart);
        this.listPanel.querySelector('.toolbox-fonts-header').addEventListener('pointerdown', this.handleDragStart);
        this.editorPanel.querySelector('.toolbox-fonts-close').onclick = () => this.toggle(this.mode);
        this.listPanel.querySelector('.toolbox-fonts-close').onclick = () => this.toggle(this.mode);
        this.editorPanel.querySelector('.toolbox-fonts-apply').onclick = () => this.applyFont();
        this.listPanel.querySelector('.toolbox-fonts-refresh').onclick = () => this.renderFontInventory();
    }

    setupEventListeners() {
        document.addEventListener('mouseover', this.handleMouseOver, true);
        document.addEventListener('pointerdown', this.handlePointerDown, true);
        document.addEventListener('click', this.handleClick, true);
    }

    handleMouseOver(e) {
        if (!this.active || this.mode !== 'changer' || this.isToolboxElement(e.target)) {
            return;
        }

        e.stopPropagation();
        this.highlightElement(e.target);
    }

    handlePointerDown(e) {
        if (!this.active || this.mode !== 'changer' || this.isToolboxElement(e.target)) {
            return;
        }

        e.preventDefault();
        e.stopImmediatePropagation();
    }

    handleClick(e) {
        if (!this.active || this.mode !== 'changer' || this.isToolboxElement(e.target)) {
            return;
        }

        e.preventDefault();
        e.stopImmediatePropagation();
        this.selectElement(e.target);
    }

    handleDragStart(e) {
        if (e.target.closest('.toolbox-fonts-close') || e.target.closest('.toolbox-fonts-refresh')) {
            return;
        }

        this.dragPanel = e.currentTarget.closest('.toolbox-fonts-panel');
        const rect = this.dragPanel.getBoundingClientRect();
        this.dragState = {
            offsetX: e.clientX - rect.left,
            offsetY: e.clientY - rect.top
        };

        this.dragPanel.style.left = `${rect.left}px`;
        this.dragPanel.style.top = `${rect.top}px`;
        this.dragPanel.style.right = 'auto';
        window.addEventListener('pointermove', this.handleDragMove);
        window.addEventListener('pointerup', this.handleDragEnd);
        e.preventDefault();
        e.stopPropagation();
    }

    handleDragMove(e) {
        if (!this.dragState || !this.dragPanel) {
            return;
        }

        const panelRect = this.dragPanel.getBoundingClientRect();
        const maxLeft = Math.max(0, window.innerWidth - panelRect.width);
        const maxTop = Math.max(0, window.innerHeight - panelRect.height);
        const nextLeft = Math.min(Math.max(0, e.clientX - this.dragState.offsetX), maxLeft);
        const nextTop = Math.min(Math.max(0, e.clientY - this.dragState.offsetY), maxTop);

        this.dragPanel.style.left = `${nextLeft}px`;
        this.dragPanel.style.top = `${nextTop}px`;
    }

    handleDragEnd() {
        this.dragState = null;
        this.dragPanel = null;
        window.removeEventListener('pointermove', this.handleDragMove);
        window.removeEventListener('pointerup', this.handleDragEnd);
    }

    isToolboxElement(el) {
        return Boolean(el && el.closest('[data-toolbox-ui="true"]'));
    }

    highlightElement(el) {
        if (!el || this.isToolboxElement(el)) {
            return;
        }

        this.highlightedElement = el;

        const rect = el.getBoundingClientRect();
        this.highlightOverlay.style.display = 'block';
        this.highlightOverlay.style.top = `${rect.top}px`;
        this.highlightOverlay.style.left = `${rect.left}px`;
        this.highlightOverlay.style.width = `${rect.width}px`;
        this.highlightOverlay.style.height = `${rect.height}px`;
    }

    selectElement(el) {
        this.selectedElement = el;
        const info = this.editorPanel.querySelector('.toolbox-fonts-info');
        const controls = this.editorPanel.querySelector('.toolbox-fonts-controls');
        const computedStyle = window.getComputedStyle(el);
        const currentFamily = computedStyle.fontFamily || 'inherit';

        info.textContent = `Selected: <${el.tagName.toLowerCase()}> using ${currentFamily}`;
        controls.style.display = 'flex';
        this.editorPanel.querySelector('#toolbox-font-size').value = parseInt(computedStyle.fontSize, 10) || 16;
    }

    applyFont() {
        if (!this.selectedElement) {
            return;
        }

        const family = this.editorPanel.querySelector('#toolbox-font-family').value;
        const size = this.editorPanel.querySelector('#toolbox-font-size').value;

        this.selectedElement.style.fontFamily = family;
        this.selectedElement.style.fontSize = `${size}px`;
        this.editorPanel.querySelector('.toolbox-fonts-info').textContent = 'Font changes applied to the selected element.';
    }

    normalizeFontFamily(fontFamily) {
        const primary = (fontFamily || 'Unknown')
            .split(',')[0]
            .trim()
            .replace(/^['"]|['"]$/g, '');

        return primary || 'Unknown';
    }

    escapeHTML(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    collectFonts() {
        if (!document.body) {
            return [];
        }

        const elements = [document.documentElement, ...document.body.querySelectorAll('*')];
        const fonts = new Map();

        elements.forEach((element) => {
            const computedStyle = window.getComputedStyle(element);
            const family = computedStyle.fontFamily;
            const normalizedFamily = this.normalizeFontFamily(family);

            if (!fonts.has(normalizedFamily)) {
                fonts.set(normalizedFamily, {
                    family: normalizedFamily,
                    stack: family || normalizedFamily,
                    count: 0,
                    tags: new Set()
                });
            }

            const entry = fonts.get(normalizedFamily);
            entry.count += 1;
            entry.tags.add(element.tagName.toLowerCase());
        });

        return Array.from(fonts.values())
            .sort((left, right) => right.count - left.count)
            .map((entry) => ({
                ...entry,
                tags: Array.from(entry.tags).slice(0, 6).join(', ')
            }));
    }

    renderFontInventory() {
        const list = this.listPanel.querySelector('.toolbox-fonts-list');
        const fonts = this.collectFonts();

        if (!fonts.length) {
            list.innerHTML = '<div class="toolbox-fonts-empty">No fonts detected on this page.</div>';
            return;
        }

        list.innerHTML = fonts.map((entry) => `
            <div class="toolbox-fonts-card">
                <strong>${this.escapeHTML(entry.family)}</strong>
                <div class="toolbox-fonts-meta">${entry.count} elements • Tags: ${this.escapeHTML(entry.tags || 'n/a')}</div>
                <div class="toolbox-fonts-meta">Stack: ${this.escapeHTML(entry.stack)}</div>
                <div class="toolbox-fonts-sample" style="font-family: ${this.escapeHTML(entry.stack)};">The quick brown fox jumps over the lazy dog.</div>
            </div>
        `).join('');
    }

    openMode(mode) {
        this.active = true;
        this.mode = mode;
        this.handleDragEnd();
        this.highlightOverlay.style.display = 'none';
        this.editorPanel.style.display = mode === 'changer' ? 'flex' : 'none';
        this.listPanel.style.display = mode === 'list' ? 'flex' : 'none';

        if (mode === 'changer') {
            this.editorPanel.querySelector('.toolbox-fonts-info').textContent = 'Select an element to change font.';
            this.editorPanel.querySelector('.toolbox-fonts-controls').style.display = 'none';
            this.selectedElement = null;
            return;
        }

        this.renderFontInventory();
    }

    close() {
        this.active = false;
        this.selectedElement = null;
        this.highlightedElement = null;
        this.editorPanel.style.display = 'none';
        this.listPanel.style.display = 'none';
        this.highlightOverlay.style.display = 'none';
        this.editorPanel.querySelector('.toolbox-fonts-controls').style.display = 'none';
        this.handleDragEnd();
    }

    toggle(mode = 'changer') {
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

export default new FontTools();
