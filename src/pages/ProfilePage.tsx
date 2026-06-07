import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { usePurchase } from "@/lib/purchase-context";
import { useCourses, useLectureProgress } from "@/lib/supabase-data";
import { useNavigate } from "react-router-dom";
import { User, Mail, BookOpen, Video, CheckCircle, ChevronRight, LogOut } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const ProfilePage = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const { purchasedCourses } = usePurchase();
  const { data: courses = [] } = useCourses();
  const { data: progress = [] } = useLectureProgress();

  const completedLectures = progress.filter((p) => p.completed).length;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const scrollRef = useScrollReveal();

  return (
    <div className="space-y-4 animate-slide-up" ref={scrollRef}>
      <Card className="p-5 text-center border border-violet-100/40 shadow-sm rounded-2xl" style={{ background: 'linear-gradient(135deg, #F3EEFF 0%, #FFEAF4 100%)' }}>
        <div className="w-16 h-16 rounded-full bg-white/70 flex items-center justify-center mx-auto mb-3 shadow-sm">
          <User className="w-8 h-8 text-violet-600" />
        </div>
        <h2 className="font-semibold text-lg text-slate-800">{user?.name}</h2>
        <p className="text-slate-500 text-sm flex items-center justify-center gap-1 mt-0.5">
          <Mail className="w-3.5 h-3.5" /> {user?.email}
        </p>
        <Badge className="mt-2">{role === "admin" ? "Teacher / Admin" : "Student"}</Badge>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3 text-center border border-violet-100/40 shadow-sm rounded-xl hover:shadow-md hover:-translate-y-0.5 transition-all duration-250" style={{ background: '#F3EEFF' }}>
          <BookOpen className="w-5 h-5 text-violet-600 mx-auto mb-1" />
          <p className="text-lg font-bold text-slate-800">{purchasedCourses.length}</p>
          <p className="text-[10px] text-slate-400">Courses</p>
        </Card>
        <Card className="p-3 text-center border border-sky-100/40 shadow-sm rounded-xl hover:shadow-md hover:-translate-y-0.5 transition-all duration-250" style={{ background: '#EAF6FF' }}>
          <Video className="w-5 h-5 text-blue-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-slate-800">{completedLectures}</p>
          <p className="text-[10px] text-slate-400">Lectures Done</p>
        </Card>
      </div>

      <div className="space-y-1">
        {[
          { label: "My Dashboard", to: "/dashboard" },
          { label: "Live Classes", to: "/live-classes" },
          { label: "My Doubts", to: "/doubts" },
          { label: "Notifications", to: "/notifications" },
        ].map((item) => (
          <Card key={item.to} className="p-3 flex items-center justify-between cursor-pointer bg-white border border-slate-100/60 shadow-sm rounded-xl hover:shadow-md hover:-translate-y-0.5 transition-all duration-250" onClick={() => navigate(item.to)}>
            <span className="text-sm font-medium text-slate-700">{item.label}</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Card>
        ))}
      </div>

      <Button variant="destructive" className="w-full rounded-xl" onClick={handleLogout}>
        <LogOut className="w-4 h-4 mr-2" /> Log Out
      </Button>
    </div>
  );
};

export default ProfilePage;
