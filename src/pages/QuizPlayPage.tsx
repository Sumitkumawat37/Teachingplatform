import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { quizQuestions } from "@/lib/mock-data";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, CheckCircle, XCircle, Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const QuizPlayPage = () => {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const questions = quizQuestions[quizId || "1"] || [];
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (optionIndex: number) => {
    if (submitted) return;
    const newAnswers = [...answers];
    newAnswers[currentQ] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => setSubmitted(true);

  const score = answers.reduce((acc, a, i) => acc + (a === questions[i]?.correct ? 1 : 0), 0);
  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  if (questions.length === 0) {
    return (
      <div className="space-y-4 animate-slide-up text-center py-12">
        <p className="text-muted-foreground">No questions available for this quiz.</p>
        <Button onClick={() => navigate("/quizzes")}>Back to Quizzes</Button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="space-y-4 animate-slide-up">
        <Card className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">{percentage}%</h2>
          <p className="text-muted-foreground text-sm mt-1">You scored {score} out of {questions.length}</p>
          <Progress value={percentage} className="h-2 mt-4" />
        </Card>

        <div className="space-y-3">
          {questions.map((q, qi) => (
            <Card key={q.id} className="p-4">
              <p className="font-medium text-sm mb-2">Q{qi + 1}. {q.question}</p>
              <div className="space-y-1.5">
                {q.options.map((opt, oi) => {
                  const isCorrect = oi === q.correct;
                  const isSelected = answers[qi] === oi;
                  return (
                    <div
                      key={oi}
                      className={`p-2.5 rounded-lg text-sm flex items-center gap-2 ${
                        isCorrect ? "bg-success/10 text-success" :
                        isSelected && !isCorrect ? "bg-destructive/10 text-destructive" : "bg-muted"
                      }`}
                    >
                      {isCorrect && <CheckCircle className="w-4 h-4 shrink-0" />}
                      {isSelected && !isCorrect && <XCircle className="w-4 h-4 shrink-0" />}
                      <span>{opt}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>

        <Button onClick={() => navigate("/quizzes")} className="w-full" size="lg">Back to Quizzes</Button>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate("/quizzes")} className="flex items-center gap-1 text-sm text-muted-foreground">
          <ChevronLeft className="w-4 h-4" /> Exit
        </button>
        <span className="text-sm font-medium">{currentQ + 1}/{questions.length}</span>
      </div>

      <Progress value={((currentQ + 1) / questions.length) * 100} className="h-1.5" />

      <Card className="p-5">
        <p className="text-xs text-muted-foreground mb-2">Question {currentQ + 1}</p>
        <h3 className="font-bold text-base mb-4">{q.question}</h3>

        <div className="space-y-2">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className={`w-full text-left p-3 rounded-xl border-2 text-sm transition-all ${
                answers[currentQ] === i
                  ? "border-primary bg-primary/5 font-medium"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <span className="font-medium text-muted-foreground mr-2">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          ))}
        </div>
      </Card>

      <div className="flex gap-2">
        {currentQ > 0 && (
          <Button variant="secondary" onClick={() => setCurrentQ(currentQ - 1)} className="flex-1">
            Previous
          </Button>
        )}
        {currentQ < questions.length - 1 ? (
          <Button onClick={() => setCurrentQ(currentQ + 1)} className="flex-1" disabled={answers[currentQ] === null}>
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} className="flex-1" disabled={answers.some((a) => a === null)}>
            Submit Quiz
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuizPlayPage;
