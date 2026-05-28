import { createFileRoute } from '@tanstack/react-router'
import { FormEvent, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  AlertCircle,
  CheckCircle2,
  Printer,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { formatKES } from "@/lib/supabase";
import { fetchDashboardStats } from "@/lib/supabase-helpers";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "School Management" },
      { name: "description", content: "School landing page and administration dashboard backed by Supabase." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const auth = useAuth();
  const dashboardQuery = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
    enabled: auth.user?.role === "admin",
  });

  if (!auth.user) {
    return <LandingView />;
  }

  if (auth.user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6 py-12">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>
              Student and teacher sign-in is visible here, but only the admin account can manage the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Use <strong>admin@gmail.com</strong> and password <strong>admin</strong> to sign in as the administrator.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={auth.signOut}>
              Go back to landing
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const stats = dashboardQuery.data;

  return (
    <>
      <PageHeader
        title="Admin Dashboard"
        description="Manage classes, students and fee reports from Supabase." 
        actions={
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            Print report
          </Button>
        }
      />
      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Students"
            value={stats ? stats.studentCount.toLocaleString() : "—"}
            hint={stats ? `${stats.activeStudentCount} active` : "Loading…"}
            icon={Users}
          />
          <StatCard
            label="Active Students"
            value={stats ? stats.activeStudentCount.toLocaleString() : "—"}
            hint="Live from Supabase"
            icon={GraduationCap}
            tone="success"
          />
          <StatCard
            label="Active Classes"
            value={stats ? stats.classCount.toString() : "—"}
            hint="Includes saved classes"
            icon={BookOpen}
          />
          <StatCard
            label="Attendance Estimate"
            value={stats ? `${stats.attendancePercent}%` : "—"}
            hint="Based on active students"
            icon={CalendarCheck}
            tone="success"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Fees Collected"
            value={stats ? formatKES(stats.feesCollected) : "—"}
            hint="Paid student balances"
            icon={Users}
            tone="success"
          />
          <StatCard
            label="Fees Pending"
            value={stats ? formatKES(stats.feesPending) : "—"}
            hint="Unpaid or partial"
            icon={AlertCircle}
            tone="warning"
          />
          <StatCard
            label="Average class fee"
            value={stats?.classCount ? formatKES(Math.round((stats.feesCollected + stats.feesPending) / stats.classCount)) : "—"}
            hint="Calculated from saved classes"
            icon={BookOpen}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Students by class</CardTitle>
              <CardDescription>Enrollment counts from Supabase.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats?.studentsByClass ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis dataKey="name" stroke="currentColor" className="text-xs text-muted-foreground" />
                  <YAxis stroke="currentColor" className="text-xs text-muted-foreground" />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fee status</CardTitle>
              <CardDescription>Paid, partial and pending amounts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats?.feesStatusBreakdown.map((item) => (
                <div key={item.status} className="flex items-center justify-between gap-4 rounded-md border p-3">
                  <div>
                    <p className="text-sm font-medium">{item.status}</p>
                    <p className="text-xs text-muted-foreground">{item.value} students</p>
                  </div>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">{item.value}</span>
                </div>
              ))}
              {!stats ? <p className="text-sm text-muted-foreground">Loading fee breakdown…</p> : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function LandingView() {
  const auth = useAuth();
  const [role, setRole] = useState<"admin" | "teacher" | "student">("admin");
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const isAdmin = role === "admin";

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const success = await auth.signIn(email.trim(), password.trim(), role);
    if (!success) {
      setError("Invalid admin credentials. Please use admin@gmail.com / admin.");
      return;
    }
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-[2rem] bg-white p-10 shadow-sm">
          <div className="space-y-6">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-primary">School Management</p>
              <h1 className="mt-4 text-4xl font-semibold text-foreground">A simple Supabase-backed admin portal for your school.</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                Securely manage students, classes and class fees. Sign in as admin to connect the dashboard directly to your Supabase data layer.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-muted/60 bg-muted/10 p-5">
                <p className="text-sm font-semibold">Admin sign-in</p>
                <p className="mt-2 text-sm text-muted-foreground">Use the admin credentials to manage school records.</p>
              </div>
              <div className="rounded-3xl border border-muted/60 bg-muted/10 p-5">
                <p className="text-sm font-semibold">Live Supabase sync</p>
                <p className="mt-2 text-sm text-muted-foreground">Add classes, student records and fees. All data is stored in Supabase.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] bg-white p-8 shadow-sm">
          <div className="mb-6">
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Sign in</p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">Choose your role to continue</h2>
          </div>
          <form className="space-y-4" onSubmit={submit}>
            <label className="block text-sm font-medium text-muted-foreground">Role</label>
            <select
              className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 text-base text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={role}
              onChange={(event) => setRole(event.target.value as "admin" | "teacher" | "student")}
            >
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>

            <div>
              <label className="block text-sm font-medium text-muted-foreground">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@gmail.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={isAdmin ? "admin" : "Enter any password"}
              />
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <Button type="submit" className="w-full">
              Continue as {role}
            </Button>
            <p className="text-sm text-muted-foreground">
              Admin can sign in with <strong>admin@gmail.com</strong> and <strong>admin</strong>. Teacher and student sign-in are available for future portal expansion.
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
