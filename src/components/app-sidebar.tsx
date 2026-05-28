import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarCheck,
  Wallet,
  BookOpen,
  Calendar,
  ClipboardList,
  Megaphone,
  MessagesSquare,
  Library,
  Bus,
  Building2,
  Settings,
  School,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

const groups = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", url: "/", icon: LayoutDashboard }],
  },
  {
    label: "People",
    items: [
      { title: "Students", url: "/students", icon: Users },
      { title: "Staff", url: "/staff", icon: GraduationCap },
    ],
  },
  {
    label: "Academics",
    items: [
      { title: "Classes", url: "/classes", icon: BookOpen },
      { title: "Timetable", url: "/timetable", icon: Calendar },
      { title: "Exams", url: "/exams", icon: ClipboardList },
      { title: "Grades", url: "/grades", icon: GraduationCap },
      { title: "Attendance", url: "/attendance", icon: CalendarCheck },
    ],
  },
  {
    label: "Finance",
    items: [{ title: "Fees & Billing", url: "/fees", icon: Wallet }],
  },
  {
    label: "Communication",
    items: [
      { title: "Announcements", url: "/announcements", icon: Megaphone },
      { title: "Messages", url: "/messages", icon: MessagesSquare },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Library", url: "/library", icon: Library },
      { title: "Transport", url: "/transport", icon: Bus },
      { title: "Hostel", url: "/hostel", icon: Building2 },
    ],
  },
];

export function AppSidebar() {
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (path: string) =>
    path === "/" ? currentPath === "/" : currentPath.startsWith(path);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
            <School className="h-5 w-5" />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold text-sidebar-foreground">Northfield Academy</span>
            <span className="text-xs text-sidebar-foreground/60">Management System</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <Link to="/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
