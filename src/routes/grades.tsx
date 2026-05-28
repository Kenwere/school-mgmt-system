import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { grades } from "@/lib/mock-data";

export const Route = createFileRoute("/grades")({
  head: () => ({ meta: [{ title: "Grades — Northfield Academy" }] }),
  component: GradesPage,
});

function gradeColor(g: string) {
  if (g.startsWith("A")) return "bg-success/15 text-success border-success/30";
  if (g.startsWith("B")) return "bg-accent/15 text-accent border-accent/30";
  if (g.startsWith("C")) return "bg-warning/20 text-warning-foreground border-warning/40";
  return "bg-destructive/15 text-destructive border-destructive/30";
}

function GradesPage() {
  return (
    <>
      <PageHeader
        title="Grades & Report Cards"
        description="Marks entry, GPA calculation, ranking and transcripts."
        actions={
          <>
            <Select defaultValue="form4a">
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="form4a">Form 4A</SelectItem>
                <SelectItem value="form4b">Form 4B</SelectItem>
                <SelectItem value="form3a">Form 3A</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline"><Download className="h-4 w-4" />Report Cards</Button>
          </>
        }
      />
      <div className="p-6">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead className="text-right">Math</TableHead>
                  <TableHead className="text-right">English</TableHead>
                  <TableHead className="text-right">Physics</TableHead>
                  <TableHead className="text-right">Chemistry</TableHead>
                  <TableHead className="text-right">Biology</TableHead>
                  <TableHead className="text-right">Average</TableHead>
                  <TableHead>Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grades.sort((a, b) => a.rank - b.rank).map((g) => (
                  <TableRow key={g.student}>
                    <TableCell className="font-mono">#{g.rank}</TableCell>
                    <TableCell className="font-medium">{g.student}</TableCell>
                    <TableCell className="text-right tabular-nums">{g.math}</TableCell>
                    <TableCell className="text-right tabular-nums">{g.eng}</TableCell>
                    <TableCell className="text-right tabular-nums">{g.phy}</TableCell>
                    <TableCell className="text-right tabular-nums">{g.chem}</TableCell>
                    <TableCell className="text-right tabular-nums">{g.bio}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">{g.avg.toFixed(1)}</TableCell>
                    <TableCell><Badge variant="outline" className={gradeColor(g.grade)}>{g.grade}</Badge></TableCell>
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
