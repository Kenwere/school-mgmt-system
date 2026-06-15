import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { PermissionGate } from "@/components/permission-gate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Printer, School as SchoolIcon } from "lucide-react";
import {
  feeStatusForStudent,
  formatKES,
  gradeFromScore,
  rankingForExam,
  useStore,
} from "@/lib/store";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports — School Management" }] }),
  component: () => (
    <PermissionGate path="/reports">
      <ReportsPage />
    </PermissionGate>
  ),
});

function ReportsPage() {
  const store = useStore();
  const school = store.school;

  return (
    <>
      <PageHeader
        title="Reports"
        actions={
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print current
          </Button>
        }
      />
      <div className="p-6">
        <Tabs defaultValue="report-cards">
          <TabsList>
            <TabsTrigger value="report-cards">Report cards</TabsTrigger>
            <TabsTrigger value="fees">Fee statements</TabsTrigger>
            <TabsTrigger value="students">Student list</TabsTrigger>
            <TabsTrigger value="classes">Class list</TabsTrigger>
          </TabsList>

          <TabsContent value="report-cards"><ReportCards school={school} /></TabsContent>
          <TabsContent value="fees"><FeeStatements school={school} /></TabsContent>
          <TabsContent value="students"><StudentList school={school} /></TabsContent>
          <TabsContent value="classes"><ClassList school={school} /></TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function SchoolLetterhead({ school, title }: { school: any; title: string }) {
  return (
    <div className="flex items-center justify-between border-b pb-4">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-md bg-primary text-primary-foreground">
          {school?.logo ? <img src={school.logo} className="h-full w-full object-cover" /> : <SchoolIcon className="h-6 w-6" />}
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</div>
      </div>
    </div>
  );
}

function ReportCards({ school }: { school: any }) {
  const store = useStore();
  const [examId, setExamId] = useState(store.exams[0]?.id ?? "");
  const [classId, setClassId] = useState(store.classes[0]?.id ?? "");
  const exam = store.exams.find((e) => e.id === examId);
  const ranking = examId ? rankingForExam(examId, classId) : [];
  const cls = store.classes.find((c) => c.id === classId);

  return (
    <Card className="mt-4">
      <CardHeader className="print:hidden">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Select value={examId} onValueChange={setExamId}>
              <SelectTrigger><SelectValue placeholder="Select exam" /></SelectTrigger>
              <SelectContent>{store.exams.map((e) => <SelectItem key={e.id} value={e.id}>{e.name} — Term {e.term} {e.year}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
              <SelectContent>{store.classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {ranking.length === 0 && <p className="text-sm text-muted-foreground">No marks for this selection.</p>}
        {ranking.map((r) => {
          const marks = store.marks.filter((m) => m.examId === examId && m.studentId === r.student.id);
          return (
            <div key={r.student.id} className="report-card rounded-md border bg-card p-6 print:break-after-page">
              <SchoolLetterhead school={school} title={`Report card — ${exam?.name ?? ""}`} />
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Student:</span> <span className="font-medium">{r.student.name}</span></div>
                <div><span className="text-muted-foreground">Adm. No:</span> {r.student.admissionNo}</div>
                <div><span className="text-muted-foreground">Class:</span> {cls?.name}</div>
                <div><span className="text-muted-foreground">Term:</span> {exam?.term} / {exam?.year}</div>
              </div>
              <Table className="mt-4">
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {marks.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>{m.subject}</TableCell>
                      <TableCell className="text-right tabular-nums">{m.score}</TableCell>
                      <TableCell><Badge variant="outline">{gradeFromScore(m.score)}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 flex justify-between border-t pt-3 text-sm">
                <div>Total: <span className="font-semibold tabular-nums">{r.total}</span></div>
                <div>Average: <span className="font-semibold tabular-nums">{r.avg.toFixed(1)}</span></div>
                <div>Grade: <Badge variant="outline">{gradeFromScore(r.avg)}</Badge></div>
                <div>Rank: <span className="font-semibold">#{r.rank || "—"}</span></div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function FeeStatements({ school }: { school: any }) {
  const store = useStore();
  const [filter, setFilter] = useState<"all" | "paid" | "pending">("all");
  const [classId, setClassId] = useState("all");

  const rows = store.students
    .filter((s) => classId === "all" || s.classId === classId)
    .map((s) => {
      const f = feeStatusForStudent(s.id);
      return { s, f };
    })
    .filter(({ f }) => {
      if (!f) return false;
      if (filter === "paid") return f.balanceTotal <= 0 && f.yearly > 0;
      if (filter === "pending") return f.balanceTotal > 0;
      return true;
    });

  return (
    <Card className="mt-4">
      <CardHeader className="print:hidden">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
              <SelectTrigger><SelectValue placeholder="Filter" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="paid">Fully paid</SelectItem>
                <SelectItem value="pending">Pending balance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All classes</SelectItem>
                {store.classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <SchoolLetterhead school={school} title={`Fee statement — ${filter === "all" ? "All students" : filter === "paid" ? "Fully paid" : "Pending balance"}`} />
        <Table className="mt-4">
          <TableHeader>
            <TableRow>
              <TableHead>Adm No</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Class</TableHead>
              <TableHead className="text-right">Yearly</TableHead>
              <TableHead className="text-right">T1</TableHead>
              <TableHead className="text-right">T2</TableHead>
              <TableHead className="text-right">T3</TableHead>
              <TableHead className="text-right">Paid</TableHead>
              <TableHead className="text-right">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ s, f }) => f && (
              <TableRow key={s.id}>
                <TableCell className="font-mono text-xs">{s.admissionNo}</TableCell>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>{f.class?.name ?? "—"}</TableCell>
                <TableCell className="text-right tabular-nums">{formatKES(f.yearly)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatKES(f.byTerm[1])}</TableCell>
                <TableCell className="text-right tabular-nums">{formatKES(f.byTerm[2])}</TableCell>
                <TableCell className="text-right tabular-nums">{formatKES(f.byTerm[3])}</TableCell>
                <TableCell className="text-right tabular-nums">{formatKES(f.paidTotal)}</TableCell>
                <TableCell className="text-right tabular-nums">{f.balanceCredit > 0 ? <Badge variant="outline" className="bg-success/15 text-success border-success/30">Credit {formatKES(f.balanceCredit)}</Badge> : f.balanceOwing > 0 ? <span className="text-destructive">{formatKES(f.balanceOwing)}</span> : <Badge variant="outline" className="bg-success/15 text-success border-success/30">Cleared</Badge>}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function StudentList({ school }: { school: any }) {
  const store = useStore();
  const [classId, setClassId] = useState("all");
  const students = store.students.filter((s) => classId === "all" || s.classId === classId);
  return (
    <Card className="mt-4">
      <CardHeader className="print:hidden">
        <CardTitle className="text-base">Student list</CardTitle>
        <div className="mt-3 max-w-xs">
          <Select value={classId} onValueChange={setClassId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All classes</SelectItem>
              {store.classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <SchoolLetterhead school={school} title="Student list" />
        <Table className="mt-4">
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Adm No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Phone</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((s, i) => {
              const c = store.classes.find((x) => x.id === s.classId);
              return (
                <TableRow key={s.id}>
                  <TableCell className="tabular-nums">{i + 1}</TableCell>
                  <TableCell className="font-mono text-xs">{s.admissionNo}</TableCell>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.gender}</TableCell>
                  <TableCell>{c?.name ?? "—"}</TableCell>
                  <TableCell>{s.parent}</TableCell>
                  <TableCell>{s.phone}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ClassList({ school }: { school: any }) {
  const store = useStore();
  return (
    <Card className="mt-4">
      <CardContent>
        <SchoolLetterhead school={school} title="Class list" />
        <Table className="mt-4">
          <TableHeader>
            <TableRow>
              <TableHead>Class</TableHead>
              <TableHead>Stream</TableHead>
              <TableHead>Teacher</TableHead>
              <TableHead>Room</TableHead>
              <TableHead className="text-right">Students</TableHead>
              <TableHead className="text-right">Fee / year</TableHead>
              <TableHead className="text-right">Fee / term</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {store.classes.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.stream ?? "—"}</TableCell>
                <TableCell>{c.teacher ?? "—"}</TableCell>
                <TableCell>{c.room ?? "—"}</TableCell>
                <TableCell className="text-right tabular-nums">{store.students.filter((s) => s.classId === c.id).length}</TableCell>
                <TableCell className="text-right tabular-nums">{formatKES(c.feePerYear)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatKES(c.feePerYear / 3)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
