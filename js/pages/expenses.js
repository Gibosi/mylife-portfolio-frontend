// Logic Controller: expenses.js
// Full CRUD against /api/expenses.

import { api } from '../core/api.js';
import { val, setVal, escapeHtml, formatDate, formatMoney } from '../core/utils.js';

const tableBody = document.getElementById('tableBody');
const form = document.getElementById('crudForm');
const modalEl = document.getElementById('crudModal');
const modalTitle = document.getElementById('crudModalTitle');
let bsModal = null;
let expensesCache = [];

function renderRows() {
    if (!tableBody) return;
    if (expensesCache.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No expenses recorded yet.</td></tr>`;
        return;
    }
    tableBody.innerHTML = expensesCache.map(x => `
        <tr>
            <td>${formatDate(x.expenseDate)}</td>
            <td><span class="status-badge bg-secondary text-white">${escapeHtml(x.category || '')}</span></td>
            <td>${escapeHtml(x.description || '')}</td>
            <td class="text-end fw-bold text-danger">${formatMoney(x.amount)}</td>
            <td class="text-center">
                <button class="table-action-btn edit-btn" data-id="${x.expenseId}"><i class="bi bi-pencil"></i></button>
                <button class="table-action-btn delete" data-id="${x.expenseId}"><i class="bi bi-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

async function loadExpenses() {
    try {
        expensesCache = await api.get('/expenses');
        renderRows();
    } catch (error) {
        console.error(error);
        window.showToast?.('Failed to load expenses.', 'danger');
    }
}

function resetForm() {
    form.reset();
    setVal('expenseId', '');
    modalTitle.innerHTML = '<i class="bi bi-dash-circle me-2"></i> Add Expense';
}

function fillForm(x) {
    setVal('expenseId', x.expenseId);
    setVal('amount', x.amount);
    setVal('category', x.category);
    setVal('description', x.description);
    setVal('paymentMethod', x.paymentMethod);
    setVal('expenseDate', x.expenseDate);
    setVal('notes', x.notes);
    modalTitle.innerHTML = '<i class="bi bi-pencil-square me-2"></i> Edit Expense';
}

document.querySelector('[data-bs-target="#crudModal"]')?.addEventListener('click', resetForm);

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            amount: parseFloat(val('amount')) || 0,
            category: val('category'),
            description: val('description'),
            paymentMethod: val('paymentMethod'),
            expenseDate: val('expenseDate'),
            notes: val('notes')
        };
        const id = val('expenseId');
        try {
            if (id) {
                await api.put(`/expenses/${id}`, payload);
                window.showToast?.('Expense updated!', 'success');
            } else {
                await api.post('/expenses', payload);
                window.showToast?.('Expense added!', 'success');
            }
            bsModal = bsModal || bootstrap.Modal.getInstance(modalEl);
            bsModal?.hide();
            resetForm();
            await loadExpenses();
        } catch (error) {
            window.showToast?.(error.message || 'Error saving expense.', 'danger');
        }
    });
}

document.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.edit-btn');
    if (editBtn && tableBody?.contains(editBtn)) {
        const item = expensesCache.find(x => String(x.expenseId) === editBtn.dataset.id);
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
            'Delete Expense',
            'Are you sure you want to delete this expense record?',
            'Delete',
            'btn-danger',
            async () => {
                try {
                    await api.delete(`/expenses/${id}`);
                    window.showToast?.('Expense deleted.', 'success');
                    await loadExpenses();
                } catch (error) {
                    window.showToast?.(error.message || 'Error deleting expense.', 'danger');
                }
            }
        );
    }
});

loadExpenses();
