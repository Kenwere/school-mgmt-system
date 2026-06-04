import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
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
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Headphones,
  Home as HomeIcon,
  MapPin,
  ChevronRight,
  CheckCircle2,
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

import heroImage from "@/assets/landing-hero.jpg";
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
  const schoolName = store.school?.name ?? "SchoolSuite";

  return (
    <div className="min-h-screen bg-background">
      {/* Top utility bar */}
      <div className="bg-foreground text-background">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-2 text-xs">
          <div className="flex flex-wrap items-center gap-5">
            <span className="inline-flex items-center gap-1.5 opacity-90">
              <Phone className="h-3.5 w-3.5" /> +254 700 000 000
            </span>
            <span className="hidden items-center gap-1.5 opacity-90 sm:inline-flex">
              <Mail className="h-3.5 w-3.5" /> hello@schoolsuite.app
            </span>
            <span className="hidden items-center gap-3 opacity-80 md:inline-flex">
              Follow us
              <Facebook className="h-3.5 w-3.5" />
              <Twitter className="h-3.5 w-3.5" />
              <Instagram className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="opacity-90 hover:opacity-100">
              Sign in
            </Link>
            {!hasSchool && (
              <Link to="/register" className="opacity-90 hover:opacity-100">
                Register
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main nav */}
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <School className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              {schoolName}
              <span className="ml-1 text-primary">.</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
            <a href="#home" className="text-foreground hover:text-primary">Home</a>
            <a href="#features" className="text-muted-foreground hover:text-primary">Features</a>
            <a href="#modules" className="text-muted-foreground hover:text-primary">Modules</a>
            <a href="#about" className="text-muted-foreground hover:text-primary">About</a>
            <a href="#contact" className="text-muted-foreground hover:text-primary">Contact</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => router.navigate({ to: "/login" })}>
              Sign in
            </Button>
            {!hasSchool && (
              <Button
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => router.navigate({ to: "/register" })}
              >
                Register your school
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="home" className="relative">
        <div className="relative h-[600px] w-full overflow-hidden">
          <img
            src={heroImage}
            alt="Students learning together in a bright classroom"
            width={1920}
            height={1080}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/30" />
          <div className="relative mx-auto flex h-full max-w-7xl items-center px-6">
            <div className="max-w-2xl text-primary-foreground">
              <span className="inline-flex items-center rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-3.5 py-1 text-xs font-medium uppercase tracking-wider backdrop-blur">
                Modern school management
              </span>
              <h1 className="mt-6 text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
                Run your school with
                <span className="block text-accent-foreground">clarity & confidence.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-primary-foreground/85 sm:text-lg">
                Enrol students, manage classes, capture exam marks with automatic ranking,
                and track termly fee balances — all in one calm, printable workspace.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                {hasSchool ? (
                  <Button
                    size="lg"
                    className="h-12 bg-accent px-7 text-accent-foreground hover:bg-accent/90"
                    onClick={() => router.navigate({ to: "/login" })}
                  >
                    Sign in to {schoolName} <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="h-12 bg-accent px-7 text-accent-foreground hover:bg-accent/90"
                    onClick={() => router.navigate({ to: "/register" })}
                  >
                    Get started <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 border-primary-foreground/40 bg-transparent px-7 text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                  onClick={() => {
                    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Explore features
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick highlights */}
      <section id="features" className="border-b bg-card">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 sm:grid-cols-3">
          <Highlight
            icon={Headphones}
            title="Fast Support"
            body="Get in touch any time — we help you set up classes, fees, and exams in minutes."
          />
          <Highlight
            icon={HomeIcon}
            title="What We Do"
            body="A complete cockpit for admissions, exams, ranking, fees and printable reports."
          />
          <Highlight
            icon={MapPin}
            title="Where We Are"
            body="Cloud-based and accessible from every device in your school — no install required."
          />
        </div>
      </section>

      {/* Modules grid */}
      <section id="modules" className="bg-muted/50">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Everything you need
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Built for administrators and teachers
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Powerful modules that work together — from the first admission to the
              end-of-year report card.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard icon={Users} title="Students & staff" body="Admissions, profiles, transfers and a clean roster." />
            <FeatureCard icon={Award} title="Exams & ranking" body="Record marks per exam — rankings update instantly." />
            <FeatureCard icon={Wallet} title="Termly fees" body="Class fee split across 3 terms with live balances." />
            <FeatureCard icon={Printer} title="Printable reports" body="Report cards, fee statements, class & student lists." />
            <FeatureCard icon={ShieldCheck} title="Role permissions" body="Admin grants teachers access to just the pages they need." />
            <FeatureCard icon={ClipboardCheck} title="Per-term tracking" body="See paid amount and balance for each term, per student." />
          </div>
        </div>
      </section>

      {/* About / CTA strip */}
      <section id="about" className="bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground/80">
              Why schools choose us
            </span>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              One calm cockpit for the whole school year.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-primary-foreground/75">
              Replace spreadsheets with a focused workspace that keeps students,
              teachers, marks and fees in one place — and prints beautiful reports
              when you need them.
            </p>
            <ul className="mt-7 space-y-3.5 text-sm">
              {[
                "Set up in minutes — no IT team required",
                "Three-term fee tracking with live balances",
                "Auto-ranked grades per class and per exam",
                "Permission-controlled access for teachers",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-primary-foreground/90">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent-foreground" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Stat number="20+" label="Modules ready out of the box" />
            <Stat number="3" label="Terms tracked per academic year" />
            <Stat number="Auto" label="Ranking by exam and class" />
            <Stat number="100%" label="Printable, branded reports" />
          </div>
        </div>
      </section>

      {/* Contact / Footer */}
      <footer id="contact" className="border-t bg-card">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <School className="h-5 w-5" />
              </div>
              <span className="font-semibold tracking-tight">{schoolName}</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Modern school management for forward-thinking schools.
            </p>
          </div>
          <FooterCol title="Product" links={["Features", "Modules", "Reports", "Pricing"]} />
          <FooterCol title="Company" links={["About", "Contact", "Privacy", "Terms"]} />
          <div>
            <h4 className="text-sm font-semibold">Get in touch</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +254 700 000 000</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@schoolsuite.app</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Nairobi, Kenya</li>
            </ul>
          </div>
        </div>
        <div className="border-t">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-6 py-5 sm:flex-row sm:items-center">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} {schoolName}. All rights reserved.
            </p>
            <div className="flex gap-4 text-xs">
              <Link to="/login" className="text-muted-foreground hover:text-foreground">Sign in</Link>
              {!hasSchool && (
                <Link to="/register" className="text-muted-foreground hover:text-foreground">Register</Link>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Highlight({ icon: Icon, title, body }: { icon: any; title: string; body: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, body }: { icon: any; title: string; body: string }) {
  return (
    <Card className="border-muted/60 transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
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

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="rounded-lg border border-background/15 bg-background/5 p-5">
      <div className="text-3xl font-semibold text-primary">{number}</div>
      <div className="mt-1 text-sm text-background/70">{label}</div>
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold">{title}</h4>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {links.map((l) => (
          <li key={l}><a href="#" className="hover:text-foreground">{l}</a></li>
        ))}
      </ul>
    </div>
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
