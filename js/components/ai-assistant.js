// js/components/ai-assistant.js
// Pulls real data from the API (dashboard totals, tasks, certificates)
// instead of showing hardcoded demo figures, and respects the user's
// notification preferences saved on the Settings page.

import { api } from '../core/api.js';

const NOTIF_KEY = 'notification_prefs';

function getNotifPrefs() {
    try {
        return JSON.parse(localStorage.getItem(NOTIF_KEY)) || { weeklyReports: true, taskDeadlines: true };
    } catch {
        return { weeklyReports: true, taskDeadlines: true };
    }
}

function daysUntil(dateStr) {
    if (!dateStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

class MyLifeAIAssistant {
    constructor() {
        this.dashboard = null;
        this.tasks = [];
        this.certificates = [];
        this.initToastContainer();
        this.bindEvents();
        this.loadRealData();
    }

    initToastContainer() {
        if (!document.getElementById('aiToastContainer')) {
            const container = document.createElement('div');
            container.id = 'aiToastContainer';
            container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            container.style.zIndex = '1080';
            document.body.appendChild(container);
        }
    }

    showToast(title, message, icon = 'bi-robot', type = 'primary') {
        const container = document.getElementById('aiToastContainer');
        const toastId = 'toast' + Date.now();

        const toastHtml = `
            <div id="${toastId}" class="toast border-0 shadow" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header bg-${type} text-white border-0">
                    <i class="bi ${icon} me-2"></i>
                    <strong class="me-auto">${title}</strong>
                    <small>Just now</small>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div class="toast-body bg-white text-dark fw-medium">
                    ${message}
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', toastHtml);
        const toastElement = document.getElementById(toastId);
        const bsToast = new bootstrap.Toast(toastElement, { delay: 7000 });
        bsToast.show();
        toastElement.addEventListener('hidden.bs.toast', () => toastElement.remove());
    }

    bindEvents() {
        const insightBtn = document.getElementById('generateInsightBtn');
        if (insightBtn) {
            insightBtn.addEventListener('click', () => {
                insightBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Thinking...';
                insightBtn.disabled = true;

                setTimeout(() => {
                    this.generateDeepInsight();
                    insightBtn.innerHTML = '<i class="bi bi-magic me-1"></i> Generate Deep Insight';
                    insightBtn.disabled = false;
                }, 1200);
            });
        }
    }

    async loadRealData() {
        try {
            const [dashboard, tasks, certificates] = await Promise.all([
                api.get('/dashboard'),
                api.get('/tasks').catch(() => []),
                api.get('/certificates').catch(() => [])
            ]);
            this.dashboard = dashboard;
            this.tasks = tasks || [];
            this.certificates = certificates || [];

            this.analyzeLife();
            this.scheduleAlerts();
        } catch (error) {
            console.error('AI assistant could not load real data:', error);
            const summaryText = document.getElementById('aiSummaryText');
            if (summaryText) summaryText.innerHTML = '<strong>AI Summary:</strong> Unable to load your data right now.';
        }
    }

    // 1. Real summary comment based on the logged-in user's actual data
    analyzeLife() {
        const summaryText = document.getElementById('aiSummaryText');
        if (!summaryText || !this.dashboard) return;

        const { totalIncome = 0, totalExpenses = 0, pendingTasks = 0 } = this.dashboard;

        let comment;
        if (totalIncome > 0) {
            const savingsRate = Math.round(((totalIncome - totalExpenses) / totalIncome) * 100);
            comment = `Your portfolio shows a savings rate of roughly ${savingsRate}%. `;
        } else {
            comment = `You haven't logged any income yet. `;
        }

        if (pendingTasks > 0) {
            comment += `You have ${pendingTasks} pending task(s). Stay focused!`;
        } else {
            comment += `You have no pending tasks right now — nice work!`;
        }

        summaryText.innerHTML = `<strong>AI Summary:</strong> ${comment}`;
    }

    generateDeepInsight() {
        const insights = [];
        const d = this.dashboard || {};

        if (d.balance > 0) {
            insights.push(`Consider allocating part of your ${Number(d.balance).toLocaleString()} TZS balance toward savings or investment.`);
        }
        if (d.totalSkills > 0) {
            insights.push(`You have ${d.totalSkills} skill(s) listed. Keep your Resume page up to date to reflect them.`);
        }
        if (d.totalExpenses > 0 && d.totalIncome > 0 && d.totalExpenses > d.totalIncome * 0.5) {
            insights.push(`Your expenses are over half of your income. Reviewing your Expenses page might reveal savings opportunities.`);
        }
        const upcomingTask = this.tasks.find(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED' && daysUntil(t.dueDate) !== null && daysUntil(t.dueDate) >= 0);
        if (upcomingTask) {
            insights.push(`Your task "${upcomingTask.title}" is coming up — check the Tasks page for details.`);
        }
        if (insights.length === 0) {
            insights.push(`Add more data (income, expenses, tasks, skills) so I can generate more personalized insights for you.`);
        }

        const chosen = insights[Math.floor(Math.random() * insights.length)];
        this.showToast('AI Deep Insight', chosen, 'bi-lightbulb-fill', 'success');
    }

    // 2. Real alerts based on actual task deadlines, spending ratio, and certificate expiry
    scheduleAlerts() {
        const prefs = getNotifPrefs();

        // Alert 1: Task(s) due soon (respects the "Task Deadlines" notification toggle)
        if (prefs.taskDeadlines) {
            setTimeout(() => {
                const dueSoon = this.tasks.filter(t => {
                    if (t.status === 'COMPLETED' || t.status === 'CANCELLED') return false;
                    const d = daysUntil(t.dueDate);
                    return d !== null && d >= 0 && d <= 2;
                });
                if (dueSoon.length > 0) {
                    const task = dueSoon[0];
                    const d = daysUntil(task.dueDate);
                    const when = d === 0 ? 'today' : d === 1 ? 'tomorrow' : `in ${d} days`;
                    this.showToast(
                        'Task Deadline Alert',
                        `Your task "${task.title}" is due ${when}. Consider starting it now to stay ahead.`,
                        'bi-alarm',
                        'warning'
                    );
                }
            }, 3000);
        }

        // Alert 2: High expenses advice (respects the "Weekly Finance Reports" notification toggle)
        if (prefs.weeklyReports) {
            setTimeout(() => {
                const d = this.dashboard || {};
                if (d.totalIncome > 0 && d.totalExpenses > d.totalIncome * 0.5) {
                    const pct = Math.round((d.totalExpenses / d.totalIncome) * 100);
                    this.showToast(
                        'Financial Advisor',
                        `Heads up! Your expenses have reached ${pct}% of your income. Try to minimize non-essential spending this week.`,
                        'bi-graph-down-arrow',
                        'danger'
                    );
                }
            }, 8000);
        }

        // Alert 3: Certificate expiring soon (real data — Certificate.expiryDate)
        setTimeout(() => {
            const expiringSoon = this.certificates.find(c => {
                const d = daysUntil(c.expiryDate);
                return d !== null && d >= 0 && d <= 30;
            });
            if (expiringSoon) {
                this.showToast(
                    'Certificate Expiring Soon',
                    `Your certificate "${expiringSoon.title}" expires soon. You may want to renew it.`,
                    'bi-award-fill',
                    'info'
                );
            }
        }, 14000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.MyLifeAI = new MyLifeAIAssistant();
});
