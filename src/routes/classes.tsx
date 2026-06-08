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
  feeTerm1: string;
  feeTerm2: string;
  feeTerm3: string;
  subjects: string;
};

const blank: Form = {
  name: "",
  stream: "",
  teacher: "",
  room: "",
  feeTerm1: "0",
  feeTerm2: "0",
  feeTerm3: "0",
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
      feeTerm1: String(c.feeTerm1),
      feeTerm2: String(c.feeTerm2),
      feeTerm3: String(c.feeTerm3),
      subjects: c.subjects.join(", "),
    });
    setEditing(true);
    setOpen(true);
  };

  const save = () => {
    const subjects = form.subjects.split(",").map((s) => s.trim()).filter(Boolean);
    const feeTerm1 = Number(form.feeTerm1) || 0;
    const feeTerm2 = Number(form.feeTerm2) || 0;
    const feeTerm3 = Number(form.feeTerm3) || 0;
    const payload = {
      name: form.name.trim(),
      stream: form.stream.trim(),
      teacher: form.teacher.trim(),
      room: form.room.trim(),
      feeTerm1,
      feeTerm2,
      feeTerm3,
      feePerYear: feeTerm1 + feeTerm2 + feeTerm3,
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
                <DialogDescription>Enter the fee expected for each term.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Form 1A" /></div>
                  <div className="space-y-2"><Label>Stream</Label><Input value={form.stream} onChange={(e) => setForm({ ...form, stream: e.target.value })} placeholder="Science" /></div>
                  <div className="space-y-2"><Label>Class teacher</Label><Input value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Room</Label><Input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>First term fee</Label>
                    <Input type="number" value={form.feeTerm1} onChange={(e) => setForm({ ...form, feeTerm1: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Second term fee</Label>
                    <Input type="number" value={form.feeTerm2} onChange={(e) => setForm({ ...form, feeTerm2: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Third term fee</Label>
                    <Input type="number" value={form.feeTerm3} onChange={(e) => setForm({ ...form, feeTerm3: e.target.value })} />
                  </div>
                  <p className="col-span-3 text-xs text-muted-foreground">
                    Annual total: {formatKES((Number(form.feeTerm1) || 0) + (Number(form.feeTerm2) || 0) + (Number(form.feeTerm3) || 0))}
                  </p>
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
                <div className="flex items-center gap-2 text-muted-foreground"><Wallet className="h-4 w-4" />{formatKES(c.feePerYear)} / year</div>
                <div className="text-xs text-muted-foreground">T1 {formatKES(c.feeTerm1)} · T2 {formatKES(c.feeTerm2)} · T3 {formatKES(c.feeTerm3)}</div>
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
