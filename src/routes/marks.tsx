import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Lock } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PermissionGate } from "@/components/permission-gate";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { setMark, useStore } from "@/lib/store";

export const Route = createFileRoute("/marks")({
  head: () => ({ meta: [{ title: "Marks entry — School Management" }] }),
  component: () => (
    <PermissionGate path="/marks">
      <MarksPage />
    </PermissionGate>
  ),
});

function MarksPage() {
  const store = useStore();
  const [examId, setExamId] = useState<string>(store.exams[0]?.id ?? "");

  const selectedExam = store.exams.find((e) => e.id === examId);
  const lockedClassId = selectedExam?.classId;
  const [freeClassId, setFreeClassId] = useState<string>(store.classes[0]?.id ?? "");
  const classId = lockedClassId ?? freeClassId;

  const handleExamChange = (id: string) => {
    setExamId(id);
    const exam = store.exams.find((e) => e.id === id);
    if (exam?.classId) {
      setFreeClassId(exam.classId);
    }
  };

  const cls = store.classes.find((c) => c.id === classId);
  const subjects = cls?.subjects ?? [];
  const students = useMemo(
    () => store.students.filter((s) => s.active !== false && s.classId === classId),
    [store.students, classId],
  );

  const enteredSubjects = useMemo(() => {
    if (!examId) return new Set<string>();
    const entered = new Set<string>();
    for (const m of store.marks) {
      if (m.examId === examId && subjects.includes(m.subject)) {
        entered.add(m.subject);
      }
    }
    return entered;
  }, [store.marks, examId, subjects]);

  const get = (studentId: string, subject: string) =>
    store.marks.find((m) => m.examId === examId && m.studentId === studentId && m.subject === subject)?.score ?? "";

  const onChange = (studentId: string, subject: string, raw: string) => {
    if (!examId) return;
    const n = Math.max(0, Math.min(100, Number(raw) || 0));
    if (raw === "") return;
    setMark({ examId, studentId, subject, score: n });
  };

  return (
    <>
      <PageHeader
        title="Marks entry"
        description="Enter marks per subject for the selected exam and class. Saved automatically."
      />
      <div className="space-y-4 p-6">
        <Card>
          <CardContent className="grid gap-4 p-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Exam</Label>
              <Select value={examId} onValueChange={handleExamChange}>
                <SelectTrigger><SelectValue placeholder="Select an exam" /></SelectTrigger>
                <SelectContent>
                  {store.exams.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name} — Term {e.term} {e.year}
                      {e.classId ? ` — ${store.classes.find((c) => c.id === e.classId)?.name ?? ""}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={classId} onValueChange={setFreeClassId} disabled={!!lockedClassId}>
                <SelectTrigger><SelectValue placeholder="Select a class" /></SelectTrigger>
                <SelectContent>
                  {store.classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {lockedClassId && <p className="text-xs text-muted-foreground">Class is locked by the selected exam.</p>}
            </div>
          </CardContent>
        </Card>

        {!examId || !classId ? (
          <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">Pick an exam and class to start entering marks.</CardContent></Card>
        ) : students.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No students in this class.</CardContent></Card>
        ) : (
          <Card key={examId + classId}>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-48">Student</TableHead>
                    {subjects.map((sub) => (
                      <TableHead key={sub} className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {sub}
                          {enteredSubjects.has(sub) && (
                            <Lock className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Avg</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((st) => {
                    const ms = store.marks.filter((m) => m.examId === examId && m.studentId === st.id);
                    const total = ms.reduce((a, b) => a + b.score, 0);
                    const avg = ms.length ? total / ms.length : 0;
                    return (
                      <TableRow key={st.id}>
                        <TableCell className="font-medium">{st.name}<div className="text-xs text-muted-foreground">{st.admissionNo}</div></TableCell>
                        {subjects.map((sub) => {
                          const isEntered = enteredSubjects.has(sub);
                          return (
                            <TableCell key={sub} className="text-right">
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                className={`h-8 w-20 text-right tabular-nums ${isEntered ? "opacity-60" : ""}`}
                                defaultValue={get(st.id, sub)}
                                disabled={isEntered}
                                onBlur={(e) => onChange(st.id, sub, e.target.value)}
                              />
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-right tabular-nums font-medium">{total}</TableCell>
                        <TableCell className="text-right tabular-nums">{avg.toFixed(1)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
        <p className="text-xs text-muted-foreground">Tip: a subject is locked once marks are entered. Rankings are calculated automatically on the Grades and Reports pages.</p>
      </div>
    </>
  );
}
