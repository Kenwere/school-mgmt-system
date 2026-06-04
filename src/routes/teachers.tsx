import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit3, Plus, Trash2, Shield } from "lucide-react";
import { addTeacher, deleteUser, updateUser, useStore, TEACHER_PERMISSION_OPTIONS, type User } from "@/lib/store";
import { PermissionGate } from "@/components/permission-gate";

export const Route = createFileRoute("/teachers")({
  head: () => ({ meta: [{ title: "Teachers — School Management" }] }),
  component: () => (
    <PermissionGate path="/teachers" adminOnly>
      <TeachersPage />
    </PermissionGate>
  ),
});

function TeachersPage() {
  const store = useStore();
  const teachers = store.users.filter((u) => u.role === "teacher");

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const openCreate = () => {
    setEditingId(null);
    setName("");
    setEmail("");
    setPassword("");
    setError("");
    setOpen(true);
  };

  const openEdit = (teacher: User) => {
    setEditingId(teacher.id);
    setName(teacher.name);
    setEmail(teacher.email);
    setPassword(teacher.password);
    setError("");
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (store.users.some((u) => u.email === email.trim().toLowerCase() && u.id !== editingId)) {
      setError("A user with that email already exists.");
      return;
    }
    if (editingId) {
      updateUser(editingId, {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
      });
    } else {
      addTeacher({ name, email, password });
    }
    setName(""); setEmail(""); setPassword("");
    setEditingId(null);
    setOpen(false);
  };

  const togglePerm = (id: string, path: string, on: boolean) => {
    const t = store.users.find((u) => u.id === id);
    if (!t) return;
    const perms = on
      ? Array.from(new Set([...t.permissions, path]))
      : t.permissions.filter((p) => p !== path);
    updateUser(id, { permissions: perms });
  };

  return (
    <>
      <PageHeader
        title="Teachers & permissions"
        description="Add teachers and grant them access only to the pages they need."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}><Plus className="h-4 w-4" /> Add teacher</Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={submit}>
                <DialogHeader>
                  <DialogTitle>{editingId ? "Edit teacher" : "Add a teacher"}</DialogTitle>
                  <DialogDescription>The teacher can sign in with the email and password you set.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2"><Label>Full name</Label><Input required value={name} onChange={(e) => setName(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Email</Label><Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Password</Label><Input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
                <DialogFooter><Button type="submit">{editingId ? "Save teacher" : "Create teacher"}</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="space-y-6 p-6">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Pages allowed</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-10">No teachers yet.</TableCell></TableRow>
                )}
                {teachers.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell>{t.email}</TableCell>
                    <TableCell><Badge variant="secondary">{t.permissions.length} / {TEACHER_PERMISSION_OPTIONS.length}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(t)}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { if (confirm(`Remove ${t.name}?`)) deleteUser(t.id); }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {teachers.map((t) => (
          <Card key={t.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4 text-primary" /> {t.name}
              </CardTitle>
              <CardDescription>Toggle the pages this teacher can open.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {TEACHER_PERMISSION_OPTIONS.map((opt) => {
                  const on = t.permissions.includes(opt.path);
                  return (
                    <label key={opt.path} className="flex items-center gap-3 rounded-md border p-3 cursor-pointer hover:bg-muted/40">
                      <Checkbox checked={on} onCheckedChange={(v) => togglePerm(t.id, opt.path, !!v)} />
                      <div>
                        <div className="text-sm font-medium">{opt.label}</div>
                        <div className="text-xs text-muted-foreground">{opt.path}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              Admin can always access everything. Teachers will see a denied screen on restricted pages.
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
