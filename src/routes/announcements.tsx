import { createFileRoute } from "@tanstack/react-router";
import { Plus, Megaphone } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { announcements } from "@/lib/mock-data";

export const Route = createFileRoute("/announcements")({
  head: () => ({ meta: [{ title: "Announcements — Northfield Academy" }] }),
  component: AnnouncementsPage,
});

function AnnouncementsPage() {
  return (
    <>
      <PageHeader
        title="Announcements"
        description="Notices, events and emergency alerts to staff, students and parents."
        actions={<Button><Plus className="h-4 w-4" />New Announcement</Button>}
      />
      <div className="space-y-3 p-6">
        {announcements.map((a) => (
          <Card key={a.title}>
            <CardContent className="flex items-start gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
                <Megaphone className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold">{a.title}</h3>
                  <Badge variant={a.priority === "High" ? "destructive" : a.priority === "Medium" ? "default" : "secondary"}>{a.priority}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{a.audience}</span>
                  <span>·</span>
                  <span>{a.date}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
