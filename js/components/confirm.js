
// Global UI Utility for Custom Confirm Modals
window.showCustomConfirm = function(title, message, confirmText, btnClass, onConfirm) {
    // Remove existing modal if any
    const oldModal = document.getElementById('customConfirmModal');
    if (oldModal) oldModal.remove();

    // HTML Template for the Bootstrap Modal
    const modalHtml = `
    <div class="modal fade" id="customConfirmModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg" style="border-radius: 16px;">
                <div class="modal-body p-5 text-center">
                    <i class="bi bi-exclamation-triangle-fill text-danger mb-4" style="font-size: 4rem;"></i>
                    <h4 class="fw-bold mb-3 text-dark">${title}</h4>
                    <p class="text-muted mb-4 fs-6">${message}</p>
                    <div class="d-flex justify-content-center gap-3 mt-4">
                        <button type="button" class="btn btn-light px-4 py-2 fw-bold text-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn ${btnClass} px-4 py-2 fw-bold" id="customConfirmBtn">${confirmText}</button>
                    </div>
                </div>
            </div>
        </div>
    </div>`;

    // Append to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Initialize & Show Bootstrap Modal
    const modalElement = document.getElementById('customConfirmModal');
    const bsModal = new bootstrap.Modal(modalElement);
    
    // Bind Confirm Action
    document.getElementById('customConfirmBtn').addEventListener('click', () => {
        bsModal.hide();
        if (onConfirm) onConfirm();
    });

    bsModal.show();
};
