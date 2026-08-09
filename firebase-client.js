import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  getDocs,
  initializeFirestore,
  query,
  setDoc,
  updateDoc,
  writeBatch,
  collection,
  where
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const app = initializeApp(window.CONFIG.FIREBASE_CONFIG);

// Forces Firebase to use standard network polling, bypassing local client block errors
const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
});

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
    await setDoc(ref, { extraStudents: [], removedStudents: [], studentAliases: [] });
    return { extraStudents: [], removedStudents: [], studentAliases: [] };
  }
  return snap.data();
}

function parseStudentAlias(entry) {
  if (typeof entry !== "string") return null;
  const [from, to] = entry.split("|||");
  if (!from || !to) return null;
  return { from, to };
}

function buildStudentAliasMap(meta, students) {
  const aliases = Array.isArray(meta.studentAliases) ? meta.studentAliases : [];
  const aliasMap = new Map();

  aliases
    .map(parseStudentAlias)
    .filter(Boolean)
    .forEach(alias => aliasMap.set(alias.from.toLowerCase(), alias.to));

  const removed = Array.isArray(meta.removedStudents) ? meta.removedStudents : [];
  removed.forEach(removedName => {
    if (aliasMap.has(removedName.toLowerCase())) return;
    const inferredName = students.find(student => removedName.toLowerCase().startsWith(`${student.toLowerCase()} `));
    if (inferredName) aliasMap.set(removedName.toLowerCase(), inferredName);
  });

  return aliasMap;
}

function applyStudentAliases(rows, meta, students) {
  const aliasMap = buildStudentAliasMap(meta, students);
  return rows.map(row => ({
    ...row,
    studentName: aliasMap.get(row.studentName.toLowerCase()) || row.studentName
  }));
}

export async function getStudents() {
  const meta = await ensureMetadataDoc();
  const extra = Array.isArray(meta.extraStudents) ? meta.extraStudents : [];
  const removed = Array.isArray(meta.removedStudents) ? meta.removedStudents : [];
  const removedSet = new Set(removed.map(student => student.toLowerCase()));
  const defaultStudents = window.CONFIG.DEFAULT_STUDENTS.filter(student => !removedSet.has(student.toLowerCase()));
  return [...new Set([...defaultStudents, ...extra])].sort((a, b) => a.localeCompare(b));
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
  const ref = doc(db, META_COLLECTION, META_DOC);
  await ensureMetadataDoc();
  const updates = { extraStudents: arrayRemove(name) };
  if (window.CONFIG.DEFAULT_STUDENTS.some(student => student.toLowerCase() === name.toLowerCase())) {
    updates.removedStudents = arrayUnion(name);
  }
  await updateDoc(ref, updates);
}

export async function renameStudentRecord(oldName, newName) {
  const oldTrimmed = oldName.trim();
  const newTrimmed = newName.trim();
  if (!oldTrimmed || !newTrimmed) throw new Error("Student name is required");
  if (oldTrimmed === newTrimmed) return;

  const students = await getStudents();
  if (students.some(student => student.toLowerCase() === newTrimmed.toLowerCase() && student.toLowerCase() !== oldTrimmed.toLowerCase())) {
    throw new Error("Student already exists");
  }

  const oldIsDefault = window.CONFIG.DEFAULT_STUDENTS.includes(oldTrimmed);
  const newIsDefault = window.CONFIG.DEFAULT_STUDENTS.includes(newTrimmed);

  await ensureMetadataDoc();
  const responsesQuery = query(collection(db, RESPONSES_COLLECTION), where("studentName", "==", oldTrimmed));
  const snapshot = await getDocs(responsesQuery);

  if (!snapshot.empty) {
    let batch = writeBatch(db);
    let operationCount = 0;
    for (const entry of snapshot.docs) {
      const response = { ...entry.data(), studentName: newTrimmed };
      const newRef = doc(db, RESPONSES_COLLECTION, buildResponseId(response.date, newTrimmed));
      if (newRef.id === entry.ref.id) {
        batch.set(entry.ref, response);
        operationCount += 1;
      } else {
        batch.set(newRef, response);
        batch.delete(entry.ref);
        operationCount += 2;
      }

      if (operationCount >= 450) {
        await batch.commit();
        batch = writeBatch(db);
        operationCount = 0;
      }
    }
    if (operationCount > 0) await batch.commit();
  }

  const metaRef = doc(db, META_COLLECTION, META_DOC);
  const removalUpdates = {};
  const additionUpdates = {};
  if (!oldIsDefault) removalUpdates.extraStudents = arrayRemove(oldTrimmed);
  if (newIsDefault) removalUpdates.removedStudents = arrayRemove(newTrimmed);
  if (oldIsDefault) additionUpdates.removedStudents = arrayUnion(oldTrimmed);
  if (!newIsDefault) additionUpdates.extraStudents = arrayUnion(newTrimmed);
  additionUpdates.studentAliases = arrayUnion(`${oldTrimmed}|||${newTrimmed}`);

  if (Object.keys(removalUpdates).length) {
    await updateDoc(metaRef, removalUpdates);
  }
  if (Object.keys(additionUpdates).length) {
    await updateDoc(metaRef, additionUpdates);
  }
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
  const [snapshot, meta, students] = await Promise.all([getDocs(q), ensureMetadataDoc(), getStudents()]);
  return applyStudentAliases(snapshot.docs
    .map(entry => entry.data())
    .sort((a, b) => a.studentName.localeCompare(b.studentName)), meta, students);
}

export async function getResponsesByRange(from, to) {
  const q = query(
    collection(db, RESPONSES_COLLECTION),
    where("date", ">=", from),
    where("date", "<=", to)
  );
  const [snapshot, meta, students] = await Promise.all([getDocs(q), ensureMetadataDoc(), getStudents()]);
  return applyStudentAliases(snapshot.docs
    .map(entry => entry.data())
    .sort((a, b) => (a.date === b.date ? a.studentName.localeCompare(b.studentName) : a.date.localeCompare(b.date))), meta, students);
}

export async function hasSubmitted(studentName, date) {
  const meta = await ensureMetadataDoc();
  const students = await getStudents();
  const aliasMap = buildStudentAliasMap(meta, students);
  const possibleNames = [studentName];
  aliasMap.forEach((to, from) => {
    if (to.toLowerCase() === studentName.toLowerCase()) possibleNames.push(from);
  });

  const checks = await Promise.all(
    possibleNames.map(name => getDoc(doc(db, RESPONSES_COLLECTION, buildResponseId(date, name))))
  );
  return checks.some(snap => snap.exists());
}
