import * as React from "react";
import { useRouter } from "@tanstack/react-router";
import {
  currentUser,
  hasPermission,
  initializeStoreFromSupabase,
  login as storeLogin,
  logout as storeLogout,
  registerSchool as storeRegister,
  useStore,
  type School,
  type User,
} from "./store";

type AuthContextValue = {
  user: User | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => void;
  register: (input: {
    school: School;
    admin: { name: string; email: string; password: string };
  }) => Promise<void>;
  canAccess: (path: string) => boolean;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const store = useStore();
  const user = store.users.find((u) => u.id === store.currentUserId) ?? null;

  React.useEffect(() => {
    void initializeStoreFromSupabase();
  }, []);

  const signIn = React.useCallback(
    async (email: string, password: string) => {
      const u = storeLogin(email, password);
      if (!u) return false;
      await router.navigate({ to: "/" });
      return true;
    },
    [router],
  );

  const signOut = React.useCallback(() => {
    storeLogout();
    router.navigate({ to: "/" });
  }, [router]);

  const register = React.useCallback(
    async (input: Parameters<typeof storeRegister>[0]) => {
      await storeRegister(input);
      await router.navigate({ to: "/" });
    },
    [router],
  );

  const canAccess = React.useCallback(
    (path: string) => hasPermission(currentUser(), path),
    // re-evaluate on store change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store],
  );

  const value = React.useMemo(
    () => ({ user, signIn, signOut, register, canAccess }),
    [user, signIn, signOut, register, canAccess],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
