import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Northfield Academy" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="School profile, integrations and preferences." />
      <div className="grid gap-4 p-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>School Profile</CardTitle>
            <CardDescription>Basic information shown across the system.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">School Name</Label>
              <Input id="name" defaultValue="Northfield Academy" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="motto">Motto</Label>
              <Input id="motto" defaultValue="Knowledge · Integrity · Service" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Official Email</Label>
              <Input id="email" type="email" defaultValue="info@northfield.ac.ke" />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
            <CardDescription>Connect payment & communication channels.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Safaricom M-Pesa", desc: "Accept mobile money payments", on: true },
              { name: "SMS Gateway (Africa's Talking)", desc: "Bulk SMS for parents & staff", on: true },
              { name: "WhatsApp Notifications", desc: "Send fee & attendance alerts", on: false },
              { name: "Google Meet / Zoom", desc: "Virtual classroom sessions", on: false },
              { name: "Biometric Devices (RFID)", desc: "Attendance check-in hardware", on: true },
            ].map((i) => (
              <div key={i.name} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <div className="text-sm font-medium">{i.name}</div>
                  <div className="text-xs text-muted-foreground">{i.desc}</div>
                </div>
                <Switch defaultChecked={i.on} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
