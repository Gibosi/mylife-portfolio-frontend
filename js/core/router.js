// js/core/router.js
//
// NOTE: This used to intercept sidebar link clicks and swap page content
// via fetch() + innerHTML for an SPA-style experience. In testing, that
// approach caused pages to stop responding correctly after navigating
// (stale DOM references in previously-imported page modules, translations
// and the header avatar not being re-applied consistently, growing
// duplicate <link>/<script> tags, and inline scripts inside swapped HTML
// never executing per browser rules) — requiring a manual refresh to
// recover. Since every page already loads its own full set of scripts
// and styles independently, a normal browser navigation is simpler and
// fully reliable, so link clicks are no longer intercepted here.
//
// This file is kept (and still loaded by every page) only for the
// browser back/forward + legacy avatar-restore behavior below.

window.addEventListener('popstate', () => {
    // Normal navigation handles back/forward correctly on its own now;
    // nothing extra to do here.
});

// Restore the header avatar image immediately on load (in case it was
// customized) so there's no flash of the default avatar.
const savedAvatar = localStorage.getItem('saved_avatar');
if (savedAvatar) {
    document.addEventListener('DOMContentLoaded', () => {
        const headerAvatar = document.getElementById('headerAvatarImg');
        if (headerAvatar) headerAvatar.src = savedAvatar;
    });
}
