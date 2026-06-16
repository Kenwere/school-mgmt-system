import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth";
import { updateUser } from "@/lib/store";
import { Shield, Save } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "My Profile" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const auth = useAuth();
  const user = auth.user;

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!user) return null;

  const initials = user.name
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const patch: Record<string, string> = {};
      if (name.trim() !== user.name) patch.name = name.trim();
      if (email.trim().toLowerCase() !== user.email) patch.email = email.trim();
      if (password) patch.password = password;
      if (Object.keys(patch).length === 0) {
        setMessage({ type: "success", text: "No changes to save." });
        return;
      }
      await updateUser(user.id, patch);
      setMessage({ type: "success", text: "Profile updated." });
      setPassword("");
    } catch {
      setMessage({ type: "error", text: "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader title="My Profile" description="View and update your account details." />
      <div className="p-6 max-w-lg">
        <Card>
          <CardHeader className="flex flex-col items-center gap-3 pb-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <CardTitle className="text-lg">{user.name}</CardTitle>
              <p className="text-xs text-muted-foreground capitalize flex items-center justify-center gap-1 mt-0.5">
                <Shield className="h-3 w-3" /> {user.role}
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current" />
            </div>
            {message && (
              <p className={`text-sm ${message.type === "success" ? "text-success" : "text-destructive"}`}>
                {message.text}
              </p>
            )}
            <Button className="w-full" onClick={save} disabled={saving}>
              <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save changes"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
