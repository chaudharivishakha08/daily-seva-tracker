// ============================================================
// CONFIG - Edit this file with your settings
// ============================================================

const CONFIG = {
  API_BASE_URL: "/api",

  // Admin users - only these names can access /results.html and /add-student.html
  ADMINS: ["Narendra Chaudhari", "Vishakha Chaudhari"],

  // Default student names
  DEFAULT_STUDENTS: [
    "Narendra Chaudhari",
    "Vishakha Chaudhari",
    "Yash Chaudhari",
    "Vandana Chaudhari",
    "Ujwal Chaudhari",
    "Hirnya Thakare",
    "Himanshi Jadhav",
    "Shravani Panmand",
    "Shruti Garud"
  ],

  // Poll question template - {date} is replaced automatically
  SEVA_QUESTION: "आजची ({date}) श्री स्वामी समर्थ महाराजांची सेवा केली का?",

  // Poll options
  SEVA_OPTIONS: [
    { id: "A", text: "होय ३ अध्याय वाचन व ११ माळी जप केला" },
    { id: "B", text: "फक्त ३ अध्याय श्री स्वामी चरित्र क्रमशः वाचन केले" },
    { id: "C", text: "फक्त ११ माळी जप श्री स्वामी समर्थ मंत्रांचा केला" },
    { id: "D", text: "११ पेक्षा कमी माळी जप श्री स्वामी समर्थ मंत्रांचा केला" },
    { id: "E", text: "नाही - आज सेवा केली नाही" }
  ]
};

async function apiFetch(path, options = {}) {
  const response = await fetch(`${CONFIG.API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

async function getStudents() {
  const data = await apiFetch("/students");
  return data.students || [];
}

async function addStudentRecord(name) {
  return apiFetch("/students", {
    method: "POST",
    body: JSON.stringify({ name })
  });
}

async function deleteStudentRecord(name) {
  return apiFetch(`/students?name=${encodeURIComponent(name)}`, {
    method: "DELETE"
  });
}

async function saveResponse(payload) {
  return apiFetch("/responses", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

async function getResponsesByDate(date) {
  const data = await apiFetch(`/responses?date=${encodeURIComponent(date)}`);
  return data.responses || [];
}

async function getResponsesByRange(from, to) {
  const data = await apiFetch(
    `/responses?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
  );
  return data.responses || [];
}

async function hasSubmitted(studentName, date) {
  const data = await apiFetch(
    `/submission-status?student=${encodeURIComponent(studentName)}&date=${encodeURIComponent(date)}`
  );
  return !!data.submitted;
}

function getTodayDisplay() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function getTodayISO() {
  return new Date().toISOString().split("T")[0];
}

function isAdmin() {
  const u = sessionStorage.getItem("currentStudent");
  return u && CONFIG.ADMINS.includes(u);
}

function showToast(msg, type = "") {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.className = "toast show " + type;
  setTimeout(() => {
    t.className = "toast";
  }, 3000);
}
