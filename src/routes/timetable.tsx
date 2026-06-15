import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useCallback } from "react";
import { Download, Plus, Trash2, Pencil } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PermissionGate } from "@/components/permission-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveTimetableEntries, useStore } from "@/lib/store";

export const Route = createFileRoute("/timetable")({
  head: () => ({ meta: [{ title: "Timetable — School Management" }] }),
  component: () => (
    <PermissionGate path="/timetable">
      <TimetablePage />
    </PermissionGate>
  ),
});

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;

function TimetablePage() {
  const store = useStore();
  const [classId, setClassId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [newSlot, setNewSlot] = useState("");
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [editSlotValue, setEditSlotValue] = useState("");

  const cls = store.classes.find((c) => c.id === classId);
  const subjects = cls?.subjects ?? [];

  const getEntry = useCallback(
    (timeSlot: string, day: string) =>
      store.timetableEntries.find((e) => e.classId === classId && e.day === day && e.timeSlot === timeSlot),
    [store.timetableEntries, classId],
  );

  const [draft, setDraft] = useState<Record<string, string>>({});

  const draftKey = (timeSlot: string, day: string) => `${timeSlot}||${day}`;

  const entrySubject = (timeSlot: string, day: string) =>
    getEntry(timeSlot, day)?.subject ?? "";

  const displayValue = (timeSlot: string, day: string) => {
    const key = draftKey(timeSlot, day);
    if (key in draft) return draft[key];
    return entrySubject(timeSlot, day) || " ";
  };

  const handleChange = (timeSlot: string, day: string, value: string) => {
    setDraft((prev) => ({ ...prev, [draftKey(timeSlot, day)]: value }));
  };

  const hasChanges = useMemo(() => {
    for (const ts of timeSlots) {
      for (const day of DAYS) {
        const key = draftKey(ts, day);
        const draftVal = key in draft ? draft[key] : undefined;
        if (draftVal === undefined) continue;
        const original = entrySubject(ts, day);
        if (draftVal !== (original || " ")) return true;
      }
    }
    return false;
  }, [draft, entrySubject, timeSlots]);

  const handleSave = async () => {
    if (!classId) return;
    setSaving(true);
    const entries = timeSlots.flatMap((ts) =>
      DAYS.map((day) => ({
        day,
        timeSlot: ts,
        subject: (displayValue(ts, day) === " " ? "" : displayValue(ts, day)),
      })),
    );
    await saveTimetableEntries(classId, entries);
    setDraft({});
    setSaving(false);
  };

  const addTimeSlot = () => {
    const s = newSlot.trim();
    if (s && !timeSlots.includes(s)) {
      setTimeSlots([...timeSlots, s]);
    }
    setNewSlot("");
  };

  const removeTimeSlot = (slot: string) => {
    setTimeSlots(timeSlots.filter((s) => s !== slot));
  };

  const startEditSlot = (slot: string) => {
    setEditingSlot(slot);
    setEditSlotValue(slot);
  };

  const saveEditSlot = () => {
    if (!editingSlot) return;
    const val = editSlotValue.trim();
    if (val && !timeSlots.includes(val)) {
      setTimeSlots(timeSlots.map((s) => (s === editingSlot ? val : s)));
    }
    setEditingSlot(null);
    setEditSlotValue("");
  };

  const isBreak = (ts: string) => ts.toLowerCase().includes("break") || ts.toLowerCase().includes("lunch");

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #timetable-print-area,
          #timetable-print-area * { visibility: visible !important; }
          #timetable-print-area {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            padding: 24px 32px !important;
            background: white !important;
            color: black !important;
            z-index: 9999 !important;
          }
          #timetable-print-area select,
          #timetable-print-area [role="combobox"],
          #timetable-print-area .print-hide { display: none !important; }
          #timetable-print-area .print-show-text {
            display: inline !important;
            font-size: 12px;
          }
          #timetable-print-area .print-cell {
            padding: 6px 8px !important;
            border: 1px solid #ccc !important;
            font-size: 12px !important;
          }
          #timetable-print-area table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          #timetable-print-area th {
            background: #f3f4f6 !important;
            font-weight: 600 !important;
            font-size: 12px !important;
            padding: 8px !important;
            border: 1px solid #ccc !important;
          }
          #timetable-print-area td {
            border: 1px solid #ccc !important;
          }
          #timetable-print-area .break-row td {
            background: #f9fafb !important;
            font-style: italic !important;
          }
          #timetable-print-area .school-header {
            display: block !important;
            text-align: center !important;
            margin-bottom: 16px !important;
          }
          #timetable-print-area .school-header h1 {
            font-size: 20px !important;
            margin: 0 !important;
          }
          #timetable-print-area .school-header p {
            font-size: 14px !important;
            margin: 4px 0 0 !important;
            color: #666 !important;
          }
        }
        .print-show-text { display: none; }
        @media print {
          @page { size: landscape; margin: 12mm; }
        }
      `}</style>
      <PageHeader
        title="Timetable"
        description="Create and manage weekly lesson schedules per class."
        actions={
          <>
            <Button variant="outline" onClick={() => window.print()} disabled={!classId}>
              <Download className="h-4 w-4" /> Print
            </Button>
          </>
        }
      />
      <div className="space-y-4 p-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-2 min-w-[200px]">
                <Label>Class</Label>
                <Select value={classId} onValueChange={(v) => { setClassId(v); setDraft({}); }}>
                  <SelectTrigger><SelectValue placeholder="Select a class" /></SelectTrigger>
                  <SelectContent>
                    {store.classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 min-w-[260px]">
                <Label>Time slots</Label>
                <div className="flex gap-2">
                  <Input
                    value={newSlot}
                    onChange={(e) => setNewSlot(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTimeSlot(); } }}
                    placeholder="e.g. 16:00 - 16:40"
                    className="flex-1"
                  />
                  <Button type="button" size="sm" variant="outline" onClick={addTimeSlot}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {timeSlots.map((slot) => (
                    <div key={slot} className="group flex items-center gap-0.5 rounded-md border bg-background px-2 py-0.5 text-xs">
                      {editingSlot === slot ? (
                        <Input
                          value={editSlotValue}
                          onChange={(e) => setEditSlotValue(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); saveEditSlot(); } if (e.key === "Escape") { setEditingSlot(null); } }}
                          onBlur={saveEditSlot}
                          className="h-6 w-28 text-xs px-1"
                          autoFocus
                        />
                      ) : (
                        <span>{slot}</span>
                      )}
                      <button type="button" onClick={() => startEditSlot(slot)} className="ml-0.5 rounded p-0.5 hover:bg-muted">
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button type="button" onClick={() => removeTimeSlot(slot)} className="rounded p-0.5 hover:bg-destructive/10 text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              {hasChanges && (
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save changes"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {!classId ? (
          <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">Select a class to view or edit its timetable.</CardContent></Card>
        ) : (
          <div id="timetable-print-area">
            <div className="school-header print-show-text">
              <h1>{store.school?.name ?? "School"} Timetable</h1>
              <p>{cls?.name ?? ""}</p>
            </div>
            <Card>
              <CardContent className="overflow-x-auto p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="px-3 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Time</th>
                      {DAYS.map((d) => (
                        <th key={d} className="px-3 py-3 text-left font-medium text-muted-foreground">{d}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((ts) => (
                      <tr key={ts} className={`border-b last:border-b-0 ${isBreak(ts) ? "break-row" : ""}`}>
                        <td className={`px-3 py-2 font-medium text-foreground whitespace-nowrap text-xs ${isBreak(ts) ? "italic text-muted-foreground" : ""}`}>
                          {ts}
                        </td>
                        {DAYS.map((day) => {
                          const val = displayValue(ts, day);
                          return (
                            <td key={day} className="px-1 py-1">
                              <div className="print-cell">
                                <Select value={val} onValueChange={(v) => handleChange(ts, day, v)}>
                                  <SelectTrigger className={`h-8 text-xs ${isBreak(ts) ? "border-dashed text-muted-foreground italic" : ""} print-hide`}>
                                    <SelectValue placeholder="—" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value=" ">—</SelectItem>
                                    {subjects.map((s) => (
                                      <SelectItem key={s} value={s}>{s}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <span className="print-show-text">{val || "—"}</span>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}

        {classId && subjects.length === 0 && (
          <Card><CardContent className="p-4 text-sm text-muted-foreground">No subjects assigned to this class. Add subjects in the Classes section first.</CardContent></Card>
        )}
      </div>
    </>
  );
}
