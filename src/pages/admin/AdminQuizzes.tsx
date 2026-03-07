import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { quizzes, quizQuestions, courses } from "@/lib/mock-data";
import { Plus, Trophy, Eye } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const AdminQuizzes = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Quiz Management</h2>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogTrigger asChild>
          <Button className="w-full">
            <Plus className="w-4 h-4 mr-2" /> Create New Quiz
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Quiz</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Select Course</Label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm bg-background">
                {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Chapter</Label>
              <Input placeholder="e.g. Algebra" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Quiz Title</Label>
              <Input placeholder="e.g. Algebra Basics Quiz" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Duration</Label>
              <Input placeholder="e.g. 15 min" />
            </div>
            <p className="text-xs text-muted-foreground">After creating the quiz, you can add MCQ questions from the quiz detail page.</p>
            <Button className="w-full" onClick={() => { toast.success("Quiz created — demo only"); setShowForm(false); }}>
              Create Quiz
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-3">
        {quizzes.map((quiz) => {
          const course = courses.find((c) => c.id === quiz.courseId);
          const questions = quizQuestions[quiz.id] || [];
          return (
            <Card key={quiz.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{quiz.title}</h4>
                    <p className="text-xs text-muted-foreground">{course?.title} · {questions.length} questions · {quiz.duration}</p>
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
          );
        })}
      </div>
    </div>
  );
};

export default AdminQuizzes;
