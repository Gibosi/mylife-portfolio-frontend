// Logic Controller: tasks.js
// Full CRUD against /api/tasks, status filters, quick-complete checkboxes,
// and inline row editing (click the pencil to edit a row in place — no
// modal needed for edits; the modal is only used to create new tasks).

import { api } from '../core/api.js';
import { val, setVal, escapeHtml, formatDate } from '../core/utils.js';

const tableBody = document.getElementById('tableBody');
const form = document.getElementById('crudForm');
const modalEl = document.getElementById('crudModal');
const modalTitle = document.getElementById('crudModalTitle');
let bsModal = null;

const priorityClass = { LOW: 'task-priority-low', MEDIUM: 'task-priority-medium', HIGH: 'task-priority-high' };
const statusBadgeClass = { PENDING: 'badge-warning', IN_PROGRESS: 'badge-primary', COMPLETED: 'badge-success', CANCELLED: 'badge-danger' };
const statusLabel = { PENDING: 'Pending', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed', CANCELLED: 'Cancelled' };

let currentFilter = 'all';
let tasksCache = [];
let editingTaskId = null; // the task currently in inline-edit mode, if any

function viewRow(t) {
    return `
        <tr data-status="${(t.status || '').toLowerCase()}" data-id="${t.taskId}" class="${t.status === 'COMPLETED' ? 'task-row-completed' : ''}">
            <td class="text-center">
                <input type="checkbox" class="task-checkbox" data-id="${t.taskId}" ${t.status === 'COMPLETED' ? 'checked' : ''}>
            </td>
            <td class="fw-bold text-dark ${t.status === 'CANCELLED' ? 'text-decoration-line-through' : ''}">${escapeHtml(t.title)}</td>
            <td>${formatDate(t.startDate)}</td>
            <td>${formatDate(t.dueDate)}</td>
            <td><span class="status-badge ${priorityClass[t.priority] || ''}">${escapeHtml(t.priority || '')}</span></td>
            <td><span class="status-badge ${statusBadgeClass[t.status] || ''}">${statusLabel[t.status] || t.status}</span></td>
            <td class="text-center">
                <button class="table-action-btn edit-btn" data-id="${t.taskId}" title="Inline edit"><i class="bi bi-pencil"></i></button>
                <button class="table-action-btn delete" data-id="${t.taskId}" title="Delete"><i class="bi bi-trash"></i></button>
            </td>
        </tr>
    `;
}

function editRow(t) {
    const priorityOptions = ['LOW', 'MEDIUM', 'HIGH']
        .map(p => `<option value="${p}" ${t.priority === p ? 'selected' : ''}>${p.charAt(0) + p.slice(1).toLowerCase()}</option>`).join('');
    const statusOptions = Object.keys(statusLabel)
        .map(s => `<option value="${s}" ${t.status === s ? 'selected' : ''}>${statusLabel[s]}</option>`).join('');

    return `
        <tr data-id="${t.taskId}" class="table-inline-edit-row">
            <td></td>
            <td><input type="text" class="form-control form-control-sm inline-title" value="${escapeHtml(t.title)}"></td>
            <td><input type="date" class="form-control form-control-sm inline-startDate" value="${t.startDate || ''}"></td>
            <td><input type="date" class="form-control form-control-sm inline-dueDate" value="${t.dueDate || ''}"></td>
            <td><select class="form-control form-control-sm inline-priority">${priorityOptions}</select></td>
            <td><select class="form-control form-control-sm inline-status">${statusOptions}</select></td>
            <td class="text-center text-nowrap">
                <button class="table-action-btn inline-save" data-id="${t.taskId}" title="Save"><i class="bi bi-check-lg text-success"></i></button>
                <button class="table-action-btn inline-cancel" title="Cancel"><i class="bi bi-x-lg text-danger"></i></button>
            </td>
        </tr>
    `;
}

function renderRows() {
    if (!tableBody) return;

    const visible = currentFilter === 'all'
        ? tasksCache
        : tasksCache.filter(t => t.status === currentFilter.toUpperCase());

    if (visible.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No tasks found.</td></tr>`;
        return;
    }

    tableBody.innerHTML = visible.map(t => t.taskId === editingTaskId ? editRow(t) : viewRow(t)).join('');
}

async function loadTasks() {
    try {
        tasksCache = await api.get('/tasks');
        renderRows();
    } catch (error) {
        console.error('Failed to load tasks:', error);
        window.showToast?.('Failed to load tasks.', 'danger');
    }
}

function resetForm() {
    form.reset();
    setVal('taskId', '');
    modalTitle.innerHTML = '<i class="bi bi-plus-circle me-2"></i> New Task';
}

// New Task button should always start from a clean form (the modal is now
// only used for creating tasks — edits happen inline in the table).
document.querySelector('[data-bs-target="#crudModal"]')?.addEventListener('click', resetForm);

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const payload = {
            title: val('title'),
            description: val('description'),
            priority: val('priority'),
            startDate: val('startDate') || null,
            dueDate: val('dueDate'),
            status: val('status')
        };

        try {
            await api.post('/tasks', payload);
            window.showToast?.('Task added successfully!', 'success');
            bsModal = bsModal || bootstrap.Modal.getInstance(modalEl);
            bsModal?.hide();
            resetForm();
            await loadTasks();
        } catch (error) {
            console.error(error);
            window.showToast?.(error.message || 'Error saving task.', 'danger');
        }
    });
}

// Filters
document.getElementById('taskFilters')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-filter]');
    if (!btn) return;
    document.querySelectorAll('#taskFilters button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.getAttribute('data-filter');
    editingTaskId = null;
    renderRows();
});

// Row actions: inline edit, inline save/cancel, delete, quick-complete checkbox
document.addEventListener('click', async (e) => {
    const editBtn = e.target.closest('.edit-btn');
    if (editBtn && tableBody?.contains(editBtn)) {
        editingTaskId = parseInt(editBtn.dataset.id, 10);
        renderRows();
        return;
    }

    const cancelBtn = e.target.closest('.inline-cancel');
    if (cancelBtn && tableBody?.contains(cancelBtn)) {
        editingTaskId = null;
        renderRows();
        return;
    }

    const saveBtn = e.target.closest('.inline-save');
    if (saveBtn && tableBody?.contains(saveBtn)) {
        const row = saveBtn.closest('tr');
        const id = saveBtn.dataset.id;
        const original = tasksCache.find(t => String(t.taskId) === id);
        if (!original) return;

        const payload = {
            title: row.querySelector('.inline-title').value,
            description: original.description,
            priority: row.querySelector('.inline-priority').value,
            startDate: row.querySelector('.inline-startDate').value || null,
            dueDate: row.querySelector('.inline-dueDate').value,
            status: row.querySelector('.inline-status').value
        };

        try {
            await api.put(`/tasks/${id}`, payload);
            window.showToast?.('Task updated!', 'success');
            editingTaskId = null;
            await loadTasks();
        } catch (error) {
            window.showToast?.(error.message || 'Error saving task.', 'danger');
        }
        return;
    }

    const deleteBtn = e.target.closest('.table-action-btn.delete');
    if (deleteBtn && tableBody?.contains(deleteBtn)) {
        const id = deleteBtn.dataset.id;
        window.showCustomConfirm(
            'Delete Task',
            'Are you sure you want to delete this task? This cannot be undone.',
            'Delete Task',
            'btn-danger',
            async () => {
                try {
                    await api.delete(`/tasks/${id}`);
                    window.showToast?.('Task deleted.', 'success');
                    await loadTasks();
                } catch (error) {
                    window.showToast?.(error.message || 'Error deleting task.', 'danger');
                }
            }
        );
    }
});

document.addEventListener('change', async (e) => {
    const checkbox = e.target.closest('.task-checkbox');
    if (checkbox && tableBody?.contains(checkbox) && checkbox.checked) {
        try {
            await api.patch(`/tasks/${checkbox.dataset.id}/complete`);
            window.showToast?.('Task marked as completed!', 'success');
            await loadTasks();
        } catch (error) {
            window.showToast?.(error.message || 'Error completing task.', 'danger');
        }
    }
});

loadTasks();
