import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuizzes } from "@/lib/supabase-data";
import { usePurchase } from "@/lib/purchase-context";
import { useNavigate } from "react-router-dom";
import { Trophy, Clock, ChevronRight, CheckCircle, Lock } from "lucide-react";
import { toast } from "sonner";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const QuizzesPage = () => {
  const navigate = useNavigate();
  const { hasPurchased } = usePurchase();
  const { data: quizzes = [] } = useQuizzes();

  const handleQuizClick = (quiz: typeof quizzes[0]) => {
    if (!hasPurchased(quiz.course_id)) {
      toast.error("Purchase the course to access this quiz.");
      return;
    }
    if (quiz.status === "available") {
      navigate(`/quiz/${quiz.id}`);
    }
  };

  const scrollRef = useScrollReveal();

  return (
    <div className="space-y-4 animate-slide-up" ref={scrollRef}>
      <h2 className="text-xl font-semibold text-slate-800" style={{ fontFamily: 'Poppins, sans-serif' }}>Quizzes & Tests</h2>

      <div className="space-y-3">
        {quizzes.map((quiz, i) => {
          const purchased = hasPurchased(quiz.course_id);
          return (
            <Card
              key={quiz.id}
              className={`p-4 transition-all duration-250 bg-white border border-slate-100/60 shadow-sm rounded-2xl ${
                purchased && quiz.status === "available" ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5" : ""
              } ${!purchased ? "opacity-70" : ""}`}
              onClick={() => handleQuizClick(quiz)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  !purchased ? "bg-slate-50" :
                  quiz.status === "available" ? "bg-amber-50" : "bg-slate-50"
                }`}>
                  {!purchased ? (
                    <Lock className="w-5 h-5 text-slate-400" />
                  ) : quiz.status === "available" ? (
                    <Trophy className="w-5 h-5 text-amber-500" />
                  ) : (
                    <Lock className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-slate-800">{quiz.title}</h4>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                    <span>{(quiz as any).courses?.title}</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {quiz.duration}</span>
                  </div>
                  {!purchased && (
                    <p className="text-[10px] text-red-500 mt-0.5">Purchase course to access</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {purchased && quiz.status === "available" && (
                    <Badge className="bg-amber-50 text-amber-600 border border-amber-100">Start</Badge>
                  )}
                  {quiz.status === "upcoming" && <Badge variant="secondary">Upcoming</Badge>}
                  {!purchased && <Lock className="w-4 h-4 text-slate-400" />}
                  {purchased && quiz.status === "available" && <ChevronRight className="w-4 h-4 text-slate-400" />}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default QuizzesPage;
