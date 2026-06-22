window.CONFIG = {
  // Replace this with your Firebase web app config from Firebase Console.
  FIREBASE_CONFIG:  {
  apiKey: "AIzaSyDwyiWjbdjwELChhDuR5TadGFJxvOHPYgk",
  authDomain: "daily-seva-tracker-e536d.firebaseapp.com",
  projectId: "daily-seva-tracker-e536d",
  storageBucket: "daily-seva-tracker-e536d.firebasestorage.app",
  messagingSenderId: "60811160636",
  appId: "1:60811160636:web:c7489e358eba013800a739",
  measurementId: "G-QCFJR9G2TX"
},

  ADMINS: ["Narendra Chaudhari", "Vishakha Chaudhari"],

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
    "Kanchan",
    "Disha Kokane",
    "Goyank Kurkure",
    "Himanshi Jadhav",
    "Hirnya Thakare",
    "Shravani Panmand",
    "Shruti Garud",
    "Nishna",
    "Shravani Pardeshi",
    "Sukruta",
    "Swara",
    "Trisha",
    "Arya",
    "Jay",
    "Krishna",
    "Mansi",
    "Meenal",
    "Shlok Mhatre",
    "Prasad",
    "Shreyash",
    "Tejas",
    "Tulya",
    "Yukta"

  ],

  POLL_QUESTIONS: [
    {
      id: "seva",
      title: "आजचा प्रश्न",
      text: "आजची ({date}) श्री स्वामी समर्थ महाराजांची सेवा केली का?",
      options: [
        { id: "A", label: "होय ३ अध्याय वाचन व ११ माळी जप केला" },
        { id: "B", label: "फक्त ३ अध्याय श्री स्वामी चरित्र क्रमशः वाचन केले" },
        { id: "C", label: "फक्त ११ माळी जप श्री स्वामी समर्थ मंत्रांचा केला" },
        { id: "D", label: "११ पेक्षा कमी माळी जप श्री स्वामी समर्थ मंत्रांचा केला" },
        { id: "E", label: "नाही - आज सेवा केली नाही" }
      ]
    },
    {
      id: "parents_namaskar",
      title: "आजचा प्रश्न",
      text: "आज आई वडिलांना नमस्कार केला का ?",
      options: [
        { id: "yes", label: "होय" },
        { id: "no", label: "नाही" }
      ]
    }
  ],

  YES_NO_OPTIONS: [
    { id: "yes", label: "होय" },
    { id: "no", label: "नाही" }
  ],

  SEVA_QUESTION: "आजची ({date}) श्री स्वामी समर्थ महाराजांची सेवा केली का?",

  SEVA_OPTIONS: [
    { id: "A", text: "होय ३ अध्याय वाचन व ११ माळी जप केला" },
    { id: "B", text: "फक्त ३ अध्याय श्री स्वामी चरित्र क्रमशः वाचन केले" },
    { id: "C", text: "फक्त ११ माळी जप श्री स्वामी समर्थ मंत्रांचा केला" },
    { id: "D", text: "११ पेक्षा कमी माळी जप श्री स्वामी समर्थ मंत्रांचा केला" },
    { id: "E", text: "नाही - आज सेवा केली नाही" }
  ]
};

window.getTodayDisplay = function getTodayDisplay() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

window.getTodayISO = function getTodayISO() {
  return new Date().toISOString().split("T")[0];
};

window.isAdmin = function isAdmin() {
  const u = sessionStorage.getItem("currentStudent");
  return u && window.CONFIG.ADMINS.includes(u);
};

window.showToast = function showToast(msg, type = "") {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.className = "toast show " + type;
  setTimeout(() => {
    t.className = "toast";
  }, 3000);
};
