import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useDoubts, useReplyDoubt } from "@/lib/supabase-data";
import { MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";

const AdminDoubts = () => {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const { data: doubts = [] } = useDoubts();
  const replyDoubt = useReplyDoubt();

  const handleReply = (doubtId: string) => {
    if (!replyText.trim()) return;
    replyDoubt.mutate({ doubtId, reply: replyText });
    toast.success("Reply sent!");
    setReplyText("");
    setReplyingTo(null);
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  const pending = doubts.filter((d) => !d.reply);
  const answered = doubts.filter((d) => d.reply);

  return (
    <div className="space-y-6 animate-slide-up">
      <h2 className="text-xl font-bold text-slate-800">Student Doubts</h2>
      <p className="text-muted-foreground text-sm">{pending.length} pending · {answered.length} answered</p>
      {pending.length > 0 && (
        <div>
          <h3 className="font-bold text-sm mb-2 text-warning uppercase tracking-wide">Pending</h3>
          <div className="space-y-3">
            {pending.map((d) => (
              <Card key={d.id} className="p-4 bg-card border border-border shadow-sm">
                <div className="flex items-start gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {d.student_name.split(" ").map((n: string) => n[0]).join("")}
                  </div>
                  <div><span className="text-sm font-medium">{d.student_name}</span><p className="text-[10px] text-muted-foreground">{formatDate(d.created_at)}</p></div>
                </div>
                <p className="text-sm mb-3">{d.question}</p>
                {replyingTo === d.id ? (
                  <div className="space-y-2">
                    <Textarea placeholder="Type your reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={2} />
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1" onClick={() => handleReply(d.id)}><Send className="w-3 h-3 mr-1" /> Send</Button>
                      <Button size="sm" variant="secondary" onClick={() => setReplyingTo(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <Button size="sm" variant="secondary" className="w-full" onClick={() => setReplyingTo(d.id)}><MessageCircle className="w-3 h-3 mr-1" /> Reply</Button>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
      {answered.length > 0 && (
        <div>
          <h3 className="font-bold text-sm mb-2 text-success uppercase tracking-wide">Answered</h3>
          <div className="space-y-2">
            {answered.map((d) => (
              <Card key={d.id} className="p-4 bg-card border border-border shadow-sm opacity-70">
                <div className="flex items-start gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {d.student_name.split(" ").map((n: string) => n[0]).join("")}
                  </div>
                  <div className="flex-1"><span className="text-sm font-medium">{d.student_name}</span><Badge className="bg-success/10 text-success border-0 text-[10px] ml-2">Answered</Badge></div>
                </div>
                <p className="text-sm mb-2">{d.question}</p>
                <div className="bg-accent/50 rounded-lg p-3"><p className="text-xs font-medium text-primary mb-1">Your Reply</p><p className="text-sm text-muted-foreground">{d.reply}</p></div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDoubts;
