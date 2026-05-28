import { createFileRoute } from "@tanstack/react-router";
import { Plus, Download, GraduationCap, BadgeCheck, CalendarOff } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { staff } from "@/lib/mock-data";

export const Route = createFileRoute("/staff")({
  head: () => ({ meta: [{ title: "Staff — Northfield Academy" }] }),
  component: StaffPage,
});

function initials(name: string) {
  return name.split(" ").filter((p) => !p.endsWith(".")).map((n) => n[0]).slice(0, 2).join("");
}

function StaffPage() {
  return (
    <>
      <PageHeader
        title="Staff & Teachers"
        description="HR records, departments, attendance and payroll."
        actions={
          <>
            <Button variant="outline"><Download className="h-4 w-4" />Export</Button>
            <Button><Plus className="h-4 w-4" />Add Staff</Button>
          </>
        }
      />
      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Staff" value="86" icon={GraduationCap} />
          <StatCard label="Teaching" value="62" icon={BadgeCheck} tone="success" />
          <StatCard label="Non-Teaching" value="24" icon={BadgeCheck} />
          <StatCard label="On Leave Today" value="3" icon={CalendarOff} tone="warning" />
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Staff ID</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">{initials(s.name)}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{s.name}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{s.id}</TableCell>
                    <TableCell>{s.role}</TableCell>
                    <TableCell><Badge variant="outline">{s.department}</Badge></TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      <div>{s.email}</div>
                      <div>{s.phone}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.status === "Active" ? "secondary" : "default"}>{s.status}</Badge>
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
