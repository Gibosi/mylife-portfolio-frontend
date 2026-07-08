// Logic Controller: sidebar.js
// Handles the sidebar toggle AND doubles as the global "layout" init that
// runs on every authenticated page: auth guard, header username/avatar,
// and the logout link.

import { uploadedFileUrl } from '../core/api.js';

const MOBILE_BREAKPOINT = 992;

function isMobileViewport() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
}

function ensureBackdrop() {
    let backdrop = document.getElementById('sidebarBackdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'sidebarBackdrop';
        backdrop.className = 'sidebar-backdrop';
        document.body.appendChild(backdrop);
    }
    return backdrop;
}

function closeMobileSidebar(sidebar, backdrop) {
    sidebar.classList.remove('sidebar-mobile-open');
    backdrop.classList.remove('active');
}

function openMobileSidebar(sidebar, backdrop) {
    sidebar.classList.add('sidebar-mobile-open');
    backdrop.classList.add('active');
}

export function initSidebar() {
    const toggleBtn = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    const backdrop = ensureBackdrop();

    // Start hidden on phones/tablets so the sidebar never crowds the page;
    // desktop keeps its existing "always visible" default.
    if (isMobileViewport()) {
        closeMobileSidebar(sidebar, backdrop);
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            if (isMobileViewport()) {
                const isOpen = sidebar.classList.contains('sidebar-mobile-open');
                if (isOpen) closeMobileSidebar(sidebar, backdrop);
                else openMobileSidebar(sidebar, backdrop);
                return;
            }

            // Desktop: original push/hide behavior.
            const currentMargin = sidebar.style.marginLeft;
            if (currentMargin === '-260px') {
                sidebar.style.marginLeft = '0';
            } else {
                sidebar.style.marginLeft = '-260px';
            }
        });
    }

    // Tapping outside the open sidebar (the dimmed backdrop) closes it again.
    backdrop.addEventListener('click', () => closeMobileSidebar(sidebar, backdrop));

    // Tapping a nav link on mobile closes the overlay immediately for a
    // cleaner transition (the browser is navigating away regardless).
    sidebar.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.addEventListener('click', () => {
            if (isMobileViewport()) closeMobileSidebar(sidebar, backdrop);
        });
    });

    // If the window is resized across the breakpoint, reset to a sane state
    // instead of leaving a desktop-opened sidebar stuck mid-transition.
    window.addEventListener('resize', () => {
        if (!isMobileViewport()) {
            closeMobileSidebar(sidebar, backdrop);
            sidebar.style.marginLeft = '';
        }
    });
}

function initAuthGuard() {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        window.location.href = '../auth/login.html';
    }
}

function initHeader() {
    const username = localStorage.getItem('username');
    const usernameEl = document.getElementById('headerUsername');
    if (usernameEl && username) usernameEl.textContent = username;

    const savedAvatar = localStorage.getItem('saved_avatar');
    if (savedAvatar) {
        const headerAvatar = document.getElementById('headerAvatarImg');
        if (headerAvatar) headerAvatar.src = savedAvatar;
    }
}

function initLogout() {
    const logoutLink = document.getElementById('dropdownLogout');
    if (logoutLink && !logoutLink.dataset.bound) {
        logoutLink.dataset.bound = 'true';
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('username');
            localStorage.removeItem('userId');
            localStorage.removeItem('email');
            window.location.href = '../auth/login.html';
        });
    }
}

// Exposed so profile.js can update the header avatar immediately after an upload.
window.setHeaderAvatar = function (url) {
    const headerAvatar = document.getElementById('headerAvatarImg');
    if (headerAvatar) headerAvatar.src = url;
    localStorage.setItem('saved_avatar', url);
};

window.uploadedFileUrl = uploadedFileUrl;

initAuthGuard();
initSidebar();
initHeader();
initLogout();
