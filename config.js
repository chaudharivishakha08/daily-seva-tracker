// ============================================================
// CONFIG — Edit this file with your settings
// ============================================================

const CONFIG = {
  // Paste your deployed Google Apps Script Web App URL here
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbwnQ4NVqzmwlJsh6IrIbbZYzltmPwGHqrPXtMw8WLUrXJ1io_jeaNiJuRSIXRTO4Ojo/exec",

  // Admin users — only these names can access /results.html and /add-student.html
  ADMINS: ["Narendra Chaudhari", "Vishakha Chaudhari"],

  // Student names — this list is also stored in localStorage so Add Student page can update it
  DEFAULT_STUDENTS: [
    "Narendra Chaudhari",
    "Vishakha Chaudhari",
    "Yash Chaudhari",
    "Vandana Chaudhari",
    "Ujwal Chaudhari",
    "Hirnya Thakare",
    "Himanshi Jadhav",
    "Shravani Panmand",
    "Shruti Garud",
  ],

  // Poll question template — {date} is replaced automatically
  SEVA_QUESTION: "आजची ({date}) श्री स्वामी समर्थ महाराजांची सेवा केली का?",

  // Poll options
  SEVA_OPTIONS: [
    { id: "A", text: "होय ३ अध्याय वाचन व ११ माळी जप केला" },
    { id: "B", text: "फक्त ३ अध्याय श्री स्वामी चरीत्र क्रमशः वाचन केले" },
    { id: "C", text: "फक्त ११ माळी जप श्री स्वामी समर्थ मंत्रांचा केला" },
    { id: "D", text: "११ पेक्षा कमी माळी जप श्री स्वामी समर्थ मंत्रांचा केला" },
    { id: "E", text: "नाही — आज सेवा केली नाही" }
  ]
};

// Helper: get current student list (default + any added via Add Student page)
function getStudents() {
  const extra = JSON.parse(localStorage.getItem('extra_students') || '[]');
  const all = [...CONFIG.DEFAULT_STUDENTS, ...extra];
  return [...new Set(all)].sort();
}

// Helper: today's date as DD/MM/YYYY
function getTodayDisplay() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

// Helper: today as YYYY-MM-DD
function getTodayISO() {
  return new Date().toISOString().split('T')[0];
}

// Helper: check if logged-in user is admin
function isAdmin() {
  const u = sessionStorage.getItem('currentStudent');
  return u && CONFIG.ADMINS.includes(u);
}

// Helper: show toast
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast show ' + type;
  setTimeout(() => t.className = 'toast', 3000);
}
