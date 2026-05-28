import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Download, Wallet, AlertCircle, Smartphone, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchClasses } from "@/lib/supabase-helpers";
import { formatKES } from "@/lib/supabase";

export const Route = createFileRoute("/fees")({
  head: () => ({ meta: [{ title: "Fees — School Management" }] }),
  component: FeesPage,
});

function FeesPage() {
  const classesQuery = useQuery({ queryKey: ["classes"], queryFn: fetchClasses });
  const totalFee = classesQuery.data?.reduce((sum, cls) => sum + (cls.fee_amount ?? 0), 0) ?? 0;
  const averageFee = classesQuery.data?.length ? Math.round(totalFee / classesQuery.data.length) : 0;

  return (
    <>
      <PageHeader
        title="Fees & Billing"
        description="Review class fees and billing data from your Supabase classes table."
        actions={
          <>
            <Button variant="outline"><Download className="h-4 w-4" />Export</Button>
            <Button><Plus className="h-4 w-4" />New Fee</Button>
          </>
        }
      />
      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Classes" value={classesQuery.data?.length.toString() ?? "—"} icon={BookOpen} />
          <StatCard label="Total Fee Value" value={formatKES(totalFee)} icon={Wallet} tone="success" />
          <StatCard label="Average Class Fee" value={formatKES(averageFee)} icon={AlertCircle} />
          <StatCard label="Live Sync" value={classesQuery.isLoading ? "Loading…" : "Connected"} icon={Smartphone} tone="success" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Class Fee Summary</CardTitle>
            <CardDescription>Fees configured per class in Supabase.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead className="text-right">Fee</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classesQuery.data?.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.teacher}</TableCell>
                    <TableCell>{c.room}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatKES(c.fee_amount ?? 0)}</TableCell>
                    <TableCell>
                      <Badge variant={c.fee_amount > 0 ? "secondary" : "destructive"}>
                        {c.fee_amount > 0 ? "Configured" : "Missing"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {classesQuery.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                      No fee records found. Add classes and set fee values from the Classes page.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
