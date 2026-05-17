// ============================================================
// Google Apps Script — Deploy as Web App
// Steps:
//   1. Go to script.google.com → New Project
//   2. Paste this entire code
//   3. Deploy → New Deployment → Web App
//   4. Execute as: Me | Who has access: Anyone
//   5. Copy the Web App URL into config.js → APPS_SCRIPT_URL
// ============================================================

const SHEET_NAME = "Responses";

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["Date", "Student Name", "Question", "Selected Option", "Option Text", "Timestamp"]);
    sheet.getRange(1, 1, 1, 6).setFontWeight("bold").setBackground("#F97316").setFontColor("white");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// POST — save a response
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet();
    sheet.appendRow([
      data.date,
      data.studentName,
      data.question,
      data.selectedOption,
      data.optionText,
      new Date().toISOString()
    ]);
    return json({ success: true });
  } catch (err) {
    return json({ success: false, error: err.message });
  }
}

// GET — fetch responses
// Params:
//   ?date=YYYY-MM-DD          → single date
//   ?from=YYYY-MM-DD&to=YYYY-MM-DD → date range
function doGet(e) {
  try {
    const sheet = getOrCreateSheet();
    const rows = sheet.getDataRange().getValues();

    if (rows.length <= 1) return json({ success: true, data: [] });

    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      return obj;
    });

    const singleDate = e.parameter.date;
    const fromDate   = e.parameter.from;
    const toDate     = e.parameter.to;

    let filtered = data;

    if (singleDate) {
      filtered = data.filter(r => r["Date"] === singleDate);
    } else if (fromDate && toDate) {
      filtered = data.filter(r => r["Date"] >= fromDate && r["Date"] <= toDate);
    }

    return json({ success: true, data: filtered });
  } catch (err) {
    return json({ success: false, error: err.message });
  }
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
