import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useDoubts, useCreateDoubt } from "@/lib/supabase-data";
import { useAuth } from "@/lib/auth-context";
import { MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const DoubtsPage = () => {
  const [newDoubt, setNewDoubt] = useState("");
  const { user } = useAuth();
  const { data: doubts = [] } = useDoubts();
  const createDoubt = useCreateDoubt();

  const handleSubmit = () => {
    if (!newDoubt.trim() || !user) return;
    createDoubt.mutate({
      lecture_id: doubts[0]?.lecture_id || "",
      course_id: doubts[0]?.course_id || "",
      user_id: user.id,
      student_name: user.name,
      question: newDoubt,
    });
    toast.success("Doubt submitted!");
    setNewDoubt("");
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  const scrollRef = useScrollReveal();

  return (
    <div className="space-y-4 animate-slide-up" ref={scrollRef}>
      <h2 className="text-xl font-semibold text-slate-800" style={{ fontFamily: 'Poppins, sans-serif' }}>My Doubts</h2>

      <Card className="p-4 space-y-3 border border-pink-100/40 shadow-sm rounded-2xl" style={{ background: '#FFEAF4' }}>
        <h3 className="font-semibold text-sm flex items-center gap-2 text-slate-800">
          <MessageCircle className="w-4 h-4 text-violet-600" /> Ask a Question
        </h3>
        <Textarea placeholder="Type your doubt or question here..." value={newDoubt} onChange={(e) => setNewDoubt(e.target.value)} rows={3} />
        <Button className="w-full rounded-xl" onClick={handleSubmit}>
          <Send className="w-4 h-4 mr-2" /> Submit Doubt
        </Button>
      </Card>

      <div className="space-y-3">
        {Array.isArray(doubts) && doubts.map((d, i) => (
          <Card key={d.id} className="p-4 bg-white border border-slate-100/60 shadow-sm rounded-2xl reveal hover:shadow-md hover:-translate-y-0.5 transition-all duration-250" style={{ transitionDelay: `${i * 35}ms` }}>
            <div className="flex items-start gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                {(d.student_name || "").split(" ").map((n: string) => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{d.student_name}</span>
                  {d.reply ? (
                    <Badge className="bg-success/10 text-success border-0 text-[10px]">Answered</Badge>
                  ) : (
                    <Badge className="bg-warning/10 text-warning border-0 text-[10px]">Pending</Badge>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">{formatDate(d.created_at)}</p>
              </div>
            </div>
            <p className="text-sm mb-2">{d.question}</p>
            {d.reply && (
              <div className="bg-accent/50 rounded-lg p-3 mt-2">
                <p className="text-xs font-medium text-primary mb-1">Teacher's Reply</p>
                <p className="text-sm text-muted-foreground">{d.reply}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{d.replied_at ? formatDate(d.replied_at) : ""}</p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DoubtsPage;
