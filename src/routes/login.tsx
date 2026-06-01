import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { School } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in" }] }),
  component: LoginPage,
});

function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const store = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (auth.user) {
    router.navigate({ to: "/" });
    return null;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const ok = await auth.signIn(email, password);
    if (!ok) {
      setError("Invalid email or password.");
      toast.error("Invalid email or password");
    } else {
      toast.success("Signed in");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <School className="h-6 w-6" />
          </div>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            {store.school ? `Welcome back to ${store.school.name}` : "Sign in to your school account"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full">Sign in</Button>
            {!store.school && (
              <p className="text-center text-sm text-muted-foreground">
                No school yet? <Link to="/register" className="text-primary underline">Register your school</Link>
              </p>
            )}
            <Link to="/" className="text-center text-xs text-muted-foreground hover:text-foreground">
              ← Back to home
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
