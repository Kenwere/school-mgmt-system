import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { PageHeader } from "@/components/page-header";
import { PermissionGate } from "@/components/permission-gate";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { gradeFromScore, useStore } from "@/lib/store";

export const Route = createFileRoute("/ranking")({
  head: () => ({ meta: [{ title: "Ranking — School Management" }] }),
  component: () => (
    <PermissionGate path="/ranking">
      <RankingPage />
    </PermissionGate>
  ),
});

function gradeColor(g: string) {
  if (g.startsWith("A")) return "bg-success/15 text-success border-success/30";
  if (g.startsWith("B")) return "bg-accent/15 text-accent border-accent/30";
  if (g.startsWith("C")) return "bg-warning/20 text-warning-foreground border-warning/40";
  return "bg-destructive/15 text-destructive border-destructive/30";
}

function RankingPage() {
  const store = useStore();
  const [examId, setExamId] = useState(store.exams[0]?.id ?? "");
  const [classId, setClassId] = useState("all");

  const cls = classId !== "all" ? store.classes.find((c) => c.id === classId) : null;
  const subjects = cls?.subjects ?? [];

  const students = useMemo(
    () => (classId === "all"
      ? store.students
      : store.students.filter((s) => s.classId === classId)
    ).filter((s) => s.active !== false),
    [store.students, classId],
  );

  const ranking = useMemo(() => {
    const examMarks = store.marks.filter((m) => m.examId === examId);
    const rows = students.map((st) => {
      const ms = examMarks.filter((m) => m.studentId === st.id);
      const bySubject: Record<string, number> = {};
      for (const m of ms) bySubject[m.subject] = m.score;
      const total = ms.reduce((a, b) => a + b.score, 0);
      const avg = ms.length ? total / ms.length : 0;
      return { student: st, bySubject, total, avg, count: ms.length };
    });
    rows.sort((a, b) => b.avg - a.avg);
    return rows.map((r, i) => ({ ...r, rank: r.count ? i + 1 : 0 }));
  }, [store.marks, examId, students]);

  return (
    <>
      <PageHeader
        title="Ranking"
        description="Per-exam ranking with subject breakdown for each class."
      />
      <div className="space-y-4 p-6">
        <Card>
          <CardContent className="grid gap-4 p-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Exam</Label>
              <Select value={examId} onValueChange={setExamId}>
                <SelectTrigger><SelectValue placeholder="Select an exam" /></SelectTrigger>
                <SelectContent>
                  {store.exams.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.name} — Term {e.term} {e.year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All classes</SelectItem>
                  {store.classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  {subjects.map((s) => (
                    <TableHead key={s} className="text-right">{s}</TableHead>
                  ))}
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Average</TableHead>
                  <TableHead>Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ranking.length === 0 && (
                  <TableRow><TableCell colSpan={5 + subjects.length} className="text-center text-sm text-muted-foreground py-10">No marks recorded for this selection yet.</TableCell></TableRow>
                )}
                {ranking.map((r) => {
                  const cls = store.classes.find((c) => c.id === r.student.classId);
                  const grade = gradeFromScore(r.avg);
                  return (
                    <TableRow key={r.student.id}>
                      <TableCell className="font-mono">{r.rank ? `#${r.rank}` : "—"}</TableCell>
                      <TableCell className="font-medium">{r.student.name}<div className="text-xs text-muted-foreground">{r.student.admissionNo}</div></TableCell>
                      <TableCell>{cls?.name ?? "—"}</TableCell>
                      {subjects.map((s) => (
                        <TableCell key={s} className="text-right tabular-nums">
                          {r.bySubject[s] != null ? r.bySubject[s] : "—"}
                        </TableCell>
                      ))}
                      <TableCell className="text-right tabular-nums font-medium">{r.total}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.avg.toFixed(1)}</TableCell>
                      <TableCell><Badge variant="outline" className={gradeColor(grade)}>{grade}</Badge></TableCell>
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
