import { createFileRoute } from "@tanstack/react-router";
import { Plus, Bus, MapPin, User } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { transport } from "@/lib/mock-data";

export const Route = createFileRoute("/transport")({
  head: () => ({ meta: [{ title: "Transport — Northfield Academy" }] }),
  component: TransportPage,
});

function TransportPage() {
  return (
    <>
      <PageHeader
        title="Transport"
        description="Routes, vehicles, drivers and GPS tracking."
        actions={<Button><Plus className="h-4 w-4" />New Route</Button>}
      />
      <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
        {transport.map((r) => {
          const pct = Math.round((r.students / r.capacity) * 100);
          return (
            <Card key={r.route}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-md bg-accent/10 text-accent">
                      <Bus className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{r.route}</CardTitle>
                      <p className="text-xs text-muted-foreground">{r.vehicle}</p>
                    </div>
                  </div>
                  <Badge variant={r.status === "On Route" ? "secondary" : "destructive"}>{r.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" /><span>{r.driver}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" /><span>Last seen: Waiyaki Way, 2 min ago</span>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Occupancy</span>
                    <span className="font-medium">{r.students}/{r.capacity}</span>
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
