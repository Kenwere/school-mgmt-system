import { createFileRoute } from "@tanstack/react-router";
import { Plus, Download, Filter, Users, UserCheck, UserX, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { students } from "@/lib/mock-data";

export const Route = createFileRoute("/students")({
  head: () => ({ meta: [{ title: "Students — Northfield Academy" }] }),
  component: StudentsPage,
});

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("");
}

function StudentsPage() {
  return (
    <>
      <PageHeader
        title="Students"
        description="Manage admissions, profiles, records and discipline."
        actions={
          <>
            <Button variant="outline"><Download className="h-4 w-4" />Export</Button>
            <Button><Plus className="h-4 w-4" />New Admission</Button>
          </>
        }
      />
      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Enrolled" value="1,247" icon={Users} />
          <StatCard label="Active" value="1,231" icon={UserCheck} tone="success" />
          <StatCard label="Suspended" value="8" icon={UserX} tone="destructive" />
          <StatCard label="New This Term" value="24" icon={UserPlus} />
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="flex items-center gap-2 border-b p-4">
              <Input placeholder="Search by name, ID or class…" className="max-w-sm" />
              <Button variant="outline" size="sm"><Filter className="h-4 w-4" />Filters</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Parent / Guardian</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Fees</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s) => (
                  <TableRow key={s.id} className="cursor-pointer">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-accent/10 text-accent text-xs">{initials(s.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{s.name}</div>
                          <div className="text-xs text-muted-foreground">{s.gender} · Adm. {s.admission}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{s.id}</TableCell>
                    <TableCell>{s.class}</TableCell>
                    <TableCell>{s.parent}</TableCell>
                    <TableCell className="text-muted-foreground">{s.phone}</TableCell>
                    <TableCell>
                      <Badge variant={s.fees === "Paid" ? "secondary" : s.fees === "Partial" ? "default" : "destructive"}>
                        {s.fees}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.status === "Active" ? "outline" : "destructive"}>{s.status}</Badge>
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
