import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Wallet,
  BookOpen,
  ClipboardList,
  Award,
  Pencil,
  FileText,
  Settings,
  Shield,
  School as SchoolIcon,
  CalendarCheck,
  Calendar,
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
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";

type Item = { title: string; url: string; icon: any; adminOnly?: boolean };

const groups: { label: string; items: Item[] }[] = [
  { label: "Overview", items: [{ title: "Dashboard", url: "/", icon: LayoutDashboard }] },
  {
    label: "People",
    items: [
      { title: "Students", url: "/students", icon: Users },
      { title: "Teachers", url: "/teachers", icon: Shield, adminOnly: true },
    ],
  },
  {
    label: "Academics",
    items: [
      { title: "Classes", url: "/classes", icon: BookOpen },
      { title: "Exams", url: "/exams", icon: ClipboardList },
      { title: "Marks entry", url: "/marks", icon: Pencil },
      { title: "Grades & ranking", url: "/grades", icon: Award },
      { title: "Attendance", url: "/attendance", icon: CalendarCheck },
      { title: "Timetable", url: "/timetable", icon: Calendar },
      { title: "Promotion", url: "/promotion", icon: GraduationCap, adminOnly: true },
    ],
  },
  {
    label: "Finance & reports",
    items: [
      { title: "Fees", url: "/fees", icon: Wallet },

      { title: "Reports", url: "/reports", icon: FileText },
    ],
  },
];

export function AppSidebar() {
  const auth = useAuth();
  const store = useStore();
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (path: string) =>
    path === "/" ? currentPath === "/" : currentPath.startsWith(path);

  const visible = (item: Item) => {
    if (item.adminOnly) return auth.user?.role === "admin";
    return auth.canAccess(item.url);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-md bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
            {store.school?.logo ? (
              <img src={store.school.logo} alt="logo" className="h-full w-full object-cover" />
            ) : (
              <SchoolIcon className="h-5 w-5" />
            )}
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold text-sidebar-foreground line-clamp-1">
              {store.school?.name ?? "School"}
            </span>
            <span className="text-xs text-sidebar-foreground/60">Management System</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group) => {
          const items = group.items.filter(visible);
          if (items.length === 0) return null;
          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
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
          );
        })}
      </SidebarContent>

      {auth.user?.role === "admin" && (
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
      )}
    </Sidebar>
  );
}
