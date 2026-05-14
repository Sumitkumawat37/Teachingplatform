import { Card } from "@/components/ui/card";
import { useAnnouncements } from "@/lib/supabase-data";
import { Info, CheckCircle, AlertTriangle } from "lucide-react";

const iconMap: Record<string, typeof Info> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
};

const NotificationsPage = () => {
  const { data: announcements = [] } = useAnnouncements();

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Notifications</h2>
        <span className="text-xs text-muted-foreground">{announcements.length} total</span>
      </div>
      {announcements.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-sm text-muted-foreground">You're all caught up — no notifications yet.</p>
        </Card>
      )}
      <div className="space-y-2">
        {announcements.map((a, i) => {
          const Icon = iconMap[a.type] || Info;
          return (
            <Card key={a.id} className="p-4" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  a.type === "info" ? "bg-info/10" : a.type === "success" ? "bg-success/10" : "bg-warning/10"
                }`}>
                  <Icon className={`w-4 h-4 ${
                    a.type === "info" ? "text-info" : a.type === "success" ? "text-success" : "text-warning"
                  }`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold text-sm">{a.title}</h4>
                    <span className="text-[10px] text-muted-foreground shrink-0">{new Date(a.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-muted-foreground text-xs mt-1">{a.message}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationsPage;
