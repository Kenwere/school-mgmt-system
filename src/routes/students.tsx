import { Link, createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { PermissionGate } from "@/components/permission-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit3, Trash2, Upload, X } from "lucide-react";
import { addStudent, deleteStudent, formatKES, updateStudent, useStore, type Student } from "@/lib/store";

export const Route = createFileRoute("/students")({
  head: () => ({ meta: [{ title: "Students — School Management" }] }),
  component: () => (
    <PermissionGate path="/students">
      <StudentsPage />
    </PermissionGate>
  ),
});

type Form = {
  id?: string;
  name: string;
  admissionNo: string;
  gender: string;
  classId: string;
  feePerYear: string;
  image: string;
  parent: string;
  phone: string;
  email: string;
};
const blank: Form = { name: "", admissionNo: "", gender: "Male", classId: "", feePerYear: "", image: "", parent: "", phone: "", email: "" };

function StudentsPage() {
  const store = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Form>(blank);
  const [classFilter, setClassFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = store.students.filter((s) => {
    if (classFilter !== "all" && s.classId !== classFilter) return false;
    if (search && !`${s.name} ${s.admissionNo}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openCreate = () => {
    setForm({ ...blank, classId: store.classes[0]?.id ?? "" });
    setEditing(false);
    setOpen(true);
  };
  const openEdit = (s: Student) => {
    setForm({ ...s, feePerYear: s.feePerYear ? String(s.feePerYear) : "", image: s.image ?? "", email: s.email ?? "" });
    setEditing(true);
    setOpen(true);
  };

  const selectedClass = store.classes.find((c) => c.id === form.classId);

  const onImage = (f: File | null) => {
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) {
      alert("Image must be smaller than 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, image: String(reader.result || "") }));
    reader.readAsDataURL(f);
  };

  const save = async () => {
    const payload = {
      name: form.name.trim(),
      admissionNo: form.admissionNo.trim(),
      gender: form.gender,
      classId: form.classId,
      feePerYear: form.feePerYear ? Number(form.feePerYear) || 0 : selectedClass?.feePerYear,
      image: form.image || undefined,
      parent: form.parent.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
    };
    if (editing && form.id) {
      await updateStudent(form.id, payload);
    } else {
      await addStudent(payload);
    }
    setOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Students"
        description="Admissions, profiles and class assignment."
        actions={
          <>
            <Input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-44" />
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All classes</SelectItem>
                {store.classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreate} disabled={store.classes.length === 0}>
                  <Plus className="h-4 w-4" /> New student
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editing ? "Edit student" : "New student"}</DialogTitle>
                  <DialogDescription>Capture admission details.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Student image</Label>
                    <div className="flex items-center gap-4">
                      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-md border bg-muted">
                        {form.image ? (
                          <img src={form.image} alt={form.name || "Student"} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xs text-muted-foreground">No image</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onImage(e.target.files?.[0] ?? null)} />
                        <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                          <Upload className="h-4 w-4" /> Upload
                        </Button>
                        {form.image && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => setForm({ ...form, image: "" })}>
                            <X className="h-4 w-4" /> Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 sm:col-span-2"><Label>Full name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Admission no.</Label><Input value={form.admissionNo} onChange={(e) => setForm({ ...form, admissionNo: e.target.value })} /></div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Class</Label>
                    <Select value={form.classId} onValueChange={(v) => setForm({ ...form, classId: v })}>
                      <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                      <SelectContent>
                        {store.classes.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Assigned annual fee</Label>
                    <Input readOnly value={formatKES(selectedClass?.feePerYear ?? 0)} />
                  </div>
                  <div className="space-y-2"><Label>Parent / Guardian</Label><Input value={form.parent} onChange={(e) => setForm({ ...form, parent: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                  <div className="space-y-2 sm:col-span-2"><Label>Email (optional)</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                </div>
                <DialogFooter><Button onClick={save}>{editing ? "Save" : "Create"}</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        }
      />
      <div className="p-6">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Adm. No</TableHead>
                  <TableHead>Photo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead className="text-right">Annual fee</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-10">No students yet.</TableCell></TableRow>
                )}
                {filtered.map((s) => {
                  const cls = store.classes.find((c) => c.id === s.classId);
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-xs">{s.admissionNo}</TableCell>
                      <TableCell>
                        <div className="h-9 w-9 overflow-hidden rounded-md border bg-muted">
                          {s.image && <img src={s.image} alt={s.name} className="h-full w-full object-cover" />}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link to="/students/$studentId" params={{ studentId: s.id }} className="hover:underline">
                          {s.name}
                        </Link>
                      </TableCell>
                      <TableCell>{cls?.name ?? "—"}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {(s.feePerYear ?? cls?.feePerYear ?? 0).toLocaleString()}
                      </TableCell>
                      <TableCell>{s.gender}</TableCell>
                      <TableCell>{s.parent}</TableCell>
                      <TableCell>{s.phone}</TableCell>
                      <TableCell className="text-right">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(s)}><Edit3 className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => { if (confirm(`Delete ${s.name}?`)) deleteStudent(s.id); }}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
