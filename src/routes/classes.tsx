import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Users, BookOpen, MapPin, Edit3, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { createFileRoute } from "@tanstack/react-router";
import { fetchClasses, createClass, updateClass, deleteClass } from "@/lib/supabase-helpers";

export const Route = createFileRoute("/classes")({
  head: () => ({ meta: [{ title: "Classes — School Management" }] }),
  component: ClassesPage,
});

type ClassFormState = {
  id?: string;
  name: string;
  stream: string;
  teacher: string;
  room: string;
  fee_amount: string;
};

function ClassesPage() {
  const queryClient = useQueryClient();
  const classesQuery = useQuery({ queryKey: ["classes"], queryFn: fetchClasses });
  const createMutation = useMutation((input: ClassFormState) => createClass({
    name: input.name,
    stream: input.stream,
    teacher: input.teacher,
    room: input.room,
    fee_amount: Number(input.fee_amount) || 0,
  }), {
    onSuccess: () => queryClient.invalidateQueries(["classes"]),
  });
  const updateMutation = useMutation((payload: ClassFormState) => updateClass(payload.id ?? "", {
    name: payload.name,
    stream: payload.stream,
    teacher: payload.teacher,
    room: payload.room,
    fee_amount: Number(payload.fee_amount) || 0,
  }), {
    onSuccess: () => queryClient.invalidateQueries(["classes"]),
  });
  const deleteMutation = useMutation((id: string) => deleteClass(id), {
    onSuccess: () => queryClient.invalidateQueries(["classes"]),
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<ClassFormState>({
    name: "",
    stream: "Science",
    teacher: "",
    room: "",
    fee_amount: "0",
  });

  const openCreate = () => {
    setForm({ name: "", stream: "Science", teacher: "", room: "", fee_amount: "0" });
    setIsEditing(false);
    setDialogOpen(true);
  };

  const openEdit = (cls: any) => {
    setForm({
      id: cls.id,
      name: cls.name,
      stream: cls.stream,
      teacher: cls.teacher,
      room: cls.room,
      fee_amount: String(cls.fee_amount ?? 0),
    });
    setIsEditing(true);
    setDialogOpen(true);
  };

  const save = async () => {
    if (isEditing) {
      await updateMutation.mutateAsync(form);
    } else {
      await createMutation.mutateAsync(form);
    }
    setDialogOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Classes & Sections"
        description="Manage forms, streams, class teachers and fee structures."
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}><Plus className="h-4 w-4" />New Class</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isEditing ? "Edit Class" : "Add New Class"}</DialogTitle>
                <DialogDescription>Store class details and class fee settings in Supabase.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input
                  placeholder="Class name"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                />
                <Input
                  placeholder="Stream"
                  value={form.stream}
                  onChange={(event) => setForm((prev) => ({ ...prev, stream: event.target.value }))}
                />
                <Input
                  placeholder="Class teacher"
                  value={form.teacher}
                  onChange={(event) => setForm((prev) => ({ ...prev, teacher: event.target.value }))}
                />
                <Input
                  placeholder="Room"
                  value={form.room}
                  onChange={(event) => setForm((prev) => ({ ...prev, room: event.target.value }))}
                />
                <Input
                  type="number"
                  placeholder="Fee amount"
                  value={form.fee_amount}
                  onChange={(event) => setForm((prev) => ({ ...prev, fee_amount: event.target.value }))}
                />
              </div>
              <DialogFooter>
                <Button type="button" onClick={save}>
                  {isEditing ? "Update class" : "Create class"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {classesQuery.data?.map((c) => (
          <Card key={c.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-base">{c.name}</CardTitle>
                  <p className="mt-0.5 text-xs text-muted-foreground">{c.teacher}</p>
                </div>
                <Badge variant={c.stream === "Science" ? "default" : "secondary"}>{c.stream}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Fee: {c.fee_amount ? `KES ${c.fee_amount.toLocaleString()}` : "Not set"}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{c.room || "Unassigned room"}</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => openEdit(c)}>
                <Edit3 className="h-4 w-4" /> Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(c.id)}>
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
