/**
 * Live Text Editor Tool
 * Allows users to make any text on the page editable by toggling designMode.
 */

class LiveTextEditor {
    constructor() {
        this.active = false;
        this.toolbar = null;
        this.dragState = null;
        this.handleDragStart = this.handleDragStart.bind(this);
        this.handleDragMove = this.handleDragMove.bind(this);
        this.handleDragEnd = this.handleDragEnd.bind(this);
        this.init();
    }

    init() {
        this.createToolbar();
    }

    createToolbar() {
        this.toolbar = document.createElement('div');
        this.toolbar.className = 'toolbox-text-editor-toolbar';
        this.toolbar.setAttribute('data-toolbox-ui', 'true');
        this.toolbar.setAttribute('contenteditable', 'false');
        this.toolbar.innerHTML = `
            <div class="toolbox-editor-header">
                <strong>Live Text Editor</strong>
                <button class="toolbox-editor-close">&times;</button>
            </div>
            <div class="toolbox-editor-controls">
                <span class="toolbox-editor-status">Status: <span>Inactive</span></span>
                <p class="toolbox-editor-hint">Click anywhere on the page to edit text.</p>
            </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
            .toolbox-text-editor-toolbar {
                position: fixed;
                top: 20px;
                left: 20px;
                width: 200px;
                background: white;
                border: 1px solid #ccc;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 2147483647;
                font-family: sans-serif;
                display: none;
                flex-direction: column;
            }
            .toolbox-editor-header {
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
            .toolbox-editor-close {
                cursor: pointer;
                border: none;
                background: none;
                font-size: 20px;
                line-height: 1;
            }
            .toolbox-editor-controls {
                padding: 12px;
                font-size: 12px;
            }
            .toolbox-editor-status span {
                font-weight: bold;
            }
            .toolbox-editor-status span.active {
                color: #198754;
            }
            .toolbox-editor-hint {
                margin-top: 8px;
                color: #666;
                font-style: italic;
            }
            .toolbox-editable-mode {
                outline: 2px dashed #198754 !important;
                outline-offset: -2px !important;
            }
            .toolbox-text-editor-toolbar,
            .toolbox-text-editor-toolbar * {
                -webkit-user-modify: read-only !important;
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(this.toolbar);

        this.toolbar.querySelector('.toolbox-editor-header').addEventListener('pointerdown', this.handleDragStart);
        this.toolbar.querySelector('.toolbox-editor-close').onclick = () => this.toggle();
    }

    handleDragStart(e) {
        if (e.target.closest('.toolbox-editor-close')) {
            return;
        }

        const rect = this.toolbar.getBoundingClientRect();
        this.dragState = {
            offsetX: e.clientX - rect.left,
            offsetY: e.clientY - rect.top
        };

        this.toolbar.style.left = `${rect.left}px`;
        this.toolbar.style.top = `${rect.top}px`;
        this.toolbar.style.right = 'auto';
        window.addEventListener('pointermove', this.handleDragMove);
        window.addEventListener('pointerup', this.handleDragEnd);
        e.preventDefault();
        e.stopPropagation();
    }

    handleDragMove(e) {
        if (!this.dragState) {
            return;
        }

        const toolbarRect = this.toolbar.getBoundingClientRect();
        const maxLeft = Math.max(0, window.innerWidth - toolbarRect.width);
        const maxTop = Math.max(0, window.innerHeight - toolbarRect.height);
        const nextLeft = Math.min(Math.max(0, e.clientX - this.dragState.offsetX), maxLeft);
        const nextTop = Math.min(Math.max(0, e.clientY - this.dragState.offsetY), maxTop);

        this.toolbar.style.left = `${nextLeft}px`;
        this.toolbar.style.top = `${nextTop}px`;
    }

    handleDragEnd() {
        this.dragState = null;
        window.removeEventListener('pointermove', this.handleDragMove);
        window.removeEventListener('pointerup', this.handleDragEnd);
    }

    syncToolbarEditability() {
        const nodes = [this.toolbar, ...this.toolbar.querySelectorAll('*')];
        nodes.forEach((node) => {
            node.setAttribute('contenteditable', 'false');
            node.setAttribute('spellcheck', 'false');
        });
    }

    toggle() {
        this.active = !this.active;
        
        if (this.active) {
            this.toolbar.style.display = 'flex';
            this.syncToolbarEditability();
            document.designMode = 'on';
            this.syncToolbarEditability();
            this.updateStatus(true);
            document.body.classList.add('toolbox-editable-mode');
        } else {
            document.designMode = 'off';
            this.toolbar.style.display = 'none';
            this.handleDragEnd();
            this.updateStatus(false);
            document.body.classList.remove('toolbox-editable-mode');
        }
    }

    updateStatus(isActive) {
        const statusSpan = this.toolbar.querySelector('.toolbox-editor-status span');
        statusSpan.textContent = isActive ? 'Active' : 'Inactive';
        if (isActive) {
            statusSpan.classList.add('active');
        } else {
            statusSpan.classList.remove('active');
        }
    }
}

export default new LiveTextEditor();
