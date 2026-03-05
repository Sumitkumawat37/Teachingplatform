import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { announcements } from "@/lib/mock-data";
import { Megaphone, Send, Info, CheckCircle, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const iconMap = { info: Info, success: CheckCircle, warning: AlertTriangle };

const AdminAnnouncements = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!title || !message) return toast.error("Please fill in all fields");
    toast.success("Announcement sent — demo only");
    setTitle("");
    setMessage("");
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <h2 className="text-xl font-bold">Announcements</h2>

      <Card className="p-4 space-y-3">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-primary" /> New Announcement
        </h3>
        <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea placeholder="Message to all students..." value={message} onChange={(e) => setMessage(e.target.value)} rows={3} />
        <Button className="w-full" onClick={handleSend}>
          <Send className="w-4 h-4 mr-2" /> Send to All Students
        </Button>
      </Card>

      <div className="space-y-2">
        {announcements.map((a) => {
          const Icon = iconMap[a.type];
          return (
            <Card key={a.id} className="p-3 flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                a.type === "info" ? "bg-info/10" : a.type === "success" ? "bg-success/10" : "bg-warning/10"
              }`}>
                <Icon className={`w-4 h-4 ${
                  a.type === "info" ? "text-info" : a.type === "success" ? "text-success" : "text-warning"
                }`} />
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-sm">{a.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{a.message}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">{a.date}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminAnnouncements;
