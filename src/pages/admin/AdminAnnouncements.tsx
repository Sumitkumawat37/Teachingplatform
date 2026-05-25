import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAnnouncements, useCreateAnnouncement } from "@/lib/supabase-data";
import { useDeleteAnnouncement } from "@/lib/supabase-mutations";
import { Megaphone, Send, Info, CheckCircle, AlertTriangle, Trash2, Lock as LockIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const iconMap: Record<string, typeof Info> = { info: Info, success: CheckCircle, warning: AlertTriangle };

const AdminAnnouncements = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"info" | "success" | "warning">("info");
  const { data: announcements = [] } = useAnnouncements();
  const createAnnouncement = useCreateAnnouncement();
  const deleteAnnouncement = useDeleteAnnouncement();

  const handleSend = () => {
    if (!title.trim() || !message.trim()) return toast.error("Please fill in all fields");
    createAnnouncement.mutate(
      { title: title.trim(), message: message.trim(), type },
      {
        onSuccess: () => {
          toast.success("Notification sent to all students!");
          setTitle("");
          setMessage("");
          setType("info");
        },
        onError: (e: any) => toast.error(e.message || "Couldn't send"),
      }
    );
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <h2 className="text-xl font-bold text-slate-800">Announcements</h2>
      <Card className="p-4 bg-card border border-border shadow-sm space-y-3">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-primary" /> Send to all students
        </h3>
        <Input placeholder="Title (e.g. New chapter added)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea placeholder="Message to all students..." value={message} onChange={(e) => setMessage(e.target.value)} rows={3} />
        <Select value={type} onValueChange={(v) => setType(v as any)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
          </SelectContent>
        </Select>
        <Button className="w-full" onClick={handleSend} disabled={createAnnouncement.isPending}>
          <Send className="w-4 h-4 mr-2" />
          {createAnnouncement.isPending ? "Sending..." : "Send Notification"}
        </Button>
      </Card>
      <div className="space-y-2">
        <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide">Sent ({announcements.length})</h3>
        {announcements.map((a) => {
          const Icon = iconMap[a.type] || Info;
          return (
            <Card key={a.id} className="p-4 bg-card border border-border shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-primary" />
                    <h4 className="font-semibold text-sm">{a.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">{a.message}</p>
                </div>
                <Button size="sm" variant="ghost" className="text-destructive shrink-0" onClick={() => deleteAnnouncement.mutate(a.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          );
        })}
        {announcements.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">No notifications sent yet</p>
        )}
      </div>
    </div>
  );
};

export default AdminAnnouncements;
