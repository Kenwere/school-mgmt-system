import { createFileRoute } from "@tanstack/react-router";
import { Plus, Download, Wallet, AlertCircle, CheckCircle2, Smartphone } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fees, formatKES } from "@/lib/mock-data";

export const Route = createFileRoute("/fees")({
  head: () => ({ meta: [{ title: "Fees — Northfield Academy" }] }),
  component: FeesPage,
});

function FeesPage() {
  return (
    <>
      <PageHeader
        title="Fees & Billing"
        description="Invoices, payments, M-Pesa, bank and card collections."
        actions={
          <>
            <Button variant="outline"><Download className="h-4 w-4" />Export</Button>
            <Button><Plus className="h-4 w-4" />New Invoice</Button>
          </>
        }
      />
      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Collected (Term)" value={formatKES(12_450_000)} icon={Wallet} tone="success" />
          <StatCard label="Pending" value={formatKES(3_280_000)} icon={AlertCircle} tone="warning" />
          <StatCard label="Paid Invoices" value="1,089" icon={CheckCircle2} />
          <StatCard label="M-Pesa Today" value={formatKES(184_500)} icon={Smartphone} tone="success" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>Term 1 · 2025</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fees.map((f) => (
                  <TableRow key={f.invoice}>
                    <TableCell className="font-mono text-xs">{f.invoice}</TableCell>
                    <TableCell className="font-medium">{f.student}</TableCell>
                    <TableCell>{f.class}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatKES(f.amount)}</TableCell>
                    <TableCell className="text-right tabular-nums text-success">{formatKES(f.paid)}</TableCell>
                    <TableCell className="text-right tabular-nums text-destructive">{formatKES(f.balance)}</TableCell>
                    <TableCell className="text-muted-foreground">{f.method}</TableCell>
                    <TableCell>
                      <Badge variant={f.status === "Paid" ? "secondary" : f.status === "Partial" ? "default" : "destructive"}>{f.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
