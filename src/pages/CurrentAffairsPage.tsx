import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  FileText, Search, Bookmark, BookmarkCheck, Megaphone,
  CheckCircle, ArrowRight, Share2, HelpCircle
} from "lucide-react";

interface CurrentAffair {
  id: string;
  title: string;
  content: string;
  category: string;
  compilation_month: string;
  mcqs: { question: string; options: string[]; correct_index: number }[];
  published_at: string;
}

const CATEGORIES = ["All", "Polity", "Economy", "Environment", "Science & Tech", "International Relations"];

const CurrentAffairsPage = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<CurrentAffair[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  
  // MCQ state
  const [activeMcqArticle, setActiveMcqArticle] = useState<CurrentAffair | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [checkedMcq, setCheckedMcq] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      let query = supabase.from("current_affairs" as any).select("*");
      if (category !== "All") query = query.eq("category", category);
      if (search.trim()) query = query.ilike("title", `%${search}%`);

      const { data, error } = await query.order("published_at", { ascending: false });
      if (error) throw error;

      setArticles(Array.isArray(data) ? data.map((item: any) => ({
        ...item,
        mcqs: Array.isArray(item.mcqs) ? item.mcqs : JSON.parse(item.mcqs || "[]")
      })) : []);

      if (user) {
        const { data: bData } = await supabase.from("current_affair_bookmarks" as any).select("article_id").eq("user_id", user.id);
        setBookmarks(Array.isArray(bData) ? bData.map((b: any) => b.article_id) : []);
      }
    } catch {
      toast.error("Failed to load current affairs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [category, search]);

  const toggleBookmark = async (id: string) => {
    if (!user) return toast.error("Please login to bookmark articles");
    const isBookmarked = bookmarks.includes(id);
    try {
      if (isBookmarked) {
        await supabase.from("current_affair_bookmarks" as any).delete().eq("user_id", user.id).eq("article_id", id);
        setBookmarks(prev => prev.filter(x => x !== id));
        toast.success("Bookmark removed");
      } else {
        await supabase.from("current_affair_bookmarks" as any).insert({ user_id: user.id, article_id: id });
        setBookmarks(prev => [...prev, id]);
        toast.success("Article bookmarked");
      }
    } catch {
      toast.error("Action failed");
    }
  };

  const handleStartMcq = (article: CurrentAffair) => {
    setActiveMcqArticle(article);
    setSelectedAnswers({});
    setCheckedMcq(false);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="rounded-2xl p-5 border border-violet-100/40 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #F3EEFF 0%, #FFEAF4 100%)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center shadow-sm">
            <FileText className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-800" style={{ fontFamily: 'Poppins, sans-serif' }}>Current Affairs</h1>
            <p className="text-slate-500 text-sm">Daily analysis, UPSC compilations & practice questions</p>
          </div>
        </div>
      </div>

      {activeMcqArticle ? (
        /* Daily MCQ Practice player */
        <Card className="p-6 bg-white border border-slate-100 shadow-sm space-y-6 rounded-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-violet-600" /> Daily Article MCQs</h3>
            <Button variant="ghost" size="sm" onClick={() => setActiveMcqArticle(null)} className="text-violet-600 hover:text-violet-700">Exit MCQs</Button>
          </div>
          {Array.isArray(activeMcqArticle.mcqs) && activeMcqArticle.mcqs.map((m, mIdx) => (
            <div key={mIdx} className="space-y-3">
              <p className="text-sm font-semibold text-slate-800">Q{mIdx+1}. {m.question}</p>
              <div className="space-y-2">
                {Array.isArray(m.options) && m.options.map((opt, oIdx) => {
                  const isSelected = selectedAnswers[mIdx] === oIdx;
                  const isCorrect = oIdx === m.correct_index;

                  let style = "border-slate-200 hover:border-violet-200";
                  if (isSelected) style = "border-violet-400 bg-violet-50 font-semibold";
                  if (checkedMcq) {
                    if (isCorrect) style = "border-emerald-400 bg-emerald-50 text-emerald-700";
                    else if (isSelected) style = "border-red-400 bg-red-50 text-red-600";
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => !checkedMcq && setSelectedAnswers(prev => ({ ...prev, [mIdx]: oIdx }))}
                      className={`w-full text-left p-3 rounded-xl border text-xs md:text-sm transition-all ${style} bg-white`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            {!checkedMcq ? (
              <Button onClick={() => setCheckedMcq(true)} disabled={Object.keys(selectedAnswers).length < activeMcqArticle.mcqs.length} className="flex-1 bg-gradient-to-r from-violet-600 to-pink-500 text-white border-0 shadow-sm hover:shadow-md">
                Check Answers
              </Button>
            ) : (
              <Button onClick={() => setActiveMcqArticle(null)} className="flex-1 bg-violet-50 border border-violet-200 text-violet-600 hover:bg-violet-100">
                Finish Practice
              </Button>
            )}
          </div>
        </Card>
      ) : (
        /* Article Feed */
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles & concepts…"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
            {/* Category Pill select */}
            <div className="flex gap-1.5 overflow-x-auto">
              {Array.isArray(CATEGORIES) && CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${
                    (cat === category) ? "bg-violet-600 text-white border-violet-600" : "bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:border-violet-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : articles.length === 0 ? (
            <div className="text-center py-20 text-slate-400 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <Megaphone className="w-10 h-10 mx-auto mb-3 opacity-30 text-violet-400" />
              <p className="text-sm">No current affairs articles found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.isArray(articles) && articles.map(article => (
                <Card key={article.id} className="p-5 bg-white border border-slate-100/60 flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 space-y-4 rounded-2xl shadow-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full border border-violet-100">{article.category}</span>
                      <p className="text-[10px] text-slate-400">{new Date(article.published_at).toLocaleDateString()}</p>
                    </div>
                    <h3 className="font-semibold text-base text-slate-800 leading-snug">{article.title}</h3>
                    <p className="text-xs md:text-sm text-slate-500 line-clamp-3 leading-relaxed whitespace-pre-line">{article.content}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex gap-2">
                      <button onClick={() => toggleBookmark(article.id)} className="p-2 rounded-lg hover:bg-slate-50">
                        {bookmarks.includes(article.id) ? <BookmarkCheck className="w-4 h-4 text-violet-600" /> : <Bookmark className="w-4 h-4 text-slate-400" />}
                      </button>
                      <button className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600"><Share2 className="w-4 h-4" /></button>
                    </div>
                    {article.mcqs.length > 0 && (
                      <Button onClick={() => handleStartMcq(article)} size="sm" variant="ghost" className="text-violet-600 hover:text-violet-700">
                        Solve {article.mcqs.length} MCQs <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    )}
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

export default CurrentAffairsPage;
