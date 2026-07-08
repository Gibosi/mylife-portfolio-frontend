// Logic Controller: income.js
// Full CRUD against /api/income.

import { api } from '../core/api.js';
import { val, setVal, escapeHtml, formatDate, formatMoney } from '../core/utils.js';

const tableBody = document.getElementById('tableBody');
const form = document.getElementById('crudForm');
const modalEl = document.getElementById('crudModal');
const modalTitle = document.getElementById('crudModalTitle');
let bsModal = null;
let incomeCache = [];

function renderRows() {
    if (!tableBody) return;
    if (incomeCache.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No income recorded yet.</td></tr>`;
        return;
    }
    tableBody.innerHTML = incomeCache.map(x => `
        <tr>
            <td>${formatDate(x.dateReceived)}</td>
            <td>${escapeHtml(x.source || '')}</td>
            <td><span class="status-badge bg-secondary text-white">${escapeHtml(x.category || '')}</span></td>
            <td class="text-end fw-bold text-success">${formatMoney(x.amount)}</td>
            <td class="text-center">
                <button class="table-action-btn edit-btn" data-id="${x.incomeId}"><i class="bi bi-pencil"></i></button>
                <button class="table-action-btn delete" data-id="${x.incomeId}"><i class="bi bi-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

async function loadIncome() {
    try {
        incomeCache = await api.get('/income');
        renderRows();
    } catch (error) {
        console.error(error);
        window.showToast?.('Failed to load income.', 'danger');
    }
}

function resetForm() {
    form.reset();
    setVal('incomeId', '');
    modalTitle.innerHTML = '<i class="bi bi-plus-circle me-2"></i> Add Income';
}

function fillForm(x) {
    setVal('incomeId', x.incomeId);
    setVal('amount', x.amount);
    setVal('source', x.source);
    setVal('category', x.category);
    setVal('dateReceived', x.dateReceived);
    setVal('notes', x.notes);
    modalTitle.innerHTML = '<i class="bi bi-pencil-square me-2"></i> Edit Income';
}

document.querySelector('[data-bs-target="#crudModal"]')?.addEventListener('click', resetForm);

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            amount: parseFloat(val('amount')) || 0,
            source: val('source'),
            category: val('category'),
            dateReceived: val('dateReceived'),
            notes: val('notes')
        };
        const id = val('incomeId');
        try {
            if (id) {
                await api.put(`/income/${id}`, payload);
                window.showToast?.('Income updated!', 'success');
            } else {
                await api.post('/income', payload);
                window.showToast?.('Income added!', 'success');
            }
            bsModal = bsModal || bootstrap.Modal.getInstance(modalEl);
            bsModal?.hide();
            resetForm();
            await loadIncome();
        } catch (error) {
            window.showToast?.(error.message || 'Error saving income.', 'danger');
        }
    });
}

document.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.edit-btn');
    if (editBtn && tableBody?.contains(editBtn)) {
        const item = incomeCache.find(x => String(x.incomeId) === editBtn.dataset.id);
        if (item) {
            fillForm(item);
            bsModal = new bootstrap.Modal(modalEl);
            bsModal.show();
        }
    }

    const deleteBtn = e.target.closest('.table-action-btn.delete');
    if (deleteBtn && tableBody?.contains(deleteBtn)) {
        const id = deleteBtn.dataset.id;
        window.showCustomConfirm(
            'Delete Income',
            'Are you sure you want to delete this income record?',
            'Delete',
            'btn-danger',
            async () => {
                try {
                    await api.delete(`/income/${id}`);
                    window.showToast?.('Income deleted.', 'success');
                    await loadIncome();
                } catch (error) {
                    window.showToast?.(error.message || 'Error deleting income.', 'danger');
                }
            }
        );
    }
});

loadIncome();
