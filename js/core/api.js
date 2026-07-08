// File: js/core/api.js
// Core fetch wrapper for the application. Automatically handles JWT tokens and common errors.

import { AppConfig } from '../../config/api-config.js';

function getHeaders(isJson = true) {
    const headers = {};
    if (isJson) headers['Content-Type'] = 'application/json';

    const token = localStorage.getItem('jwt_token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
}

// Figures out how many '../' levels separate the current page from the
// frontend root, so a redirect to auth/login.html works from any page depth.
function loginRedirectPath() {
    const depth = window.location.pathname.split('/').filter(Boolean).length;
    // pages/*.html and auth/*.html are both one level deep from the root,
    // so '../auth/login.html' is correct from either folder.
    return '../auth/login.html';
}

async function handleResponse(response) {
    if (response.status === 401 || response.status === 403) {
        console.error('Unauthorized! Redirecting to login...');
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('username');
        localStorage.removeItem('userId');
        localStorage.removeItem('email');
        window.location.href = loginRedirectPath();
        throw new Error('Unauthorized');
    }

    if (!response.ok) {
        let message = 'API request failed';
        const raw = await response.text().catch(() => '');
        if (raw) {
            try {
                const errorData = JSON.parse(raw);
                message = errorData.message || errorData.error || message;
            } catch {
                // Backend returned plain text instead of JSON — use it directly
                // rather than masking it behind a generic message.
                message = raw;
            }
        }
        throw new Error(message);
    }

    // DELETE / PATCH endpoints sometimes return plain text, sometimes JSON, sometimes nothing.
    if (response.status === 204) return null;

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        return response.json();
    }
    const text = await response.text();
    return text.length ? text : null;
}

export const api = {
    get: async (endpoint) => {
        const response = await fetch(`${AppConfig.API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    post: async (endpoint, data) => {
        const response = await fetch(`${AppConfig.API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },

    put: async (endpoint, data) => {
        const response = await fetch(`${AppConfig.API_BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },

    patch: async (endpoint, data) => {
        const response = await fetch(`${AppConfig.API_BASE_URL}${endpoint}`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: data === undefined ? undefined : JSON.stringify(data)
        });
        return handleResponse(response);
    },

    delete: async (endpoint) => {
        const response = await fetch(`${AppConfig.API_BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    // For multipart/form-data uploads (photos, PDFs, gallery media).
    // Do NOT set Content-Type manually here; the browser sets the correct
    // multipart boundary automatically when given a FormData body.
    postForm: async (endpoint, formData) => {
        const response = await fetch(`${AppConfig.API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: getHeaders(false),
            body: formData
        });
        return handleResponse(response);
    }
};

// Builds an absolute URL to a file stored under /uploads (profile photos,
// certificate PDFs, asset documents, gallery media). relativePath looks
// like "profile/abc123_photo.png" as returned by the backend.
export function uploadedFileUrl(relativePath) {
    if (!relativePath) return '';
    const origin = AppConfig.API_BASE_URL.replace(/\/api\/?$/, '');
    return `${origin}/uploads/${relativePath}`;
}
