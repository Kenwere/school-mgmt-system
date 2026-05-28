import { supabase, type ClassRecord, type StudentRecord } from "./supabase";

export type StudentsByClass = { name: string; count: number };
export type BreakdownItem = { status: string; value: number };

export async function uploadStudentImage(file: File) {
  if (!file) return null;

  const extension = file.name.split(".").pop() ?? "png";
  const filePath = `student-images/student-${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from("student-images").upload(filePath, file, {
    cacheControl: "3600",
    upsert: true,
  });

  if (error) {
    console.error("Supabase storage upload error:", error.message);
    return null;
  }

  const { data } = supabase.storage.from("student-images").getPublicUrl(filePath);
  return data.publicUrl;
}

export async function fetchClasses() {
  const { data, error } = await supabase.from<ClassRecord>("classes").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function fetchStudents() {
  const { data, error } = await supabase
    .from("students")
    .select("*, class:classes(name)")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return ((data ?? []) as Array<StudentRecord & { class?: { name?: string } }>).map((student) => ({
    ...student,
    class_name: student.class?.name ?? "Unassigned",
  }));
}

export async function fetchDashboardStats() {
  const [classes, studentsResponse] = await Promise.all([
    fetchClasses(),
    supabase
      .from("students")
      .select("id, status, fees_status, class:classes(name, fee_amount)")
      .order("created_at", { ascending: false }),
  ]);

  const students = (studentsResponse.data ?? []) as Array<
    Pick<StudentRecord, "id" | "status" | "fees_status"> & { class?: { name?: string; fee_amount?: number } }
  >;

  const studentCount = students.length;
  const activeStudentCount = students.filter((student) => student.status === "Active").length;
  const feesCollected = students.reduce((sum, student) => sum + (student.fees_status === "Paid" ? student.class?.fee_amount ?? 0 : 0), 0);
  const feesPending = students.reduce((sum, student) => sum + (student.fees_status !== "Paid" ? student.class?.fee_amount ?? 0 : 0), 0);
  const attendancePercent = studentCount ? Math.round((activeStudentCount / studentCount) * 100) : 0;

  const studentsByClass = students.reduce<Record<string, number>>((acc, student) => {
    const className = student.class?.name ?? "Unassigned";
    acc[className] = (acc[className] ?? 0) + 1;
    return acc;
  }, {});

  const studentsByClassArray = Object.entries(studentsByClass).map(([name, count]) => ({ name, count }));
  const feesStatusBreakdown: BreakdownItem[] = [
    { status: "Paid", value: students.filter((student) => student.fees_status === "Paid").length },
    { status: "Partial", value: students.filter((student) => student.fees_status === "Partial").length },
    { status: "Pending", value: students.filter((student) => student.fees_status === "Pending").length },
  ];

  return {
    studentCount,
    activeStudentCount,
    classCount: classes.length,
    feesCollected,
    feesPending,
    attendancePercent,
    studentsByClass: studentsByClassArray,
    feesStatusBreakdown,
  };
}

export async function createClass(input: {
  name: string;
  stream: string;
  teacher: string;
  room: string;
  fee_amount: number;
}) {
  const { data, error } = await supabase.from<ClassRecord>("classes").insert([input]);
  if (error) throw error;
  return data?.[0] ?? null;
}

export async function updateClass(id: string, input: Partial<Omit<ClassRecord, "id">>) {
  const { data, error } = await supabase.from<ClassRecord>("classes").update(input).eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function deleteClass(id: string) {
  const { error } = await supabase.from<ClassRecord>("classes").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function createStudent(input: Omit<StudentRecord, "id" | "created_at" | "class_name">, photoFile?: File) {
  const photo_url = photoFile ? await uploadStudentImage(photoFile) : input.photo_url;
  const payload = {
    ...input,
    photo_url,
  };

  const { data, error } = await supabase.from<StudentRecord>("students").insert([payload]);
  if (error) throw error;
  return data?.[0] ?? null;
}

export async function updateStudent(id: string, input: Partial<Omit<StudentRecord, "id" | "created_at" | "class_name">>, photoFile?: File) {
  let photo_url = input.photo_url;
  if (photoFile) {
    photo_url = await uploadStudentImage(photoFile);
  }

  const { data, error } = await supabase.from<StudentRecord>("students").update({
    ...input,
    photo_url,
  }).eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function deleteStudent(id: string) {
  const { error } = await supabase.from<StudentRecord>("students").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function toggleStudentStatus(id: string, status: "Active" | "Suspended") {
  const { data, error } = await supabase.from<StudentRecord>("students").update({ status }).eq("id", id).single();
  if (error) throw error;
  return data;
}
