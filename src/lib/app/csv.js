// Tiny CSV helpers for the student import and the "download passwords" file. Handles quotes and commas in names.
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  const s = String(text || '').replace(/^﻿/, '');
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (quoted) {
      if (ch === '"' && s[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') {
      row.push(cell);
      cell = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && s[i + 1] === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else cell += ch;
  }
  if (cell !== '' || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

// First row is the header. Known columns: full_name (or name), email, phone, level (or class), student_code.
export function csvToStudents(text) {
  const rows = parseCsv(text);
  if (!rows.length) return { rows: [], unknown: [] };
  const alias = { name: 'full_name', 'full name': 'full_name', fullname: 'full_name', class: 'level', 'student code': 'student_code', code: 'student_code' };
  const head = rows[0].map((h) => {
    const k = h.trim().toLowerCase();
    return alias[k] || k.replace(/\s+/g, '_');
  });
  const known = ['full_name', 'email', 'phone', 'level', 'student_code'];
  const out = rows.slice(1).map((r) => {
    const o = {};
    head.forEach((h, i) => {
      if (known.includes(h) && r[i] !== undefined && r[i].trim() !== '') o[h] = r[i].trim();
    });
    return o;
  });
  return { rows: out, unknown: head.filter((h) => !known.includes(h)), hasRequired: head.includes('full_name') && head.includes('email') };
}

export function toCsv(rows, columns) {
  const esc = (v) => {
    const t = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
  };
  return [columns.map((c) => c.label).join(','), ...rows.map((r) => columns.map((c) => esc(r[c.key])).join(','))].join('\n');
}

export function downloadText(filename, text, type = 'text/csv') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
