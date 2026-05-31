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
import { Plus, Trash2, Wallet } from "lucide-react";
import { addPayment, deletePayment, feeStatusForStudent, formatKES, useStore, type Term } from "@/lib/store";

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
  const [open, setOpen] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [term, setTerm] = useState<Term>(1);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("M-Pesa");
  const [ref, setRef] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const students = store.students.filter((s) => classFilter === "all" || s.classId === classFilter);

  const openFor = (sid: string) => {
    setStudentId(sid);
    setAmount("");
    setRef("");
    setTerm(1);
    setDate(new Date().toISOString().slice(0, 10));
    setOpen(true);
  };

  const save = () => {
    if (!studentId || !amount) return;
    addPayment({
      studentId,
      term,
      amount: Number(amount) || 0,
      method,
      ref: ref.trim() || undefined,
      date,
    });
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
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All classes</SelectItem>
              {store.classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                  <TableRow><TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-10">No students.</TableCell></TableRow>
                )}
                {students.map((st) => {
                  const f = feeStatusForStudent(st.id);
                  if (!f) return null;
                  const balance = f.balanceTotal;
                  return (
                    <TableRow key={st.id}>
                      <TableCell className="font-medium">{st.name}<div className="text-xs text-muted-foreground">{st.admissionNo}</div></TableCell>
                      <TableCell>{f.class?.name ?? "—"}</TableCell>
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
                          <Wallet className="h-4 w-4" /> Record
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
                      <TableCell>{p.date}</TableCell>
                      <TableCell>{s?.name ?? "—"}</TableCell>
                      <TableCell><Badge variant="outline">Term {p.term}</Badge></TableCell>
                      <TableCell className="text-right tabular-nums">{formatKES(p.amount)}</TableCell>
                      <TableCell>{p.method}</TableCell>
                      <TableCell className="font-mono text-xs">{p.ref ?? "—"}</TableCell>
                      <TableCell className="text-right">
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
            <DialogTitle>Record payment</DialogTitle>
            <DialogDescription>{store.students.find((x) => x.id === studentId)?.name}</DialogDescription>
          </DialogHeader>
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
            <div className="space-y-2"><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <div className="space-y-2 sm:col-span-2"><Label>Reference (optional)</Label><Input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="e.g. MPESA QHJ123ABC" /></div>
          </div>
          <DialogFooter><Button onClick={save}>Save payment</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
