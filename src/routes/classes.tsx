import { createFileRoute } from "@tanstack/react-router";
import { useState, type KeyboardEvent } from "react";
import { PageHeader } from "@/components/page-header";
import { PermissionGate } from "@/components/permission-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit3, Trash2, Users, Wallet, BookOpen, X } from "lucide-react";
import {
  addClass,
  deleteClass,
  formatKES,
  updateClass,
  useStore,
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
  subjects: string[];
};

const DEFAULT_SUBJECTS = [
  "Mathematics", "English", "Kiswahili", "Physics",
  "Chemistry", "Biology", "History", "Geography",
];

const blank: Form = {
  name: "",
  stream: "",
  teacher: "",
  room: "",
  feeTerm1: "0",
  feeTerm2: "0",
  feeTerm3: "0",
  subjects: [...DEFAULT_SUBJECTS],
};

function ClassesPage() {
  const store = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Form>(blank);

  const [subjectInput, setSubjectInput] = useState("");

  const openCreate = () => { setForm(blank); setEditing(false); setSubjectInput(""); setOpen(true); };
  const openEdit = (c: ClassRow) => {
    setSubjectInput("");
    setForm({
      id: c.id,
      name: c.name,
      stream: c.stream ?? "",
      teacher: c.teacher ?? "",
      room: c.room ?? "",
      feeTerm1: String(c.feeTerm1),
      feeTerm2: String(c.feeTerm2),
      feeTerm3: String(c.feeTerm3),
      subjects: [...c.subjects],
    });
    setEditing(true);
    setOpen(true);
  };

  const addSubject = () => {
    const s = subjectInput.trim();
    if (s && !form.subjects.includes(s)) {
      setForm({ ...form, subjects: [...form.subjects, s] });
    }
    setSubjectInput("");
  };

  const removeSubject = (s: string) => {
    setForm({ ...form, subjects: form.subjects.filter((x) => x !== s) });
  };

  const handleSubjectKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); addSubject(); }
  };

  const save = () => {
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
      subjects: form.subjects,
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
                  <Label>Subjects</Label>
                  <div className="flex gap-2">
                    <Input
                      value={subjectInput}
                      onChange={(e) => setSubjectInput(e.target.value)}
                      onKeyDown={handleSubjectKeyDown}
                      placeholder="Type a subject and press Enter"
                      className="flex-1"
                    />
                    <Button type="button" size="sm" variant="outline" onClick={addSubject}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {form.subjects.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {form.subjects.map((s) => (
                        <Badge key={s} variant="secondary" className="gap-1 pr-1">
                          {s}
                          <button type="button" onClick={() => removeSubject(s)} className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No subjects yet. Add at least one subject.</p>
                  )}
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
          const students = store.students.filter((s) => s.active !== false && s.classId === c.id).length;
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
                <div className="flex items-center gap-2 text-muted-foreground"><BookOpen className="h-4 w-4 shrink-0" />{c.subjects.length} subjects</div>
                {c.subjects.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {c.subjects.slice(0, 4).map((s) => (
                      <Badge key={s} variant="outline" className="text-[10px] px-1.5 py-0">{s}</Badge>
                    ))}
                    {c.subjects.length > 4 && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">+{c.subjects.length - 4}</Badge>
                    )}
                  </div>
                )}
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
