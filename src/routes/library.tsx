import { createFileRoute } from "@tanstack/react-router";
import { Plus, BookCopy, BookOpenCheck, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { library } from "@/lib/mock-data";

export const Route = createFileRoute("/library")({
  head: () => ({ meta: [{ title: "Library — Northfield Academy" }] }),
  component: LibraryPage,
});

function LibraryPage() {
  return (
    <>
      <PageHeader
        title="Library"
        description="Catalog, borrow/return tracking and fines."
        actions={<Button><Plus className="h-4 w-4" />Add Book</Button>}
      />
      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total Books" value="4,820" icon={BookCopy} />
          <StatCard label="On Loan" value="312" icon={BookOpenCheck} tone="success" />
          <StatCard label="Overdue" value="18" icon={AlertCircle} tone="destructive" />
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Copies</TableHead>
                  <TableHead className="text-right">Available</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {library.map((b) => (
                  <TableRow key={b.code}>
                    <TableCell className="font-mono text-xs">{b.code}</TableCell>
                    <TableCell className="font-medium">{b.title}</TableCell>
                    <TableCell className="text-muted-foreground">{b.author}</TableCell>
                    <TableCell><Badge variant="outline">{b.category}</Badge></TableCell>
                    <TableCell className="text-right tabular-nums">{b.copies}</TableCell>
                    <TableCell className="text-right tabular-nums">{b.available}</TableCell>
                    <TableCell>
                      <Badge variant={b.status === "Available" ? "secondary" : b.status === "Low Stock" ? "default" : "destructive"}>{b.status}</Badge>
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
