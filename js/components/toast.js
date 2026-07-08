// Logic Controller: toast.js
// Lightweight toast notifications (replaces raw alert() calls across the app).

(function () {
    let container = null;

    function ensureContainer() {
        if (container && document.body.contains(container)) return container;
        container = document.createElement('div');
        container.id = 'toastStackContainer';
        container.style.position = 'fixed';
        container.style.top = '1rem';
        container.style.right = '1rem';
        container.style.zIndex = '10000';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '0.5rem';
        document.body.appendChild(container);
        return container;
    }

    // type: 'success' | 'danger' | 'info' | 'warning'
    window.showToast = function (message, type = 'info') {
        const stack = ensureContainer();

        const icons = {
            success: 'bi-check-circle-fill',
            danger: 'bi-x-circle-fill',
            warning: 'bi-exclamation-triangle-fill',
            info: 'bi-info-circle-fill'
        };

        const el = document.createElement('div');
        el.className = `alert alert-${type} shadow-lg d-flex align-items-center gap-2 mb-0`;
        el.style.minWidth = '260px';
        el.style.borderRadius = '10px';
        el.innerHTML = `<i class="bi ${icons[type] || icons.info}"></i><span>${message}</span>`;

        stack.appendChild(el);
        setTimeout(() => {
            el.style.transition = 'opacity 0.3s ease';
            el.style.opacity = '0';
            setTimeout(() => el.remove(), 300);
        }, 3500);
    };
})();
