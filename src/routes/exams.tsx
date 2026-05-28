import { createFileRoute } from "@tanstack/react-router";
import { Plus, ClipboardList, CheckCircle2, Clock } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { exams } from "@/lib/mock-data";

export const Route = createFileRoute("/exams")({
  head: () => ({ meta: [{ title: "Exams — Northfield Academy" }] }),
  component: ExamsPage,
});

function ExamsPage() {
  return (
    <>
      <PageHeader
        title="Examinations"
        description="Schedule exams, manage question banks and publish results."
        actions={<Button><Plus className="h-4 w-4" />Schedule Exam</Button>}
      />
      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Scheduled" value="3" icon={Clock} tone="warning" />
          <StatCard label="In Progress" value="0" icon={ClipboardList} />
          <StatCard label="Completed (Term)" value="12" icon={CheckCircle2} tone="success" />
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map((e) => (
                  <TableRow key={e.name + e.class}>
                    <TableCell className="font-medium">{e.name}</TableCell>
                    <TableCell>{e.class}</TableCell>
                    <TableCell>{e.date}</TableCell>
                    <TableCell>{e.time}</TableCell>
                    <TableCell>{e.duration}</TableCell>
                    <TableCell>
                      <Badge variant={e.status === "Completed" ? "secondary" : "default"}>{e.status}</Badge>
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
