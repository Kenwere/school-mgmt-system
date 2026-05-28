import * as React from "react";
import { useRouter } from "@tanstack/react-router";

type AuthUser = {
  email: string;
  role: "admin" | "teacher" | "student";
};

type AuthContextValue = {
  user: AuthUser | null;
  signIn: (email: string, password: string, role: AuthUser["role"]) => Promise<boolean>;
  signOut: () => void;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

const storageKey = "school-management-auth";
const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = React.useState<AuthUser | null>(null);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as AuthUser;
      setUser(parsed);
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (user) {
      window.localStorage.setItem(storageKey, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(storageKey);
    }
  }, [user]);

  const signIn = React.useCallback(async (email: string, password: string, role: AuthUser["role"]) => {
    if (role === "admin") {
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        setUser({ email, role });
        await router.navigate({ to: "/" });
        return true;
      }
      return false;
    }

    setUser({ email, role });
    await router.navigate({ to: "/" });
    return true;
  }, [router]);

  const signOut = React.useCallback(() => {
    setUser(null);
    router.navigate({ to: "/" });
  }, [router]);

  return <AuthContext.Provider value={{ user, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
