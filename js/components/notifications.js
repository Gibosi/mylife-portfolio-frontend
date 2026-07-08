// js/components/notifications.js
// Populates the header notification bell with real, current data
// (upcoming task deadlines, recent income, low balance, expiring
// certificates) instead of the old hardcoded demo list. Runs on every
// page since the bell appears in every page's header.

import { api } from '../core/api.js';
import { escapeHtml, formatDate } from '../core/utils.js';

function daysUntil(dateStr) {
    if (!dateStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

function daysSince(dateStr) {
    if (!dateStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    return Math.round((today - target) / (1000 * 60 * 60 * 24));
}

async function buildNotifications() {
    const list = document.getElementById('notificationsDropdownList');
    const badge = document.getElementById('notificationBadge');
    if (!list) return;

    try {
        const [tasks, income, certificates, balance] = await Promise.all([
            api.get('/tasks').catch(() => []),
            api.get('/income').catch(() => []),
            api.get('/certificates').catch(() => []),
            api.get('/finance/balance').catch(() => null)
        ]);

        const notifications = [];

        // Upcoming/overdue task deadlines
        tasks
            .filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED')
            .forEach(t => {
                const d = daysUntil(t.dueDate);
                if (d !== null && d <= 2) {
                    notifications.push({
                        icon: d < 0 ? 'bi-exclamation-triangle text-danger' : 'bi-alarm text-warning',
                        text: d < 0
                            ? `"${t.title}" is overdue`
                            : d === 0 ? `"${t.title}" is due today` : `"${t.title}" is due soon`,
                        date: t.dueDate
                    });
                }
            });

        // Recently added income (last 7 days)
        income.forEach(i => {
            const d = daysSince(i.dateReceived);
            if (d !== null && d >= 0 && d <= 7) {
                notifications.push({
                    icon: 'bi-cash text-success',
                    text: `Income received: ${escapeHtml(i.source || 'Untitled')}`,
                    date: i.dateReceived
                });
            }
        });

        // Certificates expiring within 30 days
        certificates.forEach(c => {
            const d = daysUntil(c.expiryDate);
            if (d !== null && d >= 0 && d <= 30) {
                notifications.push({
                    icon: 'bi-award text-info',
                    text: `Certificate "${escapeHtml(c.title)}" expires soon`,
                    date: c.expiryDate
                });
            }
        });

        // Low / negative balance warning
        if (balance && Number(balance.balance) < 0) {
            notifications.push({
                icon: 'bi-graph-down-arrow text-danger',
                text: `Your balance is negative. Review your expenses.`,
                date: null
            });
        }

        // Newest first, cap at 6
        notifications.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
        const visible = notifications.slice(0, 6);

        const header = `<li class="p-3 border-bottom bg-light fw-bold" data-i18n="word.notifications">Notifications</li>`;

        if (visible.length === 0) {
            list.innerHTML = `${header}<li class="p-3 text-center text-muted small">You're all caught up!</li>`;
            badge?.classList.add('d-none');
        } else {
            const items = visible.map(n => `
                <li><a class="dropdown-item py-2 border-bottom" href="#">
                    <i class="bi ${n.icon} me-2"></i> ${n.text}
                    ${n.date ? `<div class="small text-muted ms-4">${formatDate(n.date)}</div>` : ''}
                </a></li>
            `).join('');
            list.innerHTML = `${header}${items}`;
            badge?.classList.remove('d-none');
        }

        window.applyTranslations?.(localStorage.getItem('app_lang') || 'en');
    } catch (error) {
        console.error('Failed to load notifications:', error);
        list.innerHTML = `<li class="p-3 border-bottom bg-light fw-bold" data-i18n="word.notifications">Notifications</li><li class="p-3 text-center text-muted small">Unable to load notifications.</li>`;
    }
}

buildNotifications();
