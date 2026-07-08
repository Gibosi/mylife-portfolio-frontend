// File: js/core/auth.js
// Handles Login, Registration, and Forgot Password logic against the real backend.

import { api } from './api.js';

// ============================================================
// LOGIN (auth/login.html)
// ============================================================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const errorBox = document.getElementById('loginError');
        const loginBtn = document.getElementById('loginBtn');

        if (errorBox) { errorBox.classList.add('d-none'); errorBox.textContent = ''; }
        if (loginBtn) { loginBtn.disabled = true; loginBtn.textContent = 'Signing in...'; }

        try {
            const response = await api.post('/auth/login', { username, password });

            if (!response.success) {
                throw new Error(response.message || 'Invalid username or password.');
            }

            localStorage.setItem('jwt_token', response.token);
            localStorage.setItem('username', response.username);
            localStorage.setItem('userId', response.userId);
            localStorage.setItem('email', response.email || '');

            window.location.href = '../pages/dashboard.html';
        } catch (error) {
            console.error('Login failed:', error);
            if (errorBox) {
                errorBox.textContent = error.message || 'Login failed. Please try again.';
                errorBox.classList.remove('d-none');
            }
        } finally {
            if (loginBtn) { loginBtn.disabled = false; loginBtn.textContent = 'Sign In'; }
        }
    });
}

// ============================================================
// REGISTER (auth/register.html)
// ============================================================
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('regUsername').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirm = document.getElementById('regConfirm').value;
        const errorBox = document.getElementById('registerError');
        const msgBox = document.getElementById('registerMsg');
        const registerBtn = document.getElementById('registerBtn');

        if (errorBox) { errorBox.classList.add('d-none'); errorBox.textContent = ''; }
        if (msgBox) { msgBox.classList.add('d-none'); msgBox.textContent = ''; }

        if (password !== confirm) {
            if (errorBox) {
                errorBox.textContent = 'Passwords do not match.';
                errorBox.classList.remove('d-none');
            }
            return;
        }

        if (registerBtn) { registerBtn.disabled = true; registerBtn.textContent = 'Creating account...'; }

        try {
            await api.post('/auth/register', { username, email, password });

            if (msgBox) {
                msgBox.textContent = 'Account created successfully! Redirecting to login...';
                msgBox.classList.remove('d-none');
            }
            setTimeout(() => { window.location.href = 'login.html'; }, 1200);
        } catch (error) {
            console.error('Registration failed:', error);
            if (errorBox) {
                errorBox.textContent = error.message || 'Registration failed. Please try again.';
                errorBox.classList.remove('d-none');
            }
        } finally {
            if (registerBtn) { registerBtn.disabled = false; registerBtn.textContent = 'Create Account'; }
        }
    });
}

// ============================================================
// FORGOT PASSWORD (auth/forgot-password.html) - 2 step flow
// ============================================================
const sendCodeBtn = document.getElementById('sendCodeBtn');
const resetPasswordBtn = document.getElementById('resetPasswordBtn');

if (sendCodeBtn) {
    sendCodeBtn.addEventListener('click', async () => {
        const contactInput = document.getElementById('resetContact');
        const contact = contactInput ? contactInput.value.trim() : '';

        if (!contact) {
            window.showToast ? window.showToast('Please enter your username or email.', 'warning') : alert('Please enter your username or email.');
            return;
        }

        sendCodeBtn.disabled = true;
        const originalText = sendCodeBtn.textContent;
        sendCodeBtn.textContent = 'Sending...';

        try {
            const message = await api.post('/auth/request-reset', { contact });

            const desc = document.getElementById('stepDescription');
            if (desc) desc.textContent = message || 'If an account exists, a verification code has been sent.';

            // Reveal step 2 fields
            const verifyCode = document.getElementById('verifyCode');
            const newPassword = document.getElementById('newPassword');
            const confirmNewPassword = document.getElementById('confirmNewPassword');
            [verifyCode, newPassword, confirmNewPassword, resetPasswordBtn].forEach(el => {
                if (el) el.closest('.form-group, div')?.classList.remove('d-none');
                if (el) el.classList.remove('d-none');
            });

            window.showToast ? window.showToast('Verification code sent (check server console in dev mode).', 'info') : null;
        } catch (error) {
            console.error('Request reset failed:', error);
            window.showToast ? window.showToast(error.message || 'Could not send reset code.', 'danger') : alert(error.message);
        } finally {
            sendCodeBtn.disabled = false;
            sendCodeBtn.textContent = originalText;
        }
    });
}

if (resetPasswordBtn) {
    resetPasswordBtn.addEventListener('click', async () => {
        const contact = document.getElementById('resetContact')?.value.trim();
        const code = document.getElementById('verifyCode')?.value.trim();
        const newPassword = document.getElementById('newPassword')?.value;
        const confirmNewPassword = document.getElementById('confirmNewPassword')?.value;

        if (!code || !newPassword) {
            window.showToast ? window.showToast('Please fill in the verification code and new password.', 'warning') : alert('Please fill in all fields.');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            window.showToast ? window.showToast('Passwords do not match.', 'warning') : alert('Passwords do not match.');
            return;
        }

        resetPasswordBtn.disabled = true;
        const originalText = resetPasswordBtn.textContent;
        resetPasswordBtn.textContent = 'Resetting...';

        try {
            await api.post('/auth/reset-password', { contact, code, newPassword });
            window.showToast ? window.showToast('Password reset! Redirecting to login...', 'success') : alert('Password reset successfully.');
            setTimeout(() => { window.location.href = 'login.html'; }, 1200);
        } catch (error) {
            console.error('Reset password failed:', error);
            window.showToast ? window.showToast(error.message || 'Could not reset password.', 'danger') : alert(error.message);
        } finally {
            resetPasswordBtn.disabled = false;
            resetPasswordBtn.textContent = originalText;
        }
    });
}
