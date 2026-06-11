import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Bell, Search, Palette } from "lucide-react";
import { useEffect, useState } from "react";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { AuthProvider, useAuth } from "@/lib/auth";
import { getStoredTheme, setStoredTheme, applyTheme, type Theme } from "@/lib/utils";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">Please try again.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >Try again</button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "School Management System" },
      { name: "description", content: "All-in-one school management platform: students, staff, academics, fees, communication and operations." },
      { property: "og:title", content: "School Management System" },
      { name: "twitter:title", content: "School Management System" },
      { property: "og:description", content: "All-in-one school management platform: students, staff, academics, fees, communication and operations." },
      { name: "twitter:description", content: "All-in-one school management platform: students, staff, academics, fees, communication and operations." },
      { property: "og:image", content: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80" },
      { name: "twitter:image", content: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootShellContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function RootShellContent() {
  const auth = useAuth();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const showChrome = !!auth.user && !isAuthPage;
  const [theme, setTheme] = useState<Theme>(getStoredTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    setTheme(getStoredTheme());
  }, []);

  const handleThemeChange = (val: string) => {
    const t = val as Theme;
    setTheme(t);
    setStoredTheme(t);
  };

  if (!showChrome) {
    return (
      <>
        <main className="min-h-screen w-full bg-background"><Outlet /></main>
        <Toaster />
      </>
    );
  }

  const initials = (auth.user?.name || auth.user?.email || "?")
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card px-4 print:hidden">
            <SidebarTrigger />
            <div className="relative hidden flex-1 max-w-md md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search…" className="pl-9 h-9 bg-muted/50 border-transparent" />
            </div>
              <div className="ml-auto flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Palette className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuRadioGroup value={theme} onValueChange={handleThemeChange}>
                      <DropdownMenuRadioItem value="emerald">Emerald</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="sapphire">Sapphire</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="rose">Rose</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="amber">Amber</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="violet">Violet</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="hidden sm:flex items-center gap-2 rounded-md px-2 py-1">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div className="hidden text-left text-xs leading-tight sm:block">
                  <div className="font-medium">{auth.user!.name}</div>
                  <div className="text-muted-foreground capitalize">{auth.user!.role}</div>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={auth.signOut}>
                Sign out
              </Button>
            </div>
          </header>
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}
