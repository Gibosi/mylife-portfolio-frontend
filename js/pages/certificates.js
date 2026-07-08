// Logic Controller: certificates.js
// CRUD for /api/certificates plus a two-step PDF upload flow
// (create/update the JSON record first, then POST the file to
// /api/certificates/{id}/upload-document).

import { api, uploadedFileUrl } from '../core/api.js';
import { val, setVal, escapeHtml } from '../core/utils.js';

const tableBody = document.getElementById('tableBody');
const form = document.getElementById('crudForm');
const modalEl = document.getElementById('crudModal');
let bsModal = null;
let cache = [];

function renderRows() {
    if (!tableBody) return;
    if (cache.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No certificates yet.</td></tr>`;
        return;
    }
    tableBody.innerHTML = cache.map(c => {
        const fileUrl = c.documentPath ? uploadedFileUrl(c.documentPath) : '';
        return `
        <tr>
            <td class="fw-bold">${escapeHtml(c.title)}</td><td>${escapeHtml(c.issuingOrganization || '')}</td><td>${c.issueDate ? new Date(c.issueDate).getFullYear() : ''}</td>
            <td class="text-center">
                ${fileUrl
                    ? `<button class="btn btn-sm btn-outline-primary view-cert-btn" data-cert-url="${fileUrl}"><i class="bi bi-file-earmark-pdf-fill me-1"></i> View PDF</button>`
                    : `<span class="text-muted small">No file</span>`}
            </td>
            <td class="text-center">
                ${fileUrl ? `<a href="${fileUrl}" class="btn btn-sm btn-outline-success" download title="Download"><i class="bi bi-download"></i></a>` : '—'}
            </td>
            <td class="text-center">
                <button class="table-action-btn edit-btn" data-id="${c.certificateId}"><i class="bi bi-pencil"></i></button>
                <button class="table-action-btn delete" data-id="${c.certificateId}"><i class="bi bi-trash"></i></button>
            </td>
        </tr>`;
    }).join('');
}

async function loadData() {
    try {
        cache = await api.get('/certificates');
        renderRows();
    } catch (error) {
        window.showToast?.('Failed to load certificates.', 'danger');
    }
}

function resetForm() {
    form.reset();
    setVal('certificateId', '');
}

function fillForm(c) {
    setVal('certificateId', c.certificateId);
    setVal('title', c.title);
    setVal('issuingOrganization', c.issuingOrganization);
    setVal('year', c.issueDate ? new Date(c.issueDate).getFullYear() : '');
}

document.querySelector('[data-bs-target="#crudModal"]')?.addEventListener('click', resetForm);

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const year = val('year');
        const payload = {
            title: val('title'),
            issuingOrganization: val('issuingOrganization'),
            issueDate: year ? `${year}-01-01` : null
        };

        const id = val('certificateId');
        const fileInput = document.getElementById('certFileInput');
        const file = fileInput?.files?.[0];

        if (file && file.type !== 'application/pdf') {
            window.showToast?.('Please upload a valid PDF document.', 'warning');
            return;
        }
        if (file && file.size > 5 * 1024 * 1024) {
            window.showToast?.('File size exceeds 5MB limit.', 'warning');
            return;
        }

        try {
            let certificateId = id;
            if (id) {
                await api.put(`/certificates/${id}`, payload);
            } else {
                const created = await api.post('/certificates', payload);
                certificateId = created.certificateId;
            }

            if (file) {
                const formData = new FormData();
                formData.append('file', file);
                await api.postForm(`/certificates/${certificateId}/upload-document`, formData);
            }

            window.showToast?.('Certificate saved successfully!', 'success');
            bsModal = bsModal || bootstrap.Modal.getInstance(modalEl);
            bsModal?.hide();
            resetForm();
            await loadData();
        } catch (error) {
            window.showToast?.(error.message || 'Error saving certificate.', 'danger');
        }
    });
}

document.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.edit-btn');
    if (editBtn && tableBody?.contains(editBtn)) {
        const item = cache.find(x => String(x.certificateId) === editBtn.dataset.id);
        if (item) {
            fillForm(item);
            bsModal = new bootstrap.Modal(modalEl);
            bsModal.show();
        }
    }

    const deleteBtn = e.target.closest('.table-action-btn.delete');
    if (deleteBtn && tableBody?.contains(deleteBtn)) {
        const id = deleteBtn.dataset.id;
        window.showCustomConfirm('Delete Certificate', 'Are you sure you want to delete this certificate?', 'Delete', 'btn-danger', async () => {
            try {
                await api.delete(`/certificates/${id}`);
                window.showToast?.('Certificate deleted.', 'success');
                await loadData();
            } catch (error) {
                window.showToast?.(error.message || 'Error deleting certificate.', 'danger');
            }
        });
    }

    // View PDF Modal Logic
    const viewBtn = e.target.closest('.view-cert-btn');
    if (viewBtn) {
        e.preventDefault();
        const certUrl = viewBtn.getAttribute('data-cert-url');
        if (certUrl) {
            const iframe = document.getElementById('pdfViewerIframe');
            if (iframe) {
                iframe.src = certUrl;
                const previewModalEl = document.getElementById('pdfPreviewModal');
                if (previewModalEl) new bootstrap.Modal(previewModalEl).show();
            }
        } else {
            window.showToast?.('No document available to view.', 'warning');
        }
    }
});

loadData();
