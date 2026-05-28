import { createFileRoute } from "@tanstack/react-router";
import { QrCode, Send, CalendarCheck, UserCheck, UserX, Percent } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { attendanceWeek, students } from "@/lib/mock-data";

export const Route = createFileRoute("/attendance")({
  head: () => ({ meta: [{ title: "Attendance — Northfield Academy" }] }),
  component: AttendancePage,
});

function AttendancePage() {
  return (
    <>
      <PageHeader
        title="Attendance"
        description="Daily attendance, biometric/QR check-ins and absentee alerts."
        actions={
          <>
            <Button variant="outline"><QrCode className="h-4 w-4" />QR Check-in</Button>
            <Button><Send className="h-4 w-4" />Send Alerts</Button>
          </>
        }
      />
      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Present Today" value="1,175" icon={UserCheck} tone="success" />
          <StatCard label="Absent" value="72" icon={UserX} tone="destructive" />
          <StatCard label="On Leave" value="6" icon={CalendarCheck} tone="warning" />
          <StatCard label="Attendance Rate" value="94.2%" icon={Percent} />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>This Week</CardTitle>
              <CardDescription>Daily attendance counts</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={attendanceWeek}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis dataKey="day" className="text-xs" stroke="currentColor" />
                  <YAxis className="text-xs" stroke="currentColor" />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                  <Bar dataKey="present" stackId="a" fill="var(--accent)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="absent" stackId="a" fill="var(--destructive)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Today's Absentees</CardTitle>
              <CardDescription>Form 4A · 22 March 2025</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {students.slice(0, 5).map((s, i) => (
                <div key={s.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.class}</div>
                  </div>
                  <Badge variant={i % 2 === 0 ? "destructive" : "secondary"}>{i % 2 === 0 ? "Absent" : "Late"}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Class Attendance Summary</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Present</TableHead>
                  <TableHead className="text-right">Absent</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { c: "Form 1A", t: 38, p: 36 },
                  { c: "Form 2A", t: 40, p: 39 },
                  { c: "Form 3A", t: 35, p: 32 },
                  { c: "Form 4A", t: 32, p: 30 },
                  { c: "Form 4B", t: 31, p: 28 },
                ].map((r) => (
                  <TableRow key={r.c}>
                    <TableCell className="font-medium">{r.c}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.t}</TableCell>
                    <TableCell className="text-right tabular-nums text-success">{r.p}</TableCell>
                    <TableCell className="text-right tabular-nums text-destructive">{r.t - r.p}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium">{((r.p / r.t) * 100).toFixed(1)}%</TableCell>
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
