// PDF Export Utilities — Smart Campus Hub
// Theme inspired by SLIIT Learning Platform receipt style

function downloadPDF(htmlContent, filename) {
  const win = window.open('', '_blank');
  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${filename}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; background: #f3f4f6; color: #1a1a1a; font-size: 12px; }

        /* ── Header ── */
        .header {
          background: linear-gradient(135deg, #0a4a57 0%, #0ab5d6 100%);
          padding: 28px 36px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .header-left { display: flex; align-items: center; gap: 14px; }
        .logo-box {
          width: 48px; height: 48px;
          background: rgba(255,255,255,0.15);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid rgba(255,255,255,0.3);
        }
        .logo-box span { color: #fff; font-size: 18px; font-weight: 700; letter-spacing: 1px; }
        .header-title { color: #fff; }
        .header-title h1 { font-size: 20px; font-weight: 700; margin-bottom: 2px; }
        .header-title p { font-size: 11px; opacity: 0.8; }
        .header-right { text-align: right; color: rgba(255,255,255,0.85); font-size: 11px; }
        .header-right .date { font-size: 12px; font-weight: 600; margin-bottom: 2px; }

        /* ── Receipt-style info bar ── */
        .info-bar {
          background: #0f766e;
          padding: 10px 36px;
          display: flex; gap: 32px;
        }
        .info-bar span { color: rgba(255,255,255,0.7); font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
        .info-bar strong { color: #fff; font-size: 11px; display: block; margin-top: 1px; }

        /* ── Content ── */
        .content { padding: 28px 36px; background: #fff; }

        .section-title {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #0ab5d6;
          font-weight: 700;
          margin-bottom: 10px;
          padding-bottom: 6px;
          border-bottom: 2px solid #e0f7fa;
        }

        /* ── Table ── */
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        thead tr { background: linear-gradient(135deg, #0a4a57, #0f766e); }
        th {
          color: #fff; padding: 10px 14px;
          text-align: left; font-size: 10px;
          text-transform: uppercase; letter-spacing: 0.8px; font-weight: 600;
        }
        td { padding: 9px 14px; border-bottom: 1px solid #e0f7fa; font-size: 11px; vertical-align: top; }
        tr:nth-child(even) td { background: #f0fdfe; }
        tr:nth-child(odd) td { background: #fff; }
        tr:last-child td { border-bottom: none; }
        td small { color: #6b7280; font-size: 10px; display: block; }

        /* ── Status Badges ── */
        .badge { display: inline-block; padding: 2px 9px; border-radius: 999px; font-size: 10px; font-weight: 700; letter-spacing: 0.3px; }
        .badge-green   { background: #d1fae5; color: #065f46; }
        .badge-teal    { background: #ccfbf1; color: #0f766e; }
        .badge-cyan    { background: #cffafe; color: #0e7490; }
        .badge-red     { background: #fee2e2; color: #991b1b; }
        .badge-yellow  { background: #fef3c7; color: #92400e; }
        .badge-blue    { background: #dbeafe; color: #1e40af; }
        .badge-purple  { background: #ede9fe; color: #5b21b6; }
        .badge-gray    { background: #f3f4f6; color: #374151; }

        /* ── Summary box (receipt style) ── */
        .summary-box {
          background: linear-gradient(135deg, #0a4a57, #0f766e);
          border-radius: 10px;
          padding: 14px 20px;
          color: #fff;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .summary-box .label { font-size: 11px; opacity: 0.8; }
        .summary-box .value { font-size: 20px; font-weight: 700; }

        /* ── Footer ── */
        .footer {
          background: #0a4a57;
          padding: 14px 36px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .footer-left { color: rgba(255,255,255,0.7); font-size: 10px; }
        .footer-left strong { color: #0ab5d6; }
        .footer-right { color: rgba(255,255,255,0.5); font-size: 10px; }

        @media print {
          body { background: #fff; }
          .header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .info-bar { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          thead tr { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          tr:nth-child(even) td { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .badge { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .summary-box { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .footer { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      <!-- Header -->
      <div class="header">
        <div class="header-left">
          <div class="logo-box"><span>SC</span></div>
          <div class="header-title">
            <h1>Smart Campus Hub</h1>
            <p>SLIIT — Faculty of Computing</p>
          </div>
        </div>
        <div class="header-right">
          <div class="date">${new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' })}</div>
          <div>${new Date().toLocaleTimeString()}</div>
        </div>
      </div>

      <!-- Content -->
      <div class="content">
        ${htmlContent}
      </div>

      <!-- Footer -->
      <div class="footer">
        <div class="footer-left"><strong>Smart Campus Hub</strong> — Confidential Document</div>
        <div class="footer-right">SLIIT Faculty of Computing &copy; ${new Date().getFullYear()} | Auto-generated</div>
      </div>

      <script>setTimeout(() => { window.print(); }, 400);<\/script>
    </body>
    </html>
  `);
  win.document.close();
}

function statusBadge(status) {
  const map = {
    APPROVED: 'badge-green', ACTIVE: 'badge-teal', RESOLVED: 'badge-green',
    CLOSED: 'badge-gray', PENDING: 'badge-yellow', IN_PROGRESS: 'badge-cyan',
    OPEN: 'badge-blue', REJECTED: 'badge-red', CANCELLED: 'badge-red',
    OUT_OF_SERVICE: 'badge-red', ADMIN: 'badge-red',
    TECHNICIAN: 'badge-cyan', LECTURER: 'badge-purple',
    LAB_ASSISTANT: 'badge-teal', USER: 'badge-gray', STUDENT: 'badge-purple',
  };
  return `<span class="badge ${map[status] || 'badge-gray'}">${(status || '').replace(/_/g,' ')}</span>`;
}

// ── Bookings PDF ─────────────────────────────────────────────────
export function exportBookingsPDF(bookings, title = 'Bookings') {
  const total = bookings.length;
  const approved = bookings.filter(b => b.status === 'APPROVED').length;
  const pending  = bookings.filter(b => b.status === 'PENDING').length;

  const rows = bookings.map((b, i) => `
    <tr>
      <td style="color:#6b7280;font-size:10px">${i + 1}</td>
      <td><strong>${b.resource?.name || ''}</strong><small>📍 ${b.resource?.location || ''}</small></td>
      <td>${b.startTime ? new Date(b.startTime).toLocaleString('en-GB') : ''}
          <small>→ ${b.endTime ? new Date(b.endTime).toLocaleString('en-GB') : ''}</small></td>
      <td style="max-width:180px">${b.purpose || ''}</td>
      <td>${b.user?.name || ''}<small>${b.user?.email || ''}</small></td>
      <td>${statusBadge(b.status)}</td>
    </tr>
  `).join('');

  const html = `
    <!-- Summary row -->
    <div style="display:flex;gap:12px;margin-bottom:20px">
      <div style="flex:1;background:#f0fdfe;border-radius:8px;padding:12px 16px;border-left:4px solid #0ab5d6">
        <div style="font-size:11px;color:#6b7280">Total</div>
        <div style="font-size:22px;font-weight:700;color:#0a4a57">${total}</div>
      </div>
      <div style="flex:1;background:#d1fae5;border-radius:8px;padding:12px 16px;border-left:4px solid #059669">
        <div style="font-size:11px;color:#6b7280">Approved</div>
        <div style="font-size:22px;font-weight:700;color:#065f46">${approved}</div>
      </div>
      <div style="flex:1;background:#fef3c7;border-radius:8px;padding:12px 16px;border-left:4px solid #f59e0b">
        <div style="font-size:11px;color:#6b7280">Pending</div>
        <div style="font-size:22px;font-weight:700;color:#92400e">${pending}</div>
      </div>
    </div>

    <div class="section-title"> ${title}</div>
    <table>
      <thead><tr>
        <th>#</th><th>Resource</th><th>Date &amp; Time</th>
        <th>Purpose</th><th>User</th><th>Status</th>
      </tr></thead>
      <tbody>${rows || '<tr><td colspan="6" style="text-align:center;color:#9ca3af;padding:20px">No records found</td></tr>'}</tbody>
    </table>
  `;
  downloadPDF(html, `${title.replace(/\s+/g,'_')}.pdf`);
}

// ── Activity Log PDF ─────────────────────────────────────────────
export function exportActivityPDF(activities) {
  const typeColor = { BOOKING: 'badge-cyan', TICKET: 'badge-yellow', USER: 'badge-purple' };

  const rows = activities.map((a, i) => `
    <tr>
      <td style="color:#6b7280;font-size:10px;white-space:nowrap">${a.time || ''}</td>
      <td><span class="badge ${typeColor[a.type] || 'badge-gray'}">${a.type || ''}</span></td>
      <td>${a.desc || ''}</td>
      <td>${a.user || ''}</td>
      <td>${statusBadge(a.status)}</td>
    </tr>
  `).join('');

  const bookingCount = activities.filter(a => a.type === 'BOOKING').length;
  const ticketCount  = activities.filter(a => a.type === 'TICKET').length;
  const userCount    = activities.filter(a => a.type === 'USER').length;

  const html = `
    <!-- Summary -->
    <div style="display:flex;gap:12px;margin-bottom:20px">
      <div style="flex:1;background:#f0fdfe;border-radius:8px;padding:12px 16px;border-left:4px solid #0ab5d6">
        <div style="font-size:11px;color:#6b7280">Total</div>
        <div style="font-size:22px;font-weight:700;color:#0a4a57">${activities.length}</div>
      </div>
      <div style="flex:1;background:#dbeafe;border-radius:8px;padding:12px 16px;border-left:4px solid #3b82f6">
        <div style="font-size:11px;color:#6b7280">Bookings</div>
        <div style="font-size:22px;font-weight:700;color:#1e40af">${bookingCount}</div>
      </div>
      <div style="flex:1;background:#fef3c7;border-radius:8px;padding:12px 16px;border-left:4px solid #f59e0b">
        <div style="font-size:11px;color:#6b7280">Tickets</div>
        <div style="font-size:22px;font-weight:700;color:#92400e">${ticketCount}</div>
      </div>
      <div style="flex:1;background:#ede9fe;border-radius:8px;padding:12px 16px;border-left:4px solid #8b5cf6">
        <div style="font-size:11px;color:#6b7280">Users</div>
        <div style="font-size:22px;font-weight:700;color:#5b21b6">${userCount}</div>
      </div>
    </div>

    <div class="section-title">📋 Activity Log</div>
    <table>
      <thead><tr>
        <th>Time</th><th>Type</th><th>Description</th><th>User</th><th>Status</th>
      </tr></thead>
      <tbody>${rows || '<tr><td colspan="5" style="text-align:center;color:#9ca3af;padding:20px">No activities</td></tr>'}</tbody>
    </table>
  `;
  downloadPDF(html, 'Activity_Log.pdf');
}
