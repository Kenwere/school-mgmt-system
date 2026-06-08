import { useSyncExternalStore } from "react";
import { toast } from "sonner";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";

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
  password: string; // demo only - plain text in Supabase
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
  feePerYear?: number;
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

const SCHOOL_ID = "default";

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

let state: State = emptyState;
const listeners = new Set<() => void>();
let hasWarnedAboutSupabase = false;
let hydratePromise: Promise<void> | null = null;

function notify() {
  listeners.forEach((l) => l());
}

function requireSupabase() {
  if (!supabase) {
    const message =
      "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart/redeploy.";
    if (!hasWarnedAboutSupabase && typeof window !== "undefined" && !isSupabaseConfigured) {
      hasWarnedAboutSupabase = true;
      toast.error(message);
      console.warn(message);
    }
    throw new Error(message);
  }
  return supabase;
}

function commit(nextState: State, message?: string) {
  state = nextState;
  notify();
  if (message) toast.success(message);
}

function showSupabaseError(action: string, error: { message: string }) {
  const message = `${action} failed: ${error.message}`;
  toast.error(message);
  throw new Error(message);
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

export function initializeStoreFromSupabase() {
  if (hydratePromise) return hydratePromise;

  hydratePromise = (async () => {
    const db = requireSupabase();

    const [schoolResult, usersResult, classesResult, studentsResult, examsResult, marksResult, paymentsResult] =
      await Promise.all([
        db.from("schools").select("*").eq("id", SCHOOL_ID).maybeSingle(),
        db.from("users").select("*").order("created_at", { ascending: true }),
        db.from("classes").select("*").order("created_at", { ascending: true }),
        db.from("students").select("*").order("created_at", { ascending: true }),
        db.from("exams").select("*").order("date", { ascending: false }),
        db.from("marks").select("*").order("created_at", { ascending: true }),
        db.from("payments").select("*").order("date", { ascending: false }),
      ]);

    const results = [schoolResult, usersResult, classesResult, studentsResult, examsResult, marksResult, paymentsResult];
    const failed = results.find((result) => result.error);
    if (failed?.error) showSupabaseError("Loading Supabase data", failed.error);

    commit({
      school: schoolResult.data
        ? {
            name: schoolResult.data.name,
            logo: schoolResult.data.logo ?? "",
            address: schoolResult.data.address ?? "",
            phone: schoolResult.data.phone ?? "",
            email: schoolResult.data.email ?? "",
            motto: schoolResult.data.motto ?? "",
          }
        : null,
      users: (usersResult.data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        password: row.password,
        role: row.role,
        permissions: row.permissions ?? [],
      })),
      classes: (classesResult.data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        stream: row.stream ?? undefined,
        teacher: row.teacher ?? undefined,
        room: row.room ?? undefined,
        subjects: row.subjects ?? [],
        feePerYear: Number(row.fee_per_year ?? 0),
      })),
      students: (studentsResult.data ?? []).map((row) => ({
        id: row.id,
        admissionNo: row.admission_no,
        name: row.name,
        gender: row.gender,
        classId: row.class_id ?? "",
        feePerYear: row.fee_per_year == null ? undefined : Number(row.fee_per_year),
        parent: row.parent,
        phone: row.phone,
        email: row.email ?? undefined,
      })),
      exams: (examsResult.data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        term: row.term as Term,
        year: row.year,
        date: row.date,
      })),
      marks: (marksResult.data ?? []).map((row) => ({
        id: row.id,
        examId: row.exam_id,
        studentId: row.student_id,
        subject: row.subject,
        score: Number(row.score ?? 0),
      })),
      payments: (paymentsResult.data ?? []).map((row) => ({
        id: row.id,
        studentId: row.student_id,
        term: row.term as Term,
        amount: Number(row.amount ?? 0),
        date: row.date,
        method: row.method,
        ref: row.ref ?? undefined,
      })),
      currentUserId: state.currentUserId,
    });
  })();

  return hydratePromise;
}

export async function syncStoreToSupabase() {
  hydratePromise = null;
  await initializeStoreFromSupabase();
  toast.success("Loaded latest data from Supabase");
}

export const uid = () =>
  (typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36));

// --- Auth ---
export async function registerSchool(input: {
  school: School;
  admin: { name: string; email: string; password: string };
}) {
  const db = requireSupabase();
  const adminUser: User = {
    id: uid(),
    name: input.admin.name,
    email: input.admin.email.toLowerCase().trim(),
    password: input.admin.password,
    role: "admin",
    permissions: [],
  };
  const now = new Date().toISOString();
  const schoolResult = await db.from("schools").upsert({
    id: SCHOOL_ID,
    name: input.school.name,
    logo: input.school.logo,
    address: input.school.address,
    phone: input.school.phone,
    email: input.school.email,
    motto: input.school.motto,
    updated_at: now,
  });
  if (schoolResult.error) showSupabaseError("School registration", schoolResult.error);

  const userResult = await db.from("users").insert({
    id: adminUser.id,
    school_id: SCHOOL_ID,
    name: adminUser.name,
    email: adminUser.email,
    password: adminUser.password,
    role: adminUser.role,
    permissions: adminUser.permissions,
    updated_at: now,
  });
  if (userResult.error) showSupabaseError("Admin registration", userResult.error);

  const nextState: State = {
    ...state,
    school: input.school,
    users: [adminUser],
    currentUserId: adminUser.id,
  };
  commit(nextState, "School saved to Supabase");
  return adminUser;
}

export function login(email: string, password: string): User | null {
  const e = email.toLowerCase().trim();
  const u = state.users.find((x) => x.email === e && x.password === password);
  if (!u) return null;
  commit({ ...state, currentUserId: u.id });
  return u;
}

export function logout() {
  commit({ ...state, currentUserId: null });
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
export async function addTeacher(input: { name: string; email: string; password: string }) {
  const db = requireSupabase();
  const t: User = {
    id: uid(),
    name: input.name,
    email: input.email.toLowerCase().trim(),
    password: input.password,
    role: "teacher",
    permissions: [...DEFAULT_TEACHER_PERMISSIONS],
  };
  const { error } = await db.from("users").insert({
    id: t.id,
    school_id: SCHOOL_ID,
    name: t.name,
    email: t.email,
    password: t.password,
    role: t.role,
    permissions: t.permissions,
    updated_at: new Date().toISOString(),
  });
  if (error) showSupabaseError("Creating teacher", error);
  commit({ ...state, users: [...state.users, t] }, `Teacher "${t.name}" created`);
  return t;
}
export async function updateUser(id: ID, patch: Partial<User>) {
  const db = requireSupabase();
  const dbPatch = {
    ...(patch.name !== undefined ? { name: patch.name } : {}),
    ...(patch.email !== undefined ? { email: patch.email.toLowerCase().trim() } : {}),
    ...(patch.password !== undefined ? { password: patch.password } : {}),
    ...(patch.role !== undefined ? { role: patch.role } : {}),
    ...(patch.permissions !== undefined ? { permissions: patch.permissions } : {}),
    updated_at: new Date().toISOString(),
  };
  const { error } = await db.from("users").update(dbPatch).eq("id", id);
  if (error) showSupabaseError("Updating user", error);
  commit({ ...state, users: state.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) }, "User updated");
}
export async function deleteUser(id: ID) {
  const db = requireSupabase();
  const user = state.users.find((u) => u.id === id);
  const { error } = await db.from("users").delete().eq("id", id);
  if (error) showSupabaseError("Deleting teacher", error);
  commit({ ...state, users: state.users.filter((u) => u.id !== id) }, `Teacher "${user?.name ?? "user"}" deleted`);
}

// --- Classes ---
export async function addClass(c: Omit<ClassRow, "id">) {
  const db = requireSupabase();
  const item = { ...c, id: uid() };
  const { error } = await db.from("classes").insert({
    id: item.id,
    school_id: SCHOOL_ID,
    name: item.name,
    stream: item.stream ?? null,
    teacher: item.teacher ?? null,
    room: item.room ?? null,
    subjects: item.subjects,
    fee_per_year: item.feePerYear,
    updated_at: new Date().toISOString(),
  });
  if (error) showSupabaseError("Creating class", error);
  commit({ ...state, classes: [...state.classes, item] }, `Class "${c.name}" created`);
}
export async function updateClass(id: ID, patch: Partial<ClassRow>) {
  const db = requireSupabase();
  const dbPatch = {
    ...(patch.name !== undefined ? { name: patch.name } : {}),
    ...(patch.stream !== undefined ? { stream: patch.stream ?? null } : {}),
    ...(patch.teacher !== undefined ? { teacher: patch.teacher ?? null } : {}),
    ...(patch.room !== undefined ? { room: patch.room ?? null } : {}),
    ...(patch.subjects !== undefined ? { subjects: patch.subjects } : {}),
    ...(patch.feePerYear !== undefined ? { fee_per_year: patch.feePerYear } : {}),
    updated_at: new Date().toISOString(),
  };
  const { error } = await db.from("classes").update(dbPatch).eq("id", id);
  if (error) showSupabaseError("Updating class", error);
  commit({ ...state, classes: state.classes.map((c) => (c.id === id ? { ...c, ...patch } : c)) }, `Class "${patch.name ?? "record"}" updated`);
}
export async function deleteClass(id: ID) {
  const db = requireSupabase();
  const item = state.classes.find((c) => c.id === id);
  const { error } = await db.from("classes").delete().eq("id", id);
  if (error) showSupabaseError("Deleting class", error);
  commit({ ...state, classes: state.classes.filter((c) => c.id !== id) }, `Class "${item?.name ?? "record"}" deleted`);
}

// --- Students ---
export async function addStudent(st: Omit<Student, "id">) {
  const db = requireSupabase();
  const item = { ...st, id: uid() };
  const { error } = await db.from("students").insert({
    id: item.id,
    school_id: SCHOOL_ID,
    admission_no: item.admissionNo,
    name: item.name,
    gender: item.gender,
    class_id: item.classId || null,
    fee_per_year: item.feePerYear ?? null,
    parent: item.parent,
    phone: item.phone,
    email: item.email ?? null,
    updated_at: new Date().toISOString(),
  });
  if (error) showSupabaseError("Creating student", error);
  commit({ ...state, students: [...state.students, item] }, `Student "${st.name}" created`);
}
export async function updateStudent(id: ID, patch: Partial<Student>) {
  const db = requireSupabase();
  const dbPatch = {
    ...(patch.admissionNo !== undefined ? { admission_no: patch.admissionNo } : {}),
    ...(patch.name !== undefined ? { name: patch.name } : {}),
    ...(patch.gender !== undefined ? { gender: patch.gender } : {}),
    ...(patch.classId !== undefined ? { class_id: patch.classId || null } : {}),
    ...(patch.feePerYear !== undefined ? { fee_per_year: patch.feePerYear ?? null } : {}),
    ...(patch.parent !== undefined ? { parent: patch.parent } : {}),
    ...(patch.phone !== undefined ? { phone: patch.phone } : {}),
    ...(patch.email !== undefined ? { email: patch.email ?? null } : {}),
    updated_at: new Date().toISOString(),
  };
  const { error } = await db.from("students").update(dbPatch).eq("id", id);
  if (error) showSupabaseError("Updating student", error);
  commit({ ...state, students: state.students.map((x) => (x.id === id ? { ...x, ...patch } : x)) }, `Student "${patch.name ?? "record"}" updated`);
}
export async function deleteStudent(id: ID) {
  const db = requireSupabase();
  const item = state.students.find((x) => x.id === id);
  const { error } = await db.from("students").delete().eq("id", id);
  if (error) showSupabaseError("Deleting student", error);
  commit({
    ...state,
    students: state.students.filter((x) => x.id !== id),
    marks: state.marks.filter((m) => m.studentId !== id),
    payments: state.payments.filter((p) => p.studentId !== id),
  }, `Student "${item?.name ?? "record"}" deleted`);
}

// --- Exams ---
export async function addExam(e: Omit<Exam, "id">) {
  const db = requireSupabase();
  const item = { ...e, id: uid() };
  const { error } = await db.from("exams").insert({
    id: item.id,
    school_id: SCHOOL_ID,
    name: item.name,
    term: item.term,
    year: item.year,
    date: item.date,
    updated_at: new Date().toISOString(),
  });
  if (error) showSupabaseError("Creating exam", error);
  commit({ ...state, exams: [...state.exams, item] }, `Exam "${e.name}" created`);
}
export async function updateExam(id: ID, patch: Partial<Exam>) {
  const db = requireSupabase();
  const dbPatch = {
    ...(patch.name !== undefined ? { name: patch.name } : {}),
    ...(patch.term !== undefined ? { term: patch.term } : {}),
    ...(patch.year !== undefined ? { year: patch.year } : {}),
    ...(patch.date !== undefined ? { date: patch.date } : {}),
    updated_at: new Date().toISOString(),
  };
  const { error } = await db.from("exams").update(dbPatch).eq("id", id);
  if (error) showSupabaseError("Updating exam", error);
  commit({ ...state, exams: state.exams.map((e) => (e.id === id ? { ...e, ...patch } : e)) }, "Exam updated");
}
export async function deleteExam(id: ID) {
  const db = requireSupabase();
  const item = state.exams.find((e) => e.id === id);
  const { error } = await db.from("exams").delete().eq("id", id);
  if (error) showSupabaseError("Deleting exam", error);
  commit({
    ...state,
    exams: state.exams.filter((e) => e.id !== id),
    marks: state.marks.filter((m) => m.examId !== id),
  }, `Exam "${item?.name ?? "record"}" deleted`);
}

// --- Marks ---
export async function setMark(input: { examId: ID; studentId: ID; subject: string; score: number }) {
  const db = requireSupabase();
  const existing = state.marks.find(
    (m) => m.examId === input.examId && m.studentId === input.studentId && m.subject === input.subject,
  );
  const item: Mark = existing ? { ...existing, score: input.score } : { ...input, id: uid() };
  const { error } = await db.from("marks").upsert({
    id: item.id,
    school_id: SCHOOL_ID,
    exam_id: item.examId,
    student_id: item.studentId,
    subject: item.subject,
    score: item.score,
    updated_at: new Date().toISOString(),
  }, { onConflict: "exam_id,student_id,subject" });
  if (error) showSupabaseError("Saving mark", error);
  const nextMarks = existing
    ? state.marks.map((m) => (m.id === item.id ? item : m))
    : [...state.marks, item];
  commit({ ...state, marks: nextMarks }, `Saved ${input.subject}: ${input.score}`);
}
export async function deleteMark(id: ID) {
  const db = requireSupabase();
  const { error } = await db.from("marks").delete().eq("id", id);
  if (error) showSupabaseError("Deleting mark", error);
  commit({ ...state, marks: state.marks.filter((m) => m.id !== id) }, "Mark deleted");
}

// --- Payments ---
export async function addPayment(p: Omit<Payment, "id">) {
  const db = requireSupabase();
  const item = { ...p, id: uid() };
  const { error } = await db.from("payments").insert({
    id: item.id,
    school_id: SCHOOL_ID,
    student_id: item.studentId,
    term: item.term,
    amount: item.amount,
    date: item.date,
    method: item.method,
    ref: item.ref ?? null,
    updated_at: new Date().toISOString(),
  });
  if (error) showSupabaseError("Recording payment", error);
  commit({ ...state, payments: [...state.payments, item] }, `Payment of ${formatKES(p.amount)} recorded`);
}
export async function updatePayment(id: ID, patch: Partial<Payment>) {
  const db = requireSupabase();
  const dbPatch = {
    ...(patch.studentId !== undefined ? { student_id: patch.studentId } : {}),
    ...(patch.term !== undefined ? { term: patch.term } : {}),
    ...(patch.amount !== undefined ? { amount: patch.amount } : {}),
    ...(patch.date !== undefined ? { date: patch.date } : {}),
    ...(patch.method !== undefined ? { method: patch.method } : {}),
    ...(patch.ref !== undefined ? { ref: patch.ref ?? null } : {}),
    updated_at: new Date().toISOString(),
  };
  const { error } = await db.from("payments").update(dbPatch).eq("id", id);
  if (error) showSupabaseError("Updating payment", error);
  commit({ ...state, payments: state.payments.map((p) => (p.id === id ? { ...p, ...patch } : p)) }, "Payment updated");
}
export async function deletePayment(id: ID) {
  const db = requireSupabase();
  const { error } = await db.from("payments").delete().eq("id", id);
  if (error) showSupabaseError("Deleting payment", error);
  commit({ ...state, payments: state.payments.filter((p) => p.id !== id) }, "Payment deleted");
}

// --- School profile ---
export async function updateSchool(patch: Partial<School>) {
  const db = requireSupabase();
  const nextSchool = state.school ? { ...state.school, ...patch } : null;
  if (!nextSchool) return;
  const { error } = await db.from("schools").upsert({
    id: SCHOOL_ID,
    name: nextSchool.name,
    logo: nextSchool.logo,
    address: nextSchool.address,
    phone: nextSchool.phone,
    email: nextSchool.email,
    motto: nextSchool.motto,
    updated_at: new Date().toISOString(),
  });
  if (error) showSupabaseError("Updating school profile", error);
  commit({ ...state, school: nextSchool }, "School profile updated");
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
  const yearly = st.feePerYear ?? cls?.feePerYear ?? 0;
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
