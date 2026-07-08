// Logic Controller: assets.js
// Full CRUD against /api/assets, plus optional document upload and a
// "view on map" shortcut using the location field.

import { api, uploadedFileUrl } from '../core/api.js';
import { val, setVal, escapeHtml, formatDate, formatMoney } from '../core/utils.js';

const tableBody = document.getElementById('tableBody');
const form = document.getElementById('assetForm');
const modalEl = document.getElementById('crudModal');
let bsModal = null;
let cache = [];

function renderRows() {
    if (!tableBody) return;
    if (cache.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No assets recorded yet.</td></tr>`;
        return;
    }
    tableBody.innerHTML = cache.map(a => {
        const docUrl = a.documentPath ? uploadedFileUrl(a.documentPath) : '';
        return `
        <tr>
            <td>
                <div class="fw-bold text-dark">${escapeHtml(a.name)}</div>
                <div class="small text-muted mb-1">${escapeHtml(a.sourceOfAcquisition || '')}: ${formatDate(a.acquisitionDate)}</div>
                <button class="btn btn-sm btn-outline-info view-map-btn py-0" data-location="${escapeHtml(a.location || '')}"><i class="bi bi-geo-alt-fill me-1"></i>Map</button>
            </td>
            <td><span class="status-badge bg-secondary text-white">${escapeHtml(a.category || '')}</span></td>
            <td>${escapeHtml(a.sourceOfAcquisition || '')}</td>
            <td class="text-end fw-bold text-success">${formatMoney(a.estimatedValue)}</td>
            <td class="text-center">${docUrl ? `<a href="${docUrl}" target="_blank" class="btn btn-sm btn-outline-primary"><i class="bi bi-file-earmark-pdf"></i> View</a>` : '<span class="text-muted small">None</span>'}</td>
            <td class="text-center">
                <button class="table-action-btn edit-btn" data-id="${a.assetId}"><i class="bi bi-pencil"></i></button>
                <button class="table-action-btn delete" data-id="${a.assetId}"><i class="bi bi-trash"></i></button>
            </td>
        </tr>`;
    }).join('');
}

function renderTotalValue() {
    const el = document.getElementById('assetsTotalValue');
    if (!el) return;
    const total = cache.reduce((sum, a) => sum + (Number(a.estimatedValue) || 0), 0);
    el.textContent = formatMoney(total);
}

async function loadData() {
    try {
        cache = await api.get('/assets');
        renderRows();
        renderTotalValue();
    } catch (error) {
        window.showToast?.('Failed to load assets.', 'danger');
    }
}

function resetForm() {
    form.reset();
    setVal('assetId', '');
}

function fillForm(a) {
    setVal('assetId', a.assetId);
    setVal('assetName', a.name);
    setVal('assetCategory', a.category);
    setVal('assetValue', a.estimatedValue);
    setVal('assetAcquisitionDate', a.acquisitionDate);
    setVal('assetLocation', a.location);
    setVal('assetNotes', a.notes);
    setVal('assetSource', a.sourceOfAcquisition);
}

document.querySelector('[data-bs-target="#crudModal"]')?.addEventListener('click', resetForm);

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            name: val('assetName'),
            category: val('assetCategory'),
            estimatedValue: parseFloat(val('assetValue')) || 0,
            acquisitionDate: val('assetAcquisitionDate'),
            location: val('assetLocation'),
            sourceOfAcquisition: val('assetSource'),
            notes: val('assetNotes')
        };

        const id = val('assetId');
        const fileInput = document.getElementById('assetDocument');
        const file = fileInput?.files?.[0];

        try {
            let assetId = id;
            if (id) {
                await api.put(`/assets/${id}`, payload);
            } else {
                const created = await api.post('/assets', payload);
                assetId = created.assetId;
            }

            if (file) {
                const formData = new FormData();
                formData.append('file', file);
                await api.postForm(`/assets/${assetId}/upload-document`, formData);
            }

            window.showToast?.('Asset saved successfully!', 'success');
            bsModal = bsModal || bootstrap.Modal.getInstance(modalEl);
            bsModal?.hide();
            resetForm();
            await loadData();
        } catch (error) {
            window.showToast?.(error.message || 'Error saving asset.', 'danger');
        }
    });
}

document.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.edit-btn');
    if (editBtn && tableBody?.contains(editBtn)) {
        const item = cache.find(x => String(x.assetId) === editBtn.dataset.id);
        if (item) {
            fillForm(item);
            bsModal = new bootstrap.Modal(modalEl);
            bsModal.show();
        }
    }

    const deleteBtn = e.target.closest('.table-action-btn.delete');
    if (deleteBtn && tableBody?.contains(deleteBtn)) {
        const id = deleteBtn.dataset.id;
        window.showCustomConfirm('Delete Asset', 'Are you sure you want to remove this asset from your portfolio?', 'Delete Asset', 'btn-danger', async () => {
            try {
                await api.delete(`/assets/${id}`);
                window.showToast?.('Asset deleted.', 'success');
                await loadData();
            } catch (error) {
                window.showToast?.(error.message || 'Error deleting asset.', 'danger');
            }
        });
    }

    const mapBtn = e.target.closest('.view-map-btn');
    if (mapBtn) {
        e.preventDefault();
        const locationQuery = mapBtn.getAttribute('data-location');
        if (locationQuery) {
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationQuery)}`, '_blank');
        } else {
            window.showToast?.('No location data available for this asset.', 'warning');
        }
    }
});

loadData();
