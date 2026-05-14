import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAnnouncements, useCreateAnnouncement } from "@/lib/supabase-data";
import { useDeleteAnnouncement } from "@/lib/supabase-mutations";
import { Megaphone, Send, Info, CheckCircle, AlertTriangle, Trash2 } from "lucide-react";
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
    <div className="space-y-4 animate-slide-up">
      <h2 className="text-xl font-bold">Notifications</h2>
      <Card className="p-4 space-y-3">
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
            <Card key={a.id} className="p-3 flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${a.type === "info" ? "bg-info/10" : a.type === "success" ? "bg-success/10" : "bg-warning/10"}`}>
                <Icon className={`w-4 h-4 ${a.type === "info" ? "text-info" : a.type === "success" ? "text-success" : "text-warning"}`} />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-sm">{a.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{a.message}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">{new Date(a.created_at).toLocaleString()}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive shrink-0"
                onClick={() => deleteAnnouncement.mutate(a.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
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
