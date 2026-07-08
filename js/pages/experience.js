// Logic Controller: experience.js
import { api } from '../core/api.js';
import { val, setVal, escapeHtml, formatDate } from '../core/utils.js';

const tableBody = document.getElementById('tableBody');
const form = document.getElementById('crudForm');
const modalEl = document.getElementById('crudModal');
let bsModal = null;
let cache = [];

function renderRows() {
    if (!tableBody) return;
    if (cache.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No work experience yet.</td></tr>`;
        return;
    }
    tableBody.innerHTML = cache.map(x => `
        <tr>
            <td class="fw-bold text-dark">${escapeHtml(x.company)}</td>
            <td>${escapeHtml(x.jobTitle || '')}</td>
            <td>${formatDate(x.startDate)} - ${x.currentlyWorking ? 'Present' : formatDate(x.endDate)}</td>
            <td>${escapeHtml(x.responsibilities || '')}</td>
            <td class="text-center">
                <button class="table-action-btn edit-btn" data-id="${x.workExperienceId ?? x.experienceId}"><i class="bi bi-pencil"></i></button>
                <button class="table-action-btn delete" data-id="${x.workExperienceId ?? x.experienceId}"><i class="bi bi-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

async function loadData() {
    try {
        cache = await api.get('/experience');
        renderRows();
    } catch (error) {
        window.showToast?.('Failed to load work experience.', 'danger');
    }
}

function resetForm() {
    form.reset();
    setVal('experienceId', '');
}

function fillForm(x) {
    setVal('experienceId', x.workExperienceId ?? x.experienceId);
    setVal('company', x.company);
    setVal('jobTitle', x.jobTitle);
    setVal('startDate', x.startDate);
    setVal('endDate', x.endDate);
    setVal('currentlyWorking', x.currentlyWorking);
    setVal('responsibilities', x.responsibilities);
    setVal('employmentType', x.employmentType);
    setVal('location', x.location);
}

document.querySelector('[data-bs-target="#crudModal"]')?.addEventListener('click', resetForm);

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            company: val('company'),
            job_title: val('jobTitle'),
            employmentType: val('employmentType'),
            location: val('location'),
            startDate: val('startDate'),
            endDate: val('currentlyWorking') ? null : val('endDate'),
            currentlyWorking: val('currentlyWorking'),
            responsibilities: val('responsibilities')
        };
        const id = val('experienceId');
        try {
            if (id) {
                await api.put(`/experience/${id}`, payload);
                window.showToast?.('Work experience updated!', 'success');
            } else {
                await api.post('/experience', payload);
                window.showToast?.('Work experience added!', 'success');
            }
            bsModal = bsModal || bootstrap.Modal.getInstance(modalEl);
            bsModal?.hide();
            resetForm();
            await loadData();
        } catch (error) {
            window.showToast?.(error.message || 'Error saving record.', 'danger');
        }
    });
}

document.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.edit-btn');
    if (editBtn && tableBody?.contains(editBtn)) {
        const item = cache.find(x => String(x.workExperienceId ?? x.experienceId) === editBtn.dataset.id);
        if (item) {
            fillForm(item);
            bsModal = new bootstrap.Modal(modalEl);
            bsModal.show();
        }
    }
    const deleteBtn = e.target.closest('.table-action-btn.delete');
    if (deleteBtn && tableBody?.contains(deleteBtn)) {
        const id = deleteBtn.dataset.id;
        window.showCustomConfirm('Delete Record', 'Are you sure you want to delete this work experience?', 'Delete', 'btn-danger', async () => {
            try {
                await api.delete(`/experience/${id}`);
                window.showToast?.('Record deleted.', 'success');
                await loadData();
            } catch (error) {
                window.showToast?.(error.message || 'Error deleting record.', 'danger');
            }
        });
    }
});

loadData();
