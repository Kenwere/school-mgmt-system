export const stats = {
  students: 1247,
  staff: 86,
  classes: 42,
  feesCollected: 12_450_000,
  feesPending: 3_280_000,
  attendanceToday: 94.2,
};

export const students = [
  { id: "STU-2024-001", name: "Amani Wanjiku", class: "Form 4A", gender: "Female", admission: "2021-01-12", status: "Active", parent: "Grace Wanjiku", phone: "+254 712 345 678", fees: "Paid" },
  { id: "STU-2024-002", name: "Brian Otieno", class: "Form 3B", gender: "Male", admission: "2022-01-10", status: "Active", parent: "Peter Otieno", phone: "+254 722 112 334", fees: "Partial" },
  { id: "STU-2024-003", name: "Cynthia Mwangi", class: "Form 2A", gender: "Female", admission: "2023-01-09", status: "Active", parent: "Jane Mwangi", phone: "+254 733 998 221", fees: "Paid" },
  { id: "STU-2024-004", name: "Daniel Kiprop", class: "Form 1C", gender: "Male", admission: "2024-01-15", status: "Active", parent: "Mary Kiprop", phone: "+254 701 553 119", fees: "Pending" },
  { id: "STU-2024-005", name: "Esther Achieng", class: "Form 4B", gender: "Female", admission: "2021-01-12", status: "Active", parent: "John Achieng", phone: "+254 711 224 778", fees: "Paid" },
  { id: "STU-2024-006", name: "Faisal Abdi", class: "Form 3A", gender: "Male", admission: "2022-01-10", status: "Active", parent: "Hassan Abdi", phone: "+254 720 776 442", fees: "Paid" },
  { id: "STU-2024-007", name: "Grace Njeri", class: "Form 2B", gender: "Female", admission: "2023-01-09", status: "Suspended", parent: "Susan Njeri", phone: "+254 715 663 998", fees: "Partial" },
  { id: "STU-2024-008", name: "Henry Mutiso", class: "Form 1A", gender: "Male", admission: "2024-01-15", status: "Active", parent: "Paul Mutiso", phone: "+254 726 110 552", fees: "Pending" },
];

export const staff = [
  { id: "TCH-001", name: "Mr. Joseph Karanja", role: "Mathematics Teacher", department: "Sciences", email: "j.karanja@school.ac.ke", phone: "+254 712 000 111", status: "Active" },
  { id: "TCH-002", name: "Mrs. Linda Achieng", role: "English & Literature", department: "Languages", email: "l.achieng@school.ac.ke", phone: "+254 722 000 222", status: "Active" },
  { id: "TCH-003", name: "Mr. Samuel Kiptoo", role: "Physics Teacher", department: "Sciences", email: "s.kiptoo@school.ac.ke", phone: "+254 733 000 333", status: "On Leave" },
  { id: "TCH-004", name: "Ms. Faith Wambui", role: "History & C.R.E", department: "Humanities", email: "f.wambui@school.ac.ke", phone: "+254 701 000 444", status: "Active" },
  { id: "ADM-001", name: "Mr. David Mwema", role: "Principal", department: "Administration", email: "principal@school.ac.ke", phone: "+254 711 000 555", status: "Active" },
  { id: "ADM-002", name: "Mrs. Rose Atieno", role: "Deputy Principal", department: "Administration", email: "deputy@school.ac.ke", phone: "+254 720 000 666", status: "Active" },
  { id: "TCH-005", name: "Mr. Eric Njoroge", role: "Chemistry Teacher", department: "Sciences", email: "e.njoroge@school.ac.ke", phone: "+254 715 000 777", status: "Active" },
];

export const classes = [
  { name: "Form 1A", teacher: "Ms. Faith Wambui", students: 38, room: "Block A - 101", stream: "Science" },
  { name: "Form 1B", teacher: "Mr. Eric Njoroge", students: 36, room: "Block A - 102", stream: "Arts" },
  { name: "Form 2A", teacher: "Mrs. Linda Achieng", students: 40, room: "Block B - 201", stream: "Science" },
  { name: "Form 2B", teacher: "Mr. Samuel Kiptoo", students: 37, room: "Block B - 202", stream: "Arts" },
  { name: "Form 3A", teacher: "Mr. Joseph Karanja", students: 35, room: "Block C - 301", stream: "Science" },
  { name: "Form 3B", teacher: "Ms. Faith Wambui", students: 34, room: "Block C - 302", stream: "Arts" },
  { name: "Form 4A", teacher: "Mr. Samuel Kiptoo", students: 32, room: "Block D - 401", stream: "Science" },
  { name: "Form 4B", teacher: "Mrs. Linda Achieng", students: 31, room: "Block D - 402", stream: "Arts" },
];

export const timetable = [
  { time: "08:00 - 08:40", Mon: "Mathematics", Tue: "English", Wed: "Physics", Thu: "Chemistry", Fri: "Biology" },
  { time: "08:40 - 09:20", Mon: "English", Tue: "Mathematics", Wed: "Chemistry", Thu: "History", Fri: "Mathematics" },
  { time: "09:20 - 10:00", Mon: "Physics", Tue: "Biology", Wed: "Mathematics", Thu: "English", Fri: "Geography" },
  { time: "10:00 - 10:30", Mon: "Break", Tue: "Break", Wed: "Break", Thu: "Break", Fri: "Break" },
  { time: "10:30 - 11:10", Mon: "Chemistry", Tue: "History", Wed: "English", Thu: "Physics", Fri: "C.R.E" },
  { time: "11:10 - 11:50", Mon: "Biology", Tue: "Geography", Wed: "C.R.E", Thu: "Mathematics", Fri: "Physics" },
  { time: "11:50 - 12:30", Mon: "History", Tue: "Physics", Wed: "Biology", Thu: "Geography", Fri: "English" },
  { time: "12:30 - 14:00", Mon: "Lunch", Tue: "Lunch", Wed: "Lunch", Thu: "Lunch", Fri: "Lunch" },
  { time: "14:00 - 14:40", Mon: "Games", Tue: "Computer", Wed: "Library", Thu: "Club", Fri: "Assembly" },
];

export const exams = [
  { name: "End Term 1 Mathematics", class: "Form 4A", date: "2025-04-12", time: "08:00", duration: "2h 30m", status: "Scheduled" },
  { name: "End Term 1 English", class: "Form 4A", date: "2025-04-14", time: "08:00", duration: "2h 30m", status: "Scheduled" },
  { name: "Mid Term Chemistry", class: "Form 3A", date: "2025-03-20", time: "10:00", duration: "2h", status: "Completed" },
  { name: "CAT 2 Physics", class: "Form 2B", date: "2025-03-18", time: "11:00", duration: "1h", status: "Completed" },
  { name: "Mock Examination", class: "Form 4B", date: "2025-05-05", time: "08:00", duration: "3h", status: "Scheduled" },
];

export const grades = [
  { student: "Amani Wanjiku", math: 88, eng: 76, phy: 92, chem: 81, bio: 79, avg: 83.2, grade: "A-", rank: 2 },
  { student: "Esther Achieng", math: 94, eng: 89, phy: 88, chem: 90, bio: 86, avg: 89.4, grade: "A", rank: 1 },
  { student: "Brian Otieno", math: 72, eng: 68, phy: 75, chem: 70, bio: 73, avg: 71.6, grade: "B", rank: 14 },
  { student: "Cynthia Mwangi", math: 80, eng: 84, phy: 78, chem: 82, bio: 79, avg: 80.6, grade: "A-", rank: 5 },
  { student: "Faisal Abdi", math: 65, eng: 70, phy: 68, chem: 62, bio: 66, avg: 66.2, grade: "B-", rank: 22 },
];

export const fees = [
  { invoice: "INV-2025-0421", student: "Amani Wanjiku", class: "Form 4A", term: "Term 1 2025", amount: 45000, paid: 45000, balance: 0, status: "Paid", method: "M-Pesa" },
  { invoice: "INV-2025-0422", student: "Brian Otieno", class: "Form 3B", term: "Term 1 2025", amount: 42000, paid: 20000, balance: 22000, status: "Partial", method: "Bank" },
  { invoice: "INV-2025-0423", student: "Cynthia Mwangi", class: "Form 2A", term: "Term 1 2025", amount: 40000, paid: 40000, balance: 0, status: "Paid", method: "M-Pesa" },
  { invoice: "INV-2025-0424", student: "Daniel Kiprop", class: "Form 1C", term: "Term 1 2025", amount: 38000, paid: 0, balance: 38000, status: "Pending", method: "—" },
  { invoice: "INV-2025-0425", student: "Esther Achieng", class: "Form 4B", term: "Term 1 2025", amount: 45000, paid: 45000, balance: 0, status: "Paid", method: "Card" },
  { invoice: "INV-2025-0426", student: "Henry Mutiso", class: "Form 1A", term: "Term 1 2025", amount: 38000, paid: 0, balance: 38000, status: "Pending", method: "—" },
];

export const announcements = [
  { title: "Term 1 Reopening Date Confirmed", body: "All students should report on Monday, 6th January 2025 by 9:00 AM. Full uniform is required.", audience: "All Parents & Students", date: "2024-12-20", priority: "High" },
  { title: "Parents' Day - 22nd March", body: "Annual Parents' Day will be held on Saturday 22nd March 2025. Confirm attendance via the parent portal.", audience: "Parents", date: "2025-03-01", priority: "Medium" },
  { title: "Form 4 Mock Exam Schedule Released", body: "The mock exam timetable is now available. Please review and prepare adequately.", audience: "Form 4", date: "2025-03-10", priority: "High" },
  { title: "Sports Day - Inter-house Competitions", body: "All houses to prepare for athletics, football and netball events on 18th April.", audience: "All Students", date: "2025-03-15", priority: "Low" },
];

export const messages = [
  { from: "Grace Wanjiku (Parent)", subject: "Request for early pickup", preview: "Good morning, I would like to pick Amani at 12pm today due to a clinic appointment...", time: "10:24 AM", unread: true },
  { from: "Mr. Joseph Karanja", subject: "Form 4A Mathematics report", preview: "Please find attached the analysis of last week's CAT for Form 4A...", time: "Yesterday", unread: true },
  { from: "Peter Otieno (Parent)", subject: "Fee payment confirmation", preview: "I've sent KES 20,000 via M-Pesa. Kindly confirm receipt.", time: "Yesterday", unread: false },
  { from: "Mrs. Rose Atieno", subject: "Staff meeting tomorrow", preview: "Reminder: Heads of department meeting at 4pm in the boardroom.", time: "Mon", unread: false },
];

export const library = [
  { code: "LIB-0421", title: "A Doll's House", author: "Henrik Ibsen", category: "Literature", copies: 45, available: 12, status: "Available" },
  { code: "LIB-0422", title: "The River and the Source", author: "Margaret Ogola", category: "Literature", copies: 60, available: 8, status: "Low Stock" },
  { code: "LIB-0501", title: "KCSE Mathematics", author: "KLB", category: "Mathematics", copies: 120, available: 34, status: "Available" },
  { code: "LIB-0612", title: "Physics Form 4", author: "KLB", category: "Sciences", copies: 80, available: 0, status: "Out of Stock" },
  { code: "LIB-0701", title: "Atomic Habits", author: "James Clear", category: "Self-help", copies: 5, available: 2, status: "Available" },
];

export const transport = [
  { route: "Route A - Westlands", driver: "Mr. Stephen Mutua", vehicle: "KCA 234X", capacity: 45, students: 38, status: "On Route" },
  { route: "Route B - Karen", driver: "Mr. James Onyango", vehicle: "KCB 887Y", capacity: 45, students: 41, status: "On Route" },
  { route: "Route C - Kasarani", driver: "Mr. Patrick Kamau", vehicle: "KCD 119Z", capacity: 50, students: 47, status: "Maintenance" },
  { route: "Route D - Embakasi", driver: "Mr. Daniel Wekesa", vehicle: "KCE 552A", capacity: 45, students: 35, status: "On Route" },
];

export const hostel = [
  { name: "Mandela House", warden: "Mr. Eric Njoroge", capacity: 120, occupied: 112, gender: "Boys", status: "Almost Full" },
  { name: "Wangari Maathai", warden: "Ms. Faith Wambui", capacity: 100, occupied: 88, gender: "Girls", status: "Available" },
  { name: "Kenyatta House", warden: "Mr. Joseph Karanja", capacity: 120, occupied: 120, gender: "Boys", status: "Full" },
  { name: "Mekatilili Hall", warden: "Mrs. Linda Achieng", capacity: 100, occupied: 64, gender: "Girls", status: "Available" },
];

export const attendanceWeek = [
  { day: "Mon", present: 1192, absent: 55 },
  { day: "Tue", present: 1175, absent: 72 },
  { day: "Wed", present: 1210, absent: 37 },
  { day: "Thu", present: 1188, absent: 59 },
  { day: "Fri", present: 1175, absent: 72 },
];

export const feesTrend = [
  { month: "Jan", collected: 2200000, target: 2500000 },
  { month: "Feb", collected: 2450000, target: 2500000 },
  { month: "Mar", collected: 2380000, target: 2500000 },
  { month: "Apr", collected: 1820000, target: 2500000 },
  { month: "May", collected: 1900000, target: 2500000 },
  { month: "Jun", collected: 1700000, target: 2500000 },
];

export const formatKES = (n: number) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(n);
