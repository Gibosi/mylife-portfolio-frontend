// Logic Controller: education.js
import { api } from '../core/api.js';
import { val, setVal, escapeHtml } from '../core/utils.js';

const tableBody = document.getElementById('tableBody');
const form = document.getElementById('crudForm');
const modalEl = document.getElementById('crudModal');
let bsModal = null;
let cache = [];

// Each education level tracks achievement differently in real life —
// primary/secondary use Divisions, certificate/diploma use Distinction/
// Credit/Pass, degrees use Class of Degree, and PhD tracks a result.
// "Other" always lets the user type a custom value (e.g. a numeric GPA).
const GRADE_OPTIONS_BY_LEVEL = {
    'Primary School': { label: 'Division', options: ['Division I', 'Division II', 'Division III', 'Division IV', 'Division 0 (Failed)'] },
    'Secondary / High School': { label: 'Division', options: ['Division I', 'Division II', 'Division III', 'Division IV', 'Division 0 (Failed)'] },
    'Certificate / Bootcamp': { label: 'Grade', options: ['Distinction', 'Credit', 'Pass', 'Fail'] },
    'Diploma': { label: 'Grade', options: ['Distinction', 'Credit', 'Pass', 'Fail'] },
    "Bachelor's Degree": { label: 'Class of Degree / GPA', options: ['First Class', 'Upper Second Class', 'Lower Second Class', 'Pass Degree'] },
    "Master's Degree": { label: 'Class of Degree / GPA', options: ['Distinction', 'Merit', 'Pass'] },
    'PhD / Doctorate': { label: 'Result', options: ['Pass with Distinction', 'Pass', 'Pending'] }
};
const OTHER_VALUE = '__other__';

function rebuildGradeField(level, currentValue) {
    const label = document.getElementById('gradeLabel');
    const select = document.getElementById('grade');
    if (!select) return;

    const config = GRADE_OPTIONS_BY_LEVEL[level];

    if (!config) {
        label.textContent = 'Grade / GPA';
        select.innerHTML = `<option value="">Select a level first...</option>`;
        select.disabled = true;
        return;
    }

    label.textContent = config.label;
    select.disabled = false;

    const isKnownOption = config.options.includes(currentValue);
    const optionsHtml = config.options.map(o => `<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`).join('');
    select.innerHTML = `
        <option value="">Select ${escapeHtml(config.label)}...</option>
        ${optionsHtml}
        <option value="${OTHER_VALUE}">Other (type manually)</option>
    `;

    if (currentValue && isKnownOption) {
        select.value = currentValue;
    } else if (currentValue) {
        // A saved value that doesn't match this level's preset list (e.g. a
        // numeric GPA, or the level changed after the record was saved) —
        // fall back to free text so the original value isn't lost.
        select.value = OTHER_VALUE;
        switchGradeToTextInput(currentValue);
    }
}

function switchGradeToTextInput(prefill = '') {
    const select = document.getElementById('grade');
    if (!select || select.tagName !== 'SELECT') return;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-control mt-2';
    input.id = 'gradeOther';
    input.placeholder = 'Type the exact grade/GPA (e.g. 3.8)';
    input.value = prefill === OTHER_VALUE ? '' : prefill;
    select.insertAdjacentElement('afterend', input);
}

function removeGradeTextInput() {
    document.getElementById('gradeOther')?.remove();
}

document.getElementById('level')?.addEventListener('change', (e) => {
    removeGradeTextInput();
    rebuildGradeField(e.target.value, '');
});

document.addEventListener('change', (e) => {
    if (e.target.id === 'grade' && e.target.value === OTHER_VALUE) {
        removeGradeTextInput();
        switchGradeToTextInput();
    } else if (e.target.id === 'grade') {
        removeGradeTextInput();
    }
});

function getGradeValue() {
    const select = document.getElementById('grade');
    if (select?.value === OTHER_VALUE) {
        return document.getElementById('gradeOther')?.value || '';
    }
    return select?.value || '';
}

function renderRows() {
    if (!tableBody) return;
    if (cache.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No education records yet.</td></tr>`;
        return;
    }
    tableBody.innerHTML = cache.map(e => `
        <tr>
            <td class="fw-bold text-dark">${escapeHtml(e.institution)}</td>
            <td>${escapeHtml(e.program || '')}</td>
            <td>${e.startYear || ''} - ${e.endYear || ''}</td>
            <td>${escapeHtml(e.grade || '')}</td>
            <td class="text-center">
                <button class="table-action-btn edit-btn" data-id="${e.educationId}"><i class="bi bi-pencil"></i></button>
                <button class="table-action-btn delete" data-id="${e.educationId}"><i class="bi bi-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

async function loadData() {
    try {
        cache = await api.get('/education');
        renderRows();
    } catch (error) {
        window.showToast?.('Failed to load education records.', 'danger');
    }
}

function resetForm() {
    form.reset();
    setVal('educationId', '');
    removeGradeTextInput();
    rebuildGradeField('', '');
}

function fillForm(e) {
    setVal('educationId', e.educationId);
    setVal('institution', e.institution);
    setVal('program', e.program);
    setVal('level', e.level);
    setVal('startYear', e.startYear);
    setVal('endYear', e.endYear);
    removeGradeTextInput();
    rebuildGradeField(e.level, e.grade);
    setVal('reference', e.reference);
}

document.querySelector('[data-bs-target="#crudModal"]')?.addEventListener('click', resetForm);

if (form) {
    form.addEventListener('submit', async (evt) => {
        evt.preventDefault();
        const payload = {
            institution: val('institution'),
            program: val('program'),
            level: val('level'),
            startYear: parseInt(val('startYear')) || null,
            endYear: parseInt(val('endYear')) || null,
            grade: getGradeValue(),
            reference: val('reference')
        };
        const id = val('educationId');
        try {
            if (id) {
                await api.put(`/education/${id}`, payload);
                window.showToast?.('Education record updated!', 'success');
            } else {
                await api.post('/education', payload);
                window.showToast?.('Education record added!', 'success');
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
        const item = cache.find(x => String(x.educationId) === editBtn.dataset.id);
        if (item) {
            fillForm(item);
            bsModal = new bootstrap.Modal(modalEl);
            bsModal.show();
        }
    }
    const deleteBtn = e.target.closest('.table-action-btn.delete');
    if (deleteBtn && tableBody?.contains(deleteBtn)) {
        const id = deleteBtn.dataset.id;
        window.showCustomConfirm('Delete Record', 'Are you sure you want to delete this education record?', 'Delete', 'btn-danger', async () => {
            try {
                await api.delete(`/education/${id}`);
                window.showToast?.('Record deleted.', 'success');
                await loadData();
            } catch (error) {
                window.showToast?.(error.message || 'Error deleting record.', 'danger');
            }
        });
    }
});

loadData();
