// --------------------------- داده‌ها و ثابت‌ها ---------------------------
const DAYS = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه"];
const DAY_TO_IDX = Object.fromEntries(DAYS.map((d, i) => [d, i]));
const START_HOUR = 8, END_HOUR = 20;
const PX_PER_MIN = 1;

let courses = [];
let nextId = 1;
let selectedId = null;
let fileHandle = null;

// --------------------------- ابزارهای DOM و UI ---------------------------
const ui = {
  weekHeader: document.getElementById('weekHeader'),
  weekBody: document.getElementById('weekBody'),
  hours: document.getElementById('hours'),
  tableBody: document.querySelector('#table tbody'),
  totals: document.getElementById('totals'),
  sessionsContainer: document.getElementById('sessions-container'), // NEW
  form: {
    code: document.getElementById('code'),
    name: document.getElementById('name'),
    prof: document.getElementById('prof'),
    units: document.getElementById('units'),
    examDate: document.getElementById('examDate'),
    examTime: document.getElementById('examTime'),
  }
};

// --------------------------- Toast Notifications ---------------------------
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => toast.remove());
  }, 4000);
}

// --------------------------- Theme Management ---------------------------
function applyTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

function toggleTheme() {
  const currentTheme = localStorage.getItem('theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
}

// --------------------------- ابزار زمان ---------------------------
function normalizeTimeStr(t) {
  t = (t || "").toString().trim();
  if (!t) return "";
  let hh, mm;
  if (t.includes(":")) [hh, mm] = t.split(":");
  else if (t.includes(".")) [hh, mm] = t.split(".");
  else { hh = t; mm = "00"; }
  hh = hh.padStart(2, "0");
  if (mm.length === 1) {
    const m = Math.round(parseFloat("0." + mm) * 60) || 0;
    mm = String(m);
  }
  mm = (mm + "00").slice(0, 2);
  return `${hh}:${mm}`;
}

function parseTimeToMinutes(t) {
  const n = normalizeTimeStr(t);
  const [h, m] = n.split(":").map(Number);
  return h * 60 + m;
}

function overlap(a1, a2, b1, b2) {
  return Math.max(a1, b1) < Math.min(a2, b2);
}

function parseExamDateTime(d, t) {
  const ts = `${d} ${normalizeTimeStr(t)}`;
  const dt = new Date(ts.replace(/-/g, '/'));
  return isNaN(dt) ? null : dt;
}

// --------------------------- ذخیره‌سازی ---------------------------
async function ensureSave() {
  if (fileHandle) {
    try {
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(courses, null, 2));
      await writable.close();
      return;
    } catch (e) { console.warn(e); }
  }
  localStorage.setItem("scheduleData", JSON.stringify({ courses, nextId }));
}

async function pickSaveFile() {
  if (!window.showSaveFilePicker) return showToast("مرورگر شما از ذخیره مستقیم فایل پشتیبانی نمی‌کند.", 'error');
  fileHandle = await showSaveFilePicker({ suggestedName: "courses.json", types: [{ description: "JSON", accept: { "application/json": [".json"] } }] });
  await ensureSave();
  showToast("فایل ذخیره‌سازی انتخاب شد.", 'success');
}

// --------------------------- Import Function ---------------------------
async function importFromFile() {
  if (!window.showOpenFilePicker) {
    return showToast("مرورگر شما از این قابلیت پشتیبانی نمی‌کند.", 'error');
  }
  try {
    const [handle] = await window.showOpenFilePicker({
      types: [{ description: "JSON", accept: { "application/json": [".json"] } }],
      multiple: false,
    });
    const file = await handle.getFile();
    const content = await file.text();
    const data = JSON.parse(content);

    if (!Array.isArray(data)) {
      throw new Error("فایل ورودی معتبر نیست. باید یک آرایه از دروس باشد.");
    }

    let importedCourses = data;
    // --- MIGRATION LOGIC for old file format ---
    if (importedCourses.length > 0 && importedCourses[0].day && !importedCourses[0].sessions) {
      importedCourses.forEach(c => {
        c.sessions = [{ day: c.day, start: c.start, end: c.end }];
        delete c.day;
        delete c.start;
        delete c.end;
      });
      showToast('فایل با فرمت قدیمی به فرمت جدید تبدیل شد.', 'info');
    }

    courses = importedCourses;
    nextId = (Math.max(0, ...courses.map(c => c.id || 0)) + 1);

    await ensureSave();
    renderAll();
    clearForm();
    showToast("فایل با موفقیت بارگذاری شد.", 'success');

  } catch (e) {
    console.error("Error importing file:", e);
    showToast(e.message || "خطا در بارگذاری فایل.", 'error');
  }
}

// --------------------------- Export Functions ---------------------------
async function exportAs(format = 'pdf') {
  const plannerPanel = document.getElementById('plannerPanel');
  const fileName = `course-schedule.${format}`;
  showToast(`در حال آماده‌سازی خروجی ${format.toUpperCase()}...`, 'info');

  try {
    const canvas = await html2canvas(plannerPanel, { scale: 2 });
    if (format === 'pdf') {
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const pageW = 210, margin = 10;
      const contentW = pageW - margin * 2;
      const imgH = (canvas.height * contentW) / canvas.width;
      pdf.addImage(imgData, 'PNG', margin, margin, contentW, imgH);
      pdf.save(fileName);
    } else { // PNG or JPEG
      const mimeType = `image/${format}`;
      const imgData = canvas.toDataURL(mimeType, 1.0);
      const link = document.createElement('a');
      link.href = imgData;
      link.download = fileName;
      link.click();
    }
    showToast(`فایل ${format.toUpperCase()} با موفقیت ساخته شد.`, 'success');
  } catch (e) {
    showToast(`خطا در ساخت فایل ${format.toUpperCase()}.`, 'error');
    console.error(e);
  }
}

// --------------------------- UI ساز ---------------------------
function initWeek() {
  ui.weekHeader.innerHTML = '';
  ui.weekBody.innerHTML = '';
  DAYS.forEach(d => {
    const div = document.createElement('div');
    div.textContent = d;
    ui.weekHeader.appendChild(div);
  });
  const w = ui.weekBody.clientWidth;
  if (w === 0) return;
  const colW = w / DAYS.length;
  for (let i = 0; i < DAYS.length; i++) {
    const v = document.createElement('div');
    v.className = 'vcol';
    v.style.right = `${i * colW}px`;
    v.style.width = `${colW}px`;
    ui.weekBody.appendChild(v);
  }
  for (let h = START_HOUR; h <= END_HOUR; h++) {
    const y = (h - START_HOUR) * 60 * PX_PER_MIN;
    const hr = document.createElement('div');
    hr.className = 'hrow';
    hr.style.top = `${y}px`;
    ui.weekBody.appendChild(hr);
  }
}
function colorFor(key) {
  const h = Math.abs(hashCode(key)) % 360;
  return hsvToHex(h / 360, 0.45, 0.95);
}
function hashCode(s) { let h = 0; for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; } return h; }
function hsvToHex(h, s, v) {
  let r, g, b; let i = Math.floor(h * 6), f = h * 6 - i; let p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
  switch (i % 6) { case 0: r = v; g = t; b = p; break; case 1: r = q; g = v; b = p; break; case 2: r = p; g = v; b = t; break; case 3: r = p; g = q; b = v; break; case 4: r = t; g = p; b = v; break; case 5: r = v; g = p; b = q; break; }
  return "#" + [r, g, b].map(x => ("0" + Math.round(x * 255).toString(16)).slice(-2)).join('');
}
function drawCourses() {
  Array.from(ui.weekBody.querySelectorAll('.course')).forEach(el => el.remove());
  const w = ui.weekBody.clientWidth;
  if (w === 0) return;
  const colW = w / DAYS.length;
  courses.forEach(c => {
    c.sessions.forEach(session => {
      const col = DAY_TO_IDX[session.day] ?? 0;
      const x1 = col * colW + 6;
      const x2 = x1 + colW - 12;
      const st = parseTimeToMinutes(session.start);
      const en = parseTimeToMinutes(session.end);
      const y1 = (st - START_HOUR * 60) * PX_PER_MIN;
      const y2 = (en - START_HOUR * 60) * PX_PER_MIN;
      const el = document.createElement('div');
      el.className = 'course';
      el.style.right = x1 + "px"; el.style.left = (ui.weekBody.clientWidth - x2) + "px"; el.style.top = y1 + "px"; el.style.height = (y2 - y1 - 2) + "px"; el.style.background = colorFor(c.name); el.dataset.id = c.id;
      el.innerHTML = `<div class="title">${c.name} (${c.code})</div><div class="meta">${normalizeTimeStr(session.start)} تا ${normalizeTimeStr(session.end)}</div><div class="meta">استاد: ${c.professor || '—'}</div>${c.exam_date && c.exam_time ? `<div class="meta">امتحان: ${c.exam_date} ${normalizeTimeStr(c.exam_time)}</div>` : ''}`;
      el.addEventListener('click', () => selectRow(c.id));
      ui.weekBody.appendChild(el);
    });
  });
}
function renderTable() {
  ui.tableBody.innerHTML = '';
  courses.forEach(c => {
    const tr = document.createElement('tr');
    if (c.id === selectedId) tr.classList.add('selected');
    tr.dataset.id = c.id;
    const daysTxt = c.sessions.map(s => s.day).join('<br>');
    const timeTxt = c.sessions.map(s => `${normalizeTimeStr(s.start)} تا ${normalizeTimeStr(s.end)}`).join('<br>');
    const examTxt = (c.exam_date && c.exam_time) ? `${c.exam_date} ${normalizeTimeStr(c.exam_time)}` : '—';
    tr.innerHTML = `<td>${c.code || ''}</td><td>${c.name}</td><td>${c.professor || ''}</td><td>${c.units}</td><td>${daysTxt}</td><td>${timeTxt}</td><td>${examTxt}</td>`;
    tr.addEventListener('click', () => selectRow(c.id));
    ui.tableBody.appendChild(tr);
  });
}
function updateTotals() {
  const units = courses.reduce((s, c) => s + Number(c.units || 0), 0);
  ui.totals.textContent = `مجموع واحد: ${units} | تعداد دروس: ${courses.length}`;
}
function renderAll() {
  initWeek();
  renderTable();
  drawCourses();
  updateTotals();
}
function selectRow(id) {
  selectedId = id;
  const course = courses.find(c => c.id === id);
  if (course) setFormFromCourse(course);
  renderTable();
}

// --------------------------- فرم و عملیات ---------------------------
function fillDayOptions(selectElement) {
  selectElement.innerHTML = DAYS.map(d => `<option value="${d}">${d}</option>`).join('');
}

function addSessionToForm(session = null) {
  const container = ui.sessionsContainer;
  const entryDiv = document.createElement('div');
  entryDiv.className = 'session-entry';

  const inputsDiv = document.createElement('div');
  inputsDiv.className = 'session-inputs';

  const dayDiv = document.createElement('div');
  const dayLabel = document.createElement('label');
  const sessionCount = container.children.length + 1;
  dayLabel.textContent = `روز هفته (کلاس ${sessionCount})`;
  const daySelect = document.createElement('select');
  daySelect.className = 'session-day';
  fillDayOptions(daySelect);
  if (session) daySelect.value = session.day;
  dayDiv.append(dayLabel, daySelect);

  const startDiv = document.createElement('div');
  const startLabel = document.createElement('label');
  startLabel.textContent = 'ساعت شروع';
  const startInput = document.createElement('input');
  startInput.className = 'session-start';
  startInput.placeholder = '16 یا 16.30';
  if (session) startInput.value = session.start;
  startDiv.append(startLabel, startInput);

  const endDiv = document.createElement('div');
  const endLabel = document.createElement('label');
  endLabel.textContent = 'تا';
  const endInput = document.createElement('input');
  endInput.className = 'session-end';
  endInput.placeholder = '18.30';
  if (session) endInput.value = session.end;
  endDiv.append(endLabel, endInput);

  inputsDiv.append(dayDiv, startDiv, endDiv);
  entryDiv.appendChild(inputsDiv);

  if (container.children.length > 0) {
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'حذف';
    removeBtn.className = 'btn btn-danger';
    removeBtn.style.padding = '4px 8px';
    removeBtn.style.fontSize = '12px';
    removeBtn.type = 'button';
    removeBtn.onclick = () => {
      entryDiv.remove();
      // re-label sessions after removal
      ui.sessionsContainer.querySelectorAll('.session-entry label:first-child').forEach((label, index) => {
        label.textContent = `روز هفته (کلاس ${index + 1})`;
      });
    };
    entryDiv.appendChild(removeBtn);
  }
  container.appendChild(entryDiv);
}

function readForm() {
  const values = {};
  for (const key in ui.form) { values[key] = ui.form[key].value.trim(); }
  if (!values.name) throw new Error('نام درس را وارد کنید.');
  if (!values.code) throw new Error('کد درس را وارد کنید.');

  const sessions = [];
  const sessionEntries = document.querySelectorAll('#sessions-container .session-entry');
  if (sessionEntries.length === 0) throw new Error('حداقل یک کلاس برای درس تعریف کنید.');

  sessionEntries.forEach((entry, index) => {
    const day = entry.querySelector('.session-day').value;
    const start = entry.querySelector('.session-start').value;
    const end = entry.querySelector('.session-end').value;

    if (!start || !end) throw new Error(`ساعت شروع و پایان را برای کلاس ${index + 1} وارد کنید.`);
    const stMin = parseTimeToMinutes(start), enMin = parseTimeToMinutes(end);
    if (!DAYS.includes(day)) throw new Error(`روز هفته برای کلاس ${index + 1} نامعتبر است.`);
    if (!(stMin < enMin)) throw new Error(`در کلاس ${index + 1}، ساعت پایان باید بزرگ‌تر از شروع باشد.`);
    if (stMin < START_HOUR * 60 || enMin > END_HOUR * 60) throw new Error(`ساعت کلاس ${index + 1} باید بین ${START_HOUR}:00 تا ${END_HOUR}:00 باشد.`);
    sessions.push({ day, start, end });
  });

  if (values.examDate && values.examTime) { if (!parseExamDateTime(values.examDate, values.examTime)) throw new Error('تاریخ/ساعت امتحان نامعتبر است.'); }
  return { code: values.code, name: values.name, professor: values.prof, units: parseFloat(values.units || '0'), sessions: sessions, exam_date: values.examDate, exam_time: values.examTime };
}

function checkClassConflict(candidate, ignoreId = null) {
  for (const candSession of candidate.sessions) {
    const st = parseTimeToMinutes(candSession.start);
    const en = parseTimeToMinutes(candSession.end);
    for (const existingCourse of courses) {
      if (existingCourse.id === ignoreId) continue;
      for (const existingSession of existingCourse.sessions) {
        if (candSession.day === existingSession.day && overlap(st, en, parseTimeToMinutes(existingSession.start), parseTimeToMinutes(existingSession.end))) {
          return true;
        }
      }
    }
  }
  return false;
}

function examConflicts(candidate, ignoreId = null) {
  const out = []; if (!(candidate.exam_date && candidate.exam_time)) return out; const a = parseExamDateTime(candidate.exam_date, candidate.exam_time); if (!a) return out; const aEnd = new Date(a.getTime() + 120 * 60000);
  for (const c of courses) { if (c.id === ignoreId || !(c.exam_date && c.exam_time)) continue; const b = parseExamDateTime(c.exam_date, c.exam_time); if (!b) continue; const bEnd = new Date(b.getTime() + 120 * 60000); if (Math.max(a, b) < Math.min(aEnd, bEnd)) out.push(c); } return out;
}

function clearForm() {
  Object.values(ui.form).forEach(el => el.value = '');
  ui.sessionsContainer.innerHTML = '';
  addSessionToForm();
}

function setFormFromCourse(c) {
  ui.form.code.value = c.code || ''; ui.form.name.value = c.name; ui.form.prof.value = c.professor || ''; ui.form.units.value = c.units; ui.form.examDate.value = c.exam_date || ''; ui.form.examTime.value = c.exam_time || '';
  ui.sessionsContainer.innerHTML = '';
  if (c.sessions && c.sessions.length > 0) {
    c.sessions.forEach(session => addSessionToForm(session));
  } else {
    addSessionToForm(); // Add a blank one if course has no sessions
  }
}

async function addCourse() {
  try {
    const obj = readForm();
    if (checkClassConflict(obj)) return showToast('تداخل زمانی با کلاس دیگری وجود دارد.', 'error');
    const exams = examConflicts(obj);
    if (exams.length && !confirm('زمان امتحان با این درس‌ها تداخل دارد: ' + exams.map(x => x.name).join('، ') + '\nادامه می‌دهید؟')) return;
    courses.push({ id: nextId++, ...obj });
    await ensureSave(); renderAll(); clearForm(); showToast('درس با موفقیت افزوده شد.', 'success');
  } catch (e) { showToast(e.message || 'خطایی رخ داد.', 'error'); }
}

async function editSelected() {
  if (!selectedId) return showToast('ابتدا یک درس را برای ویرایش انتخاب کنید.', 'info');
  try {
    const obj = readForm();
    if (checkClassConflict(obj, selectedId)) return showToast('تداخل زمانی با کلاس دیگری وجود دارد.', 'error');
    const exams = examConflicts(obj, selectedId);
    if (exams.length && !confirm('زمان امتحان با این درس‌ها تداخل دارد: ' + exams.map(x => x.name).join('، ') + '\nاعمال تغییر؟')) return;
    const idx = courses.findIndex(c => c.id === selectedId);
    courses[idx] = { id: selectedId, ...obj };
    await ensureSave(); renderAll(); showToast('ویرایش با موفقیت انجام شد.', 'success');
  } catch (e) { showToast(e.message || 'خطایی رخ داد.', 'error'); }
}

async function deleteSelected() {
  if (!selectedId) return showToast('ابتدا یک درس را برای حذف انتخاب کنید.', 'info');
  if (!confirm('از حذف درس انتخاب‌شده مطمئن هستید؟')) return;
  courses = courses.filter(c => c.id !== selectedId);
  selectedId = null;
  await ensureSave(); renderAll(); clearForm(); showToast('درس با موفقیت حذف شد.', 'success');
}

function copyCourseCodes() {
  if (courses.length === 0) return showToast('درسی برای کپی وجود ندارد.', 'info');
  const textToCopy = courses.map(c => `${c.code} - ${c.name}`).join('\n');
  navigator.clipboard.writeText(textToCopy).then(() => showToast('کد و نام دروس در کلیپ‌بورد کپی شد.', 'success')).catch(err => showToast('خطا در کپی کردن.', 'error'));
}

// --------------------------- راه‌اندازی ---------------------------
function loadFromLocal() {
  try {
    const raw = localStorage.getItem('scheduleData');
    if (!raw) return;
    const data = JSON.parse(raw);
    let loadedCourses = data.courses || [];

    // --- MIGRATION LOGIC for old data format ---
    if (loadedCourses.length > 0 && loadedCourses[0].day && !loadedCourses[0].sessions) {
      loadedCourses.forEach(c => {
        c.sessions = [{
          day: c.day,
          start: c.start,
          end: c.end
        }];
        delete c.day;
        delete c.start;
        delete c.end;
      });
      showToast('اطلاعات ذخیره‌شده شما به فرمت جدید به‌روزرسانی شد.', 'info');
    }

    courses = loadedCourses;
    nextId = data.nextId || (Math.max(0, ...courses.map(c => c.id || 0)) + 1);
  } catch (e) { console.warn(e); showToast('خطا در بارگذاری اطلاعات ذخیره‌شده.', 'error'); }
}

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(renderAll, 150);
});

document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  applyTheme(savedTheme);

  clearForm(); // Set up the initial session input
  loadFromLocal();
  renderAll();

  // Event listeners
  document.getElementById('btnAdd').onclick = addCourse;
  document.getElementById('btnEdit').onclick = editSelected;
  document.getElementById('btnDelete').onclick = deleteSelected;
  document.getElementById('btnCopyCodes').onclick = copyCourseCodes;
  document.getElementById('btnPickFile').onclick = pickSaveFile;
  document.getElementById('btnImportFile').onclick = importFromFile;
  document.getElementById('btnThemeToggle').onclick = toggleTheme;
  document.getElementById('btnAddSession').onclick = () => addSessionToForm(); // NEW
  document.getElementById('btnExportPDF').onclick = () => exportAs('pdf');
  document.getElementById('btnExportPNG').onclick = () => exportAs('png');
  document.getElementById('btnExportJPEG').onclick = () => exportAs('jpeg');
});