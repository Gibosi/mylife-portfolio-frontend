// Logic Controller: skills.js
import { api } from '../core/api.js';
import { val, setVal, escapeHtml } from '../core/utils.js';

const tableBody = document.getElementById('tableBody');
const form = document.getElementById('crudForm');
const modalEl = document.getElementById('crudModal');
let bsModal = null;
let cache = [];

function renderRows() {
    if (!tableBody) return;
    if (cache.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">No skills added yet.</td></tr>`;
        return;
    }
    tableBody.innerHTML = cache.map(s => `
        <tr>
            <td class="fw-bold text-dark">${escapeHtml(s.skillName)} <span class="badge bg-light text-dark border ms-1">${escapeHtml(s.proficiency || '')}</span></td>
            <td>${escapeHtml(s.category || '')}</td>
            <td class="text-center">${s.yearsOfExperience != null ? s.yearsOfExperience : '—'}</td>
            <td class="text-center">
                <button class="table-action-btn edit-btn" data-id="${s.skillId}"><i class="bi bi-pencil"></i></button>
                <button class="table-action-btn delete" data-id="${s.skillId}"><i class="bi bi-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

async function loadData() {
    try {
        cache = await api.get('/skills');
        renderRows();
    } catch (error) {
        window.showToast?.('Failed to load skills.', 'danger');
    }
}

function resetForm() {
    form.reset();
    setVal('skillId', '');
}

function fillForm(s) {
    setVal('skillId', s.skillId);
    setVal('skillName', s.skillName);
    setVal('category', s.category);
    setVal('proficiency', s.proficiency);
    setVal('yearsOfExperience', s.yearsOfExperience);
}

document.querySelector('[data-bs-target="#crudModal"]')?.addEventListener('click', resetForm);

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            skill_name: val('skillName'),
            category: val('category'),
            proficiency: val('proficiency'),
            yearsOfExperience: parseInt(val('yearsOfExperience')) || null
        };
        const id = val('skillId');
        try {
            if (id) {
                await api.put(`/skills/${id}`, payload);
                window.showToast?.('Skill updated!', 'success');
            } else {
                await api.post('/skills', payload);
                window.showToast?.('Skill added!', 'success');
            }
            bsModal = bsModal || bootstrap.Modal.getInstance(modalEl);
            bsModal?.hide();
            resetForm();
            await loadData();
        } catch (error) {
            window.showToast?.(error.message || 'Error saving skill.', 'danger');
        }
    });
}

document.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.edit-btn');
    if (editBtn && tableBody?.contains(editBtn)) {
        const item = cache.find(x => String(x.skillId) === editBtn.dataset.id);
        if (item) {
            fillForm(item);
            bsModal = new bootstrap.Modal(modalEl);
            bsModal.show();
        }
    }
    const deleteBtn = e.target.closest('.table-action-btn.delete');
    if (deleteBtn && tableBody?.contains(deleteBtn)) {
        const id = deleteBtn.dataset.id;
        window.showCustomConfirm('Delete Skill', 'Are you sure you want to delete this skill?', 'Delete', 'btn-danger', async () => {
            try {
                await api.delete(`/skills/${id}`);
                window.showToast?.('Skill deleted.', 'success');
                await loadData();
            } catch (error) {
                window.showToast?.(error.message || 'Error deleting skill.', 'danger');
            }
        });
    }
});

loadData();
