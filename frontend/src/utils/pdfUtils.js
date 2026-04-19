// pdfUtils.js — Smart Campus 
// Uses jsPDF + jspdf-autotable (no html2canvas, no DOM capture)
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function createDoc() {
  return new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
}

function addHeader(doc, title) {
  const now = new Date();
  const pageW = doc.internal.pageSize.getWidth();

  // Header background — full teal
  doc.setFillColor(10, 181, 214);
  doc.rect(0, 0, pageW, 22, 'F');

  // Title
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Smart Campus ', 26, 10);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 240, 255);
  doc.text('SLIIT — Faculty of Computing', 26, 16);

  // Date/time on right
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(now.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }), pageW - 8, 10, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(now.toLocaleTimeString(), pageW - 8, 16, { align: 'right' });

  // Section title
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(10, 181, 214);
  doc.text(title.toUpperCase(), 8, 30);

  // Underline
  doc.setDrawColor(10, 181, 214);
  doc.setLineWidth(0.5);
  doc.line(8, 32, pageW - 8, 32);
}

function addSummaryCards(doc, cards, startY) {
  const pageW = doc.internal.pageSize.getWidth();
  const cardW = (pageW - 16 - (cards.length - 1) * 4) / cards.length;
  cards.forEach((card, i) => {
    const x = 8 + i * (cardW + 4);
    // Card bg
    doc.setFillColor(...card.bg);
    doc.roundedRect(x, startY, cardW, 18, 2, 2, 'F');
    // Left border
    doc.setFillColor(...card.border);
    doc.rect(x, startY, 1.5, 18, 'F');
    // Label
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text(card.label, x + 4, startY + 6);
    // Value
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...card.color);
    doc.text(String(card.value), x + 4, startY + 15);
  });
  return startY + 22;
}

function addFooter(doc) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFillColor(10, 181, 214);
  doc.rect(0, pageH - 10, pageW, 10, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Smart Campus ', 8, pageH - 4);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 255, 255);
  doc.text('— Confidential Document', 8 + doc.getTextWidth('Smart Campus ') + 1, pageH - 4);
  doc.setTextColor(255, 255, 255);
  doc.text(`SLIIT Faculty of Computing © ${new Date().getFullYear()} | Auto-generated`, pageW - 8, pageH - 4, { align: 'right' });
}

// ── Tickets PDF ──────────────────────────────────────────────────
export function exportTicketsPDF(tickets, title = 'All Tickets') {
  const doc = createDoc();
  addHeader(doc, title);

  const total      = tickets.length;
  const open       = tickets.filter(t => t.status === 'OPEN').length;
  const inProgress = tickets.filter(t => t.status === 'IN_PROGRESS').length;
  const resolved   = tickets.filter(t => t.status === 'RESOLVED').length;

  const tableY = addSummaryCards(doc, [
    { label: 'Total',       value: total,      bg: [240,253,254], border: [10,181,214],  color: [10,74,87]   },
    { label: 'Open',        value: open,       bg: [219,234,254], border: [59,130,246],  color: [30,64,175]  },
    { label: 'In Progress', value: inProgress, bg: [207,250,254], border: [14,116,144],  color: [14,116,144] },
    { label: 'Resolved',    value: resolved,   bg: [209,250,229], border: [5,150,105],   color: [6,95,70]    },
  ], 35);

  const statusColor = (s) => {
    const m = {
      OPEN: [30,64,175], IN_PROGRESS: [14,116,144], RESOLVED: [6,95,70],
      CLOSED: [55,65,81], REJECTED: [153,27,27], CANCELLED: [153,27,27],
      HIGH: [153,27,27], CRITICAL: [153,27,27], MEDIUM: [146,64,14], LOW: [30,64,175],
    };
    return m[s] || [55,65,81];
  };

  autoTable(doc, {
    startY: tableY,
    margin: { left: 8, right: 8, bottom: 14 },
    head: [['#', 'ID', 'Category', 'Priority', 'Status', 'Description', 'Reporter', 'Assigned To', 'Resource', 'Created']],
    body: tickets.map((t, i) => [
      i + 1,
      `#${t.id}`,
      (t.category || '').replace(/_/g, ' '),
      t.priority || '',
      (t.status || '').replace(/_/g, ' '),
      (t.description || '').substring(0, 80) + ((t.description?.length || 0) > 80 ? '...' : ''),
      t.reporter?.name || '',
      t.assignedTo?.name || '—',
      t.resource?.name || '—',
      t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-GB') : '',
    ]),
    headStyles: {
      fillColor: [10, 181, 214],
      textColor: [255, 255, 255],
      fontSize: 7,
      fontStyle: 'bold',
      cellPadding: 3,
    },
    bodyStyles: { fontSize: 7, cellPadding: 2.5 },
    alternateRowStyles: { fillColor: [240, 253, 254] },
    columnStyles: {
      0: { cellWidth: 8,  halign: 'center', textColor: [156,163,175] },
      1: { cellWidth: 12, textColor: [156,163,175], font: 'courier' },
      2: { cellWidth: 22 },
      3: { cellWidth: 18, fontStyle: 'bold',
           didParseCell: (d) => { if (d.section==='body') d.cell.styles.textColor = statusColor(d.cell.raw); }},
      4: { cellWidth: 20, fontStyle: 'bold',
           didParseCell: (d) => { if (d.section==='body') d.cell.styles.textColor = statusColor(d.cell.raw); }},
      5: { cellWidth: 50 },
      6: { cellWidth: 30 },
      7: { cellWidth: 28 },
      8: { cellWidth: 22 },
      9: { cellWidth: 20 },
    },
    didDrawPage: () => addFooter(doc),
  });

  addFooter(doc);
  doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
}

// ── Bookings PDF ─────────────────────────────────────────────────
export function exportBookingsPDF(bookings, title = 'All Bookings') {
  const doc = createDoc();
  addHeader(doc, title);

  const total    = bookings.length;
  const approved = bookings.filter(b => b.status === 'APPROVED').length;
  const pending  = bookings.filter(b => b.status === 'PENDING').length;

  const tableY = addSummaryCards(doc, [
    { label: 'Total',    value: total,    bg: [240,253,254], border: [10,181,214], color: [10,74,87]  },
    { label: 'Approved', value: approved, bg: [209,250,229], border: [5,150,105],  color: [6,95,70]   },
    { label: 'Pending',  value: pending,  bg: [254,243,199], border: [245,158,11], color: [146,64,14] },
  ], 35);

  autoTable(doc, {
    startY: tableY,
    margin: { left: 8, right: 8, bottom: 14 },
    head: [['#', 'Resource', 'Location', 'Start Time', 'End Time', 'Purpose', 'User', 'Email', 'Status']],
    body: bookings.map((b, i) => [
      i + 1,
      b.resource?.name || '',
      b.resource?.location || '',
      b.startTime ? new Date(b.startTime).toLocaleString('en-GB') : '',
      b.endTime   ? new Date(b.endTime).toLocaleString('en-GB')   : '',
      b.purpose || '',
      b.user?.name || '',
      b.user?.email || '',
      (b.status || '').replace(/_/g, ' '),
    ]),
    headStyles: { fillColor: [10,181,214], textColor: [255,255,255], fontSize: 7, fontStyle: 'bold', cellPadding: 3 },
    bodyStyles: { fontSize: 7, cellPadding: 2.5 },
    alternateRowStyles: { fillColor: [240,253,254] },
    columnStyles: {
      0: { cellWidth: 8,  halign: 'center', textColor: [156,163,175] },
      8: { fontStyle: 'bold',
           didParseCell: (d) => {
             if (d.section === 'body') {
               const s = d.cell.raw;
               d.cell.styles.textColor = s === 'APPROVED' ? [6,95,70] : s === 'PENDING' ? [146,64,14] : [153,27,27];
             }
           }},
    },
    didDrawPage: () => addFooter(doc),
  });

  addFooter(doc);
  doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
}

// ── Activity Log PDF ─────────────────────────────────────────────
export function exportActivityPDF(activities) {
  const doc = createDoc();
  addHeader(doc, 'Activity Log');

  const bookingCount = activities.filter(a => a.type === 'BOOKING').length;
  const ticketCount  = activities.filter(a => a.type === 'TICKET').length;
  const userCount    = activities.filter(a => a.type === 'USER').length;

  const tableY = addSummaryCards(doc, [
    { label: 'Total',    value: activities.length, bg: [240,253,254], border: [10,181,214], color: [10,74,87]  },
    { label: 'Bookings', value: bookingCount,       bg: [219,234,254], border: [59,130,246], color: [30,64,175] },
    { label: 'Tickets',  value: ticketCount,        bg: [254,243,199], border: [245,158,11], color: [146,64,14] },
    { label: 'Users',    value: userCount,          bg: [237,233,254], border: [139,92,246],  color: [91,33,182] },
  ], 35);

  autoTable(doc, {
    startY: tableY,
    margin: { left: 8, right: 8, bottom: 14 },
    head: [['Time', 'Type', 'Description', 'User', 'Status']],
    body: activities.map(a => [a.time || '', a.type || '', a.desc || '', a.user || '', a.status || '']),
    headStyles: { fillColor: [10,181,214], textColor: [255,255,255], fontSize: 7, fontStyle: 'bold', cellPadding: 3 },
    bodyStyles: { fontSize: 7, cellPadding: 2.5 },
    alternateRowStyles: { fillColor: [240,253,254] },
    didDrawPage: () => addFooter(doc),
  });

  addFooter(doc);
  doc.save('Activity_Log.pdf');
}