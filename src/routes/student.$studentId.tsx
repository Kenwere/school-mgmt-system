import { Link, createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowLeft, Printer, Wallet, TrendingUp, AlertCircle, CheckCircle2, GraduationCap, Phone, Mail, Users, Hash, User2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PermissionGate } from "@/components/permission-gate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { feeStatusForStudent, formatKES, useStore, type Term } from "@/lib/store";

export const Route = createFileRoute("/student/$studentId")({
  head: () => ({ meta: [{ title: "Student profile" }] }),
  component: () => (
    <PermissionGate path="/students">
      <StudentDetailPage />
    </PermissionGate>
  ),
});

function StudentDetailPage() {
  const { studentId } = Route.useParams();
  const store = useStore();
  const student = store.students.find((s) => s.id === studentId);
  const fee = feeStatusForStudent(studentId);
  const payments = store.payments
    .filter((p) => p.studentId === studentId)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (!student || !fee) {
    return (
      <div className="p-6">
        <Link to="/students" className="text-sm text-muted-foreground hover:text-foreground">Back to students</Link>
        <p className="mt-6 text-sm text-muted-foreground">Student not found.</p>
      </div>
    );
  }

  const expectedFor = (term: Term) => fee.expectedByTerm[term] ?? 0;
  const paidFor = (term: Term) => payments.filter((p) => p.term === term).reduce((sum, p) => sum + p.amount, 0);
  const balance = Math.max(0, fee.balanceTotal);
  const isCleared = balance <= 0;

  const examProgress = useMemo(() => {
    const sorted = [...store.exams].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return sorted.map((e) => {
      const marks = store.marks.filter((m) => m.examId === e.id && m.studentId === studentId);
      const total = marks.reduce((s, m) => s + m.score, 0);
      const avg = marks.length ? total / marks.length : 0;
      const maxPossible = marks.length * 100;
      return {
        name: `${e.name} (T${e.term} ${e.year})`,
        total,
        average: Math.round(avg * 10) / 10,
        percentage: maxPossible > 0 ? Math.round((total / maxPossible) * 100) : 0,
        subjects: marks.length,
      };
    });
  }, [store.exams, store.marks, studentId]);

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #student-print-area, #student-print-area * { visibility: visible !important; }
          #student-print-area {
            position: fixed !important; top: 0 !important; left: 0 !important;
            width: 100% !important; height: auto !important; padding: 32px 40px !important;
            background: white !important; color: black !important; z-index: 9999 !important;
          }
          .print-hide { display: none !important; }
          .print-card { box-shadow: none !important; border: none !important; background: transparent !important; }
          .print-card > div { padding: 0 !important; }
        }
      `}</style>

      <div id="student-print-area">
        <PageHeader
          title={student.name}
          description={`${student.admissionNo} - ${fee.class?.name ?? "No class"}`}
          actions={
            <Button variant="outline" className="print-hide" asChild>
              <Link to="/students"><ArrowLeft className="h-4 w-4" /> Students</Link>
            </Button>
          }
        />

        <div className="space-y-6 p-6">
          {/* Profile hero */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border p-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="shrink-0">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-xl border-2 border-primary/20 bg-white shadow-lg shadow-primary/5">
                  {student.image ? (
                    <img src={student.image} alt={student.name} className="h-full w-full object-cover" />
                  ) : (
                    <User2 className="h-10 w-10 text-muted-foreground/40" />
                  )}
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <h1 className="text-2xl font-bold tracking-tight">{student.name}</h1>
                  <Badge variant="outline" className={`w-fit ${isCleared ? "bg-success/10 text-success border-success/30" : "bg-warning/10 text-warning-foreground border-warning/30"}`}>
                    {isCleared ? "Fees cleared" : "Fees owing"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{fee.class?.name ?? "No class"} · {student.admissionNo}</p>
                <div className="flex flex-wrap gap-4 mt-3 text-sm">
                  {student.parent && (
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <Users className="h-3.5 w-3.5" /> {student.parent}
                    </span>
                  )}
                  {student.phone && (
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" /> {student.phone}
                    </span>
                  )}
                  {student.email && (
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" /> {student.email}
                    </span>
                  )}
                </div>
              </div>
              <div className="print-hide">
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <Printer className="h-4 w-4" /> Print
                </Button>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Expected</p>
                  <p className="text-lg font-bold">{formatKES(fee.yearly)}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-success/10 text-success shrink-0">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Paid</p>
                  <p className="text-lg font-bold text-success">{formatKES(fee.paidTotal)}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-destructive/10 text-destructive shrink-0">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Balance</p>
                  <p className="text-lg font-bold text-destructive">{formatKES(balance)}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex h-11 w-11 items-center justify-center rounded-lg shrink-0 ${isCleared ? "bg-success/10 text-success" : "bg-warning/10 text-warning-foreground"}`}>
                  {isCleared ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p>
                  <p className={`text-lg font-bold ${isCleared ? "text-success" : "text-warning-foreground"}`}>
                    {isCleared ? "Cleared" : "Owing"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Details + Fee record */}
          <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User2 className="h-4 w-4 text-muted-foreground" /> Student Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <Hash className="h-3 w-3" /> Admission No.
                    </div>
                    <p className="font-semibold">{student.admissionNo}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <User2 className="h-3 w-3" /> Gender
                    </div>
                    <p className="font-semibold">{student.gender}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <GraduationCap className="h-3 w-3" /> Class
                    </div>
                    <p className="font-semibold">{fee.class?.name ?? "-"}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <Users className="h-3 w-3" /> Parent
                    </div>
                    <p className="font-semibold">{student.parent}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <Phone className="h-3 w-3" /> Phone
                    </div>
                    <p className="font-semibold">{student.phone}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <Mail className="h-3 w-3" /> Email
                    </div>
                    <p className="font-semibold">{student.email ?? "-"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-muted-foreground" /> Fee Record
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Term</TableHead>
                      <TableHead className="text-right">Fee paid</TableHead>
                      <TableHead className="text-right">Amount expected</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead>Date/time paid</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.length === 0 && (
                      <TableRow><TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">No fee payments recorded.</TableCell></TableRow>
                    )}
                    {payments.map((payment) => {
                      const expected = expectedFor(payment.term);
                      const paid = paidFor(payment.term);
                      const bal = Math.max(0, expected - paid);
                      return (
                        <TableRow key={payment.id}>
                          <TableCell><Badge variant="outline">Term {payment.term}</Badge></TableCell>
                          <TableCell className="text-right tabular-nums font-medium">{formatKES(payment.amount)}</TableCell>
                          <TableCell className="text-right tabular-nums">{formatKES(expected)}</TableCell>
                          <TableCell className="text-right tabular-nums">{bal <= 0 ? <span className="text-success font-medium">Cleared</span> : <span className="text-destructive">{formatKES(bal)}</span>}</TableCell>
                          <TableCell className="text-muted-foreground">{new Date(payment.date).toLocaleString()}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Exam Progress */}
          {examProgress.length > 0 && (
            <Card className="print-hide">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" /> Exam Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={examProgress}>
                    <defs>
                      <linearGradient id="examGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 11 }} />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13 }}
                    />
                    <Bar dataKey="total" fill="url(#examGradient)" radius={[4, 4, 0, 0]} name="Total marks" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
