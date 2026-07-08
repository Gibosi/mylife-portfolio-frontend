// Logic Controller: gallery.js
// Upload/list/delete against /api/gallery.

import { api, uploadedFileUrl } from '../core/api.js';
import { escapeHtml } from '../core/utils.js';

const grid = document.getElementById('galleryGrid');
const form = document.getElementById('galleryForm');
const uploadModalEl = document.getElementById('uploadMediaModal');
let cache = [];
let currentFilter = 'all';

const icons = { image: 'bi-image text-primary', video: 'bi-play-circle text-white', document: 'bi-file-earmark-pdf text-danger' };

function formatSize(bytes) {
    if (!bytes) return '0 MB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function renderGrid() {
    if (!grid) return;
    const visible = currentFilter === 'all' ? cache : cache.filter(m => m.category === currentFilter);

    if (visible.length === 0) {
        grid.innerHTML = `<div class="text-center text-muted py-5 w-100">No files uploaded yet.</div>`;
        return;
    }

    grid.innerHTML = visible.map(m => {
        const url = uploadedFileUrl(m.filePath);
        const isImage = m.category === 'image';
        const isVideo = m.category === 'video';
        return `
        <div class="gallery-card" data-category="${m.category}">
            <div class="gallery-actions">
                <button class="btn btn-sm btn-light text-danger delete-media" data-id="${m.mediaId}"><i class="bi bi-trash"></i></button>
            </div>
            <div class="gallery-img ${isVideo ? 'bg-dark' : ''} ${!isImage && !isVideo ? 'bg-secondary bg-opacity-25' : ''}" ${isImage ? `style="background-image:url('${url}');background-size:cover;background-position:center;"` : ''}>
                ${isImage ? '' : `<i class="bi ${icons[m.category] || 'bi-file-earmark'}"></i>`}
            </div>
            <div class="gallery-info">
                <div class="gallery-title">${escapeHtml(m.caption || m.fileName)}</div>
                <div class="gallery-meta"><span>${escapeHtml(m.category)}</span><span>${formatSize(m.fileSizeBytes)}</span></div>
            </div>
            <a href="${url}" target="_blank" class="stretched-link" style="position:absolute; inset:0; z-index:0;"></a>
        </div>`;
    }).join('');
}

async function loadMedia() {
    try {
        cache = await api.get('/gallery');
        renderGrid();
    } catch (error) {
        window.showToast?.('Failed to load gallery.', 'danger');
    }
}

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const fileInput = document.getElementById('mediaFile');
        if (fileInput.files.length === 0) return;

        const file = fileInput.files[0];
        const maxSize = 250 * 1024 * 1024;
        if (file.size > maxSize) {
            window.showToast?.(`File is too large! Maximum size is 250MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`, 'warning');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', document.getElementById('mediaCategory').value);
        formData.append('caption', document.getElementById('mediaTitle').value);

        try {
            await api.postForm('/gallery', formData);
            window.showToast?.('File uploaded successfully!', 'success');
            const bsModal = bootstrap.Modal.getInstance(uploadModalEl);
            bsModal?.hide();
            form.reset();
            await loadMedia();
        } catch (error) {
            window.showToast?.(error.message || 'Upload failed.', 'danger');
        }
    });
}

document.getElementById('galleryFilters')?.addEventListener('click', (e) => {
    const targetBtn = e.target.closest('.btn');
    if (!targetBtn) return;
    document.querySelectorAll('#galleryFilters .btn').forEach(b => b.classList.remove('active'));
    targetBtn.classList.add('active');
    currentFilter = targetBtn.getAttribute('data-filter');
    renderGrid();
});

document.addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('.delete-media');
    if (deleteBtn) {
        e.preventDefault();
        e.stopPropagation();
        const id = deleteBtn.dataset.id;
        window.showCustomConfirm('Delete Media', 'Are you sure you want to delete this file? It cannot be recovered.', 'Delete', 'btn-danger', async () => {
            try {
                await api.delete(`/gallery/${id}`);
                window.showToast?.('Media deleted.', 'success');
                await loadMedia();
            } catch (error) {
                window.showToast?.(error.message || 'Error deleting media.', 'danger');
            }
        });
    }
});

loadMedia();
