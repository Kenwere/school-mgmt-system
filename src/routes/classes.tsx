import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { PermissionGate } from "@/components/permission-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit3, Trash2, Users, Wallet, BookOpen } from "lucide-react";
import {
  addClass,
  deleteClass,
  formatKES,
  updateClass,
  useStore,
  DEFAULT_SUBJECTS,
  type ClassRow,
} from "@/lib/store";

export const Route = createFileRoute("/classes")({
  head: () => ({ meta: [{ title: "Classes — School Management" }] }),
  component: () => (
    <PermissionGate path="/classes">
      <ClassesPage />
    </PermissionGate>
  ),
});

type Form = {
  id?: string;
  name: string;
  stream: string;
  teacher: string;
  room: string;
  feePerYear: string;
  subjects: string;
};

const blank: Form = {
  name: "",
  stream: "",
  teacher: "",
  room: "",
  feePerYear: "0",
  subjects: DEFAULT_SUBJECTS.join(", "),
};

function ClassesPage() {
  const store = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Form>(blank);

  const openCreate = () => { setForm(blank); setEditing(false); setOpen(true); };
  const openEdit = (c: ClassRow) => {
    setForm({
      id: c.id,
      name: c.name,
      stream: c.stream ?? "",
      teacher: c.teacher ?? "",
      room: c.room ?? "",
      feePerYear: String(c.feePerYear),
      subjects: c.subjects.join(", "),
    });
    setEditing(true);
    setOpen(true);
  };

  const save = () => {
    const subjects = form.subjects.split(",").map((s) => s.trim()).filter(Boolean);
    const payload = {
      name: form.name.trim(),
      stream: form.stream.trim(),
      teacher: form.teacher.trim(),
      room: form.room.trim(),
      feePerYear: Number(form.feePerYear) || 0,
      subjects,
    };
    if (editing && form.id) {
      updateClass(form.id, payload);
    } else {
      addClass(payload);
    }
    setOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Classes"
        description="Each class has its own annual fee — split automatically into 3 terms."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}><Plus className="h-4 w-4" /> New class</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Edit class" : "New class"}</DialogTitle>
                <DialogDescription>Set fee per year — the system divides it into 3 terms.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Form 1A" /></div>
                  <div className="space-y-2"><Label>Stream</Label><Input value={form.stream} onChange={(e) => setForm({ ...form, stream: e.target.value })} placeholder="Science" /></div>
                  <div className="space-y-2"><Label>Class teacher</Label><Input value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Room</Label><Input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} /></div>
                </div>
                <div className="space-y-2">
                  <Label>Fee per year (KES)</Label>
                  <Input type="number" value={form.feePerYear} onChange={(e) => setForm({ ...form, feePerYear: e.target.value })} />
                  <p className="text-xs text-muted-foreground">Per term: {formatKES((Number(form.feePerYear) || 0) / 3)}</p>
                </div>
                <div className="space-y-2">
                  <Label>Subjects (comma separated)</Label>
                  <Textarea value={form.subjects} onChange={(e) => setForm({ ...form, subjects: e.target.value })} rows={2} />
                </div>
              </div>
              <DialogFooter><Button onClick={save}>{editing ? "Save" : "Create"}</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {store.classes.length === 0 && (
          <p className="col-span-full text-center text-sm text-muted-foreground py-10">
            No classes yet — add one to get started.
          </p>
        )}
        {store.classes.map((c) => {
          const students = store.students.filter((s) => s.classId === c.id).length;
          return (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{c.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{c.teacher || "No class teacher"}</p>
                  </div>
                  {c.stream && <Badge variant="secondary">{c.stream}</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4" />{students} students</div>
                <div className="flex items-center gap-2 text-muted-foreground"><Wallet className="h-4 w-4" />{formatKES(c.feePerYear)} / yr · {formatKES(c.feePerYear / 3)} / term</div>
                <div className="flex items-center gap-2 text-muted-foreground"><BookOpen className="h-4 w-4" />{c.subjects.length} subjects</div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(c)}><Edit3 className="h-4 w-4" /> Edit</Button>
                <Button size="sm" variant="ghost" onClick={() => { if (confirm(`Delete ${c.name}?`)) deleteClass(c.id); }}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </>
  );
}
