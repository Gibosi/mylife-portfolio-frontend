// Logic Controller: resume.js
// Builds the printable CV by combining /api/profile, /api/education,
// /api/experience, /api/skills, /api/certificates, and /api/projects.
// Also wires the CV Configuration toggles (persisted per-browser) and a
// real PDF export that captures only the CV paper, not the whole page.

import { api } from '../core/api.js';
import { escapeHtml } from '../core/utils.js';

const SECTION_PREFS_KEY = 'resume_section_prefs';

function setSection(id, titleText, bodyHtml) {
    const section = document.getElementById(id);
    if (!section) return;
    section.innerHTML = `
        <div class="cv-section-title text-decoration-underline border-0 pb-0">${titleText}</div>
        ${bodyHtml}
    `;
}

function formatYear(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.getFullYear();
}

async function buildResume() {
    const results = await Promise.allSettled([
        api.get('/profile'),
        api.get('/education'),
        api.get('/experience'),
        api.get('/skills'),
        api.get('/certificates'),
        api.get('/projects')
    ]);

    const [profileRes, eduRes, expRes, skillRes, certRes, projRes] = results;
    const profile = profileRes.status === 'fulfilled' ? profileRes.value : {};
    const education = eduRes.status === 'fulfilled' ? eduRes.value : [];
    const experience = expRes.status === 'fulfilled' ? expRes.value : [];
    const skills = skillRes.status === 'fulfilled' ? skillRes.value : [];
    const certificates = certRes.status === 'fulfilled' ? certRes.value : [];
    const projects = projRes.status === 'fulfilled' ? projRes.value : [];

    // Contact
    setSection('cv-contact', 'CONTACT DETAILS', `
        <div class="cv-table-like">
            <div class="cv-row"><div class="cv-label">Home Address</div><div class="cv-val">: ${escapeHtml(profile.address || '—')}</div></div>
            <div class="cv-row"><div class="cv-label">Mobile phone</div><div class="cv-val">: ${escapeHtml(profile.phoneNumber || '—')}</div></div>
            <div class="cv-row"><div class="cv-label">Email address</div><div class="cv-val">: ${escapeHtml(profile.email || '—')}</div></div>
            <div class="cv-row"><div class="cv-label">Nida Number</div><div class="cv-val">: ${escapeHtml(profile.nidaNumber || '—')}</div></div>
        </div>
    `);

    // Personal
    setSection('cv-personal', 'PERSONAL PARTICULARS', `
        <div class="cv-table-like">
            <div class="cv-row"><div class="cv-label">Name</div><div class="cv-val">: ${escapeHtml(profile.fullName || '—')}</div></div>
            <div class="cv-row"><div class="cv-label">Sex</div><div class="cv-val">: ${escapeHtml(profile.gender || '—')}</div></div>
            <div class="cv-row"><div class="cv-label">Date of birth</div><div class="cv-val">: ${escapeHtml(profile.dateOfBirth || '—')}</div></div>
            <div class="cv-row"><div class="cv-label">Marital Status</div><div class="cv-val">: ${escapeHtml(profile.maritalStatus || '—')}</div></div>
            <div class="cv-row"><div class="cv-label">Nationality</div><div class="cv-val">: ${escapeHtml(profile.nationality || '—')}</div></div>
            <div class="cv-row"><div class="cv-label">Place of birth</div><div class="cv-val">: ${escapeHtml(profile.placeOfBirth || '—')}</div></div>
        </div>
    `);

    // Personal profile / bio
    setSection('cv-summary', 'PERSONAL PROFILE', `
        <ul class="cv-custom-list"><li>${escapeHtml(profile.biography || 'No personal profile added yet. Add one on the Profile page.')}</li></ul>
    `);

    // Career objective
    setSection('cv-objective', 'CAREER OBJECTIVE', `
        <ul class="cv-custom-list"><li>${escapeHtml(profile.careerObjective || 'No career objective added yet. Add one on the Profile page.')}</li></ul>
    `);

    // Education
    const eduRows = education.length
        ? education.map((e, i) => `
            <tr>
                <td>${i + 1}</td>
                <td>${escapeHtml(e.program || '')}</td>
                <td>${e.startYear || ''}-${e.endYear || ''}</td>
                <td>${escapeHtml(e.institution || '')}</td>
                <td>${escapeHtml(e.level || '')}${e.grade ? ` (${escapeHtml(e.grade)})` : ''}</td>
            </tr>`).join('')
        : `<tr><td colspan="5" class="text-center text-muted">No education records yet.</td></tr>`;
    setSection('cv-education', 'ACADEMIC QUALIFICATIONS', `
        <table class="cv-table">
            <thead><tr><th>S/N</th><th>Course Attended</th><th>Duration</th><th>Institution</th><th>Awarded</th></tr></thead>
            <tbody>${eduRows}</tbody>
        </table>
    `);

    // Experience
    const expBlocks = experience.length
        ? experience.map(x => `
            <div class="cv-work-block mt-3">
                <div class="cv-work-title">✓ ${x.startDate || ''} - ${x.currentlyWorking ? 'Present' : (x.endDate || '')}. ${escapeHtml(x.company || '')}</div>
                <div class="cv-work-pos">Position: ${escapeHtml(x.jobTitle || '')}</div>
                <ul class="cv-custom-list"><li>${escapeHtml(x.responsibilities || '')}</li></ul>
            </div>`).join('')
        : `<p class="text-muted">No work experience yet.</p>`;
    setSection('cv-experience', 'WORKING EXPERIENCE', expBlocks);

    // Projects
    const projectBlocks = projects.length
        ? `<ul class="cv-custom-list">${projects.map(p => `
            <li><strong>${escapeHtml(p.title)}</strong>${p.status ? ` (${escapeHtml(p.status)})` : ''} — ${escapeHtml(p.description || 'No description provided.')}
                ${(p.technologies && p.technologies.length) ? `<br><em>Technologies: ${p.technologies.map(escapeHtml).join(', ')}</em>` : ''}
                ${p.projectUrl ? `<br>Link: ${escapeHtml(p.projectUrl)}` : ''}
            </li>`).join('')}</ul>`
        : `<p class="text-muted">No projects added yet.</p>`;
    setSection('cv-projects', 'PROJECTS', projectBlocks);

    // Abilities / hobbies / language proficiency (from profile)
    setSection('cv-abilities', 'ABILITIES', `<ul class="cv-custom-list"><li>${escapeHtml(profile.abilities || 'Not specified yet.')}</li></ul>`);

    // Skills
    const skillItems = skills.length
        ? skills.map(s => `<li>${escapeHtml(s.skillName)} (${escapeHtml(s.category || '')}) - ${escapeHtml(s.proficiency || '')}${s.yearsOfExperience != null ? `, ${s.yearsOfExperience} yr(s)` : ''}</li>`).join('')
        : `<li class="text-muted">No skills added yet.</li>`;
    setSection('cv-skills', 'SKILLS AND COMPETENCE', `<ul class="cv-custom-list">${skillItems}</ul>`);

    setSection('cv-hobbies', 'HOBBIES AND INTEREST', `<ul class="cv-custom-list"><li>${escapeHtml(profile.hobbies || 'Not specified yet.')}</li></ul>`);
    setSection('cv-language', 'LANGUAGE PROFICIENCY', `<ul class="cv-custom-list"><li>${escapeHtml(profile.languageProficiency || 'Not specified yet.')}</li></ul>`);

    // Certificates
    const certItems = certificates.length
        ? certificates.map(c => `<li>${escapeHtml(c.title)} — ${escapeHtml(c.issuingOrganization || '')} (${formatYear(c.issueDate)})</li>`).join('')
        : `<li class="text-muted">No certificates added yet.</li>`;
    setSection('cv-certificates', 'OTHER AWARDS', `<ul class="cv-custom-list">${certItems}</ul>`);

    // Declaration — real name + today's date instead of hardcoded fake person
    const nameEl = document.getElementById('cv-declaration-name');
    if (nameEl) nameEl.textContent = profile.fullName || (localStorage.getItem('username') || 'Full Name');

    // Referees
    setSection('cv-referees', 'REFEREES', profile.referees
        ? `<p style="margin-bottom: 0.5rem; text-align: justify; white-space: pre-line;">${escapeHtml(profile.referees)}</p>`
        : `<p style="margin-bottom: 0.5rem; text-align: justify;">References are available upon request.</p>`);
}

// ===================== Section visibility (CV Configuration) =====================

function loadSectionPrefs() {
    try {
        return JSON.parse(localStorage.getItem(SECTION_PREFS_KEY)) || {};
    } catch {
        return {};
    }
}

function saveSectionPrefs(prefs) {
    localStorage.setItem(SECTION_PREFS_KEY, JSON.stringify(prefs));
}

function applySectionVisibility() {
    const prefs = loadSectionPrefs();
    document.querySelectorAll('.section-control').forEach(checkbox => {
        const target = checkbox.getAttribute('data-target');
        // Respect a saved preference if one exists; otherwise fall back to
        // the checkbox's default `checked` state from the HTML.
        const visible = Object.prototype.hasOwnProperty.call(prefs, target) ? prefs[target] : checkbox.checked;
        checkbox.checked = visible;
        const section = document.getElementById(target);
        if (section) section.style.display = visible ? '' : 'none';
    });
}

document.querySelectorAll('.section-control').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        const prefs = loadSectionPrefs();
        prefs[checkbox.getAttribute('data-target')] = checkbox.checked;
        saveSectionPrefs(prefs);
        const section = document.getElementById(checkbox.getAttribute('data-target'));
        if (section) section.style.display = checkbox.checked ? '' : 'none';
    });
});

applySectionVisibility();

// ===================== PDF export (only the CV paper, not the app shell) =====================

document.getElementById('downloadPdfBtn')?.addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    const paper = document.getElementById('resumePreviewPane');
    if (!paper || typeof html2canvas === 'undefined' || !window.jspdf) {
        window.showToast?.('PDF export tools failed to load. Try refreshing the page.', 'danger');
        return;
    }

    const originalHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Exporting...';

    try {
        const canvas = await html2canvas(paper, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff'
        });

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = 210;
        const pageHeight = 297;

        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        const imgData = canvas.toDataURL('image/png');

        if (imgHeight <= pageHeight) {
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        } else {
            // Content taller than one A4 page — slice it across multiple pages.
            let heightLeft = imgHeight;
            let position = 0;
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
        }

        pdf.save('my-cv.pdf');
        window.showToast?.('CV exported and downloaded successfully!', 'success');
    } catch (error) {
        console.error(error);
        window.showToast?.('Failed to export the CV to PDF. Please try again.', 'danger');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalHtml;
    }
});

buildResume();
