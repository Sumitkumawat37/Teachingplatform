import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { doubts } from "@/lib/mock-data";
import { MessageCircle, Send, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

const DoubtsPage = () => {
  const [newDoubt, setNewDoubt] = useState("");

  const handleSubmit = () => {
    if (!newDoubt.trim()) return;
    toast.success("Doubt submitted — demo only");
    setNewDoubt("");
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <h2 className="text-xl font-bold">My Doubts</h2>

      <Card className="p-4 space-y-3">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-primary" /> Ask a Question
        </h3>
        <Textarea
          placeholder="Type your doubt or question here..."
          value={newDoubt}
          onChange={(e) => setNewDoubt(e.target.value)}
          rows={3}
        />
        <Button className="w-full" onClick={handleSubmit}>
          <Send className="w-4 h-4 mr-2" /> Submit Doubt
        </Button>
      </Card>

      <div className="space-y-3">
        {doubts.map((d) => (
          <Card key={d.id} className="p-4">
            <div className="flex items-start gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                {d.studentName.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{d.studentName}</span>
                  {d.reply ? (
                    <Badge className="bg-success/10 text-success border-0 text-[10px]">Answered</Badge>
                  ) : (
                    <Badge className="bg-warning/10 text-warning border-0 text-[10px]">Pending</Badge>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">{formatDate(d.createdAt)}</p>
              </div>
            </div>
            <p className="text-sm mb-2">{d.question}</p>
            {d.reply && (
              <div className="bg-accent/50 rounded-lg p-3 mt-2">
                <p className="text-xs font-medium text-primary mb-1">Teacher's Reply</p>
                <p className="text-sm text-muted-foreground">{d.reply}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{formatDate(d.repliedAt!)}</p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DoubtsPage;
