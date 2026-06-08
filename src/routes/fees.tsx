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
  const [classFilter, setClassFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [studentId, setStudentId] = useState("");
  const [term, setTerm] = useState<Term>(1);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("M-Pesa");
  const [ref, setRef] = useState("");
  const [date, setDate] = useState(toDateTimeLocal(new Date()));

  const students = store.students.filter((s) => {
    if (classFilter !== "all" && s.classId !== classFilter) return false;
    if (search && !`${s.name} ${s.admissionNo}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const selectedStudent = store.students.find((x) => x.id === studentId);
  const selectedFee = studentId ? feeStatusForStudent(studentId) : null;

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

  const totals = students.reduce(
    (acc, st) => {
      const f = feeStatusForStudent(st.id);
      if (!f) return acc;
      acc.expected += f.yearly;
      acc.paid += f.paidTotal;
      return acc;
    },
    { expected: 0, paid: 0 },
  );

  return (
    <>
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
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
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
        <div className="grid gap-4 sm:grid-cols-3">
          <Card><CardHeader className="pb-2"><CardDescription>Expected</CardDescription><CardTitle className="text-2xl">{formatKES(totals.expected)}</CardTitle></CardHeader></Card>
          <Card><CardHeader className="pb-2"><CardDescription>Collected</CardDescription><CardTitle className="text-2xl text-success">{formatKES(totals.paid)}</CardTitle></CardHeader></Card>
          <Card><CardHeader className="pb-2"><CardDescription>Outstanding</CardDescription><CardTitle className="text-2xl text-destructive">{formatKES(Math.max(0, totals.expected - totals.paid))}</CardTitle></CardHeader></Card>
        </div>

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
                {students.length === 0 && (
                  <TableRow><TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-10">No students.</TableCell></TableRow>
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
                        <Button size="icon" variant="ghost" onClick={() => window.print()}>
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
            <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" /> Print</Button>
            <Button onClick={save}>{editingPaymentId ? "Save payment" : "Save payment record"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function toDateTimeLocal(date: Date) {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}
