import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Calendar, CheckSquare, Square, Plus, Trash2, Clock, Trophy, Target
} from "lucide-react";

interface Task {
  taskName: string;
  isCompleted: boolean;
}

const CountdownTimer = () => {
  const targetDate = new Date("2026-05-31T09:00:00").getTime(); // यूपीएससी प्रीलिम्स 2026
  const [timeLeft, setTimeLeft] = useState(targetDate - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(targetDate - Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const days = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60 * 24)));
  const hours = Math.max(0, Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
  const minutes = Math.max(0, Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)));

  return (
    <Card className="p-4 bg-gradient-to-r from-red-500/10 to-purple-500/10 border border-red-500/20 text-center space-y-2 animate-pulse">
      <h4 className="text-xs uppercase font-extrabold text-red-400 tracking-wider">UPSC CSE Prelims 2026 Countdown</h4>
      <div className="flex justify-center gap-3">
        <div className="bg-white px-3 py-2 rounded-lg shadow-sm border border-slate-100"><span className="text-lg md:text-xl font-extrabold text-slate-800">{days}</span><p className="text-[10px] text-slate-400 font-bold uppercase">Days</p></div>
        <div className="bg-white px-3 py-2 rounded-lg shadow-sm border border-slate-100"><span className="text-lg md:text-xl font-extrabold text-slate-800">{hours}</span><p className="text-[10px] text-slate-400 font-bold uppercase">Hours</p></div>
        <div className="bg-white px-3 py-2 rounded-lg shadow-sm border border-slate-100"><span className="text-lg md:text-xl font-extrabold text-slate-800">{minutes}</span><p className="text-[10px] text-slate-400 font-bold uppercase">Mins</p></div>
      </div>
    </Card>
  );
};

const StudyPlannerPage = () => {
  const { user } = useAuth();
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split("T")[0]);
  const [focusArea, setFocusArea] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskName, setNewTaskName] = useState("");
  const [syncing, setSyncing] = useState(false);

  const loadPlanForDate = async (date: string) => {
    if (!user) return;
    try {
      const { data: plan } = await supabase
        .from("study_plans" as any)
        .select("*, study_tasks(task_name, is_completed)")
        .eq("user_id", user.id)
        .eq("target_date", date)
        .maybeSingle();

      if (plan) {
        setFocusArea((plan as any).focus_area || "");
        setTasks(((plan as any).study_tasks || []).map((t: any) => ({
          taskName: t.task_name,
          isCompleted: t.is_completed
        })));
      } else {
        setFocusArea("");
        setTasks([]);
      }
    } catch {
      toast.error("Failed to load planner data");
    }
  };

  useEffect(() => {
    loadPlanForDate(targetDate);
  }, [targetDate, user]);

  const addTask = () => {
    if (!newTaskName.trim()) return;
    setTasks(prev => [...prev, { taskName: newTaskName.trim(), isCompleted: false }]);
    setNewTaskName("");
  };

  const toggleTask = (index: number) => {
    setTasks(prev => prev.map((t, idx) => idx === index ? { ...t, isCompleted: !t.isCompleted } : t));
  };

  const deleteTask = (index: number) => {
    setTasks(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSyncPlanner = async () => {
    if (!user) return;
    setSyncing(true);
    try {
      const res = await fetch("http://localhost:5000/api/v1/upsc/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          targetDate,
          focusArea,
          tasks
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Daily targets synced successfully!");
      } else {
        toast.error(data.error || "Sync failed");
      }
    } catch {
      toast.error("Could not reach planner backend");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Title */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Study Planner & Countdown</h1>
            <p className="text-muted-foreground text-sm">Schedule revision workflows, count-down targets and list sub-goals</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Planner Composition Form */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5 bg-card border border-border space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center border-b border-border pb-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Target Planner Date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="bg-white/5 border border-purple-500/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/30 mt-1"
                />
              </div>
              <Button onClick={handleSyncPlanner} disabled={syncing} className="bg-gradient-to-r from-teal-600 to-indigo-600">
                {syncing ? "Saving targets..." : "Save Daily Targets"}
              </Button>
            </div>

            {/* Daily Focus */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Target className="w-4 h-4 text-teal-400" /> Daily Focus Area</label>
              <input
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                placeholder="e.g. Laxmikanth Fundamental Rights Chapter 7 review + 1 Mains Answer"
                className="w-full bg-white/5 border border-purple-500/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/30"
              />
            </div>

            {/* Checklist Tasks */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><CheckSquare className="w-4 h-4 text-indigo-400" /> Goal Subtasks</label>
              
              <div className="flex gap-2">
                <input
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  placeholder="Add specific task item…"
                  onKeyDown={(e) => e.key === "Enter" && addTask()}
                  className="flex-1 bg-white/5 border border-purple-500/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/30"
                />
                <Button onClick={addTask} size="icon" className="bg-indigo-600 hover:bg-indigo-500 shrink-0">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-1.5 pt-1">
                {tasks.length === 0 && <p className="text-xs text-slate-500 italic text-center py-4">No specific subtasks added. Create some above.</p>}
                {tasks.map((task, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 transition-all">
                    <button onClick={() => toggleTask(index)} className="shrink-0">
                      {task.isCompleted ? <CheckSquare className="w-4.5 h-4.5 text-teal-400" /> : <Square className="w-4.5 h-4.5 text-gray-500" />}
                    </button>
                    <span className={`text-sm flex-1 ${task.isCompleted ? "line-through text-gray-500" : "text-white"}`}>{task.taskName}</span>
                    <button onClick={() => deleteTask(index)} className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-red-400 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Countdown side-panel widget */}
        <div className="space-y-4">
          <CountdownTimer />
          
          <Card className="p-4 bg-card border border-border">
            <h4 className="font-bold text-sm text-foreground mb-3 flex items-center gap-1.5"><Trophy className="w-4 h-4 text-yellow-400" /> Goal Setting Tips</h4>
            <ul className="text-xs text-muted-foreground space-y-2 list-disc list-inside">
              <li>Break down large chapters into highly explicit action items.</li>
              <li>Always check off items as soon as you finish them for XP gains.</li>
              <li>Schedule target items for future days to maintain structural guidance.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudyPlannerPage;
