// Logic Controller: dashboard.js
// Pulls aggregate stats from /api/dashboard and populates the stat cards,
// plus a real "Recent Activity" feed built from actual income, expense,
// and task records (using their real createdAt timestamps).

import { api } from '../core/api.js';
import { formatMoney, escapeHtml } from '../core/utils.js';

async function loadDashboard() {
    try {
        const data = await api.get('/dashboard');

        const set = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        };

        set('stat_totalIncome', formatMoney(data.totalIncome));
        set('stat_totalExpenses', formatMoney(data.totalExpenses));
        set('stat_balance', formatMoney(data.balance));
        set('stat_totalTasks', data.totalTasks);
        set('stat_pendingTasks', data.pendingTasks);
        set('stat_completedTasks', data.completedTasks);
        set('stat_totalSkills', data.totalSkills);
        set('stat_totalEducation', data.totalEducation);
        set('stat_totalProjects', data.totalProjects);
        set('stat_totalCertificates', data.totalCertificates);

        const aiText = document.getElementById('aiSummaryText');
        if (aiText) {
            aiText.textContent = `You have ${data.pendingTasks} pending task(s) and a current balance of ${formatMoney(data.balance)} TZS.`;
        }
    } catch (error) {
        console.error('Failed to load dashboard:', error);
        window.showToast?.('Failed to load dashboard data.', 'danger');
    }
}

function timeAgo(dateStr) {
    if (!dateStr) return '';
    const then = new Date(dateStr);
    const diffMs = Date.now() - then.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
    return then.toLocaleDateString();
}

async function loadRecentActivity() {
    const list = document.getElementById('recentActivityList');
    if (!list) return;

    try {
        const [income, expenses, tasks] = await Promise.all([
            api.get('/income').catch(() => []),
            api.get('/expenses').catch(() => []),
            api.get('/tasks').catch(() => [])
        ]);

        const events = [];

        income.forEach(i => {
            if (!i.createdAt) return;
            events.push({
                time: i.createdAt,
                icon: 'bi-plus-lg', badgeClass: 'bg-success-subtle text-success border-success',
                title: 'Added Income',
                detail: `Recorded "${escapeHtml(i.source || 'Untitled')}" (${formatMoney(i.amount)} TZS) in Finance`
            });
        });

        expenses.forEach(x => {
            if (!x.createdAt) return;
            events.push({
                time: x.createdAt,
                icon: 'bi-dash-lg', badgeClass: 'bg-danger-subtle text-danger border-danger',
                title: 'Added Expense',
                detail: `Recorded "${escapeHtml(x.description || 'Untitled')}" (${formatMoney(x.amount)} TZS)`
            });
        });

        tasks.forEach(t => {
            if (!t.createdAt) return;
            events.push({
                time: t.createdAt,
                icon: t.status === 'COMPLETED' ? 'bi-check2-square' : 'bi-list-task',
                badgeClass: t.status === 'COMPLETED' ? 'bg-primary-subtle text-primary border-primary' : 'bg-warning-subtle text-warning-emphasis border-warning',
                title: t.status === 'COMPLETED' ? 'Task Completed' : 'Task Created',
                detail: `"${escapeHtml(t.title)}"`
            });
        });

        events.sort((a, b) => new Date(b.time) - new Date(a.time));
        const visible = events.slice(0, 6);

        if (visible.length === 0) {
            list.innerHTML = `<li class="text-muted small">No activity yet — start by adding income, expenses, or tasks.</li>`;
            return;
        }

        list.innerHTML = visible.map(e => `
            <li>
                <span class="badge ${e.badgeClass} p-3 rounded-circle border border-opacity-25"><i class="bi ${e.icon} fs-5"></i></span>
                <div>
                    <div class="fw-bold text-dark">${e.title}</div>
                    <div class="small text-muted mt-1">${e.detail}</div>
                </div>
                <div class="ms-auto text-muted small"><i class="bi bi-clock me-1"></i> ${timeAgo(e.time)}</div>
            </li>
        `).join('');
    } catch (error) {
        console.error('Failed to load recent activity:', error);
        list.innerHTML = `<li class="text-muted small">Unable to load recent activity.</li>`;
    }
}

const usernameEl = document.getElementById('headerUsername');
const welcomeName = document.querySelector('h3 .text-primary');
if (welcomeName && usernameEl) {
    welcomeName.textContent = localStorage.getItem('username') || usernameEl.textContent;
}

loadDashboard();
loadRecentActivity();
