import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { PermissionGate } from "@/components/permission-gate";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit3, Printer, Search, Trash2, Wallet } from "lucide-react";
import { addPayment, deletePayment, feeStatusForStudent, formatKES, updatePayment, useStore, type Payment, type Term } from "@/lib/store";

export const Route = createFileRoute("/fees")({
  head: () => ({ meta: [{ title: "Fees — School Management" }] }),
  component: () => (
    <PermissionGate path="/fees">
      <FeesPage />
    </PermissionGate>
  ),
});

function FeesPage() {
  const store = useStore();
  const [classFilter, setClassFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [studentId, setStudentId] = useState("");
  const [term, setTerm] = useState<Term>(1);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("M-Pesa");
  const [ref, setRef] = useState("");
  const [date, setDate] = useState(toDateTimeLocal(new Date()));
  const [receiptPaymentId, setReceiptPaymentId] = useState<string | null>(null);

  const students = store.students.filter((s) => {
    if (!classFilter) return false;
    if (classFilter !== "all" && s.classId !== classFilter) return false;
    if (search && !`${s.name} ${s.admissionNo}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const selectedStudent = store.students.find((x) => x.id === studentId);
  const selectedFee = studentId ? feeStatusForStudent(studentId) : null;
  const receiptPayment = store.payments.find((payment) => payment.id === receiptPaymentId) ?? null;
  const receiptStudent = receiptPayment ? store.students.find((student) => student.id === receiptPayment.studentId) ?? null : null;
  const receiptFee = receiptPayment ? feeStatusForStudent(receiptPayment.studentId) : null;
  const receiptClass = receiptFee?.class ?? null;

  const openFor = (sid: string) => {
    setEditingPaymentId(null);
    setStudentId(sid);
    setAmount("");
    setRef("");
    setTerm(1);
    setDate(toDateTimeLocal(new Date()));
    setOpen(true);
  };

  const openEditPayment = (payment: Payment) => {
    setEditingPaymentId(payment.id);
    setStudentId(payment.studentId);
    setTerm(payment.term);
    setAmount(String(payment.amount));
    setMethod(payment.method);
    setRef(payment.ref ?? "");
    setDate(toDateTimeLocal(new Date(payment.date)));
    setOpen(true);
  };

  const save = async () => {
    if (!studentId || !amount) return;
    const amt = Number(amount) || 0;
    const payload = {
      studentId,
      term,
      amount: amt,
      method,
      ref: ref.trim() || undefined,
      date,
    };
    if (editingPaymentId) {
      await updatePayment(editingPaymentId, payload);
    } else {
      await addPayment(payload);
    }
    setEditingPaymentId(null);
    setOpen(false);
  };

  const printPayment = (payment: Payment) => {
    setReceiptPaymentId(payment.id);
    window.setTimeout(() => window.print(), 50);
  };

  const totals = classFilter ? students.reduce(
    (acc, st) => {
      const f = feeStatusForStudent(st.id);
      if (!f) return acc;
      acc.expected += f.yearly;
      acc.paid += f.paidTotal;
      return acc;
    },
    { expected: 0, paid: 0 },
  ) : { expected: 0, paid: 0 };

  return (
    <>
      <style>{`
        @media screen {
          #payment-receipt {
            display: none;
          }
        }
        @media print {
          html, body {
            height: auto !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          body * {
            visibility: hidden !important;
          }
          #payment-receipt,
          #payment-receipt * {
            visibility: visible !important;
          }
          #payment-receipt {
            display: block !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            min-height: 100vh !important;
            padding: 40px 48px !important;
            background: white !important;
            color: black !important;
            font-size: 14px !important;
            line-height: 1.5 !important;
            z-index: 9999 !important;
          }
        }
      `}</style>
      <PageHeader
        title="Fees"
        description="Each class fee is split into 3 terms automatically. Record payments per term."
        actions={
          <>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search admission no. or name"
                className="w-64 pl-9"
              />
            </div>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Select class" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All classes</SelectItem>
                {store.classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
      />
      <div className="space-y-6 p-6">
        {classFilter && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card><CardHeader className="pb-2"><CardDescription>Expected</CardDescription><CardTitle className="text-2xl">{formatKES(totals.expected)}</CardTitle></CardHeader></Card>
          <Card><CardHeader className="pb-2"><CardDescription>Collected</CardDescription><CardTitle className="text-2xl text-success">{formatKES(totals.paid)}</CardTitle></CardHeader></Card>
          <Card><CardHeader className="pb-2"><CardDescription>Outstanding</CardDescription><CardTitle className="text-2xl text-destructive">{formatKES(Math.max(0, totals.expected - totals.paid))}</CardTitle></CardHeader></Card>
        </div>
        )}

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead className="text-right">Annual fee</TableHead>
                  <TableHead className="text-right">Per term</TableHead>
                  <TableHead className="text-right">T1 paid</TableHead>
                  <TableHead className="text-right">T2 paid</TableHead>
                  <TableHead className="text-right">T3 paid</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!classFilter && (
                  <TableRow><TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-10">Select a class to view fee records.</TableCell></TableRow>
                )}
                {classFilter && students.length === 0 && (
                  <TableRow><TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-10">No students in this class.</TableCell></TableRow>
                )}
                {students.map((st) => {
                  const f = feeStatusForStudent(st.id);
                  if (!f) return null;
                  const balance = f.balanceTotal;
                  return (
                    <TableRow key={st.id}>
                      <TableCell className="font-medium">{st.name}<div className="text-xs text-muted-foreground">{st.admissionNo}</div></TableCell>
                      <TableCell>{f.class?.name ?? "—"}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatKES(f.yearly)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatKES(f.perTerm)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatKES(f.byTerm[1])}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatKES(f.byTerm[2])}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatKES(f.byTerm[3])}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {balance <= 0 ? (
                          <Badge className="bg-success/15 text-success border-success/30" variant="outline">Cleared</Badge>
                        ) : (
                          <span className="text-destructive">{formatKES(balance)}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => openFor(st.id)}>
                          <Wallet className="h-4 w-4" /> Record payment
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Recent payments</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Ref</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {store.payments.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-6">No payments recorded.</TableCell></TableRow>
                )}
                {[...store.payments].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30).map((p) => {
                  const s = store.students.find((x) => x.id === p.studentId);
                  return (
                    <TableRow key={p.id}>
                        <TableCell>{new Date(p.date).toLocaleString()}</TableCell>
                      <TableCell>{s?.name ?? "—"}</TableCell>
                      <TableCell><Badge variant="outline">Term {p.term}</Badge></TableCell>
                      <TableCell className="text-right tabular-nums">{formatKES(p.amount)}</TableCell>
                      <TableCell>{p.method}</TableCell>
                      <TableCell className="font-mono text-xs">{p.ref ?? "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button size="icon" variant="ghost" onClick={() => openEditPayment(p)}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => printPayment(p)}>
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => { if (confirm("Delete this payment?")) deletePayment(p.id); }}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPaymentId ? "Edit payment" : "Record payment"}</DialogTitle>
            <DialogDescription>{selectedStudent ? `${selectedStudent.name} · ${selectedStudent.admissionNo}` : "Select a student"}</DialogDescription>
          </DialogHeader>
          {selectedFee && (
            <div className="grid gap-3 rounded-md border p-3 text-sm sm:grid-cols-3">
              <div><div className="text-xs text-muted-foreground">Expected</div><div className="font-medium">{formatKES(selectedFee.expectedByTerm[term])}</div></div>
              <div><div className="text-xs text-muted-foreground">Paid this term</div><div className="font-medium">{formatKES(selectedFee.byTerm[term])}</div></div>
              <div><div className="text-xs text-muted-foreground">Balance</div><div className="font-medium">{formatKES(Math.max(0, selectedFee.expectedByTerm[term] - selectedFee.byTerm[term]))}</div></div>
            </div>
          )}
          <div className="grid gap-4 py-4 sm:grid-cols-2">
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
            <div className="space-y-2"><Label>Amount (KES)</Label><Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
            <div className="space-y-2">
              <Label>Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="M-Pesa">M-Pesa</SelectItem>
                  <SelectItem value="Bank">Bank</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Date/time paid</Label><Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <div className="space-y-2 sm:col-span-2"><Label>Reference (optional)</Label><Input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="e.g. MPESA QHJ123ABC" /></div>
          </div>
          <DialogFooter>
            {editingPaymentId && (
              <Button
                variant="outline"
                onClick={() => {
                  const payment = store.payments.find((item) => item.id === editingPaymentId);
                  if (payment) printPayment(payment);
                }}
              >
                <Printer className="h-4 w-4" /> Print
              </Button>
            )}
            <Button onClick={save}>{editingPaymentId ? "Save payment" : "Save payment record"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {receiptPayment && receiptStudent && receiptFee && (
        <PaymentReceipt
          school={store.school}
          student={receiptStudent}
          classNameValue={receiptClass?.name ?? "-"}
          payment={receiptPayment}
          amountExpected={receiptFee.expectedByTerm[receiptPayment.term] ?? 0}
          balance={Math.max(0, receiptFee.balanceTotal)}
        />
      )}
    </>
  );
}

function PaymentReceipt({
  school,
  student,
  classNameValue,
  payment,
  amountExpected,
  balance,
}: {
  school: ReturnType<typeof useStore>["school"];
  student: ReturnType<typeof useStore>["students"][number];
  classNameValue: string;
  payment: Payment;
  amountExpected: number;
  balance: number;
}) {
  return (
    <section id="payment-receipt">
      <div style={{ display: "flex", alignItems: "center", gap: 20, borderBottom: "2px solid #111", paddingBottom: 20, marginBottom: 8 }}>
        {student.image ? (
          <img src={student.image} alt={student.name} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 4 }} />
        ) : (
          <div style={{ width: 80, height: 80, border: "1px solid #ccc", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#999" }}>No photo</div>
        )}
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>{school?.name ?? "School"}</h1>
          <div style={{ fontSize: 13, color: "#555", marginTop: 2 }}>{school?.address}</div>
          <div style={{ fontSize: 13, color: "#555" }}>{school?.phone}{school?.email ? ` | ${school.email}` : ""}</div>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 24, marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Fee Payment Receipt</h2>
        <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>Receipt #{payment.id.slice(0, 8).toUpperCase()}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 20, fontSize: 14 }}>
        <ReceiptLine label="Student name" value={student.name} />
        <ReceiptLine label="Admission number" value={student.admissionNo} />
        <ReceiptLine label="Class" value={classNameValue} />
        <ReceiptLine label="Term" value={`Term ${payment.term}`} />
        <ReceiptLine label="Amount expected" value={formatKES(amountExpected)} />
        <ReceiptLine label="Amount paid" value={formatKES(payment.amount)} />
        <ReceiptLine label="Balance" value={formatKES(balance)} />
        <ReceiptLine label="Payment method" value={payment.method} />
        <ReceiptLine label="Reference" value={payment.ref ?? "-"} />
        <ReceiptLine label="Date paid" value={new Date(payment.date).toLocaleString()} />
      </div>

      <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, fontSize: 14 }}>
        <div>
          <div style={{ borderTop: "1.5px solid #111", paddingTop: 10 }}>Received by / Signature</div>
        </div>
        <div>
          <div style={{ borderTop: "1.5px solid #111", paddingTop: 10 }}>Date printed: {new Date().toLocaleString()}</div>
        </div>
      </div>

      <div style={{ marginTop: 32, textAlign: "center", fontSize: 11, color: "#999", borderTop: "1px solid #ddd", paddingTop: 16 }}>
        This is a computer-generated receipt. No signature is required.
      </div>
    </section>
  );
}

function ReceiptLine({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ borderBottom: "1px solid #ddd", paddingBottom: 8 }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", color: "#555" }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{value}</div>
    </div>
  );
}

function toDateTimeLocal(date: Date) {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}
