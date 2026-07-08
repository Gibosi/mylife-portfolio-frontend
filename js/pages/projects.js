// Logic Controller: projects.js
import { api } from '../core/api.js';
import { val, setVal, escapeHtml } from '../core/utils.js';

const tableBody = document.getElementById('tableBody');
const form = document.getElementById('crudForm');
const modalEl = document.getElementById('crudModal');
let bsModal = null;
let cache = [];
let currentFilter = 'all';

const statusBadge = { ONGOING: 'badge-primary', COMPLETED: 'badge-success', PAUSED: 'badge-warning' };

function renderRows() {
    if (!tableBody) return;

    const visible = currentFilter === 'all'
        ? cache
        : cache.filter(p => (p.status || '').toLowerCase() === currentFilter);

    if (visible.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No projects found.</td></tr>`;
        return;
    }
    tableBody.innerHTML = visible.map(p => `
        <tr>
            <td class="fw-bold text-dark">${escapeHtml(p.title)}</td>
            <td>${(p.technologies || []).map(t => `<span class="badge bg-light text-dark border me-1">${escapeHtml(t)}</span>`).join('')}</td>
            <td><span class="status-badge ${statusBadge[p.status] || ''}">${escapeHtml(p.status || '')}</span></td>
            <td>${p.projectUrl ? `<a href="${escapeHtml(p.projectUrl)}" target="_blank" rel="noopener">Visit <i class="bi bi-box-arrow-up-right"></i></a>` : '—'}</td>
            <td class="text-center">
                <button class="table-action-btn edit-btn" data-id="${p.projectId}"><i class="bi bi-pencil"></i></button>
                <button class="table-action-btn delete" data-id="${p.projectId}"><i class="bi bi-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

async function loadData() {
    try {
        cache = await api.get('/projects');
        renderRows();
    } catch (error) {
        window.showToast?.('Failed to load projects.', 'danger');
    }
}

function resetForm() {
    form.reset();
    setVal('projectId', '');
}

function fillForm(p) {
    setVal('projectId', p.projectId);
    setVal('title', p.title);
    setVal('description', p.description);
    setVal('technologies', (p.technologies || []).join(', '));
    setVal('projectUrl', p.projectUrl);
    setVal('githubUrl', p.githubUrl);
    setVal('status', p.status);
}

document.querySelector('[data-bs-target="#crudModal"]')?.addEventListener('click', resetForm);

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            title: val('title'),
            description: val('description'),
            technologies: val('technologies').split(',').map(s => s.trim()).filter(Boolean),
            projectUrl: val('projectUrl'),
            githubUrl: val('githubUrl'),
            status: val('status')
        };
        const id = val('projectId');
        try {
            if (id) {
                await api.put(`/projects/${id}`, payload);
                window.showToast?.('Project updated!', 'success');
            } else {
                await api.post('/projects', payload);
                window.showToast?.('Project added!', 'success');
            }
            bsModal = bsModal || bootstrap.Modal.getInstance(modalEl);
            bsModal?.hide();
            resetForm();
            await loadData();
        } catch (error) {
            window.showToast?.(error.message || 'Error saving project.', 'danger');
        }
    });
}

document.getElementById('projectFilters')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-filter]');
    if (!btn) return;
    document.querySelectorAll('#projectFilters button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.getAttribute('data-filter');
    renderRows();
});

document.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.edit-btn');
    if (editBtn && tableBody?.contains(editBtn)) {
        const item = cache.find(x => String(x.projectId) === editBtn.dataset.id);
        if (item) {
            fillForm(item);
            bsModal = new bootstrap.Modal(modalEl);
            bsModal.show();
        }
    }
    const deleteBtn = e.target.closest('.table-action-btn.delete');
    if (deleteBtn && tableBody?.contains(deleteBtn)) {
        const id = deleteBtn.dataset.id;
        window.showCustomConfirm('Delete Project', 'Are you sure you want to delete this project?', 'Delete', 'btn-danger', async () => {
            try {
                await api.delete(`/projects/${id}`);
                window.showToast?.('Project deleted.', 'success');
                await loadData();
            } catch (error) {
                window.showToast?.(error.message || 'Error deleting project.', 'danger');
            }
        });
    }
});

loadData();
