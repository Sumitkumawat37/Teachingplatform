import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  BookOpen, Search, Filter, Calendar, Award, Bookmark, BookmarkCheck,
  CheckCircle2, XCircle, ArrowRight, Play, Eye, RefreshCw, AlertCircle
} from "lucide-react";

interface PYQQuestion {
  id: string;
  subject: string;
  topic: string;
  year: number;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  isBookmarked?: boolean;
}

const SUBJECTS = ["All", "Polity", "History", "Economy", "Geography", "Environment", "Science & Tech", "International Relations"];
const YEARS = ["All", "2024", "2023", "2022", "2021", "2020", "2019"];

const PYQsPage = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<PYQQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("All");
  const [year, setYear] = useState("All");
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  // Player state
  const [activeQuestion, setActiveQuestion] = useState<PYQQuestion | null>(null);
  const [playerMode, setPlayerMode] = useState<"practice" | "attempt">("practice");
  const [selectedOption, setSelectedIndex] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [score, setScore] = useState(0);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch PYQs
      let query = supabase.from("pyq_questions").select("*");
      if (subject !== "All") query = query.eq("subject", subject);
      if (year !== "All") query = query.eq("year", Number(year));
      if (search.trim()) query = query.ilike("question", `%${search}%`);

      const { data: qData, error: qErr } = await query;
      if (qErr) throw qErr;

      // 2. Fetch User Bookmarks
      if (user) {
        const { data: bData } = await supabase
          .from("pyq_bookmarks")
          .select("pyq_id")
          .eq("user_id", user.id);
        const bookmarkedIds = bData?.map((b) => b.pyq_id) || [];
        setBookmarks(bookmarkedIds);

        setQuestions(
          (qData || []).map((q: any) => ({
            ...q,
            options: Array.isArray(q.options) ? q.options : JSON.parse(q.options || "[]"),
            isBookmarked: bookmarkedIds.includes(q.id)
          }))
        );
      } else {
        setQuestions(
          (qData || []).map((q: any) => ({
            ...q,
            options: Array.isArray(q.options) ? q.options : JSON.parse(q.options || "[]")
          }))
        );
      }
    } catch (err: any) {
      toast.error("Failed to load PYQs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [subject, year, search]);

  const toggleBookmark = async (qId: string) => {
    if (!user) return toast.error("Please login to bookmark");
    const isCurrentlyBookmarked = bookmarks.includes(qId);
    try {
      if (isCurrentlyBookmarked) {
        await supabase.from("pyq_bookmarks").delete().eq("user_id", user.id).eq("pyq_id", qId);
        setBookmarks((prev) => prev.filter((id) => id !== qId));
        toast.success("Bookmark removed");
      } else {
        await supabase.from("pyq_bookmarks").insert({ user_id: user.id, pyq_id: qId });
        setBookmarks((prev) => [...prev, qId]);
        toast.success("Question bookmarked");
      }
      setQuestions((prev) =>
        prev.map((q) => (q.id === qId ? { ...q, isBookmarked: !isCurrentlyBookmarked } : q))
      );
    } catch {
      toast.error("Action failed");
    }
  };

  const handleStartQuestion = (q: PYQQuestion, mode: "practice" | "attempt") => {
    setActiveQuestion(q);
    setPlayerMode(mode);
    setSelectedIndex(null);
    setIsAnswerChecked(false);
  };

  const handleOptionSelect = (index: number) => {
    if (isAnswerChecked && playerMode === "practice") return;
    setSelectedIndex(index);
  };

  const handleCheckAnswer = async () => {
    if (selectedOption === null || !activeQuestion) return;
    setIsAnswerChecked(true);

    const isCorrect = selectedOption === activeQuestion.correct_index;
    if (isCorrect) {
      setScore((s) => s + 1);
    }

    if (user) {
      try {
        await fetch("http://localhost:5000/api/v1/upsc/pyqs/attempt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            pyqId: activeQuestion.id,
            selectedIndex: selectedOption
          })
        });
      } catch {
        // Silent fail
      }
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Title */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">PYQ Center</h1>
            <p className="text-muted-foreground text-sm">Previous Year UPSC Civil Services Prelims Questions</p>
          </div>
        </div>
      </div>

      {activeQuestion ? (
        /* Dynamic Question Player */
        <Card className="p-6 bg-card border border-border space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs bg-purple-500/10 text-purple-400 font-semibold px-2.5 py-1 rounded-full border border-purple-500/20">{activeQuestion.subject}</span>
              <span className="text-xs bg-pink-500/10 text-pink-400 font-semibold px-2.5 py-1 rounded-full border border-pink-500/20">{activeQuestion.year}</span>
              <span className="text-xs text-muted-foreground ml-2">Mode: <strong className="capitalize text-foreground">{playerMode}</strong></span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setActiveQuestion(null)}>Exit Player</Button>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-semibold text-muted-foreground">Question Topic: {activeQuestion.topic}</p>
            <h3 className="text-base md:text-lg font-bold text-foreground leading-relaxed">{activeQuestion.question}</h3>

            <div className="space-y-2 pt-2">
              {activeQuestion.options.map((option, idx) => {
                const isCorrect = idx === activeQuestion.correct_index;
                const isSelected = idx === selectedOption;
                
                let btnStyle = "border-border hover:border-purple-500/40";
                if (isSelected) btnStyle = "border-purple-500 bg-purple-500/5 font-semibold";
                if (isAnswerChecked && playerMode === "practice") {
                  if (isCorrect) btnStyle = "border-green-500 bg-green-500/10 text-green-400 font-semibold";
                  else if (isSelected) btnStyle = "border-red-500 bg-red-500/10 text-red-400 font-semibold";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(idx)}
                    className={`w-full text-left p-3.5 rounded-xl border-2 text-sm transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>
                      <strong className="text-muted-foreground mr-2">{String.fromCharCode(65 + idx)}.</strong>
                      {option}
                    </span>
                    {isAnswerChecked && playerMode === "practice" && (
                      isCorrect ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /> :
                      isSelected ? <XCircle className="w-4 h-4 text-red-500 shrink-0" /> : null
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            {!isAnswerChecked ? (
              <Button onClick={handleCheckAnswer} disabled={selectedOption === null} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90">
                {playerMode === "practice" ? "Check Answer & Explain" : "Submit Answer"}
              </Button>
            ) : (
              <Button onClick={() => setActiveQuestion(null)} className="flex-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20">
                Next / Back to List <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
            <Button variant="ghost" onClick={() => toggleBookmark(activeQuestion.id)}>
              {bookmarks.includes(activeQuestion.id) ? <BookmarkCheck className="w-4 h-4 text-purple-400" /> : <Bookmark className="w-4 h-4 text-gray-400" />}
            </Button>
          </div>

          {isAnswerChecked && playerMode === "practice" && activeQuestion.explanation && (
            <div className="bg-purple-500/5 border border-purple-500/10 rounded-2xl p-4 mt-4 animate-slide-up">
              <h4 className="text-sm font-bold text-purple-300 flex items-center gap-1.5 mb-2"><Award className="w-4 h-4" /> Comprehensive Explanation</h4>
              <p className="text-sm text-gray-300 leading-relaxed font-mono whitespace-pre-line">{activeQuestion.explanation}</p>
            </div>
          )}
        </Card>
      ) : (
        /* PYQ FILTERING & LISTING FEED */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-card border border-border p-4 rounded-2xl shadow-sm">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search PYQs…"
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-500/10"
              />
            </div>

            {/* Subject Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-purple-400 shrink-0" />
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-sm text-slate-700 focus:outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-500/10"
              >
                {SUBJECTS.map((sub) => <option key={sub} value={sub} className="bg-white">{sub}</option>)}
              </select>
            </div>

            {/* Year Filter */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400 shrink-0" />
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-sm text-slate-700 focus:outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-500/10"
              >
                {YEARS.map((y) => <option key={y} value={y} className="bg-white">{y}</option>)}
              </select>
            </div>

            {/* Load Button */}
            <Button onClick={loadData} variant="secondary" className="w-full flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Reload Feed
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground bg-card border border-border rounded-2xl">
              <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-30 text-purple-400" />
              <p className="text-sm">No Previous Year Questions match your filtering.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {questions.map((q) => (
                <Card key={q.id} className="p-4 bg-card border border-border hover:border-purple-500/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] uppercase font-bold text-purple-400 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">{q.subject}</span>
                      <span className="text-[10px] uppercase font-bold text-pink-400 px-2.5 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/20">Year: {q.year}</span>
                      <span className="text-xs text-muted-foreground">Topic: {q.topic}</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground leading-relaxed line-clamp-2">{q.question}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <Button onClick={() => handleStartQuestion(q, "practice")} size="sm" variant="ghost" className="text-purple-400 hover:text-purple-300">
                      <Play className="w-4 h-4 mr-1" /> Practice
                    </Button>
                    <Button onClick={() => handleStartQuestion(q, "attempt")} size="sm" variant="ghost" className="text-pink-400 hover:text-pink-300">
                      <Eye className="w-4 h-4 mr-1" /> Attempt
                    </Button>
                    <Button onClick={() => toggleBookmark(q.id)} size="sm" variant="ghost">
                      {bookmarks.includes(q.id) ? <BookmarkCheck className="w-4 h-4 text-purple-400" /> : <Bookmark className="w-4 h-4 text-gray-400" />}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PYQsPage;
