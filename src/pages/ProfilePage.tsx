import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { usePurchase } from "@/lib/purchase-context";
import { useCourses, useQuizAttempts, useLectureProgress } from "@/lib/supabase-data";
import { useNavigate } from "react-router-dom";
import { User, Mail, BookOpen, Trophy, Video, CheckCircle, ChevronRight, LogOut } from "lucide-react";

const ProfilePage = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const { purchasedCourses } = usePurchase();
  const { data: courses = [] } = useCourses();
  const { data: attempts = [] } = useQuizAttempts();
  const { data: progress = [] } = useLectureProgress();

  const completedLectures = progress.filter((p) => p.completed).length;
  const avgScore = attempts.length > 0
    ? Math.round(attempts.reduce((a, b) => a + (b.total > 0 ? (b.score / b.total) * 100 : 0), 0) / attempts.length)
    : 0;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <Card className="p-5 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <User className="w-8 h-8 text-primary" />
        </div>
        <h2 className="font-bold text-lg">{user?.name}</h2>
        <p className="text-muted-foreground text-sm flex items-center justify-center gap-1 mt-0.5">
          <Mail className="w-3.5 h-3.5" /> {user?.email}
        </p>
        <Badge className="mt-2">{role === "admin" ? "Teacher / Admin" : "Student"}</Badge>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3 text-center">
          <BookOpen className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold">{purchasedCourses.length}</p>
          <p className="text-[10px] text-muted-foreground">Courses</p>
        </Card>
        <Card className="p-3 text-center">
          <Trophy className="w-5 h-5 text-warning mx-auto mb-1" />
          <p className="text-lg font-bold">{avgScore}%</p>
          <p className="text-[10px] text-muted-foreground">Avg Score</p>
        </Card>
        <Card className="p-3 text-center">
          <Video className="w-5 h-5 text-info mx-auto mb-1" />
          <p className="text-lg font-bold">{completedLectures}</p>
          <p className="text-[10px] text-muted-foreground">Lectures Done</p>
        </Card>
        <Card className="p-3 text-center">
          <CheckCircle className="w-5 h-5 text-success mx-auto mb-1" />
          <p className="text-lg font-bold">{attempts.length}</p>
          <p className="text-[10px] text-muted-foreground">Quizzes Done</p>
        </Card>
      </div>

      <div className="space-y-1">
        {[
          { label: "My Dashboard", to: "/dashboard" },
          { label: "Test Results", to: "/results" },
          { label: "Live Classes", to: "/live-classes" },
          { label: "My Doubts", to: "/doubts" },
          { label: "Notifications", to: "/notifications" },
        ].map((item) => (
          <Card key={item.to} className="p-3 flex items-center justify-between cursor-pointer hover:bg-accent/50" onClick={() => navigate(item.to)}>
            <span className="text-sm font-medium">{item.label}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Card>
        ))}
      </div>

      <Button variant="destructive" className="w-full" onClick={handleLogout}>
        <LogOut className="w-4 h-4 mr-2" /> Log Out
      </Button>
    </div>
  );
};

export default ProfilePage;
