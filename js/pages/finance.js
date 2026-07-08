// Logic Controller: finance.js
// Balance summary from /api/finance/balance, a real Income vs Expense
// Chart.js bar chart built from /api/income + /api/expenses grouped by
// month, and a recent-transactions feed from the same two endpoints.

import { api } from '../core/api.js';
import { formatMoney, formatDate, escapeHtml } from '../core/utils.js';

let chartInstance = null;
let incomeCache = [];
let expenseCache = [];

async function loadBalance() {
    try {
        const balance = await api.get('/finance/balance');
        const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = `${formatMoney(value)} TZS`; };
        set('fin_totalIncome', balance.totalIncome);
        set('fin_totalExpenses', balance.totalExpenses);
        set('fin_balance', balance.balance);
    } catch (error) {
        window.showToast?.(error.message || 'Failed to load balance.', 'danger');
    }
}

function monthKey(dateStr) {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key) {
    const [year, month] = key.split('-').map(Number);
    return new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

function buildChart(monthsBack) {
    const canvas = document.getElementById('incomeExpenseChart');
    const emptyState = document.getElementById('financeChartEmptyState');
    if (!canvas || typeof Chart === 'undefined') return;

    // Build the last N month buckets (oldest -> newest) so the chart reads left-to-right chronologically.
    const now = new Date();
    const buckets = [];
    for (let i = monthsBack - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        buckets.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }

    const incomeByMonth = {};
    incomeCache.forEach(i => {
        const key = monthKey(i.dateReceived);
        if (key) incomeByMonth[key] = (incomeByMonth[key] || 0) + Number(i.amount || 0);
    });

    const expenseByMonth = {};
    expenseCache.forEach(x => {
        const key = monthKey(x.expenseDate);
        if (key) expenseByMonth[key] = (expenseByMonth[key] || 0) + Number(x.amount || 0);
    });

    const hasAnyData = incomeCache.length > 0 || expenseCache.length > 0;
    if (emptyState) emptyState.style.display = hasAnyData ? 'none' : 'block';
    canvas.style.display = hasAnyData ? 'block' : 'none';

    const labels = buckets.map(monthLabel);
    const incomeData = buckets.map(k => incomeByMonth[k] || 0);
    const expenseData = buckets.map(k => expenseByMonth[k] || 0);

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels,
            datasets: [
                { label: 'Income', data: incomeData, backgroundColor: '#16a34a', borderRadius: 6 },
                { label: 'Expense', data: expenseData, backgroundColor: '#dc2626', borderRadius: 6 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { callback: (v) => formatMoney(v) }
                }
            }
        }
    });
}

async function loadChartData() {
    try {
        [incomeCache, expenseCache] = await Promise.all([api.get('/income'), api.get('/expenses')]);
        const rangeSelect = document.getElementById('financeChartRange');
        buildChart(parseInt(rangeSelect?.value || '6', 10));
    } catch (error) {
        window.showToast?.('Failed to load chart data.', 'danger');
    }
}

document.getElementById('financeChartRange')?.addEventListener('change', (e) => {
    buildChart(parseInt(e.target.value, 10));
});

async function loadRecentTransactions() {
    const tbody = document.getElementById('recentTransactionsBody');
    if (!tbody) return;

    try {
        const combined = [
            ...incomeCache.map(i => ({ title: i.source, date: i.dateReceived, type: 'Income', amount: i.amount })),
            ...expenseCache.map(x => ({ title: x.description, date: x.expenseDate, type: 'Expense', amount: x.amount }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

        if (combined.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" class="text-center text-muted py-4">No transactions yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = combined.map(t => `
            <tr>
                <td>
                    <div class="fw-bold">${escapeHtml(t.title || '—')}</div>
                    <div class="small text-muted">${formatDate(t.date)}</div>
                </td>
                <td class="text-end">
                    <span class="status-badge ${t.type === 'Income' ? 'badge-success' : 'badge-danger'}">${t.type}</span>
                </td>
                <td class="text-end ${t.type === 'Income' ? 'amount-positive' : 'amount-negative'}">${t.type === 'Income' ? '+' : '-'} ${formatMoney(t.amount)}</td>
            </tr>
        `).join('');
    } catch (error) {
        window.showToast?.('Failed to load recent transactions.', 'danger');
    }
}

async function init() {
    await loadBalance();
    await loadChartData();
    await loadRecentTransactions();
}

init();
