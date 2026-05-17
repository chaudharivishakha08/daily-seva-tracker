import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  updateDoc,
  collection,
  where
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

const app = initializeApp(window.CONFIG.FIREBASE_CONFIG);
const db = getFirestore(app);

const META_COLLECTION = "app";
const META_DOC = "metadata";
const RESPONSES_COLLECTION = "responses";

function normalizeStudentKey(name) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function buildResponseId(date, studentName) {
  return `${date}__${normalizeStudentKey(studentName)}`;
}

async function ensureMetadataDoc() {
  const ref = doc(db, META_COLLECTION, META_DOC);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { extraStudents: [] });
    return { extraStudents: [] };
  }
  return snap.data();
}

export async function getStudents() {
  const meta = await ensureMetadataDoc();
  const extra = Array.isArray(meta.extraStudents) ? meta.extraStudents : [];
  return [...new Set([...window.CONFIG.DEFAULT_STUDENTS, ...extra])].sort((a, b) => a.localeCompare(b));
}

export async function addStudentRecord(name) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Student name is required");
  const students = await getStudents();
  if (students.some(student => student.toLowerCase() === trimmed.toLowerCase())) {
    throw new Error("Student already exists");
  }
  const ref = doc(db, META_COLLECTION, META_DOC);
  await updateDoc(ref, {
    extraStudents: arrayUnion(trimmed)
  });
}

export async function deleteStudentRecord(name) {
  if (window.CONFIG.DEFAULT_STUDENTS.includes(name)) {
    throw new Error("Default students cannot be removed");
  }
  const ref = doc(db, META_COLLECTION, META_DOC);
  await ensureMetadataDoc();
  await updateDoc(ref, {
    extraStudents: arrayRemove(name)
  });
}

export async function saveResponse(payload) {
  const response = {
    ...payload,
    timestamp: new Date().toISOString()
  };
  const ref = doc(db, RESPONSES_COLLECTION, buildResponseId(payload.date, payload.studentName));
  await setDoc(ref, response);
}

export async function getResponsesByDate(date) {
  const q = query(collection(db, RESPONSES_COLLECTION), where("date", "==", date));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map(entry => entry.data())
    .sort((a, b) => a.studentName.localeCompare(b.studentName));
}

export async function getResponsesByRange(from, to) {
  const q = query(
    collection(db, RESPONSES_COLLECTION),
    where("date", ">=", from),
    where("date", "<=", to)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map(entry => entry.data())
    .sort((a, b) => (a.date === b.date ? a.studentName.localeCompare(b.studentName) : a.date.localeCompare(b.date)));
}

export async function hasSubmitted(studentName, date) {
  const ref = doc(db, RESPONSES_COLLECTION, buildResponseId(date, studentName));
  const snap = await getDoc(ref);
  return snap.exists();
}
