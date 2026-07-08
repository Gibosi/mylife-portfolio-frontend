// Logic Controller: settings.js
// Account settings (email/language/timezone), password change, account
// deletion, appearance (theme) controls, and notification preferences.

import { api } from '../core/api.js';
import { val, setVal } from '../core/utils.js';

const accountForm = document.getElementById('accountSettingsForm');
const passwordForm = document.getElementById('passwordForm');
const deleteAccountBtn = document.getElementById('deleteAccountBtn');

async function loadSettings() {
    try {
        const user = await api.get('/users/me');
        setVal('settingsUsername', user.username);
        setVal('settingsEmail', user.email);
        setVal('settingsLanguage', user.language);
        setVal('settingsTimezone', user.timezone);

        // Keep the sidebar language selector in sync with the saved server-side preference.
        if (user.language && localStorage.getItem('app_lang') !== user.language) {
            window.changeLanguage?.(user.language);
        }
    } catch (error) {
        console.error('Failed to load account settings:', error);
    }
}

if (accountForm) {
    accountForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            email: val('settingsEmail'),
            language: val('settingsLanguage'),
            timezone: val('settingsTimezone')
        };
        try {
            const updated = await api.put('/users/settings', payload);
            localStorage.setItem('email', updated.email || '');
            window.changeLanguage?.(updated.language || 'en');
            window.showToast?.(window.t ? window.t('msg.savedSuccess') : 'Settings saved successfully!', 'success');
        } catch (error) {
            window.showToast?.(error.message || 'Error saving settings.', 'danger');
        }
    });
}

if (passwordForm) {
    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentPassword = val('currentPassword');
        const newPassword = val('newPassword');
        const confirmNewPassword = val('confirmNewPassword');

        if (newPassword !== confirmNewPassword) {
            window.showToast?.('New passwords do not match.', 'warning');
            return;
        }
        if (newPassword.length < 6) {
            window.showToast?.('New password must be at least 6 characters.', 'warning');
            return;
        }

        try {
            await api.put('/auth/change-password', { currentPassword, newPassword });
            window.showToast?.('Password changed successfully!', 'success');
            passwordForm.reset();
        } catch (error) {
            window.showToast?.(error.message || 'Error changing password.', 'danger');
        }
    });
}

if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', () => {
        window.showCustomConfirm(
            'Delete Account',
            'This is permanent. All your data, portfolio, and financial records will be wiped from the server. Are you absolutely sure?',
            'Delete My Account',
            'btn-danger',
            async () => {
                try {
                    await api.delete('/users/me');
                    window.showToast?.('Account deleted.', 'success');
                    localStorage.clear();
                    setTimeout(() => { window.location.href = '../auth/login.html'; }, 800);
                } catch (error) {
                    window.showToast?.(error.message || 'Error deleting account.', 'danger');
                }
            }
        );
    });
}

// ===================== Appearance (Theme) =====================

function refreshThemeCardHighlight() {
    const theme = window.getTheme ? window.getTheme() : 'light';
    const lightCard = document.getElementById('lightModeCard');
    const darkCard = document.getElementById('darkModeCard');
    if (!lightCard || !darkCard) return;

    lightCard.classList.toggle('border-primary', theme === 'light');
    lightCard.classList.toggle('shadow-sm', theme === 'light');
    lightCard.classList.toggle('opacity-50', theme === 'dark');

    darkCard.classList.toggle('border-primary', theme === 'dark');
    darkCard.classList.toggle('shadow-sm', theme === 'dark');
    darkCard.classList.toggle('opacity-50', theme === 'light');
}

document.getElementById('lightModeCard')?.addEventListener('click', () => {
    window.setTheme?.('light');
    refreshThemeCardHighlight();
});
document.getElementById('darkModeCard')?.addEventListener('click', () => {
    window.setTheme?.('dark');
    refreshThemeCardHighlight();
});
document.addEventListener('themechange', refreshThemeCardHighlight);
refreshThemeCardHighlight();

// ===================== Notifications =====================
// No backend model exists for notification delivery (that would need a
// real email/SMS provider), so preferences are persisted locally and
// actually consulted by the AI assistant on the dashboard before it
// surfaces a task-deadline or weekly-report style alert.

const NOTIF_KEY = 'notification_prefs';

function loadNotificationPrefs() {
    try {
        return JSON.parse(localStorage.getItem(NOTIF_KEY)) || { weeklyReports: true, taskDeadlines: true };
    } catch {
        return { weeklyReports: true, taskDeadlines: true };
    }
}

function saveNotificationPrefs(prefs) {
    localStorage.setItem(NOTIF_KEY, JSON.stringify(prefs));
}

const weeklyToggle = document.getElementById('notifyWeeklyReports');
const deadlineToggle = document.getElementById('notifyTaskDeadlines');

const prefs = loadNotificationPrefs();
if (weeklyToggle) weeklyToggle.checked = prefs.weeklyReports;
if (deadlineToggle) deadlineToggle.checked = prefs.taskDeadlines;

weeklyToggle?.addEventListener('change', () => {
    const p = loadNotificationPrefs();
    p.weeklyReports = weeklyToggle.checked;
    saveNotificationPrefs(p);
    window.showToast?.('Preference saved.', 'success');
});
deadlineToggle?.addEventListener('change', () => {
    const p = loadNotificationPrefs();
    p.taskDeadlines = deadlineToggle.checked;
    saveNotificationPrefs(p);
    window.showToast?.('Preference saved.', 'success');
});

// ===================== Real "current session" info =====================

function describeCurrentSession() {
    const ua = navigator.userAgent;
    let device = 'Desktop';
    if (/Mobi|Android/i.test(ua)) device = 'Mobile Device';
    else if (/Tablet|iPad/i.test(ua)) device = 'Tablet';

    let browser = 'Browser';
    if (ua.includes('Edg/')) browser = 'Edge';
    else if (ua.includes('Chrome/') && !ua.includes('Chromium')) browser = 'Chrome';
    else if (ua.includes('Firefox/')) browser = 'Firefox';
    else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Safari';

    let os = 'Unknown OS';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac OS')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

    const deviceInfo = document.getElementById('sessionDeviceInfo');
    const locationInfo = document.getElementById('sessionLocationInfo');
    if (deviceInfo) deviceInfo.textContent = `${os} - ${browser} (${device})`;
    if (locationInfo) locationInfo.textContent = `Active now • Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`;
}

describeCurrentSession();
loadSettings();

// ===================== Explicit tab wiring =====================
// Belt-and-suspenders: Bootstrap's data-bs-toggle="tab" attribute should
// handle this automatically, but we wire it explicitly too so each of the
// 4 settings buttons (Account / Security / Notifications / Appearance)
// reliably shows its own panel even if the automatic binding doesn't fire.
document.querySelectorAll('.settings-nav-item[data-bs-target]').forEach(navItem => {
    navItem.addEventListener('click', (e) => {
        e.preventDefault();

        const targetSelector = navItem.getAttribute('data-bs-target');
        const targetPane = document.querySelector(targetSelector);
        if (!targetPane) return;

        document.querySelectorAll('.settings-nav-item').forEach(el => el.classList.remove('active'));
        navItem.classList.add('active');

        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('show', 'active');
        });
        targetPane.classList.add('show', 'active');
    });
});
