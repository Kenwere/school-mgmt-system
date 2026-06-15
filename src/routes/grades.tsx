import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { PermissionGate } from "@/components/permission-gate";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Printer } from "lucide-react";
import { gradeFromScore, rankingForExam, useStore } from "@/lib/store";

export const Route = createFileRoute("/grades")({
  head: () => ({ meta: [{ title: "Grades & ranking — School Management" }] }),
  component: () => (
    <PermissionGate path="/grades">
      <GradesPage />
    </PermissionGate>
  ),
});

function gradeColor(g: string) {
  if (g.startsWith("A")) return "bg-success/15 text-success border-success/30";
  if (g.startsWith("B")) return "bg-accent/15 text-accent border-accent/30";
  if (g.startsWith("C")) return "bg-warning/20 text-warning-foreground border-warning/40";
  return "bg-destructive/15 text-destructive border-destructive/30";
}

function GradesPage() {
  const store = useStore();
  const [examId, setExamId] = useState(store.exams[0]?.id ?? "");
  const [classId, setClassId] = useState<string>("all");

  const ranking = examId ? rankingForExam(examId, classId === "all" ? undefined : classId) : [];

  return (
    <>
      <style>{`
        @media print {
          .grades-filters {
            display: none !important;
          }
          .grades-table-card {
            box-shadow: none !important;
            border: none !important;
          }
          .grades-table-card > div {
            padding: 0 !important;
          }
        }
      `}</style>
      <PageHeader
        title="Grades & ranking"
        description="Auto-ranked from marks recorded against each exam."
        actions={
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print
          </Button>
        }
      />
      <div className="space-y-4 p-6">
        <Card className="grades-filters">
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

        <Card className="grades-table-card">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead className="text-right">Subjects</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Average</TableHead>
                  <TableHead>Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ranking.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-10">No marks recorded for this selection yet.</TableCell></TableRow>
                )}
                {ranking.map((r) => {
                  const cls = store.classes.find((c) => c.id === r.student.classId);
                  const grade = gradeFromScore(r.avg);
                  return (
                    <TableRow key={r.student.id}>
                      <TableCell className="font-mono">{r.rank ? `#${r.rank}` : "—"}</TableCell>
                      <TableCell className="font-medium">{r.student.name}</TableCell>
                      <TableCell>{cls?.name ?? "—"}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.count}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.total}</TableCell>
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
