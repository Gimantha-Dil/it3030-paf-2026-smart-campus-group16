// exportUtils.js — Smart Campus 
// CSV + XLSX Export Utilities

//  CSV Export 
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

//  SheetJS loader 
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

// Theme Colors 
const C = {
  TEAL:        'FF0AB5D6',
  TEAL_DARK:   'FF0A4A57',
  TEAL_MID:    'FF0F766E',
  CYAN_LIGHT:  'FFE0F7FA',
  WHITE:       'FFFFFFFF',
  DARK_TEXT:   'FF1A1A1A',
  MUTED:       'FF6B7280',
  BORDER:      'FFB2EBF2',
  GREEN_BG:    'FFD1FAE5', GREEN_TEXT: 'FF065F46',
  YELLOW_BG:   'FFFEF3C7', YELLOW_TEXT:'FF92400E',
  RED_BG:      'FFFEE2E2', RED_TEXT:   'FF991B1B',
  BLUE_BG:     'FFDBEAFE', BLUE_TEXT:  'FF1E40AF',
  CYAN_BG:     'FFE0F7FA', CYAN_TEXT:  'FF0E7490',
  GRAY_BG:     'FFF3F4F6', GRAY_TEXT:  'FF374151',
  PURPLE_BG:   'FFEDE9FE', PURPLE_TEXT:'FF5B21B6',
};

function titleStyle() {
  return {
    font: { name: 'Arial', sz: 14, bold: true, color: { rgb: C.WHITE } },
    fill: { fgColor: { rgb: C.TEAL }, type: 'pattern', patternType: 'solid' },
    alignment: { horizontal: 'center', vertical: 'center' },
  };
}
function subtitleStyle() {
  return {
    font: { name: 'Arial', sz: 9, color: { rgb: C.WHITE } },
    fill: { fgColor: { rgb: C.TEAL_MID }, type: 'pattern', patternType: 'solid' },
    alignment: { horizontal: 'center', vertical: 'center' },
  };
}
function headerStyle() {
  return {
    font: { name: 'Arial', sz: 10, bold: true, color: { rgb: C.WHITE } },
    fill: { fgColor: { rgb: C.TEAL }, type: 'pattern', patternType: 'solid' },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: { bottom: { style: 'thin', color: { rgb: C.TEAL_DARK } } },
  };
}
function dataStyle(even = false) {
  return {
    font: { name: 'Arial', sz: 10, color: { rgb: C.DARK_TEXT } },
    fill: { fgColor: { rgb: even ? C.CYAN_LIGHT : C.WHITE }, type: 'pattern', patternType: 'solid' },
    alignment: { vertical: 'center', wrapText: false },
    border: { bottom: { style: 'thin', color: { rgb: C.BORDER } } },
  };
}
function statusStyle(status, even = false) {
  const map = {
    APPROVED:    { bg: C.GREEN_BG,  fg: C.GREEN_TEXT  },
    RESOLVED:    { bg: C.GREEN_BG,  fg: C.GREEN_TEXT  },
    ACTIVE:      { bg: C.CYAN_BG,   fg: C.CYAN_TEXT   },
    IN_PROGRESS: { bg: C.CYAN_BG,   fg: C.CYAN_TEXT   },
    OPEN:        { bg: C.BLUE_BG,   fg: C.BLUE_TEXT   },
    PENDING:     { bg: C.YELLOW_BG, fg: C.YELLOW_TEXT },
    CLOSED:      { bg: C.GRAY_BG,   fg: C.GRAY_TEXT   },
    REJECTED:    { bg: C.RED_BG,    fg: C.RED_TEXT    },
    CANCELLED:   { bg: C.RED_BG,    fg: C.RED_TEXT    },
    HIGH:        { bg: C.RED_BG,    fg: C.RED_TEXT    },
    CRITICAL:    { bg: C.RED_BG,    fg: C.RED_TEXT    },
    MEDIUM:      { bg: C.YELLOW_BG, fg: C.YELLOW_TEXT },
    LOW:         { bg: C.BLUE_BG,   fg: C.BLUE_TEXT   },
    TECHNICIAN:  { bg: C.CYAN_BG,   fg: C.CYAN_TEXT   },
    LECTURER:    { bg: C.PURPLE_BG, fg: C.PURPLE_TEXT },
    STUDENT:     { bg: C.PURPLE_BG, fg: C.PURPLE_TEXT },
    USER:        { bg: C.GRAY_BG,   fg: C.GRAY_TEXT   },
  };
  const c = map[status] || { bg: C.GRAY_BG, fg: C.GRAY_TEXT };
  return {
    font: { name: 'Arial', sz: 10, bold: true, color: { rgb: c.fg } },
    fill: { fgColor: { rgb: c.bg }, type: 'pattern', patternType: 'solid' },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: { bottom: { style: 'thin', color: { rgb: C.BORDER } } },
  };
}
function footerStyle() {
  return {
    font: { name: 'Arial', sz: 9, italic: true, color: { rgb: C.WHITE } },
    fill: { fgColor: { rgb: C.TEAL_DARK }, type: 'pattern', patternType: 'solid' },
    alignment: { horizontal: 'center' },
  };
}

//  Build worksheet 
function buildSheet(XLSX, title, subtitle, headers, rows, colWidths, statusCols = []) {
  const ws = {};
  const totalCols = headers.length;
  const dataStart = 3;
  const footerRow = dataStart + rows.length;

  // Title row
  for (let c = 0; c < totalCols; c++)
    ws[XLSX.utils.encode_cell({ r: 0, c })] = { v: c === 0 ? title : '', t: 's', s: titleStyle() };

  // Subtitle row
  for (let c = 0; c < totalCols; c++)
    ws[XLSX.utils.encode_cell({ r: 1, c })] = { v: c === 0 ? subtitle : '', t: 's', s: subtitleStyle() };

  // Header row
  headers.forEach((h, c) =>
    ws[XLSX.utils.encode_cell({ r: 2, c })] = { v: h, t: 's', s: headerStyle() }
  );

  // Data rows
  rows.forEach((row, ri) => {
    const even = ri % 2 === 0;
    row.forEach((val, ci) => {
      const isStatus = statusCols.includes(ci);
      const statusKey = isStatus ? String(val).toUpperCase().replace(/ /g,'_') : '';
      ws[XLSX.utils.encode_cell({ r: dataStart + ri, c: ci })] = {
        v: val ?? '', t: typeof val === 'number' ? 'n' : 's',
        s: isStatus ? statusStyle(statusKey, even) : dataStyle(even),
      };
    });
  });

  // Footer row
  const footerText = `Smart Campus — SLIIT Faculty of Computing | Generated: ${new Date().toLocaleString('en-GB')}`;
  for (let c = 0; c < totalCols; c++)
    ws[XLSX.utils.encode_cell({ r: footerRow, c })] = { v: c === 0 ? footerText : '', t: 's', s: footerStyle() };

  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: footerRow, c: totalCols - 1 } });
  ws['!cols'] = colWidths.map(w => ({ wch: w }));
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: totalCols - 1 } },
    { s: { r: footerRow, c: 0 }, e: { r: footerRow, c: totalCols - 1 } },
  ];
  ws['!rows'] = [{ hpt: 28 }, { hpt: 16 }, { hpt: 18 }];
  return ws;
}
//  Tickets XLSX 
export async function exportTicketsXLSX(tickets, title = 'All Tickets') {
  const XLSX = await loadSheetJS();
  const headers = ['#', 'ID', 'Category', 'Priority', 'Status', 'Description', 'Reporter', 'Email', 'Assigned To', 'Resource', 'Created'];
  const rows = tickets.map((t, i) => [
    i + 1,
    `#${t.id}`,
    (t.category || '').replace(/_/g, ' '),
    t.priority || '',
    (t.status || '').replace(/_/g, ' '),
    (t.description || '').substring(0, 100),
    t.reporter?.name || '',
    t.reporter?.email || '',
    t.assignedTo?.name || '—',
    t.resource?.name || '—',
    t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-GB') : '',
  ]);
  const subtitle = `Generated: ${new Date().toLocaleString('en-GB')} | ${tickets.length} tickets`;
  const ws = buildSheet(XLSX, `Smart Campus — ${title}`, subtitle, headers, rows,
    [4, 8, 16, 12, 14, 40, 20, 28, 20, 16, 14],
    [3, 4] // Priority col 3, Status col 4
  );
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, title.substring(0, 31));
  XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}.xlsx`);
}

//  Bookings XLSX
export async function exportBookingsXLSX(bookings, title = 'All Bookings') {
  const XLSX = await loadSheetJS();
  const headers = ['#', 'Resource', 'Location', 'Start Time', 'End Time', 'Purpose', 'User', 'Email', 'Status'];
  const rows = bookings.map((b, i) => [
    i + 1,
    b.resource?.name || '',
    b.resource?.location || '',
    b.startTime ? new Date(b.startTime).toLocaleString('en-GB') : '',
    b.endTime   ? new Date(b.endTime).toLocaleString('en-GB')   : '',
    b.purpose || '',
    b.user?.name  || '',
    b.user?.email || '',
    b.status || '',
  ]);
  const subtitle = `Generated: ${new Date().toLocaleString('en-GB')} | ${bookings.length} records`;
  const ws = buildSheet(XLSX, `Smart Campus — ${title}`, subtitle, headers, rows,
    [4, 22, 18, 20, 20, 30, 20, 28, 13],
    [8] // Status col 8
  );
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, title.substring(0, 31));
  XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}.xlsx`);
}

//  Activity Log XLSX 
export async function exportActivityXLSX(activities) {
  const XLSX = await loadSheetJS();
  const headers = ['#', 'Time', 'Type', 'Description', 'User', 'Status'];
  const rows = activities.map((a, i) => [i + 1, a.time || '', a.type || '', a.desc || '', a.user || '', a.status || '']);
  const subtitle = `Generated: ${new Date().toLocaleString('en-GB')} | ${activities.length} activities`;
  const ws = buildSheet(XLSX, 'Smart Campus  — Activity Log', subtitle, headers, rows,
    [4, 20, 13, 42, 24, 14],
    [5] // Status col 5
  );
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Activity Log');
  XLSX.writeFile(wb, 'Activity_Log.xlsx');
}