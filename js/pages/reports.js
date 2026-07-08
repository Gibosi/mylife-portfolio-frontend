// Logic Controller: reports.js
// Generates income/expense reports from /api/reports/{type}?date=..., with
// a period-appropriate date picker (day / ISO-week / month / year), a real
// Chart.js summary chart, success/failure toasts, and a styled PDF export.

import { api } from '../core/api.js';
import { formatMoney } from '../core/utils.js';

const periodSelect = document.getElementById('reportPeriod');
const generateBtn = document.getElementById('generateReportBtn');
const downloadBtn = document.getElementById('downloadReportBtn');
const dateLabel = document.getElementById('reportDateLabel');

const inputs = {
    daily: document.getElementById('reportDateDaily'),
    weekly: document.getElementById('reportDateWeekly'),
    monthly: document.getElementById('reportDateMonthly'),
    yearly: document.getElementById('reportDateYearly')
};

const labels = { daily: 'Select Date', weekly: 'Select Week', monthly: 'Select Month', yearly: 'Select Year' };

let lastReport = null;
let chartInstance = null;

// Sensible defaults so the first Generate click always has a value.
const today = new Date();
inputs.daily.value = today.toISOString().slice(0, 10);
inputs.monthly.value = today.toISOString().slice(0, 7);
inputs.yearly.value = today.getFullYear();
// ISO week input value format: YYYY-Www
const isoWeek = (() => {
    const d = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
})();
inputs.weekly.value = isoWeek;

function showPeriodInput(type) {
    Object.entries(inputs).forEach(([key, el]) => {
        if (el) el.style.display = key === type ? 'block' : 'none';
    });
    dateLabel.textContent = labels[type] || 'Select Period';
}

// Converts whatever the visible picker holds into a plain YYYY-MM-DD
// reference date the backend understands, regardless of period type.
function resolveReferenceDate(type) {
    if (type === 'daily') {
        return inputs.daily.value || today.toISOString().slice(0, 10);
    }
    if (type === 'monthly') {
        const v = inputs.monthly.value || today.toISOString().slice(0, 7);
        return `${v}-01`;
    }
    if (type === 'yearly') {
        const y = inputs.yearly.value || today.getFullYear();
        return `${y}-01-01`;
    }
    if (type === 'weekly') {
        const v = inputs.weekly.value || isoWeek;
        const [yearStr, weekStr] = v.split('-W');
        const year = parseInt(yearStr, 10);
        const week = parseInt(weekStr, 10);
        // ISO week -> Monday of that week
        const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
        const dow = simple.getUTCDay();
        const monday = new Date(simple);
        if (dow <= 4) monday.setUTCDate(simple.getUTCDate() - dow + 1);
        else monday.setUTCDate(simple.getUTCDate() + 8 - dow);
        return monday.toISOString().slice(0, 10);
    }
    return today.toISOString().slice(0, 10);
}

periodSelect?.addEventListener('change', () => showPeriodInput(periodSelect.value));
showPeriodInput(periodSelect ? periodSelect.value : 'monthly');

function renderChart(report) {
    const canvas = document.getElementById('reportSummaryChart');
    if (!canvas || typeof Chart === 'undefined') return;

    if (chartInstance) chartInstance.destroy();

    const income = Number(report.totalIncome) || 0;
    const expenses = Number(report.totalExpenses) || 0;

    chartInstance = new Chart(canvas.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Income', 'Expenses'],
            datasets: [{
                data: [income, expenses],
                backgroundColor: ['#16a34a', '#dc2626'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' },
                tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${formatMoney(ctx.raw)} TZS` } }
            }
        }
    });
}

async function generateReport() {
    const type = periodSelect ? periodSelect.value : 'monthly';
    const date = resolveReferenceDate(type);

    generateBtn.disabled = true;
    const originalHtml = generateBtn.innerHTML;
    generateBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Generating...';

    try {
        const report = await api.get(`/reports/${type}?date=${encodeURIComponent(date)}`);
        lastReport = report;

        const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
        set('rep_totalIncome', `${formatMoney(report.totalIncome)} TZS`);
        set('rep_totalExpenses', `${formatMoney(report.totalExpenses)} TZS`);
        set('rep_balance', `${formatMoney(report.balance)} TZS`);
        set('rep_periodLabel', `${report.reportType} report — ${report.period}`);
        set('rep_generatedAt', `Generated at ${new Date(report.generatedAt).toLocaleString()}`);

        renderChart(report);
        window.showToast?.('Report generated successfully!', 'success');
    } catch (error) {
        window.showToast?.(error.message || 'Failed to generate report.', 'danger');
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = originalHtml;
    }
}

generateBtn?.addEventListener('click', generateReport);

downloadBtn?.addEventListener('click', () => {
    if (!lastReport) {
        window.showToast?.('Generate a report first.', 'warning');
        return;
    }

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const primary = [37, 99, 235]; // matches the app's --primary blue

        // Header band
        doc.setFillColor(...primary);
        doc.rect(0, 0, 210, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.text('MyLife Portfolio', 14, 15);
        doc.setFontSize(11);
        doc.text(`${lastReport.reportType} Financial Report`, 14, 23);

        // Body
        doc.setTextColor(30, 30, 30);
        doc.setFontSize(11);
        let y = 42;
        doc.text(`Period: ${lastReport.period}`, 14, y); y += 8;
        doc.text(`Generated: ${new Date(lastReport.generatedAt).toLocaleString()}`, 14, y); y += 14;

        doc.setDrawColor(...primary);
        doc.setLineWidth(0.5);
        doc.line(14, y, 196, y); y += 10;

        const rows = [
            ['Total Income', `${formatMoney(lastReport.totalIncome)} TZS`, [22, 163, 74]],
            ['Total Expenses', `${formatMoney(lastReport.totalExpenses)} TZS`, [220, 38, 38]],
            ['Net Balance', `${formatMoney(lastReport.balance)} TZS`, primary]
        ];

        rows.forEach(([label, value, color]) => {
            doc.setFontSize(12);
            doc.setTextColor(60, 60, 60);
            doc.text(label, 14, y);
            doc.setTextColor(...color);
            doc.setFont(undefined, 'bold');
            doc.text(value, 140, y);
            doc.setFont(undefined, 'normal');
            y += 12;
        });

        doc.setDrawColor(220, 220, 220);
        doc.line(14, y, 196, y); y += 10;
        doc.setFontSize(9);
        doc.setTextColor(140, 140, 140);
        doc.text('Generated by MyLife Portfolio', 14, y);

        doc.save(`mylife-report-${lastReport.reportType.toLowerCase()}.pdf`);
        window.showToast?.('Report downloaded successfully!', 'success');
    } catch (error) {
        console.error(error);
        window.showToast?.('Failed to generate the PDF.', 'danger');
    }
});

generateReport();
