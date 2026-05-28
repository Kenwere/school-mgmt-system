import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { timetable } from "@/lib/mock-data";

export const Route = createFileRoute("/timetable")({
  head: () => ({ meta: [{ title: "Timetable — Northfield Academy" }] }),
  component: TimetablePage,
});

const days = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;

function cellTone(subject: string) {
  if (subject === "Break" || subject === "Lunch") return "bg-muted text-muted-foreground italic";
  if (subject === "Assembly" || subject === "Games" || subject === "Club" || subject === "Library") return "bg-accent/10 text-accent-foreground";
  return "bg-card";
}

function TimetablePage() {
  return (
    <>
      <PageHeader
        title="Timetable"
        description="Weekly lesson schedule by class."
        actions={
          <>
            <Select defaultValue="form4a">
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="form4a">Form 4A</SelectItem>
                <SelectItem value="form3a">Form 3A</SelectItem>
                <SelectItem value="form2a">Form 2A</SelectItem>
                <SelectItem value="form1a">Form 1A</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline"><Download className="h-4 w-4" />Print</Button>
          </>
        }
      />
      <div className="p-6">
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Time</th>
                  {days.map((d) => (
                    <th key={d} className="px-4 py-3 text-left font-medium text-muted-foreground">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timetable.map((row) => (
                  <tr key={row.time} className="border-b last:border-b-0">
                    <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{row.time}</td>
                    {days.map((d) => (
                      <td key={d} className="px-2 py-2">
                        <div className={`rounded-md px-3 py-2 text-sm ${cellTone(row[d])}`}>{row[d]}</div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
