import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  FileText, Upload, Plus, CheckCircle, RefreshCw, PenTool, Clock, Award
} from "lucide-react";

interface MainsQuestion {
  id: string;
  title: string;
  question: string;
  subject: string;
  word_limit: number;
  max_marks: number;
  deadline: string;
}

interface Submission {
  id: string;
  question_id: string;
  answer_text: string;
  file_url: string;
  word_count: number;
  status: "pending" | "reviewed";
  created_at: string;
  reviews?: {
    marks_obtained: number;
    remarks: string;
  }[];
}

const MainsWritingPage = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<MainsQuestion[]>([]);
  const [submissions, setSubsubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  // Composing submission
  const [activeQuestion, setActiveQuestion] = useState<MainsQuestion | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: qData } = await supabase.from("mains_questions").select("*").order("created_at", { ascending: false });
      setQuestions(qData || []);

      if (user) {
        // Fetch student's submissions and join teacher reviews
        const { data: sData } = await supabase
          .from("mains_submissions")
          .select("*, reviews:mains_reviews(marks_obtained, remarks)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        setSubsubmissions(sData || []);
      }
    } catch {
      toast.error("Failed to load Mains questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const wordCount = answerText.trim() ? answerText.trim().split(/\s+/).length : 0;

  const handleSubmit = async () => {
    if (!activeQuestion || !user) return;
    if (!answerText.trim() && !fileUrl.trim()) {
      return toast.error("Please write an answer or provide an answer upload URL");
    }

    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:5000/api/v1/upsc/mains/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: activeQuestion.id,
          userId: user.id,
          answerText,
          fileUrl,
          wordCount
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Mains answer submitted successfully!");
        setActiveQuestion(null);
        setAnswerText("");
        setFileUrl("");
        loadData();
      } else {
        toast.error(data.error || "Submission failed");
      }
    } catch {
      toast.error("Could not reach backend");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <PenTool className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Mains Answer Writing</h1>
            <p className="text-muted-foreground text-sm">Submit answers for evaluation and receive descriptive remarks</p>
          </div>
        </div>
      </div>

      {activeQuestion ? (
        /* Writing Editor Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-5 bg-card border border-border space-y-3">
              <h3 className="font-bold text-base text-purple-300">{activeQuestion.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-mono whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">{activeQuestion.question}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>Word Limit: <strong>{activeQuestion.word_limit} words</strong></span>
                <span>Max Marks: <strong>{activeQuestion.max_marks} marks</strong></span>
              </div>
            </Card>

            <Card className="p-5 bg-card border border-border space-y-4">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Write Answer Workspace</label>
                <span className={`text-xs font-bold ${wordCount > activeQuestion.word_limit ? "text-red-400" : "text-purple-400"}`}>
                  {wordCount} / {activeQuestion.word_limit} words
                </span>
              </div>
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                rows={12}
                placeholder="Write your detailed descriptive answer here. Remember to structured it with: Introduction, Body, and Conclusion..."
                className="w-full bg-white/5 border border-purple-500/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-purple-500/30 resize-none font-mono leading-relaxed"
              />

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">Optional Hand-written File Upload (PDF/Image Link)</label>
                <div className="relative">
                  <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    placeholder="https://example.com/my-answer.pdf"
                    className="w-full bg-white/5 border border-purple-500/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/30"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleSubmit} disabled={submitting} className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600">
                  {submitting ? "Submitting answer..." : "Submit Answer for Review"}
                </Button>
                <Button variant="ghost" onClick={() => setActiveQuestion(null)}>Cancel</Button>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-4 bg-card border border-border">
              <h4 className="font-bold text-sm text-foreground mb-3 flex items-center gap-1.5"><Clock className="w-4 h-4 text-purple-400" /> Answer Instructions</h4>
              <ul className="text-xs text-muted-foreground space-y-2 list-disc list-inside">
                <li>Write clear headings for distinct answer segments.</li>
                <li>Respect the specified word limit. Penalties may apply.</li>
                <li>Ensure any uploaded image or PDF is clear and readable.</li>
                <li>Feedback is typically sent within 24–48 hours.</li>
              </ul>
            </Card>
          </div>
        </div>
      ) : (
        /* Mains Questions list + Previous Submissions */
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Active Daily Mains Questions</h3>
            {loading ? (
              <div className="flex justify-center py-20"><RefreshCw className="w-8 h-8 text-primary animate-spin" /></div>
            ) : questions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-card border border-border rounded-2xl">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-30 text-purple-400" />
                <p className="text-sm">No Mains descriptive questions published yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q) => (
                  <Card key={q.id} className="p-5 bg-card border border-border hover:border-purple-500/20 transition-all flex justify-between items-start gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">{q.subject}</span>
                        <span className="text-[10px] font-bold text-gray-400">Word Limit: {q.word_limit}</span>
                      </div>
                      <h4 className="font-bold text-sm md:text-base text-foreground">{q.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{q.question}</p>
                    </div>
                    <Button onClick={() => setActiveQuestion(q)} size="sm" className="bg-purple-600 hover:bg-purple-500 shrink-0 self-center">
                      Write Answer
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar submission feed */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Attempt History</h3>
            {submissions.length === 0 ? (
              <p className="text-xs text-muted-foreground">Your descriptive submissions will appear here once submitted.</p>
            ) : (
              <div className="space-y-3">
                {submissions.map((sub) => {
                  const qInfo = questions.find(q => q.id === sub.question_id);
                  const review = sub.reviews?.[0];

                  return (
                    <Card key={sub.id} className="p-4 bg-card border border-border space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-muted-foreground">{new Date(sub.created_at).toLocaleDateString()}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          sub.status === "reviewed" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                        }`}>
                          {sub.status === "reviewed" ? "Evaluated" : "Awaiting Review"}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-foreground truncate">{qInfo?.title || "Descriptive Practice"}</p>
                      {sub.status === "reviewed" && review && (
                        <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-3 space-y-1.5 animate-slide-up">
                          <p className="text-xs font-bold text-green-400 flex items-center gap-1"><Award className="w-3.5 h-3.5" /> Evaluated Score: {review.marks_obtained} / {qInfo?.max_marks || 15}</p>
                          <p className="text-[11px] text-slate-300 leading-relaxed font-mono whitespace-pre-line">Remarks: {review.remarks}</p>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MainsWritingPage;
