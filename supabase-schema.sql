create table if not exists public.schools (
  id text primary key default 'default',
  name text not null,
  logo text not null default '',
  address text not null default '',
  phone text not null default '',
  email text not null default '',
  motto text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.users (
  id uuid primary key,
  school_id text not null default 'default' references public.schools(id) on delete cascade,
  name text not null,
  email text not null unique,
  password text not null,
  role text not null check (role in ('admin', 'teacher')),
  permissions text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.classes (
  id uuid primary key,
  school_id text not null default 'default' references public.schools(id) on delete cascade,
  name text not null,
  stream text,
  teacher text,
  room text,
  subjects text[] not null default '{}',
  fee_term_1 numeric not null default 0,
  fee_term_2 numeric not null default 0,
  fee_term_3 numeric not null default 0,
  fee_per_year numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key,
  school_id text not null default 'default' references public.schools(id) on delete cascade,
  admission_no text not null,
  name text not null,
  gender text not null default '',
  class_id uuid references public.classes(id) on delete set null,
  fee_per_year numeric,
  image text,
  parent text not null default '',
  phone text not null default '',
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.exams (
  id uuid primary key,
  school_id text not null default 'default' references public.schools(id) on delete cascade,
  name text not null,
  term integer not null check (term in (1, 2, 3)),
  year integer not null,
  date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.marks (
  id uuid primary key,
  school_id text not null default 'default' references public.schools(id) on delete cascade,
  exam_id uuid not null references public.exams(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  subject text not null,
  score numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (exam_id, student_id, subject)
);

create table if not exists public.payments (
  id uuid primary key,
  school_id text not null default 'default' references public.schools(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  term integer not null check (term in (1, 2, 3)),
  amount numeric not null default 0,
  date date not null,
  paid_at timestamptz not null default now(),
  method text not null default '',
  ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.attendance (
  id uuid primary key,
  school_id text not null default 'default' references public.schools(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  week_start date not null,
  status text not null check (status in ('present', 'absent', 'late', 'leave')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, week_start)
);

create table if not exists public.timetable_entries (
  id uuid primary key,
  school_id text not null default 'default' references public.schools(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  day text not null check (day in ('Mon', 'Tue', 'Wed', 'Thu', 'Fri')),
  time_slot text not null,
  subject text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (class_id, day, time_slot)
);

alter table public.classes add column if not exists fee_term_1 numeric not null default 0;
alter table public.classes add column if not exists fee_term_2 numeric not null default 0;
alter table public.classes add column if not exists fee_term_3 numeric not null default 0;
alter table public.students add column if not exists image text;
alter table public.students add column if not exists carried_forward numeric not null default 0;
alter table public.students add column if not exists paid_carried_forward numeric not null default 0;
alter table public.payments add column if not exists paid_at timestamptz not null default now();

alter table public.schools enable row level security;
alter table public.users enable row level security;
alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.exams enable row level security;
alter table public.marks enable row level security;
alter table public.payments enable row level security;
alter table public.attendance enable row level security;
alter table public.timetable_entries enable row level security;

drop policy if exists "Allow school reads" on public.schools;
create policy "Allow school reads" on public.schools for select to anon, authenticated using (true);
drop policy if exists "Allow school writes" on public.schools;
create policy "Allow school writes" on public.schools for all to anon, authenticated using (true) with check (true);

drop policy if exists "Allow user reads" on public.users;
create policy "Allow user reads" on public.users for select to anon, authenticated using (true);
drop policy if exists "Allow user writes" on public.users;
create policy "Allow user writes" on public.users for all to anon, authenticated using (true) with check (true);

drop policy if exists "Allow class reads" on public.classes;
create policy "Allow class reads" on public.classes for select to anon, authenticated using (true);
drop policy if exists "Allow class writes" on public.classes;
create policy "Allow class writes" on public.classes for all to anon, authenticated using (true) with check (true);

drop policy if exists "Allow student reads" on public.students;
create policy "Allow student reads" on public.students for select to anon, authenticated using (true);
drop policy if exists "Allow student writes" on public.students;
create policy "Allow student writes" on public.students for all to anon, authenticated using (true) with check (true);

drop policy if exists "Allow exam reads" on public.exams;
create policy "Allow exam reads" on public.exams for select to anon, authenticated using (true);
drop policy if exists "Allow exam writes" on public.exams;
create policy "Allow exam writes" on public.exams for all to anon, authenticated using (true) with check (true);

drop policy if exists "Allow mark reads" on public.marks;
create policy "Allow mark reads" on public.marks for select to anon, authenticated using (true);
drop policy if exists "Allow mark writes" on public.marks;
create policy "Allow mark writes" on public.marks for all to anon, authenticated using (true) with check (true);

drop policy if exists "Allow payment reads" on public.payments;
create policy "Allow payment reads" on public.payments for select to anon, authenticated using (true);
drop policy if exists "Allow payment writes" on public.payments;
create policy "Allow payment writes" on public.payments for all to anon, authenticated using (true) with check (true);

drop policy if exists "Allow attendance reads" on public.attendance;
create policy "Allow attendance reads" on public.attendance for select to anon, authenticated using (true);
drop policy if exists "Allow attendance writes" on public.attendance;
create policy "Allow attendance writes" on public.attendance for all to anon, authenticated using (true) with check (true);

drop policy if exists "Allow timetable reads" on public.timetable_entries;
create policy "Allow timetable reads" on public.timetable_entries for select to anon, authenticated using (true);
drop policy if exists "Allow timetable writes" on public.timetable_entries;
create policy "Allow timetable writes" on public.timetable_entries for all to anon, authenticated using (true) with check (true);
