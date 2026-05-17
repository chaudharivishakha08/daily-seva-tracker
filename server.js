const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const HOST = "0.0.0.0";
const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;
const DATA_DIR = process.env.DATA_DIR || ROOT_DIR;
const DATA_FILE = path.join(DATA_DIR, "data.json");

const DEFAULT_STUDENTS = [
  "Narendra Chaudhari",
  "Vishakha Chaudhari",
  "Yash Chaudhari",
  "Vandana Chaudhari",
  "Ujwal Chaudhari",
  "Hirnya Thakare",
  "Himanshi Jadhav",
  "Shravani Panmand",
  "Shruti Garud"
];

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    const initial = { extraStudents: [], responses: [] };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), "utf8");
  }
}

function readData() {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, "utf8");
  const parsed = JSON.parse(raw || "{}");
  return {
    extraStudents: Array.isArray(parsed.extraStudents) ? parsed.extraStudents : [],
    responses: Array.isArray(parsed.responses) ? parsed.responses : []
  };
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8"
  });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", chunk => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error("Request body too large"));
      }
    });
    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function getAllStudents(data) {
  return [...new Set([...DEFAULT_STUDENTS, ...data.extraStudents])].sort((a, b) =>
    a.localeCompare(b)
  );
}

function normalizeResponse(row) {
  return {
    date: row.date,
    studentName: row.studentName,
    question: row.question,
    selectedOption: row.selectedOption,
    optionText: row.optionText,
    timestamp: row.timestamp || new Date().toISOString()
  };
}

async function handleApi(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/students") {
    const data = readData();
    sendJson(res, 200, { students: getAllStudents(data), extraStudents: data.extraStudents });
    return true;
  }

  if (req.method === "POST" && url.pathname === "/api/students") {
    const body = await readBody(req);
    const name = String(body.name || "").trim();
    if (!name) {
      sendJson(res, 400, { error: "Student name is required" });
      return true;
    }

    const data = readData();
    const allStudents = getAllStudents(data).map(n => n.toLowerCase());
    if (allStudents.includes(name.toLowerCase())) {
      sendJson(res, 400, { error: "Student already exists" });
      return true;
    }

    data.extraStudents.push(name);
    data.extraStudents.sort((a, b) => a.localeCompare(b));
    writeData(data);
    sendJson(res, 201, { success: true, students: getAllStudents(data) });
    return true;
  }

  if (req.method === "DELETE" && url.pathname === "/api/students") {
    const name = String(url.searchParams.get("name") || "").trim();
    if (!name) {
      sendJson(res, 400, { error: "Student name is required" });
      return true;
    }

    const data = readData();
    if (DEFAULT_STUDENTS.includes(name)) {
      sendJson(res, 400, { error: "Default students cannot be removed" });
      return true;
    }

    data.extraStudents = data.extraStudents.filter(student => student !== name);
    writeData(data);
    sendJson(res, 200, { success: true, students: getAllStudents(data) });
    return true;
  }

  if (req.method === "GET" && url.pathname === "/api/responses") {
    const data = readData();
    const date = url.searchParams.get("date");
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");

    let responses = data.responses;
    if (date) {
      responses = responses.filter(row => row.date === date);
    } else if (from && to) {
      responses = responses.filter(row => row.date >= from && row.date <= to);
    }

    responses = responses
      .slice()
      .sort((a, b) => (a.date === b.date ? a.studentName.localeCompare(b.studentName) : a.date.localeCompare(b.date)));

    sendJson(res, 200, { responses });
    return true;
  }

  if (req.method === "POST" && url.pathname === "/api/responses") {
    const body = await readBody(req);
    const requiredFields = ["date", "studentName", "question", "selectedOption", "optionText"];
    const missingField = requiredFields.find(field => !String(body[field] || "").trim());

    if (missingField) {
      sendJson(res, 400, { error: `Missing field: ${missingField}` });
      return true;
    }

    const data = readData();
    const normalized = normalizeResponse(body);
    const existingIndex = data.responses.findIndex(
      row => row.date === normalized.date && row.studentName === normalized.studentName
    );

    if (existingIndex >= 0) {
      data.responses[existingIndex] = normalized;
    } else {
      data.responses.push(normalized);
    }

    writeData(data);
    sendJson(res, 200, { success: true, response: normalized });
    return true;
  }

  if (req.method === "GET" && url.pathname === "/api/submission-status") {
    const student = String(url.searchParams.get("student") || "").trim();
    const date = String(url.searchParams.get("date") || "").trim();
    if (!student || !date) {
      sendJson(res, 400, { error: "student and date are required" });
      return true;
    }

    const data = readData();
    const submitted = data.responses.some(
      row => row.studentName === student && row.date === date
    );
    sendJson(res, 200, { submitted });
    return true;
  }

  return false;
}

function serveStatic(req, res, url) {
  let relativePath = url.pathname === "/" ? "/index.html" : url.pathname;
  relativePath = path.normalize(relativePath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(ROOT_DIR, relativePath);

  if (!filePath.startsWith(ROOT_DIR)) {
    sendJson(res, 403, { error: "Forbidden" });
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === "ENOENT") {
        sendJson(res, 404, { error: "Not found" });
        return;
      }
      sendJson(res, 500, { error: "Unable to read file" });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream"
    });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname.startsWith("/api/")) {
      const handled = await handleApi(req, res, url);
      if (!handled) {
        sendJson(res, 404, { error: "API route not found" });
      }
      return;
    }

    serveStatic(req, res, url);
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Internal server error" });
  }
});

ensureDataFile();
server.listen(PORT, HOST, () => {
  console.log(`Seva tracker running at http://localhost:${PORT}`);
});
