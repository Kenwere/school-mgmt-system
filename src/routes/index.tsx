import { createFileRoute } from "@tanstack/react-router";
import {
  Users,
  GraduationCap,
  BookOpen,
  Wallet,
  CalendarCheck,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  stats,
  attendanceWeek,
  feesTrend,
  announcements,
  formatKES,
} from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Northfield Academy" },
      { name: "description", content: "School-wide overview: enrollment, attendance, fees and academic performance." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Welcome back, here's what's happening at Northfield Academy today."
        actions={<Button>Generate Report</Button>}
      />
      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Students" value={stats.students.toLocaleString()} hint="+24 this term" icon={Users} />
          <StatCard label="Teaching Staff" value={stats.staff.toString()} hint="86 active" icon={GraduationCap} tone="success" />
          <StatCard label="Active Classes" value={stats.classes.toString()} hint="Across 4 forms" icon={BookOpen} />
          <StatCard label="Attendance Today" value={`${stats.attendanceToday}%`} hint="1,175 present" icon={CalendarCheck} tone="success" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Fees Collected (Term)" value={formatKES(stats.feesCollected)} hint="79% of target" icon={Wallet} tone="success" />
          <StatCard label="Fees Pending" value={formatKES(stats.feesPending)} hint="142 students" icon={AlertCircle} tone="warning" />
          <StatCard label="Avg. Performance" value="74.6%" hint="+3.2% vs last term" icon={TrendingUp} />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Fees Collection Trend</CardTitle>
              <CardDescription>Collected vs. target — last 6 months (KES)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={feesTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis dataKey="month" stroke="currentColor" className="text-xs text-muted-foreground" />
                  <YAxis stroke="currentColor" className="text-xs text-muted-foreground" tickFormatter={(v) => `${v / 1_000_000}M`} />
                  <Tooltip
                    contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => formatKES(v)}
                  />
                  <Line type="monotone" dataKey="target" stroke="var(--muted-foreground)" strokeDasharray="4 4" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="collected" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Attendance</CardTitle>
              <CardDescription>Present vs. absent — this week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={attendanceWeek}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis dataKey="day" stroke="currentColor" className="text-xs text-muted-foreground" />
                  <YAxis stroke="currentColor" className="text-xs text-muted-foreground" />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="present" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="absent" fill="var(--destructive)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Announcements</CardTitle>
              <CardDescription>Latest notices to the school community</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {announcements.slice(0, 4).map((a) => (
                <div key={a.title} className="flex items-start gap-3 border-b last:border-b-0 pb-3 last:pb-0">
                  <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-md bg-accent/10 text-accent">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium truncate">{a.title}</p>
                      <Badge variant={a.priority === "High" ? "destructive" : a.priority === "Medium" ? "default" : "secondary"} className="text-xs">{a.priority}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{a.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{a.audience} · {a.date}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Activities</CardTitle>
              <CardDescription>Next 14 days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { date: "Mar 18", title: "CAT 2 Physics — Form 2B", tag: "Exam" },
                { date: "Mar 20", title: "Mid Term Chemistry — Form 3A", tag: "Exam" },
                { date: "Mar 22", title: "Parents' Day", tag: "Event" },
                { date: "Apr 05", title: "Sports Day — Inter-house", tag: "Event" },
                { date: "Apr 12", title: "End Term 1 Mathematics — Form 4A", tag: "Exam" },
              ].map((e) => (
                <div key={e.title} className="flex items-center gap-4 rounded-md border p-3">
                  <div className="flex h-12 w-12 flex-col items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <span className="text-[10px] uppercase">{e.date.split(" ")[0]}</span>
                    <span className="text-sm font-bold">{e.date.split(" ")[1]}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{e.title}</p>
                    <p className="text-xs text-muted-foreground">{e.tag}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
