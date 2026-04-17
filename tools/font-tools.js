/**
 * Fonts Changer Tool
 * Allows users to change the font family of a selected element.
 */

class FontsChanger {
    constructor() {
        this.active = false;
        this.highlightedElement = null;
        this.selectedElement = null;
        this.panel = null;
        this.highlightOverlay = null;
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
        this.panel = document.createElement('div');
        this.panel.className = 'toolbox-fonts-changer-panel';
        this.panel.setAttribute('data-toolbox-ui', 'true');
        this.panel.innerHTML = `
            <div class="toolbox-fonts-header">
                <strong>Fonts Changer</strong>
                <button class="toolbox-fonts-close">&times;</button>
            </div>
            <div class="toolbox-fonts-content">
                <div class="toolbox-fonts-info">Select an element to change font</div>
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
                        <input type="number" id="toolbox-font-size" value="16">
                    </div>
                    <button class="toolbox-fonts-apply">Apply Changes</button>
                </div>
            </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
            .toolbox-fonts-changer-panel {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 260px;
                background: white;
                border: 1px solid #ccc;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 2147483647;
                font-family: sans-serif;
                display: none;
                flex-direction: column;
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
            .toolbox-fonts-close {
                cursor: pointer;
                border: none;
                background: none;
                font-size: 20px;
                line-height: 1;
            }
            .toolbox-fonts-content {
                padding: 12px;
                font-size: 12px;
            }
            .toolbox-fonts-info {
                margin-bottom: 10px;
                color: #666;
                text-align: center;
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
            .toolbox-fonts-group select, .toolbox-fonts-group input {
                padding: 4px;
                border: 1px solid #ddd;
                border-radius: 4px;
            }
            .toolbox-fonts-apply {
                margin-top: 10px;
                padding: 6px;
                cursor: pointer;
                background: #0d6efd;
                color: white;
                border: none;
                border-radius: 4px;
                font-weight: bold;
            }
            .toolbox-fonts-apply:hover {
                background: #0b5ed7;
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
        document.body.appendChild(this.panel);

        this.highlightOverlay = document.createElement('div');
        this.highlightOverlay.className = 'toolbox-fonts-highlight-overlay';
        this.highlightOverlay.setAttribute('data-toolbox-ui', 'true');
        document.body.appendChild(this.highlightOverlay);

        this.panel.querySelector('.toolbox-fonts-header').addEventListener('pointerdown', this.handleDragStart);
        this.panel.querySelector('.toolbox-fonts-close').onclick = () => this.toggle();
        this.panel.querySelector('.toolbox-fonts-apply').onclick = () => this.applyFont();
    }

    setupEventListeners() {
        document.addEventListener('mouseover', this.handleMouseOver, true);
        document.addEventListener('pointerdown', this.handlePointerDown, true);
        document.addEventListener('click', this.handleClick, true);
    }

    handleMouseOver(e) {
        if (!this.active || this.isToolboxElement(e.target)) return;
        e.stopPropagation();
        this.highlightElement(e.target);
    }

    handlePointerDown(e) {
        if (!this.active || this.isToolboxElement(e.target)) return;
        e.preventDefault();
        e.stopImmediatePropagation();
    }

    handleClick(e) {
        if (!this.active || this.isToolboxElement(e.target)) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        this.selectElement(e.target);
    }

    handleDragStart(e) {
        if (e.target.closest('.toolbox-fonts-close')) {
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
        this.panel.querySelector('.toolbox-fonts-info').textContent = `Selected: <${el.tagName.toLowerCase()}>`;
        this.panel.querySelector('.toolbox-fonts-controls').style.display = 'flex';
        
        // Set current values
        const style = window.getComputedStyle(el);
        this.panel.querySelector('#toolbox-font-size').value = parseInt(style.fontSize) || 16;
    }

    applyFont() {
        if (!this.selectedElement) return;
        
        const family = this.panel.querySelector('#toolbox-font-family').value;
        const size = this.panel.querySelector('#toolbox-font-size').value;
        
        this.selectedElement.style.fontFamily = family;
        this.selectedElement.style.fontSize = size + 'px';
    }

    toggle() {
        this.active = !this.active;
        if (!this.active) {
            this.panel.style.display = 'none';
            this.handleDragEnd();
            this.highlightedElement = null;
            this.highlightOverlay.style.display = 'none';
            this.selectedElement = null;
            this.panel.querySelector('.toolbox-fonts-controls').style.display = 'none';
            this.panel.querySelector('.toolbox-fonts-info').textContent = 'Select an element to change font';
        } else {
            this.panel.style.display = 'flex';
        }
    }
}

export default new FontsChanger();
