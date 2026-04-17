/**
 * CSS Inspector Tool
 * Allows users to hover over elements to see their computed styles
 * and click to lock the element for detailed inspection.
 */

class CSSInspector {
    constructor() {
        this.active = false;
        this.highlightedElement = null;
        this.highlightOverlay = null;
        this.inspectorPanel = null;
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
        this.inspectorPanel = document.createElement('div');
        this.inspectorPanel.className = 'toolbox-css-inspector-panel';
        this.inspectorPanel.setAttribute('data-toolbox-ui', 'true');
        this.inspectorPanel.innerHTML = `
            <div class="toolbox-inspector-header">
                <strong>CSS Inspector</strong>
                <button class="toolbox-inspector-close">&times;</button>
            </div>
            <div class="toolbox-inspector-content">
                <div class="toolbox-inspector-element-info">Select an element...</div>
                <div class="toolbox-inspector-styles"></div>
            </div>
        `;
        
        // Add styles to the panel
        const style = document.createElement('style');
        style.textContent = `
            .toolbox-css-inspector-panel {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 300px;
                max-height: 80vh;
                background: white;
                border: 1px solid #ccc;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                z-index: 2147483647;
                font-family: sans-serif;
                display: none;
                flex-direction: column;
                overflow: hidden;
            }
            .toolbox-highlight-overlay {
                position: fixed;
                border: 2px solid #0d6efd;
                background: rgba(13, 110, 253, 0.08);
                box-sizing: border-box;
                pointer-events: none;
                z-index: 2147483646;
                display: none;
            }
            .toolbox-inspector-header {
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
            .toolbox-inspector-close {
                cursor: pointer;
                border: none;
                background: none;
                font-size: 20px;
                line-height: 1;
            }
            .toolbox-inspector-content {
                padding: 12px;
                overflow-y: auto;
                font-size: 12px;
            }
            .toolbox-inspector-element-info {
                margin-bottom: 10px;
                padding-bottom: 10px;
                border-bottom: 1px solid #eee;
                font-weight: bold;
                word-break: break-all;
            }
            .toolbox-inspector-styles {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            .toolbox-style-row {
                display: flex;
                justify-content: space-between;
                padding: 2px 0;
                border-bottom: 1px solid #fafafa;
            }
            .toolbox-style-prop {
                color: #881391;
                font-weight: bold;
            }
            .toolbox-style-val {
                color: #252525;
                text-align: right;
                margin-left: 10px;
            }
        `;
        document.head.appendChild(style);
        this.highlightOverlay = document.createElement('div');
        this.highlightOverlay.className = 'toolbox-highlight-overlay';
        this.highlightOverlay.setAttribute('data-toolbox-ui', 'true');
        document.body.appendChild(this.highlightOverlay);
        document.body.appendChild(this.inspectorPanel);

        this.inspectorPanel.querySelector('.toolbox-inspector-header').addEventListener('pointerdown', this.handleDragStart);
        this.inspectorPanel.querySelector('.toolbox-inspector-close').onclick = () => this.toggle();
    }

    setupEventListeners() {
        document.addEventListener('mouseover', this.handleMouseOver, true);
        document.addEventListener('pointerdown', this.handlePointerDown, true);
        document.addEventListener('click', this.handleClick, true);
    }

    handleMouseOver(e) {
        if (!this.active) return;
        if (this.isToolboxElement(e.target)) return;
        e.stopPropagation();
        this.highlightElement(e.target);
    }

    handlePointerDown(e) {
        if (!this.active) return;
        if (this.isToolboxElement(e.target)) return;
        e.preventDefault();
        e.stopImmediatePropagation();
    }

    handleClick(e) {
        if (!this.active) return;
        if (this.isToolboxElement(e.target)) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        this.inspectElement(e.target);
    }

    handleDragStart(e) {
        if (e.target.closest('.toolbox-inspector-close')) {
            return;
        }

        const rect = this.inspectorPanel.getBoundingClientRect();
        this.dragState = {
            offsetX: e.clientX - rect.left,
            offsetY: e.clientY - rect.top
        };

        this.inspectorPanel.style.left = `${rect.left}px`;
        this.inspectorPanel.style.top = `${rect.top}px`;
        this.inspectorPanel.style.right = 'auto';
        window.addEventListener('pointermove', this.handleDragMove);
        window.addEventListener('pointerup', this.handleDragEnd);
        e.preventDefault();
        e.stopPropagation();
    }

    handleDragMove(e) {
        if (!this.dragState) {
            return;
        }

        const panelRect = this.inspectorPanel.getBoundingClientRect();
        const maxLeft = Math.max(0, window.innerWidth - panelRect.width);
        const maxTop = Math.max(0, window.innerHeight - panelRect.height);
        const nextLeft = Math.min(Math.max(0, e.clientX - this.dragState.offsetX), maxLeft);
        const nextTop = Math.min(Math.max(0, e.clientY - this.dragState.offsetY), maxTop);

        this.inspectorPanel.style.left = `${nextLeft}px`;
        this.inspectorPanel.style.top = `${nextTop}px`;
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

    inspectElement(el) {
        this.inspectorPanel.style.display = 'flex';
        const info = this.inspectorPanel.querySelector('.toolbox-inspector-element-info');
        const stylesDiv = this.inspectorPanel.querySelector('.toolbox-inspector-styles');
        
        info.textContent = `<${el.tagName.toLowerCase()}> ${el.className ? '.' + el.className.split(' ').join('.') : ''} ${el.id ? '#' + el.id : ''}`;
        
        const computed = window.getComputedStyle(el);
        stylesDiv.innerHTML = '';
        
        // We only show a subset of common styles to avoid overwhelming the user
        const commonStyles = [
            'display', 'position', 'width', 'height', 'margin', 'padding', 
            'font-family', 'font-size', 'color', 'background-color', 
            'border', 'flex', 'grid', 'z-index', 'opacity'
        ];

        commonStyles.forEach(prop => {
            const val = computed.getPropertyValue(prop);
            if (val) {
                const row = document.createElement('div');
                row.className = 'toolbox-style-row';
                row.innerHTML = `<span class="toolbox-style-prop">${prop}</span><span class="toolbox-style-val">${val}</span>`;
                stylesDiv.appendChild(row);
            }
        });
    }

    toggle() {
        this.active = !this.active;
        if (!this.active) {
            this.inspectorPanel.style.display = 'none';
            this.highlightOverlay.style.display = 'none';
            this.highlightedElement = null;
            this.handleDragEnd();
        } else {
            this.inspectorPanel.style.display = 'flex';
        }
    }
}

export default new CSSInspector();
