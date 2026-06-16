import { useSyncExternalStore } from "react";
import { toast } from "sonner";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";

export type ID = string;
export type Term = 1 | 2 | 3;

export type School = {
  name: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  motto: string;
};

export type User = {
  id: ID;
  name: string;
  email: string;
  password: string;
  role: "admin" | "teacher";
  permissions: string[];
};

export type ClassRow = {
  id: ID;
  name: string;
  stream?: string;
  teacher?: string;
  room?: string;
  subjects: string[];
  feeTerm1: number;
  feeTerm2: number;
  feeTerm3: number;
  feePerYear: number;
};

export type Student = {
  id: ID;
  admissionNo: string;
  name: string;
  gender: string;
  classId: ID;
  active: boolean;
  feePerYear?: number;
  image?: string;
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
  classId?: ID;
};

export type Mark = {
  id: ID;
  examId: ID;
  studentId: ID;
  subject: string;
  score: number;
};

export type Payment = {
  id: ID;
  studentId: ID;
  amount: number;
  date: string;
  method: string;
  ref?: string;
};

export type FeeLedgerEntry = {
  id: ID;
  studentId: ID;
  type: "debit" | "credit";
  description: string;
  amount: number;
  date: string;
  paymentId?: ID;
};

export type AttendanceRecord = {
  id: ID;
  studentId: ID;
  weekStart: string;
  status: "present" | "absent" | "late" | "leave";
};

export type TimetableEntry = {
  id: ID;
  classId: ID;
  day: string;
  timeSlot: string;
  subject: string;
};

export type State = {
  school: School | null;
  users: User[];
  classes: ClassRow[];
  students: Student[];
  exams: Exam[];
  marks: Mark[];
  payments: Payment[];
  feeLedger: FeeLedgerEntry[];
  attendance: AttendanceRecord[];
  timetableEntries: TimetableEntry[];
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
  { path: "/ranking", label: "Ranking" },
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
  "/ranking",
];

const SCHOOL_ID = "default";

const LS_KEY = "school_mgmt_user_id";

function loadUserId(): ID | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(LS_KEY);
  } catch {
    return null;
  }
}

function saveUserId(id: ID | null) {
  if (typeof window === "undefined") return;
  try {
    if (id) localStorage.setItem(LS_KEY, id);
    else localStorage.removeItem(LS_KEY);
  } catch { }
}

const emptyState: State = {
  school: null,
  users: [],
  classes: [],
  students: [],
  exams: [],
  marks: [],
  payments: [],
  feeLedger: [],
  attendance: [],
  timetableEntries: [],
  currentUserId: loadUserId(),
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

    const [schoolResult, usersResult, classesResult, studentsResult, examsResult, marksResult, paymentsResult, feeLedgerResult, attendanceResult, timetableResult] =
      await Promise.all([
        db.from("schools").select("*").eq("id", SCHOOL_ID).maybeSingle(),
        db.from("users").select("*").order("created_at", { ascending: true }),
        db.from("classes").select("*").order("created_at", { ascending: true }),
        db.from("students").select("*").order("created_at", { ascending: true }),
        db.from("exams").select("*").order("date", { ascending: false }),
        db.from("marks").select("*").order("created_at", { ascending: true }),
        db.from("payments").select("*").order("paid_at", { ascending: false }),
        db.from("fee_ledger").select("*").order("date", { ascending: true }),
        db.from("attendance").select("*").order("week_start", { ascending: false }),
        db.from("timetable_entries").select("*").order("created_at", { ascending: true }),
      ]);

    const results = [schoolResult, usersResult, classesResult, studentsResult, examsResult, marksResult, paymentsResult, feeLedgerResult, attendanceResult, timetableResult];
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
      classes: (classesResult.data ?? []).map((row) => {
        const feePerYear = Number(row.fee_per_year ?? 0);
        const fallbackTermFee = feePerYear / 3;
        const feeTerm1 = row.fee_term_1 == null ? fallbackTermFee : Number(row.fee_term_1);
        const feeTerm2 = row.fee_term_2 == null ? fallbackTermFee : Number(row.fee_term_2);
        const feeTerm3 = row.fee_term_3 == null ? fallbackTermFee : Number(row.fee_term_3);
        return {
          id: row.id,
          name: row.name,
          stream: row.stream ?? undefined,
          teacher: row.teacher ?? undefined,
          room: row.room ?? undefined,
          subjects: row.subjects ?? [],
          feeTerm1,
          feeTerm2,
          feeTerm3,
          feePerYear: feeTerm1 + feeTerm2 + feeTerm3,
        };
      }),
      students: (studentsResult.data ?? []).map((row) => ({
        id: row.id,
        admissionNo: row.admission_no,
        name: row.name,
        gender: row.gender,
        classId: row.class_id ?? "",
        active: row.active !== false,
        feePerYear: row.fee_per_year == null ? undefined : Number(row.fee_per_year),
        image: row.image ?? undefined,
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
        classId: row.class_id ?? undefined,
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
        amount: Number(row.amount ?? 0),
        date: row.paid_at ?? row.date,
        method: row.method,
        ref: row.ref ?? undefined,
      })),
      feeLedger: (feeLedgerResult.data ?? []).map((row) => ({
        id: row.id,
        studentId: row.student_id,
        type: row.type as "debit" | "credit",
        description: row.description,
        amount: Number(row.amount ?? 0),
        date: row.date,
        paymentId: row.payment_id ?? undefined,
      })),
      attendance: (attendanceResult.data ?? []).map((row) => ({
        id: row.id,
        studentId: row.student_id,
        weekStart: row.week_start,
        status: row.status,
      })),
      timetableEntries: (timetableResult.data ?? []).map((row) => ({
        id: row.id,
        classId: row.class_id,
        day: row.day,
        timeSlot: row.time_slot,
        subject: row.subject,
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

  saveUserId(adminUser.id);
  const nextState: State = {
    ...state,
    school: input.school,
    users: [adminUser],
    currentUserId: adminUser.id,
  };
  commit(nextState, "Registration successful");
  return adminUser;
}

export function login(email: string, password: string): User | null {
  const e = email.toLowerCase().trim();
  const u = state.users.find((x) => x.email === e && x.password === password);
  if (!u) return null;
  saveUserId(u.id);
  commit({ ...state, currentUserId: u.id });
  return u;
}

export function logout() {
  saveUserId(null);
  commit({
    school: null,
    users: [],
    classes: [],
    students: [],
    exams: [],
    marks: [],
    payments: [],
    feeLedger: [],
    attendance: [],
    timetableEntries: [],
    currentUserId: null,
  });
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
    fee_term_1: item.feeTerm1,
    fee_term_2: item.feeTerm2,
    fee_term_3: item.feeTerm3,
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
    ...(patch.feeTerm1 !== undefined ? { fee_term_1: patch.feeTerm1 } : {}),
    ...(patch.feeTerm2 !== undefined ? { fee_term_2: patch.feeTerm2 } : {}),
    ...(patch.feeTerm3 !== undefined ? { fee_term_3: patch.feeTerm3 } : {}),
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
export async function addStudent(st: Omit<Student, "id" | "active">) {
  const db = requireSupabase();
  const item = { ...st, id: uid(), active: true };
  const { error } = await db.from("students").insert({
    id: item.id,
    school_id: SCHOOL_ID,
    admission_no: item.admissionNo,
    name: item.name,
    gender: item.gender,
    class_id: item.classId || null,
    fee_per_year: item.feePerYear ?? 0,
    image: item.image ?? null,
    parent: item.parent,
    phone: item.phone,
    email: item.email ?? null,
    updated_at: new Date().toISOString(),
  });
  if (error) showSupabaseError("Creating student", error);

  const cls = state.classes.find((c) => c.id === st.classId);
  const annualFee = st.feePerYear ?? cls?.feePerYear ?? 0;

  if (annualFee > 0) {
    const now = new Date().toISOString();
    const ledgerEntry: FeeLedgerEntry = {
      id: uid(),
      studentId: item.id,
      type: "debit",
      description: `${cls?.name ?? "Class"} annual fee`,
      amount: annualFee,
      date: now.slice(0, 10),
    };
    const { error: ledgerError } = await db.from("fee_ledger").insert({
      id: ledgerEntry.id,
      school_id: SCHOOL_ID,
      student_id: ledgerEntry.studentId,
      type: ledgerEntry.type,
      description: ledgerEntry.description,
      amount: ledgerEntry.amount,
      date: ledgerEntry.date,
    });
    if (ledgerError) showSupabaseError("Creating fee ledger entry", ledgerError);
    commit({ ...state, students: [...state.students, item], feeLedger: [...state.feeLedger, ledgerEntry] }, `Student "${st.name}" created`);
  } else {
    commit({ ...state, students: [...state.students, item] }, `Student "${st.name}" created`);
  }
}
export async function updateStudent(id: ID, patch: Partial<Student>) {
  const db = requireSupabase();
  const dbPatch = {
    ...(patch.admissionNo !== undefined ? { admission_no: patch.admissionNo } : {}),
    ...(patch.name !== undefined ? { name: patch.name } : {}),
    ...(patch.gender !== undefined ? { gender: patch.gender } : {}),
    ...(patch.classId !== undefined ? { class_id: patch.classId || null } : {}),
    ...(patch.feePerYear !== undefined ? { fee_per_year: patch.feePerYear ?? null } : {}),
    ...(patch.image !== undefined ? { image: patch.image ?? null } : {}),
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
    feeLedger: state.feeLedger.filter((e) => e.studentId !== id),
    attendance: state.attendance.filter((a) => a.studentId !== id),
  }, `Student "${item?.name ?? "record"}" deleted`);
}

export async function promoteStudents(studentIds: ID[], toClassId: ID) {
  const db = requireSupabase();
  const destClass = state.classes.find((c) => c.id === toClassId);
  if (!destClass) return;

  const now = new Date().toISOString();
  const dateStr = now.slice(0, 10);

  const entries: FeeLedgerEntry[] = [];
  const nextStudents = state.students.map((s) => {
    if (!studentIds.includes(s.id)) return s;
    entries.push({
      id: uid(),
      studentId: s.id,
      type: "debit",
      description: `${destClass.name} annual fee`,
      amount: destClass.feePerYear,
      date: dateStr,
    });
    return {
      ...s,
      classId: toClassId,
    };
  });

  if (entries.length === 0) return;

  const dbInserts = entries.map((e) =>
    db.from("fee_ledger").insert({
      id: e.id,
      school_id: SCHOOL_ID,
      student_id: e.studentId,
      type: e.type,
      description: e.description,
      amount: e.amount,
      date: e.date,
    }),
  );
  const dbUpdates = studentIds.map((sid) =>
    db.from("students").update({ class_id: toClassId, updated_at: now }).eq("id", sid),
  );

  const results = await Promise.all([...dbInserts, ...dbUpdates]);
  const failed = results.find((r) => r?.error);
  if (failed?.error) showSupabaseError("Promoting students", failed.error);

  commit({
    ...state,
    students: nextStudents,
    feeLedger: [...state.feeLedger, ...entries],
  }, `${studentIds.length} student(s) promoted to ${destClass.name}`);
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
    class_id: item.classId ?? null,
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
    ...(patch.classId !== undefined ? { class_id: patch.classId ?? null } : {}),
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
  const paidAt = item.date || new Date().toISOString();
  const dateStr = paidAt.slice(0, 10);
  const { error } = await db.from("payments").insert({
    id: item.id,
    school_id: SCHOOL_ID,
    student_id: item.studentId,
    term: 1,
    amount: item.amount,
    date: dateStr,
    paid_at: paidAt,
    method: item.method,
    ref: item.ref ?? null,
    updated_at: new Date().toISOString(),
  });
  if (error) showSupabaseError("Recording payment", error);

  const ledgerEntry: FeeLedgerEntry = {
    id: uid(),
    studentId: item.studentId,
    type: "credit",
    description: `Payment${item.ref ? ` (${item.ref})` : ""} — ${item.method}`,
    amount: item.amount,
    date: dateStr,
    paymentId: item.id,
  };
  const { error: ledgerError } = await db.from("fee_ledger").insert({
    id: ledgerEntry.id,
    school_id: SCHOOL_ID,
    student_id: ledgerEntry.studentId,
    type: ledgerEntry.type,
    description: ledgerEntry.description,
    amount: ledgerEntry.amount,
    date: ledgerEntry.date,
    payment_id: ledgerEntry.paymentId ?? null,
  });
  if (ledgerError) showSupabaseError("Creating fee ledger entry", ledgerError);

  commit({ ...state, payments: [...state.payments, item], feeLedger: [...state.feeLedger, ledgerEntry] }, `Payment of ${formatKES(p.amount)} recorded`);
}
export async function updatePayment(id: ID, patch: Partial<Payment>) {
  const db = requireSupabase();
  const now = new Date().toISOString();
  const dbPatch = {
    ...(patch.studentId !== undefined ? { student_id: patch.studentId } : {}),
    ...(patch.amount !== undefined ? { amount: patch.amount } : {}),
    ...(patch.date !== undefined ? { date: patch.date.slice(0, 10), paid_at: patch.date } : {}),
    ...(patch.method !== undefined ? { method: patch.method } : {}),
    ...(patch.ref !== undefined ? { ref: patch.ref ?? null } : {}),
    updated_at: now,
  };
  const { error } = await db.from("payments").update(dbPatch).eq("id", id);
  if (error) showSupabaseError("Updating payment", error);

  const existingLedger = state.feeLedger.find((e) => e.paymentId === id);
  if (existingLedger) {
    const newDesc = `Payment${patch.ref ? ` (${patch.ref})` : existingLedger.description.includes("(") ? "" : ""} — ${patch.method ?? existingLedger.description.split("—").pop()?.trim() ?? ""}`;
    const desc = patch.method || patch.ref
      ? `Payment${patch.ref ? ` (${patch.ref})` : ""} — ${patch.method ?? existingLedger.description.split("— ").pop() ?? ""}`
      : existingLedger.description;
    const ledgerPatch: Partial<FeeLedgerEntry> = {
      ...(patch.amount !== undefined ? { amount: patch.amount } : {}),
      ...(patch.date !== undefined ? { date: patch.date.slice(0, 10) } : {}),
      ...(patch.method !== undefined || patch.ref !== undefined ? { description: desc } : {}),
    };
    await db.from("fee_ledger").update({
      ...(ledgerPatch.amount !== undefined ? { amount: ledgerPatch.amount } : {}),
      ...(ledgerPatch.date !== undefined ? { date: ledgerPatch.date } : {}),
      ...(ledgerPatch.description !== undefined ? { description: ledgerPatch.description } : {}),
    }).eq("id", existingLedger.id);
    const nextLedger = state.feeLedger.map((e) =>
      e.id === existingLedger.id ? { ...e, ...ledgerPatch } : e,
    );
    commit({
      ...state,
      payments: state.payments.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      feeLedger: nextLedger,
    }, "Payment updated");
  } else {
    commit({ ...state, payments: state.payments.map((p) => (p.id === id ? { ...p, ...patch } : p)) }, "Payment updated");
  }
}
export async function deletePayment(id: ID) {
  const db = requireSupabase();
  const { error } = await db.from("payments").delete().eq("id", id);
  if (error) showSupabaseError("Deleting payment", error);
  const ledgerEntry = state.feeLedger.find((e) => e.paymentId === id);
  if (ledgerEntry) {
    await db.from("fee_ledger").delete().eq("id", ledgerEntry.id);
    commit({
      ...state,
      payments: state.payments.filter((p) => p.id !== id),
      feeLedger: state.feeLedger.filter((e) => e.id !== ledgerEntry.id),
    }, "Payment deleted");
  } else {
    commit({ ...state, payments: state.payments.filter((p) => p.id !== id) }, "Payment deleted");
  }
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

// --- Timetable ---
export async function saveTimetableEntries(classId: ID, entries: { day: string; timeSlot: string; subject: string }[]) {
  const db = requireSupabase();
  const existing = state.timetableEntries.filter((e) => e.classId === classId);
  const existingIds = new Set(existing.map((e) => e.id));

  const incoming = entries.map((e) => {
    const match = existing.find((x) => x.day === e.day && x.timeSlot === e.timeSlot);
    return {
      id: match?.id ?? uid(),
      classId,
      day: e.day,
      timeSlot: e.timeSlot,
      subject: e.subject,
    };
  });

  const incomingIds = new Set(incoming.map((e) => e.id));
  const toDelete = existing.filter((e) => !incomingIds.has(e.id));

  const results = await Promise.all([
    ...(toDelete.length > 0
      ? [db.from("timetable_entries").delete().in("id", toDelete.map((e) => e.id))]
      : []),
    ...incoming.map((item) =>
      db.from("timetable_entries").upsert({
        id: item.id,
        school_id: SCHOOL_ID,
        class_id: item.classId,
        day: item.day,
        time_slot: item.timeSlot,
        subject: item.subject,
        updated_at: new Date().toISOString(),
      }, { onConflict: "class_id,day,time_slot" }),
    ),
  ]);

  const failed = results.find((r) => r?.error);
  if (failed?.error) showSupabaseError("Saving timetable", failed.error);

  const remaining = state.timetableEntries.filter((e) => e.classId !== classId);
  commit({
    ...state,
    timetableEntries: [...remaining, ...incoming],
  }, "Timetable saved");
}

export async function deleteTimetableForClass(classId: ID) {
  const db = requireSupabase();
  const { error } = await db.from("timetable_entries").delete().eq("class_id", classId);
  if (error) showSupabaseError("Deleting timetable", error);
  commit({
    ...state,
    timetableEntries: state.timetableEntries.filter((e) => e.classId !== classId),
  }, "Timetable deleted");
}

// --- Attendance ---
export async function setAttendance(studentId: ID, weekStart: string, status: AttendanceRecord["status"]) {
  const db = requireSupabase();
  const existing = state.attendance.find(
    (a) => a.studentId === studentId && a.weekStart === weekStart,
  );
  const item: AttendanceRecord = existing
    ? { ...existing, status }
    : { id: uid(), studentId, weekStart, status };
  const { error } = await db.from("attendance").upsert({
    id: item.id,
    school_id: SCHOOL_ID,
    student_id: item.studentId,
    week_start: item.weekStart,
    status: item.status,
    updated_at: new Date().toISOString(),
  }, { onConflict: "student_id,week_start" });
  if (error) showSupabaseError("Saving attendance", error);
  const next = existing
    ? state.attendance.map((a) => (a.id === item.id ? item : a))
    : [...state.attendance, item];
  commit({ ...state, attendance: next });
}

export function attendanceForWeek(weekStart: string) {
  return state.attendance.filter((a) => a.weekStart === weekStart);
}

export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export function getWeeksInMonth(year: number, month: number): string[] {
  const weeks: string[] = [];
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  let current = getWeekStart(first);
  const lastWeek = getWeekStart(last);
  while (current <= lastWeek) {
    weeks.push(current);
    const next = new Date(current);
    next.setDate(next.getDate() + 7);
    current = next.toISOString().slice(0, 10);
  }
  return weeks;
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
  const students = classId ? s.students.filter((x) => x.active !== false && x.classId === classId) : s.students.filter((x) => x.active !== false);
  const rows = students.map((st) => {
    const ms = s.marks.filter((m) => m.examId === examId && m.studentId === st.id);
    const total = ms.reduce((a, b) => a + b.score, 0);
    const avg = ms.length ? total / ms.length : 0;
    return { student: st, total, avg, count: ms.length };
  });
  rows.sort((a, b) => b.avg - a.avg);
  return rows.map((r, i) => ({ ...r, rank: r.count ? i + 1 : 0 }));
}

export function studentFeeLedger(studentId: ID) {
  const st = state.students.find((x) => x.id === studentId);
  if (!st) return null;
  const cls = state.classes.find((c) => c.id === st.classId);
  const entries = state.feeLedger
    .filter((e) => e.studentId === studentId)
    .sort((a, b) => a.date.localeCompare(b.date));
  const totalDebit = entries.reduce((s, e) => (e.type === "debit" ? s + e.amount : s), 0);
  const totalCredit = entries.reduce((s, e) => (e.type === "credit" ? s + e.amount : s), 0);
  const balance = totalDebit - totalCredit;
  return {
    student: st,
    class: cls,
    entries,
    totalDebit,
    totalCredit,
    balance,
    balanceOwing: Math.max(0, balance),
    balanceCredit: Math.max(0, -balance),
  };
}

// --- Fee Ledger ---
export async function addFeeLedgerEntry(e: { studentId: ID; type: "debit" | "credit"; description: string; amount: number; date?: string }) {
  const db = requireSupabase();
  const item: FeeLedgerEntry = {
    id: uid(),
    studentId: e.studentId,
    type: e.type,
    description: e.description,
    amount: e.amount,
    date: e.date ?? new Date().toISOString().slice(0, 10),
  };
  const { error } = await db.from("fee_ledger").insert({
    id: item.id,
    school_id: SCHOOL_ID,
    student_id: item.studentId,
    type: item.type,
    description: item.description,
    amount: item.amount,
    date: item.date,
  });
  if (error) showSupabaseError("Adding fee ledger entry", error);
  commit({ ...state, feeLedger: [...state.feeLedger, item] }, `${e.type === "debit" ? "Debit" : "Credit"} entry added`);
}

export async function deleteFeeLedgerEntry(id: ID) {
  const db = requireSupabase();
  const { error } = await db.from("fee_ledger").delete().eq("id", id);
  if (error) showSupabaseError("Deleting fee ledger entry", error);
  commit({ ...state, feeLedger: state.feeLedger.filter((e) => e.id !== id) }, "Fee ledger entry deleted");
}

export const formatKES = (n: number) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(Math.round(n || 0));