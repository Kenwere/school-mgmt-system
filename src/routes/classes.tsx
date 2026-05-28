import { createFileRoute } from "@tanstack/react-router";
import { Plus, Users, BookOpen, MapPin } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { classes } from "@/lib/mock-data";

export const Route = createFileRoute("/classes")({
  head: () => ({ meta: [{ title: "Classes — Northfield Academy" }] }),
  component: ClassesPage,
});

function ClassesPage() {
  return (
    <>
      <PageHeader
        title="Classes & Sections"
        description="Manage forms, streams, class teachers and room allocation."
        actions={<Button><Plus className="h-4 w-4" />New Class</Button>}
      />
      <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {classes.map((c) => (
          <Card key={c.name} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{c.name}</CardTitle>
                  <p className="mt-0.5 text-xs text-muted-foreground">{c.teacher}</p>
                </div>
                <Badge variant={c.stream === "Science" ? "default" : "secondary"}>{c.stream}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" /><span>{c.students} students</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" /><span>{c.room}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <BookOpen className="h-4 w-4" /><span>8 subjects</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
