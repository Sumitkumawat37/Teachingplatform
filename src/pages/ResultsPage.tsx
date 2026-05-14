import { Card } from "@/components/ui/card";
import { useQuizAttempts } from "@/lib/supabase-data";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Trophy, TrendingUp } from "lucide-react";

const ResultsPage = () => {
  const { data: attempts = [] } = useQuizAttempts();

  const chartData = attempts.slice(0, 6).reverse().map((a, i) => ({
    quiz: `Q${i + 1}`,
    score: a.total > 0 ? Math.round((a.score / a.total) * 100) : 0,
  }));

  return (
    <div className="space-y-5 animate-slide-up">
      <h2 className="text-xl font-bold">Results & Analytics</h2>

      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" /> Performance Overview
        </h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <XAxis dataKey="quiz" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="hsl(217, 91%, 50%)" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-muted-foreground text-sm py-8">No quiz data yet. Complete a quiz to see your performance.</p>
        )}
      </Card>

      <div>
        <h3 className="font-bold text-base mb-3">Quiz History</h3>
        <div className="space-y-2">
          {attempts.map((attempt) => (
            <Card key={attempt.id} className="p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">{(attempt as any).quizzes?.title || "Quiz"}</h4>
                <p className="text-xs text-muted-foreground">{attempt.score}/{attempt.total} correct</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">{attempt.total > 0 ? Math.round((attempt.score / attempt.total) * 100) : 0}%</p>
                <p className="text-[10px] text-muted-foreground">Score</p>
              </div>
            </Card>
          ))}
          {attempts.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">No completed quizzes yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
