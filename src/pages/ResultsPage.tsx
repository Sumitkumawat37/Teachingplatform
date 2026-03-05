import { Card } from "@/components/ui/card";
import { performanceData, quizzes } from "@/lib/mock-data";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Trophy, TrendingUp } from "lucide-react";

const ResultsPage = () => {
  const completedQuizzes = quizzes.filter((q) => q.status === "completed");

  return (
    <div className="space-y-5 animate-slide-up">
      <h2 className="text-xl font-bold">Results & Analytics</h2>

      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" /> Performance Overview
        </h3>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={performanceData}>
            <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide domain={[60, 100]} />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke="hsl(217, 91%, 50%)" strokeWidth={2.5} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div>
        <h3 className="font-bold text-base mb-3">Quiz History</h3>
        <div className="space-y-2">
          {completedQuizzes.map((quiz) => (
            <Card key={quiz.id} className="p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">{quiz.title}</h4>
                <p className="text-xs text-muted-foreground">{quiz.questions} questions</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">{quiz.score}%</p>
                <p className="text-[10px] text-muted-foreground">Score</p>
              </div>
            </Card>
          ))}
          {completedQuizzes.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">No completed quizzes yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
