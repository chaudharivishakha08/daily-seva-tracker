# 🕉 श्री स्वामी समर्थ — Seva Poll App

A simple, fast HTML/CSS/JS poll app to track daily seva (worship) of Shri Swami Samarth.  
Data is stored in **Google Sheets** via Google Apps Script (no server needed).

---

## 📁 File Structure

```
shri-swami-poll/
├── index.html              ← Login page (select student name)
├── poll.html               ← Poll page (select seva option)
├── results.html            ← Results page (table + pie chart)
├── style.css               ← Shared styles
├── config.js               ← 🔧 YOUR CONFIGURATION (edit this!)
├── google-apps-script.js   ← Paste this into Google Apps Script
├── .env.example            ← Reference for env variables
└── README.md               ← This file
```

---

## 🚀 Setup Instructions

### Step 1 — Create your Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it **"Shri Swami Samarth Poll"** (or any name)
4. The app will auto-create a **"Responses"** sheet with headers

---

### Step 2 — Set up Google Apps Script

1. Go to [script.google.com](https://script.google.com)
2. Click **"New Project"**
3. Delete the default code
4. Open `google-apps-script.js` from this folder and **paste the entire code**
5. Click **Deploy → New Deployment**
6. Choose type: **"Web App"**
7. Set:
   - Execute as: **"Me"**
   - Who has access: **"Anyone"**
8. Click **"Deploy"**
9. **Copy the Web App URL** (it looks like `https://script.google.com/macros/s/ABC123.../exec`)

---

### Step 3 — Configure the app

Open `config.js` and:

1. Paste your **Web App URL** into `APPS_SCRIPT_URL`
2. Edit the `STUDENTS` array to add your actual student names
3. Edit `SEVA_QUESTION` if today's date changes
4. The options (`SEVA_OPTIONS`) match the image — edit as needed

```js
const CONFIG = {
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/YOUR_ID/exec", // ← Paste here

  STUDENTS: [
    "Aarav Kulkarni",
    "Ananya Deshmukh",
    // Add more names...
  ],

  SEVA_QUESTION: "आजची (16/5/2026) श्री स्वामी समर्थ महाराजांची सेवा केली का?",

  SEVA_OPTIONS: [
    { id: "A", text: "होय ३ अध्याय वाचन व ११ माळी जप केला" },
    { id: "B", text: "फक्त ३ अध्याय श्री स्वामी चरीत्र क्रमशः वाचन केले" },
    { id: "C", text: "फक्त ११ माळी जप श्री स्वामी समर्थ मंत्रांचा केला" },
    { id: "D", text: "११ पेक्षा कमी माळी जप श्री स्वामी समर्थ मंत्रांचा केला" },
    { id: "E", text: "नाही — आज सेवा केली नाही" }
  ]
};
```

---

### Step 4 — Open the app

Simply open `index.html` in a browser. No server needed!

- For local use: double-click `index.html`
- For sharing: upload the folder to any web host (GitHub Pages, Netlify, etc.)

---

## 📊 How it works

| Page | What it does |
|------|-------------|
| `index.html` | Student selects their name from dropdown |
| `poll.html` | Student picks their seva option (A–E) |
| `results.html` | Shows all responses for a selected date — table + pie chart |

- **One response per student per day** — enforced via localStorage
- **Data saved to Google Sheets** — each row: Date, Name, Question, Option, Text, Timestamp
- **Offline fallback** — if Google Sheets is unreachable, saves locally

---

## 🔒 Permissions note

When you deploy the Apps Script, Google may ask you to authorize it.  
Accept the permissions — it only writes/reads your own Google Sheet.

---

## ✏️ Customizing

**To update the daily question:**  
Edit `SEVA_QUESTION` in `config.js` each day.

**To add/remove students:**  
Edit the `STUDENTS` array in `config.js`.

**To add more options:**  
Add entries to `SEVA_OPTIONS` in `config.js`. Use letters A, B, C, D, E...

---

## 🙏 जय स्वामी समर्थ!
