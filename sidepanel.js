const STORAGE_KEY = 'toolboxTodoTasks';
const TIMER_TICK_MS = 1000;

const taskInput = document.getElementById('task-input');
const addTaskButton = document.getElementById('add-task');
const addCurrentPageButton = document.getElementById('add-current-page');
const clearCompletedButton = document.getElementById('clear-completed');
const todoList = document.getElementById('todo-list');
const summaryTotal = document.getElementById('summary-total');
const summaryOpen = document.getElementById('summary-open');
const summaryDone = document.getElementById('summary-done');
const deleteModal = document.getElementById('delete-modal');
const deleteModalTitle = document.getElementById('delete-modal-title');
const deleteModalMessage = document.getElementById('delete-modal-message');
const cancelDeleteButton = document.getElementById('cancel-delete');
const confirmDeleteButton = document.getElementById('confirm-delete');

let pendingDeleteTaskId = null;
let pendingDeleteMode = null;

function normalizeTask(task) {
    return {
        ...task,
        completed: Boolean(task.completed),
        elapsedMs: Number(task.elapsedMs || 0),
        timerStartedAt: task.timerStartedAt || null,
        completedAt: task.completedAt || null
    };
}

async function getTasks() {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return Array.isArray(result[STORAGE_KEY]) ? result[STORAGE_KEY].map(normalizeTask) : [];
}

async function saveTasks(tasks) {
    await chrome.storage.local.set({ [STORAGE_KEY]: tasks });
}

function updateSummary(tasks) {
    const completeCount = tasks.filter((task) => task.completed).length;
    summaryTotal.textContent = String(tasks.length);
    summaryOpen.textContent = String(tasks.length - completeCount);
    summaryDone.textContent = String(completeCount);
}

function formatTime(timestamp) {
    if (!timestamp) {
        return 'Just now';
    }

    return new Date(timestamp).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
}

function formatDuration(milliseconds) {
    const totalSeconds = Math.max(0, Math.floor((milliseconds || 0) / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
        .map((value) => String(value).padStart(2, '0'))
        .join(':');
}

function getElapsedMs(task) {
    const startedAt = task.timerStartedAt ? new Date(task.timerStartedAt).getTime() : null;
    const liveMs = startedAt ? Date.now() - startedAt : 0;
    return Number(task.elapsedMs || 0) + liveMs;
}

function updateVisibleTimers() {
    const items = todoList.querySelectorAll('.todo-item');
    items.forEach((item) => {
        const value = item.querySelector('.todo-timer-value');
        if (!value) {
            return;
        }

        const baseElapsed = Number(item.dataset.elapsedMs || 0);
        const startedAt = Number(item.dataset.startedAt || 0);
        const elapsed = baseElapsed + (startedAt ? Date.now() - startedAt : 0);
        value.textContent = formatDuration(elapsed);
    });
}

async function renderTasks() {
    const tasks = await getTasks();
    updateSummary(tasks);

    if (!tasks.length) {
        todoList.innerHTML = '<div class="todo-empty">No tasks yet. Add one from the panel or save the current page as a follow-up.</div>';
        return;
    }

    todoList.innerHTML = tasks.map((task) => {
        const elapsed = getElapsedMs(task);
        const startedAt = task.timerStartedAt ? new Date(task.timerStartedAt).getTime() : 0;
        const hasTimerToDisplay = task.timerStartedAt || elapsed > 0;
        const timerLabel = task.timerStartedAt ? 'Running' : task.completed ? 'Spent' : 'Tracked';
        const completionMeta = task.completedAt ? `<div class="todo-item-meta">Completed ${escapeHTML(formatTime(task.completedAt))}</div>` : '';
        const timerMarkup = !task.completed
            ? `
                <div class="todo-timer-row">
                    <span class="todo-timer-pill ${task.timerStartedAt ? 'is-running' : 'is-paused'}">
                        <button class="todo-timer-toggle task-timer-toggle" type="button" aria-label="${task.timerStartedAt ? 'Pause timer' : 'Start timer'}">${task.timerStartedAt ? '❚❚' : '▶'}</button>
                        <span>${timerLabel}: <span class="todo-timer-value">${formatDuration(elapsed)}</span></span>
                    </span>
                </div>
            `
            : hasTimerToDisplay
                ? `
                    <div class="todo-timer-row">
                        <span class="todo-timer-pill is-paused">Spent: <span class="todo-timer-value">${formatDuration(elapsed)}</span></span>
                    </div>
                `
                : '';

        return `
            <div class="todo-item ${task.completed ? 'is-complete' : ''}" data-id="${task.id}" data-elapsed-ms="${task.elapsedMs}" data-started-at="${startedAt}">
                <input class="form-check-input task-toggle" type="checkbox" ${task.completed ? 'checked' : ''} aria-label="Toggle task completion">
                <div>
                    <div class="todo-item-text">${escapeHTML(task.text)}</div>
                    <div class="todo-item-meta">Created ${escapeHTML(formatTime(task.createdAt))}</div>
                    ${completionMeta}
                    ${timerMarkup}
                </div>
                <button class="btn btn-sm btn-outline-danger task-delete" aria-label="Delete task" title="Delete task">🗑</button>
            </div>
        `;
    }).join('');

    updateVisibleTimers();
}

function escapeHTML(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function addTask(text) {
    const cleanText = (text || '').trim();
    if (!cleanText) {
        taskInput.focus();
        return;
    }

    const tasks = await getTasks();
    tasks.unshift({
        id: Date.now(),
        text: cleanText,
        completed: false,
        createdAt: new Date().toISOString(),
        elapsedMs: 0,
        timerStartedAt: null,
        completedAt: null
    });

    await saveTasks(tasks);
    taskInput.value = '';
    renderTasks();
}

async function addCurrentPageTask() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) {
        return;
    }

    const title = tab.title || 'Current page';
    const url = tab.url || '';
    await addTask(`Review: ${title}\n${url}`);
}

async function toggleTask(taskId, completed) {
    const tasks = await getTasks();
    const now = Date.now();

    const nextTasks = tasks.map((task) => {
        if (task.id !== taskId) {
            return task;
        }

        const nextTask = { ...task, completed, completedAt: completed ? new Date(now).toISOString() : null };

        if (completed && task.timerStartedAt) {
            nextTask.elapsedMs = getElapsedMs(task);
            nextTask.timerStartedAt = null;
        }

        return nextTask;
    });

    await saveTasks(nextTasks);
    renderTasks();
}

async function startTaskTimer(taskId) {
    const tasks = await getTasks();
    const nextTasks = tasks.map((task) => {
        if (task.id !== taskId || task.completed || task.timerStartedAt) {
            return task;
        }

        return {
            ...task,
            timerStartedAt: new Date().toISOString()
        };
    });

    await saveTasks(nextTasks);
    renderTasks();
}

async function pauseTaskTimer(taskId) {
    const tasks = await getTasks();
    const nextTasks = tasks.map((task) => {
        if (task.id !== taskId || !task.timerStartedAt) {
            return task;
        }

        return {
            ...task,
            elapsedMs: getElapsedMs(task),
            timerStartedAt: null
        };
    });

    await saveTasks(nextTasks);
    renderTasks();
}

function openDeleteModal(taskId) {
    pendingDeleteTaskId = taskId;
    pendingDeleteMode = 'single';
    deleteModalTitle.textContent = 'Delete task?';
    deleteModalMessage.textContent = 'This action will remove the task and its tracked time.';
    confirmDeleteButton.textContent = 'Delete';
    deleteModal.classList.add('is-open');
    deleteModal.setAttribute('aria-hidden', 'false');
}

function openClearCompletedModal() {
    pendingDeleteTaskId = null;
    pendingDeleteMode = 'completed';
    deleteModalTitle.textContent = 'Clear completed tasks?';
    deleteModalMessage.textContent = 'This will remove all completed tasks and their tracked time.';
    confirmDeleteButton.textContent = 'Clear completed';
    deleteModal.classList.add('is-open');
    deleteModal.setAttribute('aria-hidden', 'false');
}

function closeDeleteModal() {
    pendingDeleteTaskId = null;
    pendingDeleteMode = null;
    deleteModal.classList.remove('is-open');
    deleteModal.setAttribute('aria-hidden', 'true');
}

async function deleteTask(taskId) {
    const tasks = await getTasks();
    const nextTasks = tasks.filter((task) => task.id !== taskId);
    await saveTasks(nextTasks);
    renderTasks();
}

async function clearCompleted() {
    const tasks = await getTasks();
    const nextTasks = tasks.filter((task) => !task.completed);
    await saveTasks(nextTasks);
    renderTasks();
}

addTaskButton.addEventListener('click', () => addTask(taskInput.value));
addCurrentPageButton.addEventListener('click', addCurrentPageTask);
clearCompletedButton.addEventListener('click', async () => {
    const tasks = await getTasks();
    const hasCompleted = tasks.some((task) => task.completed);

    if (hasCompleted) {
        openClearCompletedModal();
    }
});

taskInput.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        addTask(taskInput.value);
    }
});

todoList.addEventListener('click', (event) => {
    const item = event.target.closest('.todo-item');
    if (!item) {
        return;
    }

    const taskId = Number(item.dataset.id);
    if (event.target.classList.contains('task-delete')) {
        openDeleteModal(taskId);
        return;
    }

    if (event.target.classList.contains('task-timer-toggle') || event.target.closest('.task-timer-toggle')) {
        const toggleButton = event.target.closest('.task-timer-toggle');
        const isRunning = toggleButton.getAttribute('aria-label') === 'Pause timer';

        if (isRunning) {
            pauseTaskTimer(taskId);
        } else {
            startTaskTimer(taskId);
        }
    }
});

todoList.addEventListener('change', (event) => {
    const item = event.target.closest('.todo-item');
    if (!item || !event.target.classList.contains('task-toggle')) {
        return;
    }

    toggleTask(Number(item.dataset.id), event.target.checked);
});

cancelDeleteButton.addEventListener('click', closeDeleteModal);
confirmDeleteButton.addEventListener('click', async () => {
    if (pendingDeleteMode === 'single' && pendingDeleteTaskId !== null) {
        await deleteTask(pendingDeleteTaskId);
    }

    if (pendingDeleteMode === 'completed') {
        await clearCompleted();
    }

    closeDeleteModal();
});

deleteModal.addEventListener('click', (event) => {
    if (event.target === deleteModal) {
        closeDeleteModal();
    }
});

renderTasks();
window.setInterval(updateVisibleTimers, TIMER_TICK_MS);