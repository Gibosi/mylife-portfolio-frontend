// Logic Controller: profile.js
// Loads/saves the current user's profile, and handles photo upload.

import { api, uploadedFileUrl } from '../core/api.js';
import { val, setVal, formatDate } from '../core/utils.js';

const editBtn = document.getElementById('editProfileBtn');
const cancelBtn = document.getElementById('cancelEditBtn');
const profileView = document.getElementById('profileView');
const profileForm = document.getElementById('profileForm');

let hasProfile = false;

function displayProfile(p) {
    document.getElementById('profileNameDisplay').textContent = p.fullName || 'Your Name';
    document.getElementById('profileTitleDisplay').textContent = p.jobTitle || '';

    const map = {
        view_email: p.email, view_phoneNumber: p.phoneNumber, view_address: p.address,
        view_dateOfBirth: formatDate(p.dateOfBirth), view_nationality: p.nationality,
        view_gender: p.gender, view_maritalStatus: p.maritalStatus, view_nidaNumber: p.nidaNumber,
        view_placeOfBirth: p.placeOfBirth, view_careerObjective: p.careerObjective,
        view_abilities: p.abilities, view_hobbies: p.hobbies,
        view_languageProficiency: p.languageProficiency, view_biography: p.biography,
        view_referees: p.referees
    };
    Object.entries(map).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value || '—';
    });

    // Populate the edit form too so it opens pre-filled
    setVal('fullName', p.fullName);
    setVal('jobTitle', p.jobTitle);
    setVal('email', p.email);
    setVal('phoneNumber', p.phoneNumber);
    setVal('address', p.address);
    setVal('dateOfBirth', p.dateOfBirth);
    setVal('nationality', p.nationality);
    setVal('gender', p.gender);
    setVal('maritalStatus', p.maritalStatus);
    setVal('nidaNumber', p.nidaNumber);
    setVal('placeOfBirth', p.placeOfBirth);
    setVal('careerObjective', p.careerObjective);
    setVal('abilities', p.abilities);
    setVal('hobbies', p.hobbies);
    setVal('languageProficiency', p.languageProficiency);
    setVal('referees', p.referees);
    setVal('biography', p.biography);

    if (p.profilePhoto) {
        const url = uploadedFileUrl(p.profilePhoto);
        ['avatarPreview', 'avatarZoomImg'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.src = url;
        });
        window.setHeaderAvatar?.(url);
    }
}

async function loadProfile() {
    try {
        const p = await api.get('/profile');
        hasProfile = true;
        displayProfile(p);
    } catch (error) {
        // No profile yet is expected for a brand-new account.
        hasProfile = false;
        console.log('No profile yet, showing empty state.');
    }
}

if (editBtn) {
    editBtn.addEventListener('click', () => {
        profileView.classList.add('d-none');
        profileForm.classList.remove('d-none');
        editBtn.classList.add('d-none');
    });
}

if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
        profileForm.classList.add('d-none');
        profileView.classList.remove('d-none');
        editBtn.classList.remove('d-none');
    });
}

if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const payload = {
            fullName: val('fullName'), jobTitle: val('jobTitle'), email: val('email'),
            phoneNumber: val('phoneNumber'), address: val('address'), dateOfBirth: val('dateOfBirth'),
            nationality: val('nationality'), gender: val('gender'), maritalStatus: val('maritalStatus'),
            nidaNumber: val('nidaNumber'), placeOfBirth: val('placeOfBirth'),
            careerObjective: val('careerObjective'), abilities: val('abilities'),
            hobbies: val('hobbies'), languageProficiency: val('languageProficiency'),
            referees: val('referees'),
            biography: val('biography')
        };

        try {
            await api.post('/profile', payload);
            window.showToast?.('Profile updated successfully!', 'success');
            await loadProfile();
            profileForm.classList.add('d-none');
            profileView.classList.remove('d-none');
            editBtn.classList.remove('d-none');
        } catch (error) {
            window.showToast?.(error.message || 'Error updating profile.', 'danger');
        }
    });
}

// Photo upload (shared across the quick-change icon, zoom modal button, and main button)
document.addEventListener('click', (e) => {
    const quickBtn = e.target.closest('#quickChangeAvatarBtn');
    if (quickBtn) document.getElementById('photoUploadInput').click();

    const modalBtn = e.target.closest('#modalChangeAvatarBtn');
    if (modalBtn) {
        const modalEl = document.getElementById('avatarZoomModal');
        bootstrap.Modal.getInstance(modalEl)?.hide();
        document.getElementById('photoUploadInput').click();
    }
});

async function uploadPhoto(file) {
    if (!hasProfile) {
        window.showToast?.('Please save your profile details first, then add a photo.', 'warning');
        return;
    }
    const formData = new FormData();
    formData.append('photo', file);
    try {
        await api.postForm('/profile/upload-photo', formData);
        window.showToast?.('Profile photo updated!', 'success');
        await loadProfile();
    } catch (error) {
        window.showToast?.(error.message || 'Error uploading photo.', 'danger');
    }
}

['photoUploadInput'].forEach(id => {
    const input = document.getElementById(id);
    if (input) {
        input.addEventListener('change', function () {
            const file = this.files[0];
            if (file) {
                // Instant local preview while the upload happens in the background
                const reader = new FileReader();
                reader.onload = (e) => {
                    ['avatarPreview', 'avatarZoomImg'].forEach(pid => {
                        const el = document.getElementById(pid);
                        if (el) el.src = e.target.result;
                    });
                };
                reader.readAsDataURL(file);
                uploadPhoto(file);
            }
        });
    }
});

const uploadPhotoBtn = document.getElementById('uploadPhotoBtn');
const photoUploadInput = document.getElementById('photoUploadInput');
if (uploadPhotoBtn && photoUploadInput) {
    uploadPhotoBtn.addEventListener('click', () => photoUploadInput.click());
}

loadProfile();
