import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { quizzes, quizQuestions } from "@/lib/mock-data";
import { Plus, Trophy, Eye } from "lucide-react";
import { toast } from "sonner";

const AdminQuizzes = () => {
  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Quiz Management</h2>
      </div>

      <Button className="w-full" onClick={() => toast.success("Create quiz feature — demo only")}>
        <Plus className="w-4 h-4 mr-2" /> Create New Quiz
      </Button>

      <div className="space-y-3">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{quiz.title}</h4>
                  <p className="text-xs text-muted-foreground">{quiz.questions} questions · {quiz.duration}</p>
                </div>
              </div>
              <Badge variant={quiz.status === "available" ? "default" : "secondary"}>
                {quiz.status}
              </Badge>
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="secondary" className="flex-1" onClick={() => toast.info("View results — demo only")}>
                <Eye className="w-3 h-3 mr-1" /> Results
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminQuizzes;
