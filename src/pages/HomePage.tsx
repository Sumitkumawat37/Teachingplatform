import { Play, FileText, Trophy, Bell, BookOpen, TrendingUp, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { announcements } from "@/lib/mock-data";
import teacherBanner from "@/assets/teacher-banner.jpg";

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Teacher Banner */}
      <Card className="overflow-hidden relative">
        <div className="relative">
          <img
            src={teacherBanner}
            alt="Teacher Banner"
            className="w-full h-40 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />
          <div className="absolute inset-0 p-4 flex flex-col justify-center">
            <p className="text-primary-foreground/80 text-[10px] font-semibold uppercase tracking-widest">Your Mentor</p>
            <h3 className="text-primary-foreground font-bold text-xl mt-1">Rajesh Kumar Sir</h3>
            <p className="text-primary-foreground/70 text-xs mt-0.5">Mathematics & Physics Expert</p>
            <div className="flex items-center gap-1 mt-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 text-warning fill-warning" />
              ))}
              <span className="text-primary-foreground/70 text-[10px] ml-1">4.9 (2.3k reviews)</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold">Welcome back! 👋</h2>
        <p className="text-muted-foreground text-sm mt-0.5">{user?.name} · Keep learning, keep growing</p>
      </div>

      {/* Continue Learning */}
      <Card
        className="p-4 cursor-pointer hover:card-shadow-lg transition-shadow bg-gradient-to-r from-primary to-info overflow-hidden relative"
        onClick={() => navigate("/courses/1/lecture/3")}
      >
        <div className="relative z-10">
          <p className="text-primary-foreground/80 text-xs font-medium uppercase tracking-wide">Continue Learning</p>
          <h3 className="text-primary-foreground font-bold text-lg mt-1">Polynomials</h3>
          <p className="text-primary-foreground/70 text-sm">Complete Mathematics · Chapter: Algebra</p>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Play className="w-4 h-4 text-primary-foreground" fill="currentColor" />
            </div>
            <div className="flex-1">
              <Progress value={65} className="h-1.5 bg-primary-foreground/20" />
            </div>
            <span className="text-primary-foreground text-xs font-medium">65%</span>
          </div>
        </div>
        <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-primary-foreground/10" />
      </Card>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card
          className="p-4 cursor-pointer hover:card-shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => navigate("/quizzes")}
        >
          <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center mb-2">
            <Trophy className="w-5 h-5 text-warning" />
          </div>
          <h4 className="font-semibold text-sm">Today's Quiz</h4>
          <p className="text-muted-foreground text-xs mt-0.5">Algebra Basics · 10 Qs</p>
        </Card>

        <Card
          className="p-4 cursor-pointer hover:card-shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => navigate("/notes")}
        >
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center mb-2">
            <FileText className="w-5 h-5 text-success" />
          </div>
          <h4 className="font-semibold text-sm">Latest Notes</h4>
          <p className="text-muted-foreground text-xs mt-0.5">Differentiation Rules</p>
        </Card>

        <Card
          className="p-4 cursor-pointer hover:card-shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => navigate("/courses")}
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <h4 className="font-semibold text-sm">My Courses</h4>
          <p className="text-muted-foreground text-xs mt-0.5">3 courses enrolled</p>
        </Card>

        <Card
          className="p-4 cursor-pointer hover:card-shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => navigate("/results")}
        >
          <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center mb-2">
            <TrendingUp className="w-5 h-5 text-info" />
          </div>
          <h4 className="font-semibold text-sm">Upcoming Test</h4>
          <p className="text-muted-foreground text-xs mt-0.5">Chemical Bonding · Mar 10</p>
        </Card>
      </div>

      {/* Announcements */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-base">Announcements</h3>
          <button onClick={() => navigate("/notifications")} className="text-primary text-xs font-medium">View all</button>
        </div>
        <div className="space-y-2">
          {announcements.slice(0, 2).map((a, i) => (
            <Card key={a.id} className="p-3 flex items-start gap-3" style={{ animationDelay: `${i * 100}ms` }}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                a.type === "info" ? "bg-info/10" : a.type === "success" ? "bg-success/10" : "bg-warning/10"
              }`}>
                <Bell className={`w-4 h-4 ${
                  a.type === "info" ? "text-info" : a.type === "success" ? "text-success" : "text-warning"
                }`} />
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-sm">{a.title}</h4>
                <p className="text-muted-foreground text-xs line-clamp-1">{a.message}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
