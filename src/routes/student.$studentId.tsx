import { Link, createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Printer, Wallet, TrendingUp, AlertCircle, CheckCircle2, GraduationCap, Phone, Mail, Users, Hash, User2, Ban, CheckCircle } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PermissionGate } from "@/components/permission-gate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { feeStatusForStudent, formatKES, updateStudent, useStore, type Term } from "@/lib/store";

type LedgerEntry = {
  id: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
};

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

  const isCleared = fee.balanceOwing <= 0;
  const [toggling, setToggling] = useState(false);

  const toggleActive = async () => {
    setToggling(true);
    try {
      await updateStudent(student.id, { active: !student.active });
    } finally {
      setToggling(false);
    }
  };

  const ledgerEntries = useMemo(() => {
    const entries: LedgerEntry[] = [];
    let running = 0;

    if (fee.carriedForward > 0) {
      running += fee.carriedForward;
      entries.push({
        id: "cf",
        date: "Previous year",
        description: "Balance carried forward",
        debit: fee.carriedForward,
        credit: 0,
        balance: running,
      });
    }

    for (const term of [1, 2, 3] as Term[]) {
      const expected = fee.expectedByTerm[term] ?? 0;
      if (expected <= 0) continue;

      running += expected;
      entries.push({
        id: `fee-t${term}`,
        date: `Term ${term}`,
        description: `Term ${term} school fees`,
        debit: expected,
        credit: 0,
        balance: running,
      });

      const termPayments = payments
        .filter((p) => p.term === term)
        .sort((a, b) => a.date.localeCompare(b.date));

      for (const payment of termPayments) {
        running -= payment.amount;
        entries.push({
          id: payment.id,
          date: new Date(payment.date).toLocaleDateString(),
          description: `Payment${payment.ref ? ` (${payment.ref})` : ""} — ${payment.method}`,
          debit: 0,
          credit: payment.amount,
          balance: running,
        });
      }
    }

    if (entries.length === 0) {
      entries.push({
        id: "empty",
        date: "",
        description: "No fee records",
        debit: 0,
        credit: 0,
        balance: 0,
      });
    }

    return entries;
  }, [fee, payments]);

  const totalDebit = ledgerEntries.reduce((s, e) => s + e.debit, 0);
  const totalCredit = ledgerEntries.reduce((s, e) => s + e.credit, 0);
  const closingBalance = ledgerEntries.length > 0 ? ledgerEntries[ledgerEntries.length - 1].balance : 0;

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
        .print-fee { display: none; }
        @media print {
          body * { visibility: hidden !important; }
          .print-fee, .print-fee * { visibility: visible !important; }
          .print-fee {
            position: fixed !important; top: 0 !important; left: 0 !important;
            width: 100% !important; height: auto !important; padding: 32px 40px !important;
            background: white !important; color: black !important; z-index: 9999 !important;
            display: block !important;
          }
          .print-fee table { border-collapse: collapse !important; width: 100% !important; }
          .print-fee th {
            background: #f5f5f5 !important; color: #000 !important;
            font-weight: 600 !important; padding: 8px 12px !important;
            border: 1px solid #000 !important;
          }
          .print-fee td {
            padding: 6px 12px !important; border: 1px solid #000 !important;
            color: #000 !important;
          }
          .print-fee tr { page-break-inside: avoid !important; }
          .print-hide { display: none !important; }
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
                  {!student.active && (
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                      Disabled
                    </Badge>
                  )}
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
              <div className="print-hide flex items-center gap-2">
                <Button
                  variant={student.active ? "destructive" : "outline"}
                  size="sm"
                  onClick={toggleActive}
                  disabled={toggling}
                >
                  {student.active ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                  {student.active ? "Disable" : "Enable"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <Printer className="h-4 w-4" /> Print
                </Button>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-4">
            <Card className="flex-1 min-w-[180px]">
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
            <Card className="flex-1 min-w-[180px]">
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
            {fee.balanceOwing > 0 && (
              <Card className="flex-1 min-w-[180px]">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-destructive/10 text-destructive shrink-0">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Balance owing</p>
                    <p className="text-lg font-bold text-destructive">{formatKES(fee.balanceOwing)}</p>
                  </div>
                </CardContent>
              </Card>
            )}
            {fee.balanceCredit > 0 && (
              <Card className="flex-1 min-w-[180px]">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-success/10 text-success shrink-0">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Credit / Excess</p>
                    <p className="text-lg font-bold text-success">{formatKES(fee.balanceCredit)}</p>
                  </div>
                </CardContent>
              </Card>
            )}
            {fee.balanceOwing <= 0 && fee.balanceCredit <= 0 && (
              <Card className="flex-1 min-w-[180px]">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-success/10 text-success shrink-0">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Balance</p>
                    <p className="text-lg font-bold text-success">Cleared</p>
                  </div>
                </CardContent>
              </Card>
            )}
            {fee.carriedForward > 0 && (
              <Card className="flex-1 min-w-[180px]">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-warning/10 text-warning-foreground shrink-0">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Carried forward</p>
                    <p className="text-lg font-bold text-warning-foreground">{formatKES(fee.carriedForward)}</p>
                  </div>
                </CardContent>
              </Card>
            )}
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
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-muted-foreground" /> Fee Record
                  </CardTitle>
                  <div className="hidden md:flex items-center gap-6 text-xs text-muted-foreground">
                    <span>Total debit: <strong className="text-foreground">{formatKES(totalDebit)}</strong></span>
                    <span>Total credit: <strong className="text-foreground">{formatKES(totalCredit)}</strong></span>
                    <span>Balance: <strong className={closingBalance > 0 ? "text-destructive" : "text-success"}>{formatKES(closingBalance)}</strong></span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-36">Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right w-28">Debit (KES)</TableHead>
                      <TableHead className="text-right w-28">Credit (KES)</TableHead>
                      <TableHead className="text-right w-28">Balance (KES)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ledgerEntries.length === 1 && ledgerEntries[0].id === "empty" ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                          No fee records.
                        </TableCell>
                      </TableRow>
                    ) : (
                      ledgerEntries.map((entry, i) => (
                        <TableRow
                          key={entry.id}
                          className={
                            entry.id === "cf"
                              ? "bg-warning/5"
                              : entry.debit > 0
                                ? "bg-muted/30"
                                : ""
                          }
                        >
                          <TableCell className="text-xs text-muted-foreground">{entry.date}</TableCell>
                          <TableCell className="text-sm">{entry.description}</TableCell>
                          <TableCell className="text-right tabular-nums font-medium">
                            {entry.debit > 0 ? formatKES(entry.debit) : "—"}
                          </TableCell>
                          <TableCell className="text-right tabular-nums font-medium text-success">
                            {entry.credit > 0 ? formatKES(entry.credit) : "—"}
                          </TableCell>
                          <TableCell className="text-right tabular-nums font-semibold">
                            {entry.balance > 0 ? (
                              <span className="text-destructive">{formatKES(entry.balance)}</span>
                            ) : entry.balance < 0 ? (
                              <span className="text-success">{formatKES(Math.abs(entry.balance))} CR</span>
                            ) : (
                              <span className="text-success">Cleared</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                    {ledgerEntries.length > 1 && (
                      <TableRow className="border-t-2 border-border font-semibold bg-muted/50">
                        <TableCell colSpan={2} className="text-sm">Totals</TableCell>
                        <TableCell className="text-right tabular-nums">{formatKES(totalDebit)}</TableCell>
                        <TableCell className="text-right tabular-nums text-success">{formatKES(totalCredit)}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {closingBalance > 0 ? (
                            <span className="text-destructive">{formatKES(closingBalance)}</span>
                          ) : closingBalance < 0 ? (
                            <span className="text-success">{formatKES(Math.abs(closingBalance))} CR</span>
                          ) : (
                            <span className="text-success">Cleared</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
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

      {/* Print-only fee statement */}
      <div className="print-fee">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{student.name}</h1>
          <p style={{ margin: "4px 0 0", color: "#555", fontSize: 13 }}>
            Admission No: {student.admissionNo}
          </p>
        </div>
        <table>
          <thead>
            <tr>
              <th style={{ textAlign: "left", width: 140 }}>Date</th>
              <th style={{ textAlign: "left" }}>Description</th>
              <th style={{ textAlign: "right", width: 120 }}>Debit (KES)</th>
              <th style={{ textAlign: "right", width: 120 }}>Credit (KES)</th>
              <th style={{ textAlign: "right", width: 120 }}>Balance (KES)</th>
            </tr>
          </thead>
          <tbody>
            {ledgerEntries.length === 1 && ledgerEntries[0].id === "empty" ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: 32, color: "#888" }}>
                  No fee records.
                </td>
              </tr>
            ) : (
              ledgerEntries.map((entry) => (
                <tr key={entry.id}>
                  <td style={{ fontSize: 13, color: "#555" }}>{entry.date}</td>
                  <td style={{ fontSize: 13 }}>{entry.description}</td>
                  <td style={{ textAlign: "right", fontFamily: "monospace" }}>
                    {entry.debit > 0 ? formatKES(entry.debit) : "—"}
                  </td>
                  <td style={{ textAlign: "right", fontFamily: "monospace" }}>
                    {entry.credit > 0 ? formatKES(entry.credit) : "—"}
                  </td>
                  <td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 600 }}>
                    {entry.balance > 0 ? formatKES(entry.balance) : entry.balance < 0 ? `${formatKES(Math.abs(entry.balance))} CR` : "0"}
                  </td>
                </tr>
              ))
            )}
            {ledgerEntries.length > 1 && (
              <tr style={{ borderTop: "2px solid #000", fontWeight: 700 }}>
                <td colSpan={2} style={{ fontSize: 13 }}>Totals</td>
                <td style={{ textAlign: "right", fontFamily: "monospace" }}>{formatKES(totalDebit)}</td>
                <td style={{ textAlign: "right", fontFamily: "monospace" }}>{formatKES(totalCredit)}</td>
                <td style={{ textAlign: "right", fontFamily: "monospace" }}>
                  {closingBalance > 0 ? formatKES(closingBalance) : closingBalance < 0 ? `${formatKES(Math.abs(closingBalance))} CR` : "0"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
