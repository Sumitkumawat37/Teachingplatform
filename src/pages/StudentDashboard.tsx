import { useMemo, useEffect, useState } from "react";
import { useCourses, useLectures } from "@/lib/supabase-data";
import { usePurchase } from "@/lib/purchase-context";
import { useAuth } from "@/lib/auth-context";
import { useNavigate } from "react-router-dom";
import { BookOpen, Video, CheckCircle, TrendingUp, ChevronRight, Flame, Target, Star, AlertTriangle } from "lucide-react";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasPurchased } = usePurchase();
  const { data: courses = [] } = useCourses();
  const { data: lectures = [] } = useLectures();

  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      try {
        const res = await fetch(`http://localhost:5000/api/v1/upsc/analytics?userId=${user.id}`);
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, [user]);

  const completedLectures = stats?.completedLectures || 0;
  const totalLectures = lectures.length;
  const lecturePercent = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;

  const purchasedCourses = courses.filter((c) => hasPurchased(c.id));

  const statCards = [
    { icon: BookOpen,     label: "Courses",      value: purchasedCourses.length.toString(), grad: "from-sky-400 to-cyan-500",     delay: 0 },
    { icon: Video,        label: "Lectures",     value: `${completedLectures}/${totalLectures}`, grad: "from-violet-400 to-purple-500", delay: 140 },
    { icon: CheckCircle,  label: "Completed",   value: completedLectures.toString(),           grad: "from-emerald-400 to-teal-500",delay: 70 },
  ];

  // Streak
  const streakDays = stats?.studyStreak || 0;

  // XP system
  const totalXP = completedLectures * 50;
  const xpLevel = Math.floor(totalXP / 500) + 1;
  const xpInLevel = totalXP % 500;
  const xpPercent = Math.round((xpInLevel / 500) * 100);

  const levelNames = ["Beginner", "Aspirant", "Seeker", "Scholar", "Expert", "Champion", "Master"];
  const levelName = levelNames[Math.min(xpLevel - 1, levelNames.length - 1)];

  // Daily goal
  const dailyGoalTarget = 3;
  const dailyGoalDone = Math.min(completedLectures % dailyGoalTarget || (completedLectures > 0 ? dailyGoalTarget : 0), dailyGoalTarget);
  const dailyGoalPercent = Math.round((dailyGoalDone / dailyGoalTarget) * 100);

  return (
    <div className="space-y-6">

      {/* ── HEADER ── */}
      <div className="relative overflow-hidden rounded-2xl p-5 border border-violet-100/40" style={{ background: 'linear-gradient(135deg, #F3EEFF 0%, #FFEAF4 100%)' }}>
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center shadow-sm">
            <TrendingUp className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800" style={{ fontFamily: 'Poppins, sans-serif' }}>My Dashboard</h2>
            <p className="text-slate-500 text-xs">Track your UPSC prep progress</p>
          </div>
        </div>
      </div>

      {/* ── STREAK + XP ROW ── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Streak card */}
        <div className="rounded-2xl p-4 shadow-sm border border-orange-100/50 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-250" style={{ background: '#FFF0EA' }}>
          <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center mx-auto mb-2">
            <Flame className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{streakDays}</p>
          <p className="text-[11px] text-slate-500 font-medium">Day Streak</p>
          <div className="flex items-center justify-center gap-1 mt-1.5">
            {[...Array(Math.min(streakDays, 7))].map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-orange-400" />
            ))}
            {streakDays === 0 && <p className="text-[10px] text-slate-400">Start today!</p>}
          </div>
        </div>

        {/* XP / Level card */}
        <div className="rounded-2xl p-4 shadow-sm border border-amber-100/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-250" style={{ background: '#FFF8E7' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-slate-800">Lv.{xpLevel}</p>
              <p className="text-[10px] text-amber-600 font-semibold">{levelName}</p>
            </div>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 xp-bar-fill"
              style={{ "--xp-pct": `${xpPercent}%` } as React.CSSProperties}
            />
          </div>
          <div className="flex justify-between mt-1">
            <p className="text-[10px] text-slate-400">{xpInLevel} XP</p>
            <p className="text-[10px] text-slate-400">500 XP</p>
          </div>
        </div>
      </div>

      {/* ── DAILY GOAL ── */}
      <div className="rounded-2xl p-4 shadow-sm border border-sky-100/50" style={{ background: '#EAF6FF' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
              <Target className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-800">Daily Goal</p>
              <p className="text-[11px] text-slate-400">Complete {dailyGoalTarget} lectures today</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-violet-600">{dailyGoalDone}/{dailyGoalTarget}</p>
          </div>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all duration-1000 ease-out"
            style={{ width: `${dailyGoalPercent}%` }}
          />
        </div>
        <div className="flex gap-2 mt-3">
          {[...Array(dailyGoalTarget)].map((_, i) => (
            <div
              key={i}
              className={`flex-1 rounded-lg py-1.5 text-center text-[10px] font-semibold ${
                i < dailyGoalDone
                  ? "bg-violet-50 text-violet-600 border border-violet-100"
                  : "bg-slate-50 text-slate-400 border border-slate-100"
              }`}
            >
              {i < dailyGoalDone ? (
                <span className="flex items-center justify-center gap-1"><CheckCircle className="w-3 h-3" /> Done</span>
              ) : (
                `Lecture ${i + 1}`
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100/60 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-250"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.grad} flex items-center justify-center mx-auto mb-2 shadow-sm`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-xl font-bold text-slate-800">{stat.value}</p>
            <p className="text-[11px] text-slate-500 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── PROGRESS + CHART (side-by-side on desktop) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5 shadow-sm border border-violet-100/40" style={{ background: '#F3EEFF' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-slate-800">Lecture Progress</h3>
            <span className="text-sm font-bold text-violet-600">{lecturePercent}%</span>
          </div>
          <div className="relative">
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${lecturePercent}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">{completedLectures} of {totalLectures} lectures completed</p>
        </div>
      </div>

      {/* ── YOUR TEACHERS ── */}
      <div>
        <h3 className="font-semibold text-base text-slate-800 mb-3">Your Teachers</h3>
        <div className="grid grid-cols-2 gap-3">
          {/* Nadiya Khan */}
          <div className="rounded-2xl p-4 shadow-sm border border-violet-100/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-250" style={{ background: '#F3EEFF' }}>
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-violet-200 mx-auto mb-3 shadow-sm bg-gradient-to-br from-violet-100 to-pink-100 flex items-center justify-center">
              <img
                src="/nadiya-maam.jpg"
                alt="Nadiya Khan"
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  (e.currentTarget.style.display = 'none');
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML = `<span class="text-violet-600 font-bold text-lg">NK</span>`;
                  }
                }}
              />
            </div>
            <h4 className="font-semibold text-sm text-slate-800 text-center">Nadiya Khan</h4>
            <p className="text-[11px] text-violet-600 text-center font-medium mt-0.5">Faculty</p>
            <p className="text-[10px] text-slate-400 text-center mt-1">Polity & GS-2 Expert</p>
          </div>

          {/* Shivam Saxena */}
          <div className="rounded-2xl p-4 shadow-sm border border-pink-100/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-250" style={{ background: '#FFEAF4' }}>
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-pink-200 mx-auto mb-3 shadow-sm bg-gradient-to-br from-pink-100 to-violet-100 flex items-center justify-center">
              <img
                src="/shivam-sir.jpg"
                alt="Shivam Saxena"
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  (e.currentTarget.style.display = 'none');
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML = `<span class="text-pink-600 font-bold text-lg">SS</span>`;
                  }
                }}
              />
            </div>
            <h4 className="font-semibold text-sm text-slate-800 text-center">Shivam Saxena</h4>
            <p className="text-[11px] text-pink-600 text-center font-medium mt-0.5">Faculty</p>
            <p className="text-[10px] text-slate-400 text-center mt-1">History & GS-1 Expert</p>
          </div>
        </div>
      </div>

      {/* ── ENROLLED COURSES ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-base text-slate-800">Enrolled Courses</h3>
          <button onClick={() => navigate("/courses")} className="text-violet-600 text-xs font-semibold flex items-center gap-1 hover:gap-2 transition-all">
            Browse more <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {purchasedCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl p-3.5 cursor-pointer shadow-sm border border-slate-100/60 flex items-center gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-250"
              onClick={() => navigate(`/courses/${course.id}`)}
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-2xl shadow-sm shrink-0">
                {course.thumbnail_emoji}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-slate-800 truncate">{course.title}</h4>
                <p className="text-slate-400 text-xs">{course.category}</p>
              </div>
              <div className="w-7 h-7 rounded-full bg-violet-50 flex items-center justify-center shrink-0">
                <ChevronRight className="w-3.5 h-3.5 text-violet-600" />
              </div>
            </div>
          ))}
          {purchasedCourses.length === 0 && (
            <div
              className="bg-white rounded-2xl p-6 text-center shadow-sm border border-slate-100/60 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-250"
              onClick={() => navigate("/courses")}
            >
              <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-violet-600" />
              </div>
              <p className="text-slate-500 text-sm font-medium">No enrolled courses yet</p>
              <p className="text-violet-600 text-xs font-semibold mt-1">Browse courses →</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
