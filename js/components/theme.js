// js/components/theme.js
(function () {
    function applyThemeClasses(theme) {
        const isDark = theme === 'dark';
        document.documentElement.classList.toggle('dark-mode', isDark);
        document.body.classList.toggle('dark-mode', isDark);

        const themeIcon = document.getElementById('themeIcon');
        if (themeIcon) {
            themeIcon.classList.toggle('bi-sun', isDark);
            themeIcon.classList.toggle('bi-moon', !isDark);
        }

        document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    }

    // Shared entry point used by the header toggle button AND the
    // Settings > Appearance tab, so both stay in sync with one source of truth.
    window.setTheme = function (theme) {
        localStorage.setItem('theme', theme);
        applyThemeClasses(theme);
    };

    window.getTheme = function () {
        return localStorage.getItem('theme') || 'light';
    };

    // Run immediately (before DOMContentLoaded) to prevent a white flash on load.
    const currentTheme = window.getTheme();
    if (currentTheme === 'dark') {
        document.documentElement.classList.add('dark-mode');
    }

    document.addEventListener('DOMContentLoaded', () => {
        applyThemeClasses(currentTheme);

        const themeBtn = document.getElementById('themeToggleBtn');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                const next = window.getTheme() === 'dark' ? 'light' : 'dark';
                window.setTheme(next);
            });
        }
    });
})();
