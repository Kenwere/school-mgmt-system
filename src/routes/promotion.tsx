import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { PermissionGate } from "@/components/permission-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRight, Users } from "lucide-react";
import { promoteStudents, useStore } from "@/lib/store";

export const Route = createFileRoute("/promotion")({
  head: () => ({ meta: [{ title: "Promotion — School Management" }] }),
  component: () => (
    <PermissionGate path="/promotion">
      <PromotionPage />
    </PermissionGate>
  ),
});

function PromotionPage() {
  const store = useStore();
  const [sourceClassId, setSourceClassId] = useState("");
  const [destClassId, setDestClassId] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const students = store.students.filter((s) => s.active !== false && s.classId === sourceClassId);
  const allSelected = students.length > 0 && selected.size === students.length;

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(students.map((s) => s.id)));
  };

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const doPromote = async (ids: string[]) => {
    if (!destClassId || ids.length === 0) return;
    setSaving(true);
    try {
      await promoteStudents(ids, destClassId);
      setSelected(new Set());
    } finally {
      setSaving(false);
    }
  };

  const otherClasses = store.classes.filter((c) => c.id !== sourceClassId);

  return (
    <>
      <PageHeader
        title="Promotion"
        description="Move a whole class or individual students to another class."
      />
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-5 w-5" />
              Select classes
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label>From class</Label>
              <Select value={sourceClassId} onValueChange={(v) => { setSourceClassId(v); setSelected(new Set()); }}>
                <SelectTrigger className="w-56"><SelectValue placeholder="Choose source class" /></SelectTrigger>
                <SelectContent>
                  {store.classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <ArrowRight className="h-5 w-5 pb-1 text-muted-foreground" />
            <div className="space-y-2">
              <Label>To class</Label>
              <Select value={destClassId} onValueChange={setDestClassId}>
                <SelectTrigger className="w-56"><SelectValue placeholder="Choose destination class" /></SelectTrigger>
                <SelectContent>
                  {otherClasses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {sourceClassId && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">
                Students ({students.length})
              </CardTitle>
              {students.length > 0 && (
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                    Select all
                  </label>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Adm. No</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Gender</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-10">
                        No students in this class.
                      </TableCell>
                    </TableRow>
                  )}
                  {students.map((s) => (
                    <TableRow key={s.id} className="cursor-pointer" onClick={() => toggle(s.id)}>
                      <TableCell>
                        <Checkbox checked={selected.has(s.id)} onCheckedChange={() => toggle(s.id)} />
                      </TableCell>
                      <TableCell className="font-mono text-xs">{s.admissionNo}</TableCell>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.gender}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex gap-3 justify-end">
              <Button
                variant="default"
                disabled={!destClassId || selected.size === 0 || saving}
                onClick={() => doPromote(Array.from(selected))}
              >
                Promote selected ({selected.size})
              </Button>
              <Button
                variant="secondary"
                disabled={!destClassId || students.length === 0 || saving}
                onClick={() => doPromote(students.map((s) => s.id))}
              >
                Promote all ({students.length})
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </>
  );
}
