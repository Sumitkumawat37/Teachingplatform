import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { announcements } from "@/lib/mock-data";
import { Bell, Info, CheckCircle, AlertTriangle } from "lucide-react";

const iconMap = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
};

const NotificationsPage = () => {
  return (
    <div className="space-y-4 animate-slide-up">
      <h2 className="text-xl font-bold">Notifications</h2>
      <div className="space-y-2">
        {announcements.map((a, i) => {
          const Icon = iconMap[a.type];
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
                    <span className="text-[10px] text-muted-foreground shrink-0">{a.date}</span>
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
