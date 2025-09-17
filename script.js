// --------------------------- داده‌ها و ثابت‌ها ---------------------------
const DAYS = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه"];
const DAY_TO_IDX = Object.fromEntries(DAYS.map((d, i) => [d, i]));
const START_HOUR = 8,
  END_HOUR = 20;
const PX_PER_MIN = 1;

let courses = [];
let nextId = 1;
let selectedCourseId = null;
let fileHandle = null;

// --------------------------- UI Elements ---------------------------
const ui = {
  weekHeader: document.getElementById('weekHeader'),
  weekBody: document.getElementById('weekBody'),
  tableBody: document.querySelector('#table tbody'),
  totals: document.getElementById('totals'),
  sessionsContainer: document.getElementById('sessions-container'),
  examFieldsContainer: document.getElementById('exam-fields-container'),
  form: {
    code: document.getElementById('code'),
    name: document.getElementById('name'),
    prof: document.getElementById('prof'),
    units: document.getElementById('units'),
    noExam: document.getElementById('noExam'),
    examDay: document.getElementById('examDay'),
    examMonth: document.getElementById('examMonth'),
    examYear: document.getElementById('examYear'),
    examTime: document.getElementById('examTime'),
  }
};

// --------------------------- Global Error Handler ---------------------------
window.onerror = function (message, source, lineno, colno, error) {
  console.error("خطای پیش‌بینی نشده:", error);
  showToast("یک خطای غیرمنتظره رخ داد. لطفاً صفحه را رفرش کنید.", "error");
  return true;
};

// --------------------------- Toast Notifications ---------------------------
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
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

// --------------------------- Time & Date Utilities ---------------------------
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
  if (isNaN(h) || isNaN(m)) return NaN;
  return h * 60 + m;
}

function overlap(a1, a2, b1, b2) {
  return Math.max(a1, b1) < Math.min(a2, b2);
}

// --------------------------- File & Data Storage ---------------------------
async function ensureSave() {
  try {
    if (fileHandle) {
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(courses, null, 2));
      await writable.close();
      return;
    }
    localStorage.setItem("scheduleData", JSON.stringify({ courses, nextId }));
  } catch (e) {
    console.error("Save Error:", e);
    showToast("خطا در ذخیره‌سازی اطلاعات.", "error");
  }
}

async function pickSaveFile() {
  if (!window.showSaveFilePicker) return showToast("مرورگر شما از ذخیره مستقیم فایل پشتیبانی نمی‌کند.", 'error');
  try {
    fileHandle = await showSaveFilePicker({ suggestedName: "courses.json", types: [{ description: "JSON", accept: { "application/json": [".json"] } }] });
    await ensureSave();
    showToast("فایل ذخیره‌سازی انتخاب شد.", 'success');
  } catch (e) {
    if (e.name !== 'AbortError') {
      console.error("File Pick Error:", e);
      showToast("امکان انتخاب فایل ذخیره‌سازی وجود ندارد.", "error");
    }
  }
}

async function importFromFile() {
  if (!window.showOpenFilePicker) return showToast("مرورگر شما از این قابلیت پشتیبانی نمی‌کند.", 'error');
  try {
    const [handle] = await window.showOpenFilePicker({ types: [{ description: "JSON", accept: { "application/json": [".json"] } }], multiple: false });
    const file = await handle.getFile();
    const content = await file.text();

    let data;
    try { data = JSON.parse(content); }
    catch (parseError) { throw new Error("فایل انتخاب شده یک فایل JSON معتبر نیست."); }

    if (!Array.isArray(data)) throw new Error("ساختار فایل ورودی معتبر نیست.");

    const isValid = data.every(c => c.code && c.name && Array.isArray(c.sessions));
    if (!isValid) throw new Error("داده‌های درون فایل کامل نیستند.");

    courses = data;
    nextId = (Math.max(0, ...courses.map(c => c.id || 0)) + 1);
    await ensureSave();
    renderAll();
    clearForm();
    showToast("فایل با موفقیت بارگذاری شد.", 'success');
  } catch (e) {
    if (e.name !== 'AbortError') {
      console.error("Import Error:", e);
      showToast(e.message || "خطا در بارگذاری فایل.", 'error');
    }
  }
}

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
    } else {
      const mimeType = `image/${format}`;
      const imgData = canvas.toDataURL(mimeType, 1.0);
      const link = document.createElement('a');
      link.href = imgData;
      link.download = fileName;
      link.click();
    }
    showToast(`فایل ${format.toUpperCase()} با موفقیت ساخته شد.`, 'success');
  } catch (e) {
    console.error("Export Error:", e);
    showToast(`خطا در ساخت فایل ${format.toUpperCase()}.`, 'error');
  }
}

// --------------------------- UI Rendering ---------------------------
function initWeek() {
  ui.weekHeader.innerHTML = ''; ui.weekBody.innerHTML = '';
  DAYS.forEach(d => { const div = document.createElement('div'); div.textContent = d; ui.weekHeader.appendChild(div); });
  const w = ui.weekBody.clientWidth; if (w === 0) return; const colW = w / DAYS.length;
  for (let i = 0; i < DAYS.length; i++) { const v = document.createElement('div'); v.className = 'vcol'; v.style.right = `${i * colW}px`; v.style.width = `${colW}px`; ui.weekBody.appendChild(v); }
  for (let h = START_HOUR; h <= END_HOUR; h++) { const y = (h - START_HOUR) * 60 * PX_PER_MIN; const hr = document.createElement('div'); hr.className = 'hrow'; hr.style.top = `${y}px`; ui.weekBody.appendChild(hr); }
}

function colorFor(key) {
  let h = 0; for (let i = 0; i < key.length; i++) { h = ((h << 5) - h) + key.charCodeAt(i); h |= 0; } const hue = Math.abs(h) % 360;
  let r, g, b; let i = Math.floor(hue / 60), f = hue / 60 - i, p = 0.95 * (1 - 0.45), q = 0.95 * (1 - f * 0.45), t = 0.95 * (1 - (1 - f) * 0.45);
  switch (i % 6) {
    case 0: r = 0.95; g = t; b = p; break; case 1: r = q; g = 0.95; b = p; break; case 2: r = p; g = 0.95; b = t; break;
    case 3: r = p; g = q; b = 0.95; break; case 4: r = t; g = p; b = 0.95; break; case 5: r = 0.95; g = p; b = q; break;
  }
  return "#" + [r, g, b].map(x => ("0" + Math.round(x * 255).toString(16)).slice(-2)).join('');
}

function drawCourses() {
  Array.from(ui.weekBody.querySelectorAll('.course')).forEach(el => el.remove());
  const w = ui.weekBody.clientWidth; if (w === 0) return; const colW = w / DAYS.length;
  courses.forEach(c => {
    c.sessions.forEach(s => {
      const col = DAY_TO_IDX[s.day] ?? 0, st = parseTimeToMinutes(s.start), en = parseTimeToMinutes(s.end);
      if (isNaN(st) || isNaN(en)) return;
      const el = document.createElement('div');
      el.className = 'course';
      el.style.right = `${col * colW + 6}px`;
      el.style.left = `${ui.weekBody.clientWidth - (col * colW + colW - 6)}px`;
      el.style.top = `${(st - START_HOUR * 60) * PX_PER_MIN}px`;
      el.style.height = `${(en - st - 2) * PX_PER_MIN}px`;
      el.style.background = colorFor(c.name); el.dataset.courseId = c.id;
      let examText = '—';
      if (c.exam_date === null) examText = 'بدون امتحان';
      else if (c.exam_date && c.exam_time) examText = `امتحان: ${c.exam_date.split('-').reverse().join('-')} ${normalizeTimeStr(c.exam_time)}`;
      el.innerHTML = `<div class="title">${c.name} (${c.code})</div><div class="meta">${s.day} | ${normalizeTimeStr(s.start)} تا ${normalizeTimeStr(s.end)}</div><div class="meta">استاد: ${c.professor || '—'}</div><div class="meta">${examText}</div>`;
      el.addEventListener('click', () => selectRow(c.id)); ui.weekBody.appendChild(el);
    });
  });
}

function renderTable() {
  ui.tableBody.innerHTML = '';
  courses.forEach(c => {
    const sessionTexts = c.sessions.map(s => `${s.day} | ${normalizeTimeStr(s.start)} تا ${normalizeTimeStr(s.end)}`).join('<br>');
    const tr = document.createElement('tr');
    if (c.id === selectedCourseId) tr.classList.add('selected');
    tr.dataset.courseId = c.id;

    let examTxt = '—';
    if (c.exam_date === null) examTxt = 'بدون امتحان';
    else if (c.exam_date && c.exam_time) {
      const examDateFormatted = c.exam_date.split('-').reverse().join('-');
      examTxt = `${examDateFormatted} ${normalizeTimeStr(c.exam_time)}`;
    }

    tr.innerHTML = `<td>${c.code || ''}</td><td>${c.name}</td><td>${c.professor || ''}</td><td>${c.units}</td><td style="white-space: normal;">${sessionTexts}</td><td>${examTxt}</td>`;
    tr.addEventListener('click', () => selectRow(c.id));
    ui.tableBody.appendChild(tr);
  });
}

function updateTotals() {
  const units = courses.reduce((s, c) => s + Number(c.units || 0), 0);
  const sessionCount = courses.reduce((s, c) => s + c.sessions.length, 0);
  ui.totals.textContent = `مجموع واحد: ${units} | تعداد دروس: ${courses.length} | تعداد جلسات: ${sessionCount}`;
}

function renderAll() {
  try {
    initWeek(); renderTable(); drawCourses(); updateTotals();
  } catch (e) {
    console.error("Render Error:", e);
    showToast("خطا در نمایش اطلاعات روی صفحه.", "error");
  }
}

function selectRow(courseId) {
  selectedCourseId = courseId;
  const course = courses.find(c => c.id === courseId);
  if (course) setFormFromCourse(course);
  renderTable();
}

// --------------------------- Form Logic ---------------------------
function fillDayOptions(selectElement) {
  selectElement.innerHTML = DAYS.map(d => `<option value="${d}">${d}</option>`).join('');
}

function addSessionRow(sessionData = null) {
  const sessionRow = ui.sessionsContainer.firstElementChild.cloneNode(true);
  fillDayOptions(sessionRow.querySelector('.day'));
  sessionRow.querySelector('.day').value = sessionData ? sessionData.day : DAYS[0];
  sessionRow.querySelector('.start').value = sessionData ? sessionData.start : '';
  sessionRow.querySelector('.end').value = sessionData ? sessionData.end : '';
  sessionRow.querySelector('.btn-delete-session').style.visibility = 'visible';
  ui.sessionsContainer.appendChild(sessionRow);
}

function readForm() {
  const courseData = {};
  for (const key in ui.form) courseData[key] = typeof ui.form[key].value === 'string' ? ui.form[key].value.trim() : ui.form[key].value;

  if (!courseData.name) throw new Error('نام درس را وارد کنید.');
  if (!courseData.code) throw new Error('کد درس را وارد کنید.');
  if (isNaN(parseFloat(courseData.units))) courseData.units = 0;

  let examDateStr = '', examTimeStr = '';
  if (ui.form.noExam.checked) {
    examDateStr = null; // Special marker for "no exam"
    examTimeStr = null;
  } else if (courseData.examYear || courseData.examMonth || courseData.examDay) {
    const day = parseInt(courseData.examDay), month = parseInt(courseData.examMonth), year = parseInt(courseData.examYear);
    if (isNaN(day) || isNaN(month) || isNaN(year) || day < 1 || day > 31 || month < 1 || month > 12 || year < 1300) throw new Error('تاریخ امتحان وارد شده معتبر نیست.');
    examDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    examTimeStr = courseData.examTime;
    if (!examTimeStr) throw new Error('ساعت امتحان را وارد کنید.');
  }

  const sessions = [];
  ui.sessionsContainer.querySelectorAll('.session-row').forEach((row, index) => {
    const start = row.querySelector('.start').value, end = row.querySelector('.end').value;
    if (!start || !end) throw new Error(`ساعت شروع و پایان برای جلسه ${index + 1} الزامی است.`);
    const stMin = parseTimeToMinutes(start), enMin = parseTimeToMinutes(end);
    if (isNaN(stMin) || isNaN(enMin)) throw new Error(`فرمت ساعت در جلسه ${index + 1} نامعتبر است.`);
    if (!(stMin < enMin)) throw new Error(`در جلسه ${index + 1}، ساعت پایان باید بزرگ‌تر از شروع باشد.`);
    if (stMin < START_HOUR * 60 || enMin > END_HOUR * 60) throw new Error(`ساعت کلاس باید بین ${START_HOUR}:00 تا ${END_HOUR}:00 باشد.`);
    sessions.push({ day: row.querySelector('.day').value, start, end });
  });

  if (sessions.length === 0) throw new Error('حداقل یک جلسه برای درس باید تعریف شود.');

  return {
    code: courseData.code, name: courseData.name, professor: courseData.prof,
    units: parseFloat(courseData.units), exam_date: examDateStr, exam_time: examTimeStr, sessions
  };
}

function setFormFromCourse(course) {
  clearForm(false);
  ui.form.code.value = course.code || '';
  ui.form.name.value = course.name || '';
  ui.form.prof.value = course.professor || '';
  ui.form.units.value = course.units || '';

  ui.form.noExam.checked = course.exam_date === null;
  ui.form.noExam.dispatchEvent(new Event('change'));

  if (course.exam_date) {
    const [year, month, day] = course.exam_date.split('-');
    ui.form.examDay.value = day;
    ui.form.examMonth.value = month;
    ui.form.examYear.value = year;
  }
  ui.form.examTime.value = course.exam_time || '';

  ui.sessionsContainer.querySelectorAll('.session-row:not(:first-child)').forEach(row => row.remove());
  const firstSessionRow = ui.sessionsContainer.firstElementChild;
  course.sessions.forEach((session, index) => {
    if (index === 0) {
      firstSessionRow.querySelector('.day').value = session.day;
      firstSessionRow.querySelector('.start').value = session.start;
      firstSessionRow.querySelector('.end').value = session.end;
    } else {
      addSessionRow(session);
    }
  });
}

function clearForm(shouldClearSelection = true) {
  if (shouldClearSelection) selectedCourseId = null;
  Object.keys(ui.form).forEach(key => {
    if (key !== 'noExam') ui.form[key].value = '';
  });
  ui.form.noExam.checked = false;
  ui.form.noExam.dispatchEvent(new Event('change'));

  ui.sessionsContainer.querySelectorAll('.session-row:not(:first-child)').forEach(row => row.remove());
  const firstRow = ui.sessionsContainer.firstElementChild;
  firstRow.querySelector('.day').value = DAYS[0];
  firstRow.querySelector('.start').value = '';
  firstRow.querySelector('.end').value = '';

  if (shouldClearSelection) renderTable();
}

// --------------------------- Core Logic & Actions ---------------------------
function checkClassConflict(sessions, ignoreCourseId = null) {
  for (const newSession of sessions) {
    const st = parseTimeToMinutes(newSession.start), en = parseTimeToMinutes(newSession.end);
    for (const course of courses) {
      if (course.id === ignoreCourseId) continue;
      for (const existingSession of course.sessions) {
        if (existingSession.day === newSession.day && overlap(st, en, parseTimeToMinutes(existingSession.start), parseTimeToMinutes(existingSession.end))) {
          return true;
        }
      }
    }
  }
  return false;
}

function examConflicts(candidateCourse, ignoreCourseId = null) {
  const out = [];
  if (!candidateCourse.exam_date || !candidateCourse.exam_time) return out;
  const a = new Date(`${candidateCourse.exam_date.replace(/-/g, '/')} ${normalizeTimeStr(candidateCourse.exam_time)}`);
  if (isNaN(a.getTime())) return out;
  const aEnd = new Date(a.getTime() + 120 * 60000); // 2-hour exam duration

  for (const c of courses) {
    if (c.id === ignoreCourseId || !c.exam_date || !c.exam_time) continue;
    const b = new Date(`${c.exam_date.replace(/-/g, '/')} ${normalizeTimeStr(c.exam_time)}`);
    if (isNaN(b.getTime())) continue;
    const bEnd = new Date(b.getTime() + 120 * 60000);
    if (Math.max(a.getTime(), b.getTime()) < Math.min(aEnd.getTime(), bEnd.getTime())) {
      out.push(c);
    }
  }
  return out;
}

async function addOrUpdateCourse() {
  try {
    const courseData = readForm();
    const existingCourseById = selectedCourseId ? courses.find(c => c.id === selectedCourseId) : null;

    if (existingCourseById) { // Update mode
      if (checkClassConflict(courseData.sessions, selectedCourseId)) return showToast('تداخل زمانی با کلاس دیگری وجود دارد.', 'error');
      const exams = examConflicts(courseData, selectedCourseId);
      if (exams.length && !confirm(`زمان امتحان این درس با «${exams.map(x => x.name).join(', ')}» تداخل دارد. آیا مطمئن هستید؟`)) return;
      Object.assign(existingCourseById, courseData);
      showToast('درس با موفقیت ویرایش شد.', 'success');
    } else { // Add new course mode
      const existingCourseByCode = courses.find(c => c.code === courseData.code);
      if (existingCourseByCode) return showToast(`درسی با کد «${courseData.code}» از قبل وجود دارد. برای ویرایش، آن را از جدول انتخاب کنید.`, 'error');
      if (checkClassConflict(courseData.sessions)) return showToast('تداخل زمانی با کلاس دیگری وجود دارد.', 'error');
      const exams = examConflicts(courseData);
      if (exams.length && !confirm(`زمان امتحان این درس با «${exams.map(x => x.name).join(', ')}» تداخل دارد. آیا مطمئن هستید؟`)) return;
      courses.push({ id: nextId++, ...courseData });
      showToast('درس با موفقیت افزوده شد.', 'success');
    }
    await ensureSave();
    renderAll();
    clearForm();
  } catch (e) {
    showToast(e.message || 'خطایی در پردازش اطلاعات رخ داد.', 'error');
  }
}

async function deleteSelected() {
  if (!selectedCourseId) return showToast('ابتدا یک درس را برای حذف انتخاب کنید.', 'info');
  try {
    const courseName = courses.find(c => c.id === selectedCourseId)?.name;
    if (!confirm(`از حذف درس «${courseName}» مطمئن هستید؟`)) return;
    courses = courses.filter(c => c.id !== selectedCourseId);
    await ensureSave();
    renderAll();
    clearForm();
    showToast('درس با موفقیت حذف شد.', 'success');
  } catch (e) {
    console.error("Delete Error:", e);
    showToast("خطا در هنگام حذف درس.", "error");
  }
}

function copyCourseCodes() {
  if (courses.length === 0) return showToast('درسی برای کپی وجود ندارد.', 'info');
  const textToCopy = [...new Map(courses.map(c => [c.code, `${c.code} - ${c.name}`])).values()].join('\n');
  navigator.clipboard.writeText(textToCopy)
    .then(() => showToast('کد و نام دروس در کلیپ‌بورد کپی شد.', 'success'))
    .catch(err => showToast('خطا در کپی کردن.', 'error'));
}

// --------------------------- Initialization ---------------------------
function loadFromLocal() {
  try {
    const raw = localStorage.getItem('scheduleData');
    if (!raw) return;
    const data = JSON.parse(raw);
    courses = data.courses || [];
    nextId = data.nextId || (Math.max(0, ...courses.map(c => c.id || 0)) + 1);
  } catch (e) {
    console.error("Local Storage Load Error:", e);
    showToast('اطلاعات ذخیره‌شده قبلی نامعتبر است و بارگذاری نشد.', 'error');
    localStorage.removeItem('scheduleData');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const essentialUI = { ...ui, ...ui.form };
  for (const key in essentialUI) {
    if (!essentialUI[key]) {
      const message = `خطای داخلی: عنصر ضروری صفحه (${key}) یافت نشد.`;
      console.error(message);
      showToast(message, 'error');
      return;
    }
  }

  const savedTheme = localStorage.getItem('theme') || 'dark';
  applyTheme(savedTheme);
  fillDayOptions(ui.sessionsContainer.querySelector('.day'));
  loadFromLocal();
  renderAll();

  // Event Listeners
  document.getElementById('btnAdd').onclick = addOrUpdateCourse;
  document.getElementById('btnDelete').onclick = deleteSelected;
  document.getElementById('btnCopyCodes').onclick = copyCourseCodes;
  document.getElementById('btnPickFile').onclick = pickSaveFile;
  document.getElementById('btnImportFile').onclick = importFromFile;
  document.getElementById('btnThemeToggle').onclick = toggleTheme;
  document.getElementById('btnExportPDF').onclick = () => exportAs('pdf');
  document.getElementById('btnExportPNG').onclick = () => exportAs('png');
  document.getElementById('btnExportJPEG').onclick = () => exportAs('jpeg');
  document.getElementById('btnAddSession').onclick = () => addSessionRow();

  ui.sessionsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-delete-session')) e.target.closest('.session-row').remove();
  });

  ui.form.noExam.addEventListener('change', () => {
    const isDisabled = ui.form.noExam.checked;
    ui.examFieldsContainer.classList.toggle('disabled', isDisabled);
    ['examDay', 'examMonth', 'examYear', 'examTime'].forEach(key => {
      ui.form[key].disabled = isDisabled;
      if (isDisabled) ui.form[key].value = '';
    });
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(renderAll, 150);
  });
});