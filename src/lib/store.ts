import { useSyncExternalStore } from "react";

export type ID = string;
export type Term = 1 | 2 | 3;

export type School = {
  name: string;
  logo: string; // dataURL
  address: string;
  phone: string;
  email: string;
  motto: string;
};

export type User = {
  id: ID;
  name: string;
  email: string;
  password: string; // demo only — plain text in localStorage
  role: "admin" | "teacher";
  permissions: string[]; // route paths the teacher can access; ignored for admin
};

export type ClassRow = {
  id: ID;
  name: string;
  stream?: string;
  teacher?: string;
  room?: string;
  subjects: string[];
  feePerYear: number;
};

export type Student = {
  id: ID;
  admissionNo: string;
  name: string;
  gender: string;
  classId: ID;
  parent: string;
  phone: string;
  email?: string;
};

export type Exam = {
  id: ID;
  name: string;
  term: Term;
  year: number;
  date: string;
};

export type Mark = {
  id: ID;
  examId: ID;
  studentId: ID;
  subject: string;
  score: number; // 0-100
};

export type Payment = {
  id: ID;
  studentId: ID;
  term: Term;
  amount: number;
  date: string;
  method: string;
  ref?: string;
};

export type State = {
  school: School | null;
  users: User[];
  classes: ClassRow[];
  students: Student[];
  exams: Exam[];
  marks: Mark[];
  payments: Payment[];
  currentUserId: ID | null;
};

export const DEFAULT_SUBJECTS = [
  "Mathematics",
  "English",
  "Kiswahili",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Geography",
];

export const TEACHER_PERMISSION_OPTIONS: { path: string; label: string }[] = [
  { path: "/", label: "Dashboard" },
  { path: "/students", label: "Students" },
  { path: "/classes", label: "Classes" },
  { path: "/exams", label: "Exams" },
  { path: "/marks", label: "Marks entry" },
  { path: "/grades", label: "Grades & ranking" },
  { path: "/fees", label: "Fees" },
  { path: "/reports", label: "Reports" },
  { path: "/attendance", label: "Attendance" },
  { path: "/timetable", label: "Timetable" },
  { path: "/announcements", label: "Announcements" },
  { path: "/messages", label: "Messages" },
];

const DEFAULT_TEACHER_PERMISSIONS = [
  "/",
  "/students",
  "/classes",
  "/exams",
  "/marks",
  "/grades",
  "/reports",
];

const KEY = "sms-store-v1";

const emptyState: State = {
  school: null,
  users: [],
  classes: [],
  students: [],
  exams: [],
  marks: [],
  payments: [],
  currentUserId: null,
};

function load(): State {
  if (typeof window === "undefined") return emptyState;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyState;
    return { ...emptyState, ...JSON.parse(raw) };
  } catch {
    return emptyState;
  }
}

let state: State = load();
const listeners = new Set<() => void>();

function persist() {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  }
  listeners.forEach((l) => l());
}

function set(updater: (s: State) => State) {
  state = updater(state);
  persist();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function getSnapshot() {
  return state;
}

export function useStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export const uid = () =>
  (typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36));

// --- Auth ---
export function registerSchool(input: {
  school: School;
  admin: { name: string; email: string; password: string };
}) {
  const adminUser: User = {
    id: uid(),
    name: input.admin.name,
    email: input.admin.email.toLowerCase().trim(),
    password: input.admin.password,
    role: "admin",
    permissions: [],
  };
  set((s) => ({
    ...s,
    school: input.school,
    users: [adminUser],
    currentUserId: adminUser.id,
  }));
  return adminUser;
}

export function login(email: string, password: string): User | null {
  const e = email.toLowerCase().trim();
  const u = state.users.find((x) => x.email === e && x.password === password);
  if (!u) return null;
  set((s) => ({ ...s, currentUserId: u.id }));
  return u;
}

export function logout() {
  set((s) => ({ ...s, currentUserId: null }));
}

export function currentUser(): User | null {
  return state.users.find((u) => u.id === state.currentUserId) ?? null;
}

export function hasPermission(user: User | null, path: string): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  return user.permissions.includes(path);
}

// --- Users / teachers ---
export function addTeacher(input: { name: string; email: string; password: string }) {
  const t: User = {
    id: uid(),
    name: input.name,
    email: input.email.toLowerCase().trim(),
    password: input.password,
    role: "teacher",
    permissions: [...DEFAULT_TEACHER_PERMISSIONS],
  };
  set((s) => ({ ...s, users: [...s.users, t] }));
  return t;
}
export function updateUser(id: ID, patch: Partial<User>) {
  set((s) => ({ ...s, users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) }));
}
export function deleteUser(id: ID) {
  set((s) => ({ ...s, users: s.users.filter((u) => u.id !== id) }));
}

// --- Classes ---
export function addClass(c: Omit<ClassRow, "id">) {
  set((s) => ({ ...s, classes: [...s.classes, { ...c, id: uid() }] }));
}
export function updateClass(id: ID, patch: Partial<ClassRow>) {
  set((s) => ({
    ...s,
    classes: s.classes.map((c) => (c.id === id ? { ...c, ...patch } : c)),
  }));
}
export function deleteClass(id: ID) {
  set((s) => ({ ...s, classes: s.classes.filter((c) => c.id !== id) }));
}

// --- Students ---
export function addStudent(st: Omit<Student, "id">) {
  set((s) => ({ ...s, students: [...s.students, { ...st, id: uid() }] }));
}
export function updateStudent(id: ID, patch: Partial<Student>) {
  set((s) => ({
    ...s,
    students: s.students.map((x) => (x.id === id ? { ...x, ...patch } : x)),
  }));
}
export function deleteStudent(id: ID) {
  set((s) => ({
    ...s,
    students: s.students.filter((x) => x.id !== id),
    marks: s.marks.filter((m) => m.studentId !== id),
    payments: s.payments.filter((p) => p.studentId !== id),
  }));
}

// --- Exams ---
export function addExam(e: Omit<Exam, "id">) {
  set((s) => ({ ...s, exams: [...s.exams, { ...e, id: uid() }] }));
}
export function updateExam(id: ID, patch: Partial<Exam>) {
  set((s) => ({ ...s, exams: s.exams.map((e) => (e.id === id ? { ...e, ...patch } : e)) }));
}
export function deleteExam(id: ID) {
  set((s) => ({
    ...s,
    exams: s.exams.filter((e) => e.id !== id),
    marks: s.marks.filter((m) => m.examId !== id),
  }));
}

// --- Marks ---
export function setMark(input: { examId: ID; studentId: ID; subject: string; score: number }) {
  set((s) => {
    const idx = s.marks.findIndex(
      (m) =>
        m.examId === input.examId &&
        m.studentId === input.studentId &&
        m.subject === input.subject,
    );
    const next = [...s.marks];
    if (idx === -1) next.push({ ...input, id: uid() });
    else next[idx] = { ...next[idx], score: input.score };
    return { ...s, marks: next };
  });
}
export function deleteMark(id: ID) {
  set((s) => ({ ...s, marks: s.marks.filter((m) => m.id !== id) }));
}

// --- Payments ---
export function addPayment(p: Omit<Payment, "id">) {
  set((s) => ({ ...s, payments: [...s.payments, { ...p, id: uid() }] }));
}
export function updatePayment(id: ID, patch: Partial<Payment>) {
  set((s) => ({
    ...s,
    payments: s.payments.map((p) => (p.id === id ? { ...p, ...patch } : p)),
  }));
}
export function deletePayment(id: ID) {
  set((s) => ({ ...s, payments: s.payments.filter((p) => p.id !== id) }));
}

// --- School profile ---
export function updateSchool(patch: Partial<School>) {
  set((s) => ({ ...s, school: s.school ? { ...s.school, ...patch } : s.school }));
}

// --- Derivations ---
export function gradeFromScore(score: number): string {
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "E";
}

export function rankingForExam(examId: ID, classId?: ID) {
  const s = state;
  const students = classId ? s.students.filter((x) => x.classId === classId) : s.students;
  const rows = students.map((st) => {
    const ms = s.marks.filter((m) => m.examId === examId && m.studentId === st.id);
    const total = ms.reduce((a, b) => a + b.score, 0);
    const avg = ms.length ? total / ms.length : 0;
    return { student: st, total, avg, count: ms.length };
  });
  rows.sort((a, b) => b.avg - a.avg);
  return rows.map((r, i) => ({ ...r, rank: r.count ? i + 1 : 0 }));
}

export function feeStatusForStudent(studentId: ID) {
  const s = state;
  const st = s.students.find((x) => x.id === studentId);
  if (!st) return null;
  const cls = s.classes.find((c) => c.id === st.classId);
  const yearly = cls?.feePerYear ?? 0;
  const perTerm = yearly / 3;
  const byTerm: Record<Term, number> = { 1: 0, 2: 0, 3: 0 };
  for (const p of s.payments.filter((p) => p.studentId === studentId)) {
    byTerm[p.term] = (byTerm[p.term] ?? 0) + p.amount;
  }
  const paidTotal = byTerm[1] + byTerm[2] + byTerm[3];
  return {
    student: st,
    class: cls,
    byTerm,
    perTerm,
    yearly,
    paidTotal,
    balanceTotal: yearly - paidTotal,
  };
}

export const formatKES = (n: number) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(Math.round(n || 0));
