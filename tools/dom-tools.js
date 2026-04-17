/**
 * DOM Tools
 * Allows users to move, delete, or hide elements in the DOM.
 */

class DOMTools {
    constructor() {
        this.active = false;
        this.currentAction = 'move';
        this.highlightedElement = null;
        this.selectedElement = null;
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
        this.panel = document.createElement('div');
        this.panel.className = 'toolbox-dom-tools-panel';
        this.panel.setAttribute('data-toolbox-ui', 'true');
        this.panel.innerHTML = `
            <div class="toolbox-dom-header">
                <strong>DOM Tools</strong>
                <button class="toolbox-dom-close">&times;</button>
            </div>
            <div class="toolbox-dom-content">
                <div class="toolbox-dom-mode">Mode: Move element</div>
                <div class="toolbox-dom-info">Select an element</div>
                <div class="toolbox-dom-controls" style="display: none;">
                    <div class="toolbox-dom-group">
                        <button class="toolbox-dom-up">↑ Up</button>
                        <button class="toolbox-dom-down">↓ Down</button>
                    </div>
                    <div class="toolbox-dom-group">
                        <button class="toolbox-dom-hide">Hide</button>
                        <button class="toolbox-dom-delete">Delete</button>
                    </div>
                </div>
            </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
            .toolbox-dom-tools-panel {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 240px;
                background: white;
                border: 1px solid #ccc;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 2147483647;
                font-family: sans-serif;
                display: none;
                flex-direction: column;
            }
            .toolbox-dom-header {
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
            .toolbox-dom-close {
                cursor: pointer;
                border: none;
                background: none;
                font-size: 20px;
                line-height: 1;
            }
            .toolbox-dom-content {
                padding: 12px;
                font-size: 12px;
                text-align: center;
            }
            .toolbox-dom-info {
                margin-bottom: 10px;
                color: #666;
                word-break: break-word;
            }
            .toolbox-dom-mode {
                margin-bottom: 8px;
                font-size: 11px;
                font-weight: bold;
                color: #0d6efd;
                text-transform: uppercase;
            }
            .toolbox-dom-controls {
                display: flex;
                flex-direction: column;
                gap: 8px;
                align-items: center;
            }
            .toolbox-dom-group {
                display: flex;
                gap: 8px;
                justify-content: center;
            }
            .toolbox-dom-up, .toolbox-dom-down, .toolbox-dom-hide, .toolbox-dom-delete {
                padding: 4px 8px;
                cursor: pointer;
                border: 1px solid #ddd;
                background: #f8f9fa;
                border-radius: 4px;
            }
            .toolbox-dom-up:hover, .toolbox-dom-down:hover, .toolbox-dom-hide:hover, .toolbox-dom-delete:hover {
                background: #e2e6ea;
            }
            .toolbox-dom-delete {
                color: #dc3545;
            }
            .toolbox-dom-button-active {
                border-color: #0d6efd;
                background: #e7f1ff;
            }
            .toolbox-dom-highlight-overlay {
                position: fixed;
                border: 2px solid #ffc107;
                background: rgba(255, 193, 7, 0.12);
                box-sizing: border-box;
                pointer-events: none;
                z-index: 2147483646;
                display: none;
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(this.panel);

        this.panel.querySelector('.toolbox-dom-header').addEventListener('pointerdown', this.handleDragStart);
        this.panel.querySelector('.toolbox-dom-close').onclick = () => this.toggle();

        this.highlightOverlay = document.createElement('div');
        this.highlightOverlay.className = 'toolbox-dom-highlight-overlay';
        this.highlightOverlay.setAttribute('data-toolbox-ui', 'true');
        document.body.appendChild(this.highlightOverlay);
        
        this.panel.querySelector('.toolbox-dom-up').onclick = () => this.moveElement('up');
        this.panel.querySelector('.toolbox-dom-down').onclick = () => this.moveElement('down');
        this.panel.querySelector('.toolbox-dom-hide').onclick = () => this.hideElement();
        this.panel.querySelector('.toolbox-dom-delete').onclick = () => this.deleteElement();
    }

    setupEventListeners() {
        document.addEventListener('mouseover', this.handleMouseOver, true);
        document.addEventListener('pointerdown', this.handlePointerDown, true);
        document.addEventListener('click', this.handleClick, true);
    }

    handleMouseOver(e) {
        if (!this.active || this.isToolboxElement(e.target)) {
            return;
        }

        this.highlightElement(e.target);
    }

    handlePointerDown(e) {
        if (!this.active || this.isToolboxElement(e.target)) {
            return;
        }

        e.preventDefault();
        e.stopImmediatePropagation();
    }

    handleClick(e) {
        if (!this.active || this.isToolboxElement(e.target)) {
            return;
        }

        e.preventDefault();
        e.stopImmediatePropagation();
        this.selectElement(e.target);
    }

    handleDragStart(e) {
        if (e.target.closest('.toolbox-dom-close')) {
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
        this.panel.querySelector('.toolbox-dom-info').textContent = this.getElementLabel(el);
        this.panel.querySelector('.toolbox-dom-controls').style.display = 'flex';
        this.panel.style.display = 'flex';
    }

    getElementLabel(el) {
        const classLabel = el.classList.length ? `.${Array.from(el.classList).join('.')}` : '';
        const idLabel = el.id ? `#${el.id}` : '';
        return `Selected: <${el.tagName.toLowerCase()}>${idLabel}${classLabel}`;
    }

    updateModeUI() {
        const isDeleteMode = this.currentAction === 'delete';
        this.panel.querySelector('.toolbox-dom-mode').textContent = isDeleteMode
            ? 'Mode: Delete or hide element'
            : 'Mode: Move element';

        this.panel.querySelector('.toolbox-dom-up').classList.toggle('toolbox-dom-button-active', !isDeleteMode);
        this.panel.querySelector('.toolbox-dom-down').classList.toggle('toolbox-dom-button-active', !isDeleteMode);
        this.panel.querySelector('.toolbox-dom-hide').classList.toggle('toolbox-dom-button-active', isDeleteMode);
        this.panel.querySelector('.toolbox-dom-delete').classList.toggle('toolbox-dom-button-active', isDeleteMode);
    }

    moveElement(direction) {
        if (!this.selectedElement) return;

        const parent = this.selectedElement.parentNode;
        if (!parent) return;

        if (direction === 'up') {
            const prev = this.selectedElement.previousElementSibling;
            if (prev) {
                parent.insertBefore(this.selectedElement, prev);
                this.panel.querySelector('.toolbox-dom-info').textContent = 'Element moved up';
            }
        } else if (direction === 'down') {
            const next = this.selectedElement.nextElementSibling;
            if (next) {
                parent.insertBefore(next, this.selectedElement);
                this.panel.querySelector('.toolbox-dom-info').textContent = 'Element moved down';
            }
        }

        this.highlightElement(this.selectedElement);
    }

    deleteElement() {
        if (!this.selectedElement) return;
        const el = this.selectedElement;
        this.selectedElement = null;
        el.remove();
        this.highlightedElement = null;
        this.highlightOverlay.style.display = 'none';
        this.panel.querySelector('.toolbox-dom-controls').style.display = 'none';
        this.panel.querySelector('.toolbox-dom-info').textContent = 'Element deleted';
    }

    hideElement() {
        if (!this.selectedElement) return;
        this.selectedElement.style.display = 'none';
        this.highlightOverlay.style.display = 'none';
        this.panel.querySelector('.toolbox-dom-info').textContent = 'Element hidden';
    }

    toggle(action = null) {
        const requestedAction = action || this.currentAction;

        if (!this.active) {
            this.active = true;
            this.currentAction = requestedAction;
            this.panel.style.display = 'flex';
            this.updateModeUI();
            return;
        }

        if (action && requestedAction !== this.currentAction) {
            this.currentAction = requestedAction;
            this.updateModeUI();
            return;
        }

        this.active = false;
        if (!this.active) {
            this.panel.style.display = 'none';
            this.highlightedElement = null;
            this.selectedElement = null;
            this.highlightOverlay.style.display = 'none';
            this.handleDragEnd();
            this.panel.querySelector('.toolbox-dom-controls').style.display = 'none';
            this.panel.querySelector('.toolbox-dom-info').textContent = 'Select an element';
        }
    }
}

export default new DOMTools();

