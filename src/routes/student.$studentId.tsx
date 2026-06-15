import { Link, createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowLeft, Printer } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PermissionGate } from "@/components/permission-gate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
          body * {
            visibility: hidden !important;
          }
          #student-print-area,
          #student-print-area * {
            visibility: visible !important;
          }
          #student-print-area {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: auto !important;
            padding: 32px 40px !important;
            background: white !important;
            color: black !important;
            z-index: 9999 !important;
          }
          #student-print-area .print\\:hidden {
            display: none !important;
          }
          #student-print-area .print-card {
            box-shadow: none !important;
            border: none !important;
            background: transparent !important;
          }
          #student-print-area .print-card > div {
            padding: 0 !important;
          }
          #student-print-area .print-summary-grid {
            display: flex !important;
            gap: 24px !important;
            margin-bottom: 24px !important;
          }
          #student-print-area .print-summary-item {
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
            padding: 0 !important;
          }
          #student-print-area .print-summary-item > div {
            padding: 0 !important;
          }
          #student-print-area .print-summary-item h3 {
            font-size: 11px !important;
            text-transform: uppercase !important;
            color: #666 !important;
            margin: 0 0 2px !important;
          }
          #student-print-area .print-summary-item p {
            margin: 0 !important;
            font-size: 18px !important;
          }
          #student-print-area .print-table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin-top: 12px !important;
          }
          #student-print-area .print-table th {
            text-align: left !important;
            font-size: 11px !important;
            text-transform: uppercase !important;
            color: #666 !important;
            border-bottom: 2px solid #111 !important;
            padding: 6px 8px !important;
          }
          #student-print-area .print-table th.right {
            text-align: right !important;
          }
          #student-print-area .print-table td {
            padding: 6px 8px !important;
            border-bottom: 1px solid #ddd !important;
            font-size: 13px !important;
          }
          #student-print-area .print-table td.right {
            text-align: right !important;
          }
          .print-btn-hide {
            display: none !important;
          }
          #student-print-area .print-hide {
            display: none !important;
          }
        }
      `}</style>
      <div id="student-print-area">
        <PageHeader
          title={student.name}
          description={`${student.admissionNo} - ${fee.class?.name ?? "No class"}`}
          actions={
              <Button variant="outline" className="print-btn-hide" asChild>
              <Link to="/students"><ArrowLeft className="h-4 w-4" /> Students</Link>
            </Button>
          }
        />
      <div className="grid gap-4 p-6 lg:grid-cols-[320px_1fr]">
        <Card className="print-card">
          <CardHeader>
            <CardTitle className="text-base">Student Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-center">
              <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-md border bg-muted">
                {student.image ? (
                  <img src={student.image} alt={student.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs text-muted-foreground">No image</span>
                )}
              </div>
            </div>
            <Info label="Admission number" value={student.admissionNo} />
            <Info label="Gender" value={student.gender} />
            <Info label="Class" value={fee.class?.name ?? "-"} />
            <Info label="Parent / guardian" value={student.parent} />
            <Info label="Phone" value={student.phone} />
            <Info label="Email" value={student.email ?? "-"} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-4 print-summary-grid">
            <Card className="print-summary-item"><CardHeader className="pb-2"><CardTitle className="text-sm">Expected</CardTitle><p className="text-2xl font-semibold">{formatKES(fee.yearly)}</p></CardHeader></Card>
            <Card className="print-summary-item"><CardHeader className="pb-2"><CardTitle className="text-sm">Paid</CardTitle><p className="text-2xl font-semibold text-success">{formatKES(fee.paidTotal)}</p></CardHeader></Card>
            <Card className="print-summary-item"><CardHeader className="pb-2"><CardTitle className="text-sm">Balance</CardTitle><p className="text-2xl font-semibold text-destructive">{formatKES(Math.max(0, fee.balanceTotal))}</p></CardHeader></Card>
            <Card className="print-summary-item"><CardHeader className="pb-2"><CardTitle className="text-sm">Status</CardTitle><Badge variant="outline">{fee.balanceTotal <= 0 ? "Cleared" : "Owing"}</Badge></CardHeader></Card>
          </div>

          <Card className="print-card">
            <CardHeader className="flex flex-row items-center justify-between print-card">
              <CardTitle className="text-base">Fee Record</CardTitle>
              <Button variant="outline" size="sm" className="print-btn-hide" onClick={() => window.print()}><Printer className="h-4 w-4" /> Print</Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table className="print-table">
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
                    return (
                      <TableRow key={payment.id}>
                        <TableCell><Badge variant="outline">Term {payment.term}</Badge></TableCell>
                        <TableCell className="text-right tabular-nums">{formatKES(payment.amount)}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatKES(expected)}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatKES(Math.max(0, expected - paid))}</TableCell>
                        <TableCell>{new Date(payment.date).toLocaleString()}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {examProgress.length > 0 && (
            <Card className="print-hide">
              <CardHeader>
                <CardTitle className="text-base">Exam Progress</CardTitle>
                <CardDescription>Performance across exams from first to last</CardDescription>
              </CardHeader>
              <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={examProgress}>
                      <defs>
                        <linearGradient id="examGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.6} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
                      <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 11 }} />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Bar dataKey="total" fill="url(#examGradient)" radius={[4, 4, 0, 0]} name="Total marks" />
                    </BarChart>
                  </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      </div>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
