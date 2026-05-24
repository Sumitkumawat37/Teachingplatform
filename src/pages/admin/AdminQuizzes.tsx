import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuizzes, useQuizQuestions, useCourses, useChapters } from "@/lib/supabase-data";
import { useCreateQuiz, useDeleteQuiz, useCreateQuizQuestion, useDeleteQuizQuestion } from "@/lib/supabase-mutations";
import { Plus, Trophy, Eye, Trash2, ListPlus } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const AdminQuizzes = () => {
  const [showForm, setShowForm] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDuration, setQuizDuration] = useState("10 min");
  const [quizCourseId, setQuizCourseId] = useState("");
  const [quizChapterId, setQuizChapterId] = useState("");

  // Question form
  const [showQForm, setShowQForm] = useState(false);
  const [qQuizId, setQQuizId] = useState("");
  const [qQuestion, setQQuestion] = useState("");
  const [qOptions, setQOptions] = useState(["", "", "", ""]);
  const [qCorrect, setQCorrect] = useState("0");

  const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null);

  const { data: quizzes = [] } = useQuizzes();
  const { data: courses = [] } = useCourses();
  const { data: chapters = [] } = useChapters();
  const { data: questions = [] } = useQuizQuestions(expandedQuiz || undefined);

  const createQuiz = useCreateQuiz();
  const deleteQuiz = useDeleteQuiz();
  const createQuestion = useCreateQuizQuestion();
  const deleteQuestion = useDeleteQuizQuestion();

  const filteredChapters = chapters.filter((c) => c.course_id === quizCourseId);

  const handleCreateQuiz = () => {
    if (!quizTitle || !quizCourseId || !quizChapterId) return toast.error("Fill all fields");
    createQuiz.mutate({ course_id: quizCourseId, chapter_id: quizChapterId, title: quizTitle, duration: quizDuration }, {
      onSuccess: () => { toast.success("Quiz created!"); setShowForm(false); setQuizTitle(""); },
    });
  };

  const handleAddQuestion = () => {
    if (!qQuestion || qOptions.some((o) => !o.trim())) return toast.error("Fill all fields");
    createQuestion.mutate({
      quiz_id: qQuizId, question: qQuestion, options: qOptions,
      correct_index: parseInt(qCorrect), sort_order: questions.length,
    }, {
      onSuccess: () => { toast.success("Question added!"); setQQuestion(""); setQOptions(["", "", "", ""]); setQCorrect("0"); },
    });
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Quiz Management</h2>
      </div>
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogTrigger asChild><Button className="w-full"><Plus className="w-4 h-4 mr-2" /> Create New Quiz</Button></DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>Create New Quiz</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Course *</Label>
              <Select value={quizCourseId} onValueChange={(v) => { setQuizCourseId(v); setQuizChapterId(""); }}>
                <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                <SelectContent>{courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.thumbnail_emoji} {c.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {quizCourseId && (
              <div className="space-y-1">
                <Label className="text-xs">Chapter *</Label>
                <Select value={quizChapterId} onValueChange={setQuizChapterId}>
                  <SelectTrigger><SelectValue placeholder="Select chapter" /></SelectTrigger>
                  <SelectContent>{filteredChapters.map((ch) => <SelectItem key={ch.id} value={ch.id}>{ch.title}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1"><Label className="text-xs">Quiz Title *</Label><Input placeholder="e.g. Algebra Basics Quiz" value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} /></div>
            <div className="space-y-1"><Label className="text-xs">Duration</Label><Input placeholder="10 min" value={quizDuration} onChange={(e) => setQuizDuration(e.target.value)} /></div>
            <Button className="w-full" onClick={handleCreateQuiz} disabled={createQuiz.isPending}>Create Quiz</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-3">
        {quizzes.map((q) => (
          <Card key={q.id} className="p-4 bg-card border border-border shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h3 className="font-semibold text-foreground">{q.title}</h3>
                  <Badge variant="secondary" className="text-[10px] shrink-0">{q.duration}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{q.courses?.title || "No course"}</p>
                <p className="text-xs text-muted-foreground">{questions.filter((qs) => qs.quiz_id === q.id).length} questions</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button size="sm" variant="ghost" onClick={() => setExpandedQuiz(expandedQuiz === q.id ? null : q.id)}>
                  {expandedQuiz === q.id ? <Eye className="w-3.5 h-3.5" /> : <ListPlus className="w-3.5 h-3.5" />}
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteQuiz.mutate(q.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>

            {expandedQuiz === q.id && (
              <div className="mt-3 space-y-2 border-t pt-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">{questions.length} questions</p>
                  <Dialog open={showQForm && qQuizId === q.id} onOpenChange={(o) => { setShowQForm(o); if (o) setQQuizId(q.id); }}>
                    <DialogTrigger asChild><Button size="sm" variant="secondary"><ListPlus className="w-3 h-3 mr-1" /> Add Question</Button></DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Add Question</DialogTitle></DialogHeader>
                      <div className="space-y-3">
                        <div className="space-y-1"><Label className="text-xs">Question *</Label><Input placeholder="What is 2+2?" value={qQuestion} onChange={(e) => setQQuestion(e.target.value)} /></div>
                        {qOptions.map((opt, i) => (
                          <div key={i} className="space-y-1">
                            <Label className="text-xs">Option {i + 1} {i === parseInt(qCorrect) && <span className="text-success">(correct)</span>}</Label>
                            <Input placeholder={`Option ${i + 1}`} value={opt} onChange={(e) => { const n = [...qOptions]; n[i] = e.target.value; setQOptions(n); }} />
                          </div>
                        ))}
                        <div className="space-y-1">
                          <Label className="text-xs">Correct Answer</Label>
                          <Select value={qCorrect} onValueChange={setQCorrect}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {qOptions.map((_, i) => <SelectItem key={i} value={String(i)}>Option {i + 1}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button className="w-full" onClick={handleAddQuestion} disabled={createQuestion.isPending}>Add Question</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                {questions.map((q, i) => (
                  <div key={q.id} className="p-2 bg-accent/30 rounded-lg flex items-start gap-2">
                    <span className="text-xs font-bold text-muted-foreground shrink-0">Q{i + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs">{q.question}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(q.options as string[]).map((opt, j) => (
                          <Badge key={j} variant={j === q.correct_index ? "default" : "secondary"} className="text-[10px]">{opt}</Badge>
                        ))}
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="h-5 w-5 p-0 text-destructive shrink-0" onClick={() => deleteQuestion.mutate(q.id)}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminQuizzes;
