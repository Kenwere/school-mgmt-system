import { createFileRoute } from "@tanstack/react-router";
import { Plus, Send } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { messages } from "@/lib/mock-data";

export const Route = createFileRoute("/messages")({
  head: () => ({ meta: [{ title: "Messages — Northfield Academy" }] }),
  component: MessagesPage,
});

function MessagesPage() {
  return (
    <>
      <PageHeader
        title="Messages"
        description="In-app chat, parent-teacher messaging and bulk SMS."
        actions={<Button><Plus className="h-4 w-4" />Compose</Button>}
      />
      <div className="grid gap-4 p-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="p-0">
            <div className="border-b p-3">
              <Input placeholder="Search messages…" className="h-9" />
            </div>
            <div className="divide-y">
              {messages.map((m, i) => (
                <button
                  key={m.subject}
                  className={`flex w-full gap-3 p-3 text-left hover:bg-muted/40 transition-colors ${i === 0 ? "bg-muted/40" : ""}`}
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-accent/10 text-accent text-xs">
                      {m.from.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm truncate ${m.unread ? "font-semibold" : ""}`}>{m.from}</span>
                      <span className="text-xs text-muted-foreground shrink-0">{m.time}</span>
                    </div>
                    <p className={`text-xs truncate ${m.unread ? "font-medium text-foreground" : "text-muted-foreground"}`}>{m.subject}</p>
                    <p className="text-xs text-muted-foreground truncate">{m.preview}</p>
                  </div>
                  {m.unread && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="flex h-[600px] flex-col p-0">
            <div className="flex items-center gap-3 border-b p-4">
              <Avatar><AvatarFallback className="bg-accent/10 text-accent">GW</AvatarFallback></Avatar>
              <div>
                <div className="font-medium">Grace Wanjiku (Parent)</div>
                <div className="text-xs text-muted-foreground">Parent of Amani Wanjiku · Form 4A</div>
              </div>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              <div className="flex justify-start">
                <div className="max-w-[75%] rounded-lg rounded-tl-sm bg-muted px-3 py-2 text-sm">
                  Good morning, I would like to pick Amani at 12pm today due to a clinic appointment. Is that okay?
                  <div className="mt-1 text-[10px] text-muted-foreground">10:24 AM</div>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="max-w-[75%] rounded-lg rounded-tr-sm bg-accent text-accent-foreground px-3 py-2 text-sm">
                  Good morning Mrs. Wanjiku, that's fine. Kindly carry the gate pass when picking her up.
                  <div className="mt-1 text-[10px] opacity-80">10:31 AM</div>
                </div>
              </div>
            </div>
            <div className="border-t p-3">
              <div className="flex gap-2">
                <Input placeholder="Type a message…" className="flex-1" />
                <Button size="icon"><Send className="h-4 w-4" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
