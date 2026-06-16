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

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

function HomePage() {
  const auth = useAuth();
  const store = useStore();
  if (auth.user) return <Dashboard />;
  if (!auth.initialized && store.currentUserId) return <LoadingScreen />;
  return <Landing />;
}

function Landing() {
  const router = useRouter();
  const auth = useAuth();
  const store = useStore();
  const hasSchool = auth.initialized && !!store.school;
  const schoolName = store.school?.name ?? "SchoolSuite";

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="bg-primary/5 border-b border-primary/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-2 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-5">
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" /> +254 700 000 000
            </span>
            <span className="hidden items-center gap-1.5 sm:inline-flex">
              <Mail className="h-3.5 w-3.5" /> hello@schoolsuite.app
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-foreground transition-colors">Sign in</Link>
            {!hasSchool && (
              <Link to="/register" className="hover:text-foreground transition-colors">Register</Link>
            )}
          </div>
        </div>
      </div>

      {/* Main nav */}
      <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg shadow-primary/20">
              <School className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              {schoolName}
            </span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            {["Home", "Features", "Modules", "About", "Contact"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.navigate({ to: "/login" })}>
              Sign in
            </Button>
            {!hasSchool && (
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                onClick={() => router.navigate({ to: "/register" })}
              >
                Get started
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="home" className="relative overflow-hidden">
        <div className="relative min-h-[85vh] w-full">
          <img
            src={heroImage}
            alt="Students learning together"
            width={1920}
            height={1080}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/40" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_oklch(0.55_0.16_165/_0.2),_transparent_60%)]" />
          <div className="relative mx-auto flex min-h-[85vh] max-w-7xl items-center px-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest backdrop-blur-sm text-primary-foreground/90">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-foreground animate-pulse" />
                Modern school management
              </span>
              <h1 className="mt-8 text-5xl font-bold leading-[1.05] tracking-tight text-primary-foreground sm:text-7xl">
                Run your school
                <span className="block text-accent-foreground">with confidence.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-primary-foreground/80 sm:text-xl">
                Enrol students, manage classes, capture exam marks with automatic ranking,
                and track termly fee balances — all in one calm, printable workspace.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                {hasSchool ? (
                  <Button
                    size="lg"
                    className="h-13 bg-accent px-8 text-accent-foreground text-base hover:bg-accent/90 shadow-xl shadow-accent/25"
                    onClick={() => router.navigate({ to: "/login" })}
                  >
                    Sign in to {schoolName} <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="h-13 bg-accent px-8 text-accent-foreground text-base hover:bg-accent/90 shadow-xl shadow-accent/25"
                    onClick={() => router.navigate({ to: "/register" })}
                  >
                    Start free trial <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
                <Button
                  size="lg"
                  variant="outline"
                  className="h-13 border-primary-foreground/30 bg-transparent px-8 text-base text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                  onClick={() => {
                    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  See how it works
                </Button>
              </div>
              <div className="mt-12 flex items-center gap-8 text-sm text-primary-foreground/60">
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-foreground" /> No IT setup</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-foreground" /> Cloud-based</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-foreground" /> Free to start</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features strip */}
      <section id="features" className="relative -mt-16 z-10 mx-auto max-w-7xl px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border bg-card p-6 shadow-lg backdrop-blur-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Headphones className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-semibold">Fast Support</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">We help you set up classes, fees, and exams in minutes.</p>
          </div>
          <div className="rounded-2xl border bg-card p-6 shadow-lg backdrop-blur-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <HomeIcon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-semibold">All-in-One Platform</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">Admissions, exams, ranking, fees and printable reports.</p>
          </div>
          <div className="rounded-2xl border bg-card p-6 shadow-lg backdrop-blur-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <MapPin className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-semibold">Access Anywhere</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">Cloud-based and accessible from every device — no install.</p>
          </div>
        </div>
      </section>

      {/* Modules grid */}
      <section id="modules" className="bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-28">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Everything you need</span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Built for administrators and teachers
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Powerful modules that work together — from the first admission to the end-of-year report card.
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard icon={Users} title="Students & Staff" body="Admissions, profiles, transfers and a clean roster." />
            <FeatureCard icon={Award} title="Exams & Ranking" body="Record marks per exam — rankings update instantly." />
            <FeatureCard icon={Wallet} title="Termly Fees" body="Class fee split across 3 terms with live balances." />
            <FeatureCard icon={Printer} title="Printable Reports" body="Report cards, fee statements, class & student lists." />
            <FeatureCard icon={ShieldCheck} title="Role Permissions" body="Admin grants teachers access to just the pages they need." />
            <FeatureCard icon={ClipboardCheck} title="Per-Term Tracking" body="See paid amount and balance for each term, per student." />
          </div>
        </div>
      </section>

      {/* Stats / CTA */}
      <section id="about" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_oklch(0.55_0.16_165/_0.3),_transparent_50%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-24 md:grid-cols-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-foreground/80">
              Why schools choose us
            </span>
            <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-primary-foreground sm:text-4xl">
              One calm cockpit for the whole school year.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-primary-foreground/70">
              Replace spreadsheets with a focused workspace that keeps students,
              teachers, marks and fees in one place — and prints beautiful reports
              when you need them.
            </p>
            <ul className="mt-8 space-y-4 text-sm">
              {[
                "Set up in minutes — no IT team required",
                "Three-term fee tracking with live balances",
                "Auto-ranked grades per class and per exam",
                "Permission-controlled access for teachers",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-primary-foreground/85">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent-foreground" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <Stat number="20+" label="Modules ready out of the box" />
            <Stat number="3" label="Terms tracked per academic year" />
            <Stat number="Auto" label="Ranking by exam and class" />
            <Stat number="100%" label="Printable, branded reports" />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y bg-card">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Trusted by schools</span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">What administrators say</h2>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {[
              { quote: "We went from 4 spreadsheets to one dashboard. The fee tracking alone saved us days.", author: "Jane M.", role: "Head Teacher" },
              { quote: "Setting up exams and getting ranked reports used to take a full weekend. Now it's instant.", author: "Peter K.", role: "Deputy Head" },
              { quote: "The printable reports are a lifesaver. Parents love the clean fee statements.", author: "Sarah W.", role: "Bursar" },
            ].map((t) => (
              <div key={t.author} className="rounded-2xl border bg-card/50 p-6">
                <div className="flex gap-1 text-accent mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="h-4 w-4 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-bold text-accent">★</span>
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground italic">"{t.quote}"</p>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-semibold">{t.author}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / Footer */}
      <footer id="contact" className="bg-card">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                <School className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight">{schoolName}</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Modern school management for forward-thinking schools.
            </p>
          </div>
          <FooterCol title="Product" links={["Features", "Modules", "Reports", "Pricing"]} />
          <FooterCol title="Company" links={["About", "Contact", "Privacy", "Terms"]} />
          <div>
            <h4 className="text-sm font-semibold">Get in touch</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-accent" /> +254 700 000 000</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-accent" /> hello@schoolsuite.app</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" /> Nairobi, Kenya</li>
            </ul>
          </div>
        </div>
        <div className="border-t">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-6 py-6 sm:flex-row sm:items-center">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} {schoolName}. All rights reserved.
            </p>
            <div className="flex gap-5 text-xs">
              <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">Sign in</Link>
              {!hasSchool && (
                <Link to="/register" className="text-muted-foreground hover:text-foreground transition-colors">Register</Link>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, body }: { icon: any; title: string; body: string }) {
  return (
    <Card className="group border-border/60 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5">
      <CardContent className="p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-all duration-300 group-hover:bg-accent group-hover:text-accent-foreground group-hover:shadow-lg group-hover:shadow-accent/20">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mt-5 text-base font-semibold tracking-tight text-foreground">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 p-6 backdrop-blur-sm transition-all hover:bg-primary-foreground/10 hover:scale-[1.02]">
      <div className="text-3xl font-bold tracking-tight text-accent-foreground">{number}</div>
      <div className="mt-2 text-sm leading-relaxed text-primary-foreground/70">{label}</div>
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold">{title}</h4>
      <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
        {links.map((l) => (
          <li key={l}><a href="#" className="hover:text-foreground transition-colors">{l}</a></li>
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
                  <Bar dataKey="count" fill="var(--success)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
