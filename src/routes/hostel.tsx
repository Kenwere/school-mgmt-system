import { createFileRoute } from "@tanstack/react-router";
import { Plus, Building2, User } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { hostel } from "@/lib/mock-data";

export const Route = createFileRoute("/hostel")({
  head: () => ({ meta: [{ title: "Hostel — Northfield Academy" }] }),
  component: HostelPage,
});

function HostelPage() {
  return (
    <>
      <PageHeader
        title="Hostel & Dormitories"
        description="Room allocation, bed tracking and hostel fees."
        actions={<Button><Plus className="h-4 w-4" />New Allocation</Button>}
      />
      <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
        {hostel.map((h) => {
          const pct = Math.round((h.occupied / h.capacity) * 100);
          return (
            <Card key={h.name}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-md ${h.gender === "Boys" ? "bg-accent/10 text-accent" : "bg-success/10 text-success"}`}>
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{h.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{h.gender} hostel</p>
                    </div>
                  </div>
                  <Badge variant={h.status === "Full" ? "destructive" : h.status === "Almost Full" ? "default" : "secondary"}>{h.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" /><span>Warden: {h.warden}</span>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Occupancy</span>
                    <span className="font-medium">{h.occupied}/{h.capacity} beds</span>
                  </div>
                  <Progress value={pct} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
