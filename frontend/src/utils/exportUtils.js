// CSV & XLSX Export Utilities — Smart Campus Hub
// Theme: SLIIT receipt-inspired (dark teal → cyan gradient)

export function exportToCSV(data, filename = 'export.csv') {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(h => {
    const val = row[h] ?? '';
    return `"${String(val).replace(/"/g, '""')}"`;
  }).join(','));
  const csv = ['\uFEFF' + headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ── SheetJS loader ───────────────────────────────────────────────
function loadSheetJS() {
  return new Promise((resolve, reject) => {
    if (window.XLSX) { resolve(window.XLSX); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    s.onload = () => resolve(window.XLSX);
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

// ── Theme Colors (SLIIT receipt palette) ────────────────────────
const C = {
  DARK_TEAL:   'FF0A4A57',   // header dark
  MID_TEAL:    'FF0F766E',   // row header
  CYAN:        'FF0AB5D6',   // accent
  CYAN_LIGHT:  'FFE0F7FA',   // even rows
  TEAL_LIGHT:  'FFCCFBF1',   // alt rows
  WHITE:       'FFFFFFFF',
  DARK_TEXT:   'FF1A1A1A',
  MUTED:       'FF6B7280',
  BORDER:      'FFB2EBF2',
  GREEN_BG:    'FFD1FAE5',   // approved
  GREEN_TEXT:  'FF065F46',
  YELLOW_BG:   'FFFEF3C7',   // pending
  YELLOW_TEXT: 'FF92400E',
  RED_BG:      'FFFEE2E2',
  RED_TEXT:    'FF991B1B',
};

function cell(value, type = 's', style = {}) {
  return { v: value, t: type, s: style };
}

// Title row style — dark teal gradient feel
function titleStyle() {
  return {
    font: { name: 'Arial', sz: 14, bold: true, color: { rgb: C.WHITE } },
    fill: { fgColor: { rgb: C.DARK_TEAL }, type: 'pattern', patternType: 'solid' },
    alignment: { horizontal: 'center', vertical: 'center' },
  };
}

// Subtitle style
function subtitleStyle() {
  return {
    font: { name: 'Arial', sz: 9, color: { rgb: C.CYAN } },
    fill: { fgColor: { rgb: C.MID_TEAL }, type: 'pattern', patternType: 'solid' },
    alignment: { horizontal: 'center', vertical: 'center' },
  };
}

// Column header style — mid teal
function headerStyle() {
  return {
    font: { name: 'Arial', sz: 10, bold: true, color: { rgb: C.WHITE } },
    fill: { fgColor: { rgb: C.MID_TEAL }, type: 'pattern', patternType: 'solid' },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: { bottom: { style: 'thin', color: { rgb: C.CYAN } } },
  };
}

// Data cell styles
function dataStyle(even = false, bold = false, bgOverride = null) {
  return {
    font: { name: 'Arial', sz: 10, bold, color: { rgb: C.DARK_TEXT } },
    fill: {
      fgColor: { rgb: bgOverride || (even ? C.CYAN_LIGHT : C.WHITE) },
      type: 'pattern', patternType: 'solid'
    },
    alignment: { vertical: 'center', wrapText: true },
    border: { bottom: { style: 'thin', color: { rgb: C.BORDER } } },
  };
}

// Status cell color
function statusStyle(status, even = false) {
  const map = {
    APPROVED: { bg: C.GREEN_BG, fg: C.GREEN_TEXT },
    ACTIVE:   { bg: C.TEAL_LIGHT, fg: C.MID_TEAL },
    RESOLVED: { bg: C.GREEN_BG, fg: C.GREEN_TEXT },
    PENDING:  { bg: C.YELLOW_BG, fg: C.YELLOW_TEXT },
    IN_PROGRESS: { bg: 'FFE0F7FA', fg: 'FF0E7490' },
    OPEN:     { bg: 'FFDBEAFE', fg: 'FF1E40AF' },
    REJECTED: { bg: C.RED_BG, fg: C.RED_TEXT },
    CANCELLED:{ bg: C.RED_BG, fg: C.RED_TEXT },
    CLOSED:   { bg: 'FFF3F4F6', fg: 'FF374151' },
    TECHNICIAN: { bg: 'FFE0F7FA', fg: 'FF0E7490' },
    LECTURER:   { bg: 'FFEDE9FE', fg: 'FF5B21B6' },
    LAB_ASSISTANT: { bg: C.TEAL_LIGHT, fg: C.MID_TEAL },
    USER:     { bg: 'FFF3F4F6', fg: 'FF374151' },
    STUDENT:  { bg: 'FFEDE9FE', fg: 'FF5B21B6' },
  };
  const colors = map[status] || { bg: 'FFF3F4F6', fg: 'FF374151' };
  return {
    font: { name: 'Arial', sz: 10, bold: true, color: { rgb: colors.fg } },
    fill: { fgColor: { rgb: colors.bg }, type: 'pattern', patternType: 'solid' },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: { bottom: { style: 'thin', color: { rgb: C.BORDER } } },
  };
}

// Footer style
function footerStyle() {
  return {
    font: { name: 'Arial', sz: 9, italic: true, color: { rgb: 'FFAAAAAA' } },
    fill: { fgColor: { rgb: C.DARK_TEAL }, type: 'pattern', patternType: 'solid' },
    alignment: { horizontal: 'center' },
  };
}

// ── Build worksheet helper ───────────────────────────────────────
function buildSheet(XLSX, title, subtitle, headers, rows, colWidths, statusColIdx = -1) {
  const ws = {};
  const totalCols = headers.length;
  const totalRows = rows.length + 4; // title + subtitle + header + data + footer
  const range = { s: { r: 0, c: 0 }, e: { r: totalRows, c: totalCols - 1 } };

  // Row 0: Title
  for (let c = 0; c < totalCols; c++) {
    ws[XLSX.utils.encode_cell({ r: 0, c })] = { v: c === 0 ? title : '', t: 's', s: titleStyle() };
  }

  // Row 1: Subtitle
  for (let c = 0; c < totalCols; c++) {
    ws[XLSX.utils.encode_cell({ r: 1, c })] = { v: c === 0 ? subtitle : '', t: 's', s: subtitleStyle() };
  }

  // Row 2: Column headers
  headers.forEach((h, c) => {
    ws[XLSX.utils.encode_cell({ r: 2, c })] = { v: h, t: 's', s: headerStyle() };
  });

  // Data rows
  rows.forEach((row, ri) => {
    const even = ri % 2 === 0;
    row.forEach((val, ci) => {
      const isStatus = ci === statusColIdx;
      const statusStr = isStatus ? String(val).toUpperCase() : '';
      ws[XLSX.utils.encode_cell({ r: ri + 3, c: ci })] = {
        v: val, t: typeof val === 'number' ? 'n' : 's',
        s: isStatus ? statusStyle(statusStr, even) : dataStyle(even),
      };
    });
  });

  // Footer row
  const footerRow = rows.length + 3;
  const footerText = `Smart Campus Hub — SLIIT Faculty of Computing | Generated: ${new Date().toLocaleString('en-GB')}`;
  for (let c = 0; c < totalCols; c++) {
    ws[XLSX.utils.encode_cell({ r: footerRow, c })] = { v: c === 0 ? footerText : '', t: 's', s: footerStyle() };
  }

  ws['!ref'] = XLSX.utils.encode_range(range);
  ws['!cols'] = colWidths.map(w => ({ wch: w }));
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: totalCols - 1 } },
    { s: { r: footerRow, c: 0 }, e: { r: footerRow, c: totalCols - 1 } },
  ];
  ws['!rows'] = [{ hpt: 24 }, { hpt: 14 }, { hpt: 16 }];

  return ws;
}

// ── Bookings XLSX ────────────────────────────────────────────────
export async function exportBookingsXLSX(bookings, title = 'Bookings') {
  const XLSX = await loadSheetJS();

  const headers = ['#', 'Resource', 'Location', 'Start Time', 'End Time', 'Purpose', 'Attendees', 'User', 'Email', 'Status'];
  const rows = bookings.map((b, i) => [
    i + 1,
    b.resource?.name || '',
    b.resource?.location || '',
    b.startTime ? new Date(b.startTime).toLocaleString('en-GB') : '',
    b.endTime   ? new Date(b.endTime).toLocaleString('en-GB')   : '',
    b.purpose   || '',
    b.attendees || '',
    b.user?.name  || '',
    b.user?.email || '',
    b.status || '',
  ]);

  const subtitle = `Generated: ${new Date().toLocaleString('en-GB')} | ${bookings.length} records`;
  const ws = buildSheet(XLSX, `Smart Campus Hub — ${title}`, subtitle, headers, rows,
    [4, 22, 18, 18, 18, 28, 10, 18, 26, 13], 9);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, title.substring(0, 31));
  XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}.xlsx`);
}

// ── Activity Log XLSX ────────────────────────────────────────────
export async function exportActivityXLSX(activities) {
  const XLSX = await loadSheetJS();

  const headers = ['#', 'Time', 'Type', 'Description', 'User', 'Status'];
  const rows = activities.map((a, i) => [i + 1, a.time || '', a.type || '', a.desc || '', a.user || '', a.status || '']);

  const subtitle = `Generated: ${new Date().toLocaleString('en-GB')} | ${activities.length} activities`;
  const ws = buildSheet(XLSX, 'Smart Campus Hub — Activity Log', subtitle, headers, rows,
    [4, 20, 13, 42, 24, 14], 5);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Activity Log');
  XLSX.writeFile(wb, 'Activity_Log.xlsx');
}