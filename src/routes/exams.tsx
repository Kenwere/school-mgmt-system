import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { PermissionGate } from "@/components/permission-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { addExam, deleteExam, updateExam, useStore, type Exam, type Term, type ID } from "@/lib/store";

export const Route = createFileRoute("/exams")({
  head: () => ({ meta: [{ title: "Exams — School Management" }] }),
  component: () => (
    <PermissionGate path="/exams">
      <ExamsPage />
    </PermissionGate>
  ),
});

function ExamsPage() {
  const store = useStore();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [term, setTerm] = useState<Term>(1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [classId, setClassId] = useState<string>("all");

  const openCreate = () => {
    setEditingId(null);
    setName("");
    setTerm(1);
    setYear(new Date().getFullYear());
    setDate(new Date().toISOString().slice(0, 10));
    setClassId("all");
    setOpen(true);
  };

  const openEdit = (exam: Exam) => {
    setEditingId(exam.id);
    setName(exam.name);
    setTerm(exam.term);
    setYear(exam.year);
    setDate(exam.date);
    setClassId(exam.classId ?? "all");
    setOpen(true);
  };

  const save = () => {
    if (!name.trim()) return;
    const payload: Omit<Exam, "id"> = { name: name.trim(), term, year, date, classId: classId === "all" ? undefined : classId };
    if (editingId) {
      updateExam(editingId, payload);
    } else {
      addExam(payload);
    }
    setName("");
    setEditingId(null);
    setOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Exams"
        description="Record each exam (about 2 per term). Marks are entered against an exam."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}><Plus className="h-4 w-4" /> New exam</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit exam" : "Add exam"}</DialogTitle>
                <DialogDescription>e.g. "Mid Term 1", "End Term 1".</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2"><Label>Exam name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Mid Term 1" /></div>
                <div className="space-y-2">
                  <Label>Term</Label>
                  <Select value={String(term)} onValueChange={(v) => setTerm(Number(v) as Term)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Term 1</SelectItem>
                      <SelectItem value="2">Term 2</SelectItem>
                      <SelectItem value="3">Term 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Year</Label><Input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} /></div>
                <div className="space-y-2 sm:col-span-2"><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Class (optional)</Label>
                  <Select value={classId} onValueChange={setClassId}>
                    <SelectTrigger><SelectValue placeholder="All classes" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All classes</SelectItem>
                      {store.classes.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter><Button onClick={save}>{editingId ? "Save" : "Create"}</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="p-6">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {store.exams.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-10">No exams yet.</TableCell></TableRow>
                )}
                {[...store.exams].sort((a, b) => b.date.localeCompare(a.date)).map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.name}</TableCell>
                    <TableCell><Badge variant="outline">Term {e.term}</Badge></TableCell>
                    <TableCell>{e.year}</TableCell>
                    <TableCell>{e.date}</TableCell>
                    <TableCell>{e.classId ? store.classes.find((c) => c.id === e.classId)?.name ?? "—" : "All classes"}</TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(e)}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => { if (confirm("Delete exam (and its marks)?")) deleteExam(e.id); }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
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
