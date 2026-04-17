class ColorTools {
    constructor() {
        this.active = false;
        this.mode = 'picker';
        this.highlightOverlay = null;
        this.panel = null;
        this.dragState = null;
        this.handleMouseOver = this.handleMouseOver.bind(this);
        this.handlePointerDown = this.handlePointerDown.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleDragStart = this.handleDragStart.bind(this);
        this.handleDragMove = this.handleDragMove.bind(this);
        this.handleDragEnd = this.handleDragEnd.bind(this);
        this.init();
    }

    init() {
        this.createPanel();
        this.setupEventListeners();
    }

    createPanel() {
        const style = document.createElement('style');
        style.textContent = `
            .toolbox-color-panel {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 320px;
                max-height: 80vh;
                background: white;
                border: 1px solid #ccc;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.18);
                z-index: 2147483647;
                font-family: sans-serif;
                display: none;
                flex-direction: column;
                overflow: hidden;
            }
            .toolbox-color-header {
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
            .toolbox-color-actions {
                display: flex;
                gap: 8px;
                align-items: center;
            }
            .toolbox-color-refresh,
            .toolbox-color-close {
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
            .toolbox-color-refresh {
                padding: 4px 8px;
                background: #edf3ff;
                color: #0d6efd;
                font-size: 11px;
                font-weight: 700;
            }
            .toolbox-color-close {
                background: none;
                font-size: 20px;
                line-height: 1;
            }
            .toolbox-color-content {
                padding: 12px;
                overflow-y: auto;
                font-size: 12px;
            }
            .toolbox-color-info {
                color: #6b7280;
                margin-bottom: 10px;
            }
            .toolbox-color-list {
                display: grid;
                gap: 8px;
            }
            .toolbox-color-row,
            .toolbox-color-card {
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                padding: 10px;
                background: #fbfcfe;
            }
            .toolbox-color-row {
                display: grid;
                grid-template-columns: 24px 1fr auto;
                gap: 10px;
                align-items: center;
            }
            .toolbox-color-card-head {
                display: grid;
                grid-template-columns: 28px 1fr auto;
                gap: 10px;
                align-items: center;
                margin-bottom: 6px;
            }
            .toolbox-color-chip {
                width: 24px;
                height: 24px;
                border-radius: 6px;
                border: 1px solid rgba(0,0,0,0.12);
            }
            .toolbox-color-usage {
                color: #6b7280;
                font-size: 11px;
            }
            .toolbox-color-label {
                font-weight: 700;
                color: #111827;
            }
            .toolbox-color-value {
                font-family: monospace;
                color: #374151;
                word-break: break-all;
            }
            .toolbox-color-highlight-overlay {
                position: fixed;
                border: 2px solid #dc3545;
                background: rgba(220, 53, 69, 0.12);
                box-sizing: border-box;
                pointer-events: none;
                z-index: 2147483646;
                display: none;
            }
            .toolbox-color-empty {
                color: #6b7280;
                text-align: center;
                padding: 16px 12px;
            }
        `;
        document.head.appendChild(style);

        this.panel = document.createElement('div');
        this.panel.className = 'toolbox-color-panel';
        this.panel.setAttribute('data-toolbox-ui', 'true');
        this.panel.innerHTML = `
            <div class="toolbox-color-header">
                <strong class="toolbox-color-title">Color Picker</strong>
                <div class="toolbox-color-actions">
                    <button class="toolbox-color-refresh">Refresh</button>
                    <button class="toolbox-color-close">&times;</button>
                </div>
            </div>
            <div class="toolbox-color-content">
                <div class="toolbox-color-info">Click an element to inspect its computed colors.</div>
                <div class="toolbox-color-list"></div>
            </div>
        `;
        document.body.appendChild(this.panel);

        this.highlightOverlay = document.createElement('div');
        this.highlightOverlay.className = 'toolbox-color-highlight-overlay';
        this.highlightOverlay.setAttribute('data-toolbox-ui', 'true');
        document.body.appendChild(this.highlightOverlay);

        this.panel.querySelector('.toolbox-color-header').addEventListener('pointerdown', this.handleDragStart);
        this.panel.querySelector('.toolbox-color-close').onclick = () => this.toggle(this.mode);
        this.panel.querySelector('.toolbox-color-refresh').onclick = () => this.refresh();
    }

    setupEventListeners() {
        document.addEventListener('mouseover', this.handleMouseOver, true);
        document.addEventListener('pointerdown', this.handlePointerDown, true);
        document.addEventListener('click', this.handleClick, true);
    }

    isToolboxElement(el) {
        return Boolean(el && el.closest('[data-toolbox-ui="true"]'));
    }

    handleMouseOver(e) {
        if (!this.active || this.mode !== 'picker' || this.isToolboxElement(e.target)) {
            return;
        }

        this.highlightElement(e.target);
    }

    handlePointerDown(e) {
        if (!this.active || this.mode !== 'picker' || this.isToolboxElement(e.target)) {
            return;
        }

        e.preventDefault();
        e.stopImmediatePropagation();
    }

    handleClick(e) {
        if (!this.active || this.mode !== 'picker' || this.isToolboxElement(e.target)) {
            return;
        }

        e.preventDefault();
        e.stopImmediatePropagation();
        this.renderPickedColors(e.target);
    }

    handleDragStart(e) {
        if (e.target.closest('.toolbox-color-close') || e.target.closest('.toolbox-color-refresh')) {
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

    normalizeColor(value) {
        if (!value) {
            return null;
        }

        const trimmedValue = value.trim();
        if (!trimmedValue || trimmedValue === 'transparent' || trimmedValue === 'currentcolor' || trimmedValue === 'none') {
            return null;
        }

        const rgbaMatch = trimmedValue.match(/^rgba?\(([^)]+)\)$/i);
        if (!rgbaMatch) {
            return trimmedValue;
        }

        const [red, green, blue, alpha] = rgbaMatch[1].split(',').map((part) => part.trim());
        const numericAlpha = alpha === undefined ? 1 : Number.parseFloat(alpha);

        if (Number.isNaN(numericAlpha) || numericAlpha <= 0) {
            return null;
        }

        const toHex = (channel) => Number.parseInt(channel, 10).toString(16).padStart(2, '0');
        if (numericAlpha >= 1) {
            return `#${toHex(red)}${toHex(green)}${toHex(blue)}`.toUpperCase();
        }

        return `rgba(${Number.parseInt(red, 10)}, ${Number.parseInt(green, 10)}, ${Number.parseInt(blue, 10)}, ${numericAlpha.toFixed(2)})`;
    }

    buildColorRows(colorMap) {
        return Array.from(colorMap.entries()).map(([label, value]) => ({ label, value })).filter((entry) => Boolean(entry.value));
    }

    resolveBackgroundColor(element) {
        let node = element;
        while (node && node !== document.documentElement) {
            const color = this.normalizeColor(window.getComputedStyle(node).backgroundColor);
            if (color) {
                return color;
            }
            node = node.parentElement;
        }

        if (!document.body) {
            return '#FFFFFF';
        }

        return this.normalizeColor(window.getComputedStyle(document.body).backgroundColor) || '#FFFFFF';
    }

    renderPickedColors(element) {
        const info = this.panel.querySelector('.toolbox-color-info');
        const list = this.panel.querySelector('.toolbox-color-list');
        const computedStyle = window.getComputedStyle(element);
        const colors = new Map([
            ['Text', this.normalizeColor(computedStyle.color)],
            ['Element background', this.normalizeColor(computedStyle.backgroundColor)],
            ['Surface background', this.resolveBackgroundColor(element)],
            ['Border top', this.normalizeColor(computedStyle.borderTopColor)],
            ['Border right', this.normalizeColor(computedStyle.borderRightColor)],
            ['Border bottom', this.normalizeColor(computedStyle.borderBottomColor)],
            ['Border left', this.normalizeColor(computedStyle.borderLeftColor)],
            ['Outline', this.normalizeColor(computedStyle.outlineColor)],
            ['Text decoration', this.normalizeColor(computedStyle.textDecorationColor)]
        ]);

        const rows = this.buildColorRows(colors);
        info.textContent = `Selected <${element.tagName.toLowerCase()}>. Click another element to inspect a different area.`;

        if (!rows.length) {
            list.innerHTML = '<div class="toolbox-color-empty">No computed colors found for this element.</div>';
            return;
        }

        list.innerHTML = rows.map((entry) => `
            <div class="toolbox-color-row">
                <span class="toolbox-color-chip" style="background: ${entry.value};"></span>
                <div>
                    <div class="toolbox-color-label">${entry.label}</div>
                    <div class="toolbox-color-value">${entry.value}</div>
                </div>
                <span></span>
            </div>
        `).join('');
    }

    collectPalette() {
        const properties = [
            'color',
            'backgroundColor',
            'borderTopColor',
            'borderRightColor',
            'borderBottomColor',
            'borderLeftColor',
            'outlineColor',
            'textDecorationColor',
            'fill',
            'stroke'
        ];
        const colors = new Map();
        if (!document.body) {
            return [];
        }

        const elements = [document.documentElement, document.body, ...document.body.querySelectorAll('*')];

        elements.forEach((element) => {
            const computedStyle = window.getComputedStyle(element);
            properties.forEach((property) => {
                const color = this.normalizeColor(computedStyle[property]);
                if (!color) {
                    return;
                }

                if (!colors.has(color)) {
                    colors.set(color, { count: 0, elements: new Set() });
                }

                const entry = colors.get(color);
                entry.count += 1;
                entry.elements.add(element.tagName.toLowerCase());
            });
        });

        return Array.from(colors.entries())
            .map(([value, meta]) => ({
                value,
                count: meta.count,
                elements: Array.from(meta.elements).slice(0, 5).join(', ')
            }))
            .sort((left, right) => right.count - left.count)
            .slice(0, 30);
    }

    renderPalette() {
        const info = this.panel.querySelector('.toolbox-color-info');
        const list = this.panel.querySelector('.toolbox-color-list');
        const palette = this.collectPalette();

        info.textContent = 'Palette extracted from computed text, background, border, and vector colors.';

        if (!palette.length) {
            list.innerHTML = '<div class="toolbox-color-empty">No reusable palette colors were detected.</div>';
            return;
        }

        list.innerHTML = palette.map((entry) => `
            <div class="toolbox-color-card">
                <div class="toolbox-color-card-head">
                    <span class="toolbox-color-chip" style="background: ${entry.value};"></span>
                    <div>
                        <div class="toolbox-color-label">${entry.value}</div>
                        <div class="toolbox-color-usage">Seen ${entry.count} times</div>
                    </div>
                    <span></span>
                </div>
                <div class="toolbox-color-value">Elements: ${entry.elements || 'n/a'}</div>
            </div>
        `).join('');
    }

    highlightElement(element) {
        if (!element || this.isToolboxElement(element)) {
            return;
        }

        const rect = element.getBoundingClientRect();
        this.highlightOverlay.style.display = 'block';
        this.highlightOverlay.style.top = `${rect.top}px`;
        this.highlightOverlay.style.left = `${rect.left}px`;
        this.highlightOverlay.style.width = `${rect.width}px`;
        this.highlightOverlay.style.height = `${rect.height}px`;
    }

    refresh() {
        if (this.mode === 'palette') {
            this.renderPalette();
            return;
        }

        this.panel.querySelector('.toolbox-color-info').textContent = 'Click an element to inspect its computed colors.';
        this.panel.querySelector('.toolbox-color-list').innerHTML = '';
    }

    openMode(mode) {
        this.active = true;
        this.mode = mode;
        this.panel.style.display = 'flex';
        this.panel.querySelector('.toolbox-color-title').textContent = mode === 'palette' ? 'Color Palette' : 'Color Picker';
        this.highlightOverlay.style.display = 'none';
        this.panel.querySelector('.toolbox-color-list').innerHTML = '';

        if (mode === 'palette') {
            this.renderPalette();
            return;
        }

        this.panel.querySelector('.toolbox-color-info').textContent = 'Click an element to inspect its computed colors.';
    }

    close() {
        this.active = false;
        this.panel.style.display = 'none';
        this.highlightOverlay.style.display = 'none';
        this.handleDragEnd();
    }

    toggle(mode = 'picker') {
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

export default new ColorTools();