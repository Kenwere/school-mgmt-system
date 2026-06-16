import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UserCheck, UserX, CalendarDays, Percent } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { PermissionGate } from "@/components/permission-gate";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { attendanceForWeek, getWeekStart, getWeeksInMonth, setAttendance, useStore } from "@/lib/store";

export const Route = createFileRoute("/attendance")({
  head: () => ({ meta: [{ title: "Attendance — School Management" }] }),
  component: () => (
    <PermissionGate path="/attendance">
      <AttendancePage />
    </PermissionGate>
  ),
});

const STATUS_OPTIONS = [
  { value: "present", label: "Present", color: "bg-success/15 text-success border-success/30" },
  { value: "absent", label: "Absent", color: "bg-destructive/15 text-destructive border-destructive/30" },
  { value: "late", label: "Late", color: "bg-warning/20 text-warning-foreground border-warning/40" },
  { value: "leave", label: "Leave", color: "bg-accent/15 text-accent border-accent/30" },
] as const;

function AttendancePage() {
  const store = useStore();
  const [classId, setClassId] = useState("all");
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const weeks = getWeeksInMonth(year, month);
  const [weekStart, setWeekStart] = useState(getWeekStart(today));

  const students = (classId === "all"
    ? store.students
    : store.students.filter((s) => s.classId === classId)
  ).filter((s) => s.active !== false);

  const records = attendanceForWeek(weekStart);
  const recordMap = new Map(records.map((r) => [r.studentId, r.status]));

  const presentCount = students.filter((s) => recordMap.get(s.id) === "present").length;
  const absentCount = students.filter((s) => recordMap.get(s.id) === "absent").length;
  const lateCount = students.filter((s) => recordMap.get(s.id) === "late").length;
  const leaveCount = students.filter((s) => recordMap.get(s.id) === "leave").length;
  const markedCount = presentCount + absentCount + lateCount + leaveCount;
  const rate = markedCount > 0 ? Math.round((presentCount / markedCount) * 100) : 0;

  const weekLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const changeStatus = async (sid: string, status: string) => {
    await setAttendance(sid, weekStart, status as any);
  };

  return (
    <>
      <PageHeader
        title="Attendance"
        description="Track weekly attendance per student."
        actions={
          <div className="flex items-center gap-2">
            <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                {weekLabels.map((l, i) => (
                  <SelectItem key={i} value={String(i)}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[year - 1, year, year + 1].map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />
      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Present" value={String(presentCount)} icon={UserCheck} tone="success" />
          <StatCard label="Absent" value={String(absentCount)} icon={UserX} tone="destructive" />
          <StatCard label="Late / Leave" value={String(lateCount + leaveCount)} icon={CalendarDays} tone="warning" />
          <StatCard label="Attendance Rate" value={markedCount > 0 ? `${rate}%` : "—"} icon={Percent} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Weekly attendance for {weekLabels[month]} {year}</CardTitle>
            <CardDescription>
              Week of {new Date(weekStart).toLocaleDateString()} — {weeks.length} week{weeks.length > 1 ? "s" : ""} this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="space-y-1">
                <Label>Class</Label>
                <Select value={classId} onValueChange={setClassId}>
                  <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All classes</SelectItem>
                    {store.classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Week</Label>
                <Select value={weekStart} onValueChange={setWeekStart}>
                  <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {weeks.map((w) => {
                      const d = new Date(w);
                      return (
                        <SelectItem key={w} value={w}>
                          {d.toLocaleDateString(undefined, { month: "short", day: "numeric" })} — {new Date(d.getTime() + 6 * 86400000).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Adm No</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-10">No students found.</TableCell></TableRow>
                  )}
                  {students.map((s) => {
                    const cls = store.classes.find((c) => c.id === s.classId);
                    const status = recordMap.get(s.id) ?? "present";
                    const opt = STATUS_OPTIONS.find((o) => o.value === status)!;
                    return (
                      <TableRow key={s.id}>
                        <TableCell className="font-mono text-xs">{s.admissionNo}</TableCell>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell>{cls?.name ?? "—"}</TableCell>
                        <TableCell>
                          <Select value={status} onValueChange={(v) => changeStatus(s.id, v)}>
                            <SelectTrigger className="w-36"><Badge variant="outline" className={opt.color}>{opt.label}</Badge></SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.map((o) => (
                                <SelectItem key={o.value} value={o.value}>
                                  <Badge variant="outline" className={o.color}>{o.label}</Badge>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
