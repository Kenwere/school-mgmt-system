import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { School, Upload } from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Register school" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const auth = useAuth();
  const router = useRouter();
  const store = useStore();

  const fileRef = useRef<HTMLInputElement>(null);
  const [logo, setLogo] = useState<string>("");
  const [schoolName, setSchoolName] = useState("");
  const [motto, setMotto] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [schoolEmail, setSchoolEmail] = useState("");

  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminPassword2, setAdminPassword2] = useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (auth.initialized && store.school && !auth.user) {
      void router.navigate({ to: "/login" });
    }
  }, [auth.initialized, auth.user, router, store.school]);

  if (!auth.initialized) return null;
  if (store.school) return null;

  const onLogo = (f: File | null) => {
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) {
      setError("Logo must be smaller than 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogo(String(reader.result || ""));
    reader.readAsDataURL(f);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (adminPassword.length < 4) return setError("Password must be at least 4 characters.");
    if (adminPassword !== adminPassword2) return setError("Passwords do not match.");
    setIsSubmitting(true);
    try {
      await auth.register({
        school: {
          name: schoolName.trim(),
          logo,
          address: address.trim(),
          phone: phone.trim(),
          email: schoolEmail.trim(),
          motto: motto.trim(),
        },
        admin: {
          name: adminName.trim(),
          email: adminEmail.trim(),
          password: adminPassword,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save school to Supabase.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <School className="h-6 w-6" />
          </div>
          <CardTitle>Register your school</CardTitle>
          <CardDescription>
            Set up the school profile and create the administrator account.
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-6">
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">School details</h3>
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-md border bg-muted">
                  {logo ? (
                    <img src={logo} alt="School logo" className="h-full w-full object-cover" />
                  ) : (
                    <School className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onLogo(e.target.files?.[0] ?? null)}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                    <Upload className="h-4 w-4" /> Upload logo
                  </Button>
                  <p className="mt-1 text-xs text-muted-foreground">PNG/JPG up to 2MB.</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>School name</Label>
                  <Input required value={schoolName} onChange={(e) => setSchoolName(e.target.value)} placeholder="e.g. Northfield Academy" />
                </div>
                <div className="space-y-2">
                  <Label>Motto</Label>
                  <Input value={motto} onChange={(e) => setMotto(e.target.value)} placeholder="Knowledge is power" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Address</Label>
                  <Textarea rows={2} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="P.O. Box 100 — City" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>School email</Label>
                  <Input type="email" value={schoolEmail} onChange={(e) => setSchoolEmail(e.target.value)} />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Administrator account</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Full name</Label>
                  <Input required value={adminName} onChange={(e) => setAdminName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Admin email</Label>
                  <Input required type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input required type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Confirm password</Label>
                  <Input required type="password" value={adminPassword2} onChange={(e) => setAdminPassword2(e.target.value)} />
                </div>
              </div>
            </section>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "processing..." : "Create school & sign in"}
            </Button>
            <Link to="/" className="text-center text-xs text-muted-foreground hover:text-foreground">
              ← Back to home
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
