import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Download, Filter, Users, UserCheck, UserX, UserPlus, Edit3, Trash2, Printer } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchStudents, fetchClasses, createStudent, updateStudent, deleteStudent, toggleStudentStatus } from "@/lib/supabase-helpers";
import { useAuth } from "@/lib/auth";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/students")({
  head: () => ({ meta: [{ title: "Students — School Management" }] }),
  component: StudentsPage,
});

type StudentFormState = {
  id?: string;
  name: string;
  admission_no: string;
  gender: string;
  parent: string;
  phone: string;
  email: string;
  class_id: string;
  fees_status: "Paid" | "Partial" | "Pending";
  status: "Active" | "Suspended";
  photo_url?: string;
  photoFile?: File | null;
};

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("");
}

function StudentsPage() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const studentsQuery = useQuery({ queryKey: ["students"], queryFn: fetchStudents });
  const classesQuery = useQuery({ queryKey: ["classes"], queryFn: fetchClasses });
  const createMutation = useMutation((payload: { data: StudentFormState }) => createStudent(payload.data, payload.data.photoFile ?? undefined), {
    onSuccess: () => queryClient.invalidateQueries(["students"]),
  });
  const updateMutation = useMutation((payload: { id: string; data: StudentFormState }) => updateStudent(payload.id, payload.data, payload.data.photoFile ?? undefined), {
    onSuccess: () => queryClient.invalidateQueries(["students"]),
  });
  const deleteMutation = useMutation((id: string) => deleteStudent(id), {
    onSuccess: () => queryClient.invalidateQueries(["students"]),
  });
  const toggleStatusMutation = useMutation((payload: { id: string; status: "Active" | "Suspended" }) => toggleStudentStatus(payload.id, payload.status), {
    onSuccess: () => queryClient.invalidateQueries(["students"]),
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<StudentFormState>({
    name: "",
    admission_no: "",
    gender: "Female",
    parent: "",
    phone: "",
    email: "",
    class_id: "",
    fees_status: "Pending",
    status: "Active",
    photo_url: "",
    photoFile: null,
  });

  const [isEditing, setIsEditing] = useState(false);

  const onOpenDialog = () => {
    setForm({
      name: "",
      admission_no: "",
      gender: "Female",
      parent: "",
      phone: "",
      email: "",
      class_id: "",
      fees_status: "Pending",
      status: "Active",
      photo_url: "",
      photoFile: null,
    });
    setIsEditing(false);
    setDialogOpen(true);
  };

  const onEdit = (student: any) => {
    setForm({
      id: student.id,
      name: student.name ?? "",
      admission_no: student.admission_no ?? "",
      gender: student.gender ?? "Female",
      parent: student.parent ?? "",
      phone: student.phone ?? "",
      email: student.email ?? "",
      class_id: student.class_id ?? "",
      fees_status: student.fees_status ?? "Pending",
      status: student.status ?? "Active",
      photo_url: student.photo_url ?? "",
      photoFile: null,
    });
    setIsEditing(true);
    setDialogOpen(true);
  };

  const saveStudent = async () => {
    const payload = {
      name: form.name,
      admission_no: form.admission_no,
      gender: form.gender,
      parent: form.parent,
      phone: form.phone,
      email: form.email,
      class_id: form.class_id || undefined,
      fees_status: form.fees_status,
      status: form.status,
      photo_url: form.photo_url,
    } as any;

    if (isEditing && form.id) {
      await updateMutation.mutateAsync({ id: form.id, data: { ...payload, photoFile: form.photoFile } });
    } else {
      await createMutation.mutateAsync({ data: { ...payload, photoFile: form.photoFile } });
    }

    setDialogOpen(false);
    setForm((current) => ({ ...current, photoFile: null }));
  };

  return (
    <>
      <PageHeader
        title="Students"
        description="Manage student admissions, profiles and classroom assignments."
        actions={
          <>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Print
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={onOpenDialog}>
                  <Plus className="h-4 w-4" /> New Admission
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{isEditing ? "Edit Student" : "New Student Admission"}</DialogTitle>
                  <DialogDescription>Save a student record directly to Supabase.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Input
                    placeholder="Student name"
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  />
                  <Input
                    placeholder="Admission number"
                    value={form.admission_no}
                    onChange={(event) => setForm((prev) => ({ ...prev, admission_no: event.target.value }))}
                  />
                  <Input
                    placeholder="Parent / Guardian"
                    value={form.parent}
                    onChange={(event) => setForm((prev) => ({ ...prev, parent: event.target.value }))}
                  />
                  <Input
                    placeholder="Phone"
                    value={form.phone}
                    onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                  />
                  <Input
                    placeholder="Email"
                    value={form.email}
                    onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  />
                  <select
                    className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 text-base text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={form.gender}
                    onChange={(event) => setForm((prev) => ({ ...prev, gender: event.target.value as "Male" | "Female" }))}
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                  <select
                    className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 text-base text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={form.class_id}
                    onChange={(event) => setForm((prev) => ({ ...prev, class_id: event.target.value }))}
                  >
                    <option value="">Unassigned class</option>
                    {classesQuery.data?.map((cls) => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                  <select
                    className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 text-base text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={form.fees_status}
                    onChange={(event) => setForm((prev) => ({ ...prev, fees_status: event.target.value as "Paid" | "Partial" | "Pending" }))}
                  >
                    <option value="Paid">Paid</option>
                    <option value="Partial">Partial</option>
                    <option value="Pending">Pending</option>
                  </select>
                  <select
                    className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 text-base text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={form.status}
                    onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as "Active" | "Suspended" }))}
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                  <label className="flex flex-col gap-2 text-sm text-muted-foreground">
                    Student image
                    <input
                      type="file"
                      accept="image/*"
                      className="text-sm"
                      onChange={(event) => {
                        const file = event.target.files?.[0] ?? null;
                        setForm((prev) => ({ ...prev, photoFile: file }));
                      }}
                    />
                  </label>
                </div>
                <DialogFooter>
                  <Button type="button" onClick={saveStudent} disabled={createMutation.isLoading || updateMutation.isLoading}>
                    {isEditing ? "Update student" : "Create student"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        }
      />
      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Enrolled" value={studentsQuery.data?.length.toString() ?? "—"} icon={Users} />
          <StatCard label="Active" value={studentsQuery.data?.filter((s) => s.status === "Active").length.toString() ?? "—"} icon={UserCheck} tone="success" />
          <StatCard label="Suspended" value={studentsQuery.data?.filter((s) => s.status === "Suspended").length.toString() ?? "—"} icon={UserX} tone="destructive" />
          <StatCard label="New this session" value="Managed live" icon={UserPlus} />
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="flex flex-col gap-2 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
              <Input placeholder="Search by name, ID or class…" className="max-w-sm" />
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm"><Filter className="h-4 w-4" /> Filters</Button>
                <Button variant="outline" size="sm"><Download className="h-4 w-4" /> Export</Button>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Admission</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Fees</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentsQuery.data?.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          {student.photo_url ? (
                            <AvatarImage src={student.photo_url} alt={student.name} />
                          ) : (
                            <AvatarFallback className="bg-accent/10 text-accent text-xs">{initials(student.name)}</AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-xs text-muted-foreground">{student.gender}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{student.admission_no}</TableCell>
                    <TableCell>{student.class_name ?? "Unassigned"}</TableCell>
                    <TableCell className="text-muted-foreground">{student.phone}</TableCell>
                    <TableCell>
                      <Badge variant={student.fees_status === "Paid" ? "secondary" : student.fees_status === "Partial" ? "default" : "destructive"}>
                        {student.fees_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={student.status === "Active" ? "outline" : "destructive"}>{student.status}</Badge>
                    </TableCell>
                    <TableCell className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => onEdit(student)}>
                        <Edit3 className="h-4 w-4" /> Edit
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => toggleStatusMutation.mutate({ id: student.id, status: student.status === "Active" ? "Suspended" : "Active" })}>
                        {student.status === "Active" ? "Suspend" : "Restore"}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(student.id)}>
                        <Trash2 className="h-4 w-4" /> Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
