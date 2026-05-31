import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  Users,
  GraduationCap,
  BookOpen,
  Wallet,
  ClipboardCheck,
  Award,
  Printer,
  ShieldCheck,
  School,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { formatKES, feeStatusForStudent, useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "School Management System" }] }),
  component: HomePage,
});

function HomePage() {
  const auth = useAuth();
  if (!auth.user) return <Landing />;
  return <Dashboard />;
}

function Landing() {
  const router = useRouter();
  const store = useStore();
  const hasSchool = !!store.school;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <School className="h-5 w-5" />
          </div>
          <span className="font-semibold tracking-tight">SchoolSuite</span>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => router.navigate({ to: "/login" })}>
            Sign in
          </Button>
          {!hasSchool && (
            <Button onClick={() => router.navigate({ to: "/register" })}>
              Register your school
            </Button>
          )}
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-16">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <span className="inline-flex rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              Modern school management
            </span>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Run your school from one calm, professional cockpit.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              Enrol students, manage classes, capture exam marks with automatic ranking,
              and track termly fee balances — all in a clean, printable workspace built
              for administrators and teachers.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {hasSchool ? (
                <Button size="lg" onClick={() => router.navigate({ to: "/login" })}>
                  Sign in to {store.school?.name}
                </Button>
              ) : (
                <Button size="lg" onClick={() => router.navigate({ to: "/register" })}>
                  Get started — register your school
                </Button>
              )}
              <Button size="lg" variant="outline" onClick={() => router.navigate({ to: "/login" })}>
                I already have an account
              </Button>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              Demo build — data is stored on this device only.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FeatureCard icon={Users} title="Students & staff" body="Admissions, profiles, transfers and a clean roster." />
            <FeatureCard icon={Award} title="Exams & ranking" body="Record marks per exam — rankings update instantly." />
            <FeatureCard icon={Wallet} title="Termly fees" body="Class fee split across 3 terms with live balances." />
            <FeatureCard icon={Printer} title="Printable reports" body="Report cards, fee statements, class & student lists." />
            <FeatureCard icon={ShieldCheck} title="Role permissions" body="Admin grants teachers access to just the pages they need." />
            <FeatureCard icon={ClipboardCheck} title="Per-term tracking" body="See paid amount and balance for each term, per student." />
          </div>
        </div>
      </section>

      <footer className="border-t bg-card/50">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 px-6 py-6 sm:flex-row sm:items-center">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} SchoolSuite. All rights reserved.</p>
          <div className="flex gap-4 text-sm">
            <Link to="/login" className="text-muted-foreground hover:text-foreground">Sign in</Link>
            {!hasSchool && (
              <Link to="/register" className="text-muted-foreground hover:text-foreground">Register</Link>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, body }: { icon: any; title: string; body: string }) {
  return (
    <Card className="border-muted/60">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="text-sm">{body}</CardDescription>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const store = useStore();
  const studentCount = store.students.length;
  const classCount = store.classes.length;
  const examCount = store.exams.length;
  const teacherCount = store.users.filter((u) => u.role === "teacher").length;

  const feeAgg = store.students.reduce(
    (acc, st) => {
      const fs = feeStatusForStudent(st.id);
      if (!fs) return acc;
      acc.paid += fs.paidTotal;
      acc.balance += Math.max(0, fs.balanceTotal);
      return acc;
    },
    { paid: 0, balance: 0 },
  );

  const studentsByClass = store.classes.map((c) => ({
    name: c.name,
    count: store.students.filter((s) => s.classId === c.id).length,
  }));

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Snapshot of your school today."
        actions={
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print
          </Button>
        }
      />
      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Students" value={studentCount.toLocaleString()} icon={Users} />
          <StatCard label="Classes" value={classCount.toString()} icon={BookOpen} />
          <StatCard label="Exams" value={examCount.toString()} icon={Award} />
          <StatCard label="Teachers" value={teacherCount.toString()} icon={GraduationCap} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Fees collected" value={formatKES(feeAgg.paid)} icon={Wallet} tone="success" />
          <StatCard label="Outstanding balance" value={formatKES(feeAgg.balance)} icon={Wallet} tone="warning" />
          <StatCard
            label="Collection rate"
            value={`${
              feeAgg.paid + feeAgg.balance > 0
                ? Math.round((feeAgg.paid / (feeAgg.paid + feeAgg.balance)) * 100)
                : 0
            }%`}
            icon={ClipboardCheck}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Students by class</CardTitle>
            <CardDescription>Enrollment per class.</CardDescription>
          </CardHeader>
          <CardContent>
            {studentsByClass.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No classes yet. Add classes and students to see analytics.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={studentsByClass}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
