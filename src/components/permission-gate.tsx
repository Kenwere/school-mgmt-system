import { ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export function PermissionGate({
  path,
  adminOnly,
  children,
}: {
  path: string;
  adminOnly?: boolean;
  children: ReactNode;
}) {
  const auth = useAuth();
  const router = useRouter();

  if (!auth.user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Sign in required</CardTitle>
            <CardDescription>You need to sign in to view this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.navigate({ to: "/login" })}>Sign in</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const allowed = auth.user.role === "admin"
    ? true
    : !adminOnly && auth.user.permissions.includes(path);

  if (!allowed) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardTitle>Access denied</CardTitle>
            <CardDescription>
              {adminOnly
                ? "Only the administrator can open this page."
                : "Your administrator hasn't granted you access to this page."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => router.navigate({ to: "/" })}>Back to dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
