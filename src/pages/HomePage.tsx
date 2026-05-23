import { useState } from "react";
import { Play, FileText, Trophy, Bell, BookOpen, TrendingUp, Star, Video, Users, Target, Award, ChevronRight, Quote, GraduationCap, CheckCircle, Clock, Shield, ChevronDown, Medal, MapPin, Flame, Sparkles, Brain, Pen, Heart, MessageCircle, Rocket, BookMarked } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { usePurchase } from "@/lib/purchase-context";
import { useCourses, useAnnouncements, useLiveClasses } from "@/lib/supabase-data";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import teacherBanner from "../assets/teacher-banner.jpg";

const reviews = [
  { name: "Priya Sharma", rank: "AIR 287", year: "UPSC 2024", location: "Delhi", text: "Nadiya Ma'am's structured approach cleared every concept. From polity to GS-2, I aced it all. Highly recommend!", rating: 5 },
  { name: "Rahul Verma", rank: "AIR 412", year: "UPSC 2023", location: "Mumbai", text: "Best mentor I've found online. Doubt replies are super fast and live classes are genuinely gold.", rating: 5 },
  { name: "Ananya Singh", rank: "Mains Qualified", year: "UPSC 2024", location: "Bengaluru", text: "The notes + quiz combo is brilliant. Cracked prelims on first attempt. No coaching centre needed!", rating: 5 },
  { name: "Mohammed Aslam", rank: "AIR 189", year: "UPSC 2024", location: "Hyderabad", text: "Affordable, structured, and the live tests kept me on track. Cleared with AIR 189. Life-changing!", rating: 5 },
];

const programs = [
  { icon: Video,    label: "Live Classes",  desc: "Daily 2–3 hr sessions with Nadiya Ma'am",  grad: "from-purple-500 to-pink-500",  path: "/live-classes", badge: "Most Popular" },
  { icon: BookOpen, label: "Video Courses", desc: "Self-paced recorded lectures, rewatch anytime", grad: "from-violet-500 to-purple-500", path: "/courses", badge: null },
  { icon: FileText, label: "Study Notes",   desc: "Curated notes, PYQs & PDF downloads",       grad: "from-pink-500 to-rose-500", path: "/notes",        badge: "500+ Notes" },
  { icon: Trophy,   label: "Mock Quizzes",  desc: "Weekly tests, auto-evaluated with analytics", grad: "from-amber-500 to-orange-500", path: "/quizzes",      badge: "200+ Tests" },
];

const faqs = [
  { q: "What is included in the Live Classes batch?", a: "Each batch includes 150+ live interactive classes, doubt sessions, current affairs coverage, full notes PDFs, and weekly mock tests. All sessions are recorded for later revision." },
  { q: "How long will it take to prepare for UPSC with this platform?", a: "Our structured 12-month program is designed to cover the complete UPSC syllabus. Most students see significant improvement within 3–4 months. We also offer crash courses for specific papers." },
  { q: "Can I access the content after the batch ends?", a: "Yes! All recorded lectures and notes remain accessible for 2 years after your batch ends. You can revisit any topic anytime." },
  { q: "Is there any free trial available?", a: "Absolutely! You get 2 free lecture previews in every course. Simply sign up, browse the Course Marketplace, and tap any course to access the free preview lectures." },
  { q: "How is Nadiya Ma'am different from other UPSC mentors?", a: "Nadiya Ma'am combines simplified teaching with personal feedback. With a 92% student satisfaction rate and 45+ students clearing UPSC, her track record speaks for itself. She personally reviews doubts within 24 hours." },
];

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasPurchased } = usePurchase();
  const { data: courses = [] } = useCourses();
  const { data: announcements = [] } = useAnnouncements();
  const { data: liveClasses = [] } = useLiveClasses();

  const upcomingLive = liveClasses.filter((c) => c.status === "upcoming");
  const purchasedCourses = courses.filter((c) => hasPurchased(c.id));

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const scrollRef = useScrollReveal();

  return (
    <div className="space-y-6" ref={scrollRef}>

      {/* ══ HERO SECTION ══ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#A855F7]/80 via-[#1a1040] to-[#EC4899]/40 p-6 md:p-8 shadow-[0_0_40px_rgba(168,85,247,0.3)] animate-fade-in neon-border animate-glow-breathe">
        {/* Glow blobs */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#A855F7]/25 rounded-full blur-3xl animate-blob pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[#EC4899]/25 rounded-full blur-3xl animate-blob-2 pointer-events-none" />
        <div className="absolute top-8 right-32 w-6 h-6 bg-purple-400/40 rounded-full animate-float" style={{ animationDelay: '0.3s' }} />
        <div className="absolute bottom-10 right-16 w-4 h-4 bg-pink-400/50 rounded-full animate-float-reverse" />
        {/* Meteor streaks */}
        <div className="absolute top-0 left-1/4 w-px h-16 bg-gradient-to-b from-purple-400/60 to-transparent animate-meteor pointer-events-none" style={{ animationDelay: '1s' }} />
        <div className="absolute top-0 right-1/3 w-px h-12 bg-gradient-to-b from-pink-400/40 to-transparent animate-meteor pointer-events-none" style={{ animationDelay: '3s', animationDuration: '5s' }} />

        <div className="flex items-start justify-between relative z-10">
          <div className="flex-1 pr-3">
            {/* Pill tag */}
            <div className="inline-flex items-center gap-1.5 bg-[#A855F7]/20 backdrop-blur-sm px-3 py-1.5 rounded-full mb-3 animate-slide-in-left border border-[#A855F7]/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <Sparkles className="w-3.5 h-3.5 text-[#C084FC] icon-glow-purple icon-animated-pulse" />
              <span className="text-[#C084FC] text-[10px] font-bold tracking-wide">India's Most Loved UPSC Platform</span>
            </div>

            {/* Main headline */}
            <h1 className="text-white font-extrabold text-[22px] md:text-3xl leading-tight mb-2 animate-slide-in-left animate-text-glow" style={{ animationDelay: '0.08s', fontFamily: 'Poppins, sans-serif' }}>
              Chalo Gen Z<br /><span className="text-shimmer">padhte hai!</span>
            </h1>
            <p className="text-[#B3B3B3]/80 text-xs md:text-sm mb-4 leading-relaxed animate-slide-in-left max-w-md" style={{ animationDelay: '0.16s' }}>
              Smart strategy, real guidance, and UPSC success — all in one platform. Hi {user?.name?.split(' ')[0] || 'Aspirant'}! <span className="animate-wave">🎯</span>
            </p>

            {/* CTAs */}
            <div className="flex gap-3 animate-slide-in-left" style={{ animationDelay: '0.24s' }}>
              <button
                onClick={() => navigate('/courses')}
                className="btn-action ripple text-xs font-extrabold px-6 py-3 rounded-full urgency-pulse"
              >
                Start Learning Now
              </button>
              <button
                onClick={() => navigate('/courses')}
                className="bg-[#0D0D0D]/50 backdrop-blur-sm text-white text-xs font-semibold px-5 py-3 rounded-full border border-[#A855F7]/30 hover:bg-[#0D0D0D]/70 hover:border-[#A855F7]/50 transition-all ripple press shadow-[0_0_15px_rgba(168,85,247,0.1)]"
              >
                Explore Courses
              </button>
            </div>

            {/* Student avatars */}
            <div className="flex items-center gap-3 mt-4 animate-slide-in-left" style={{ animationDelay: '0.32s' }}>
              <div className="flex -space-x-2">
                {["P", "R", "A", "M"].map((l, i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-[10px] font-bold border-2 border-[#1a1040] shadow-md" style={{ zIndex: 4 - i }}>
                    {l}
                  </div>
                ))}
              </div>
              <span className="text-[#777777] text-[11px] font-semibold"><AnimatedCounter end={50000} suffix="+" className="text-[#A855F7] font-bold" /> Aspirants already learning</span>
            </div>
          </div>

          {/* Teacher photo + floating doodles */}
          <div className="relative shrink-0 animate-slide-in-right mt-1">
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border-2 border-[#A855F7]/40 shadow-[0_0_30px_rgba(168,85,247,0.3)] animate-float-slow">
              <img src={teacherBanner} alt="Nadiya Ma'am" className="w-full h-full object-cover object-top scale-110" loading="lazy" />
            </div>
            {/* Floating doodles */}
            <div className="absolute -top-1 -left-28 glass-dark rounded-2xl px-3 py-1.5 shadow-[0_0_20px_rgba(168,85,247,0.2)] flex items-center gap-1.5 animate-float" style={{ animationDelay: '0.6s' }}>
              <Target className="w-3 h-3 text-[#EC4899] icon-glow-pink" />
              <span className="text-[10px] font-bold text-[#B3B3B3]">Discipline</span>
            </div>
            <div className="absolute top-1/2 -left-28 -translate-y-1/2 glass-dark rounded-2xl px-3 py-1.5 shadow-[0_0_20px_rgba(168,85,247,0.2)] flex items-center gap-1.5 animate-float" style={{ animationDelay: '1.1s' }}>
              <Flame className="w-3 h-3 text-orange-400 icon-glow-purple icon-animated-pulse" />
              <span className="text-[10px] font-bold text-[#B3B3B3]">Consistency</span>
            </div>
            <div className="absolute -bottom-8 -left-28 glass-dark rounded-2xl px-3 py-1.5 shadow-[0_0_20px_rgba(168,85,247,0.2)] flex items-center gap-1.5 animate-float" style={{ animationDelay: '0.8s' }}>
              <Rocket className="w-3 h-3 text-[#A855F7] icon-glow-purple icon-animated-bounce" />
              <span className="text-[10px] font-bold text-[#B3B3B3]">Future Officer</span>
            </div>
          </div>
        </div>

        {/* Trust badges row */}
        <div className="flex gap-2 mt-5 relative z-10 animate-slide-in-left flex-wrap" style={{ animationDelay: '0.4s' }}>
          {[
            { icon: Shield, label: "45+ Cleared UPSC" },
            { icon: CheckCircle, label: "92% Completion" },
            { icon: Clock, label: "24hr Doubt Reply" },
          ].map((b) => (
            <div key={b.label} className="trust-badge flex items-center gap-1.5 px-3 py-2 hover-scale-sm">
              <b.icon className="w-3 h-3 text-[#C084FC] shrink-0 icon-glow-purple" />
              <span className="text-[#C084FC] text-[9px] font-semibold whitespace-nowrap">{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ══ STATS CARDS ══ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-fast">
        {[
          { icon: Users,      value: 50000, suffix: "+",  label: "Active Aspirants",      grad: "from-purple-500 to-violet-600" },
          { icon: Clock,      value: 500,   suffix: "+",  label: "Hours of Content",      grad: "from-pink-500 to-rose-600" },
          { icon: BookMarked, value: 10000, suffix: "+",  label: "PYQs Solved",           grad: "from-amber-500 to-orange-600" },
          { icon: Star,       value: 49,    suffix: "/5★", label: "Top Rated by Aspirants", grad: "from-emerald-500 to-teal-600" },
        ].map((s, i) => (
          <div
            key={s.label}
            className="reveal-scale glass-card rounded-2xl p-4 text-center stat-counter neon-border spotlight-card magnetic-hover cursor-default"
            style={{ transitionDelay: `${i * 50}ms` }}
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.grad} flex items-center justify-center mx-auto mb-2 shadow-lg relative z-[1] hover-scale icon-container-glow`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-xl font-extrabold text-white relative z-[1]">
              {s.suffix === "/5★" ? <><AnimatedCounter end={s.value} duration={1200} /><span className="text-sm">/5★</span></> : <AnimatedCounter end={s.value} suffix={s.suffix} duration={1500} />}
            </p>
            <p className="text-[10px] text-[#777777] font-semibold mt-0.5 relative z-[1]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ══ DAILY TARGET / PROGRESS TRACKER ══ */}
      <div className="reveal glass-card rounded-3xl p-5 neon-border aurora-bg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>Daily Target</h2>
            <p className="text-[#777777] text-[10px]">Stay consistent, stay ahead</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-orange-500/15 px-3 py-1.5 rounded-full border border-orange-500/20">
              <Flame className="w-3.5 h-3.5 text-orange-400 streak-fire icon-glow-purple icon-animated-pulse" />
              <span className="text-orange-300 text-[11px] font-bold">7 Day Streak <span className="animate-wave">🔥</span></span>
            </div>
            <div className="flex items-center gap-1 bg-[#A855F7]/15 px-3 py-1.5 rounded-full border border-[#A855F7]/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <Sparkles className="w-3.5 h-3.5 text-[#A855F7] icon-glow-purple icon-animated-pulse" />
              <span className="text-[#C084FC] text-[11px] font-bold">250 XP</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Circular progress */}
          <div className="relative w-24 h-24 shrink-0">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(168,85,247,0.2)" strokeWidth="8" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="url(#progressGradient)" strokeWidth="8" strokeLinecap="round" strokeDasharray="264" strokeDashoffset="92" />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-extrabold text-white">65%</span>
            </div>
          </div>

          {/* Checklist */}
          <div className="flex-1 space-y-2">
            {[
              { label: "Polity", done: true },
              { label: "Current Affairs Quiz", done: true },
              { label: "Editorial Reading", done: false },
              { label: "Answer Writing", done: false },
            ].map((task) => (
              <div key={task.label} className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${task.done ? 'bg-[#A855F7]/10 border border-[#A855F7]/20' : 'bg-[#0D0D0D]/50 border border-white/5'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${task.done ? 'bg-gradient-to-r from-[#A855F7] to-[#EC4899]' : 'border-2 border-[#777777]'}`}>
                  {task.done && <CheckCircle className="w-3.5 h-3.5 text-white icon-glow-purple" />}
                </div>
                <span className={`text-xs font-medium ${task.done ? 'text-[#C084FC] line-through' : 'text-[#B3B3B3]'}`}>{task.label}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => navigate('/courses')}
          className="w-full mt-4 bg-gradient-to-r from-[#A855F7] to-[#EC4899] text-white text-sm font-bold py-3 rounded-xl shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(236,72,153,0.5)] transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Continue Where You Left →
        </button>
      </div>

      {/* ══ OUR PROGRAMS ══ */}
      <div className="reveal">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>Our Programs</h2>
            <p className="text-[#777777] text-[10px]">Choose your path to UPSC success</p>
          </div>
          <button onClick={() => navigate('/courses')} className="text-[#A855F7] text-xs font-bold link-underline">
            All Courses →
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {programs.map((item, i) => (
            <div
              key={item.label}
              className="reveal-scale glass-card rounded-3xl p-4 cursor-pointer card-interactive group-item tilt-hover spotlight-card relative overflow-hidden"
              style={{ transitionDelay: `${i * 50}ms` }}
              onClick={() => navigate(item.path)}
            >
              {item.badge && (
                <div className="absolute top-2.5 right-2.5 gradient-action text-white text-[8px] font-bold px-2 py-0.5 rounded-full animate-pop-in shadow-lg shadow-purple-500/30">
                  {item.badge}
                </div>
              )}
              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${item.grad} flex items-center justify-center shadow-lg mb-3 hover-scale relative z-[1] icon-container-glow`}>
                <item.icon className="w-5 h-5 text-white bounce-on-hover" />
              </div>
              <h4 className="font-bold text-sm text-white relative z-[1]">{item.label}</h4>
              <p className="text-[#777777] text-[10px] mt-0.5 leading-relaxed relative z-[1]">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══ LIVE CLASS CARD ══ */}
      {upcomingLive.length > 0 && (
        <div className="reveal glass-card rounded-3xl p-5 neon-border relative overflow-hidden animate-glow-breathe">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#EC4899]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-400 text-xs font-bold uppercase tracking-wider">Live Now</span>
            </div>
            <button onClick={() => navigate('/live-classes')} className="text-[#A855F7] text-xs font-bold link-underline flex items-center gap-1">
              View all <ChevronRight className="w-3.5 h-3.5 icon-glow-purple" />
            </button>
          </div>
          <div className="relative z-10">
            <h3 className="text-white font-bold text-base">{upcomingLive[0]?.title || "Upcoming Live Class"}</h3>
            <p className="text-[#B3B3B3] text-xs mt-1">{upcomingLive[0]?.subject || "Subject"}</p>
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={() => navigate('/live-classes')}
                className="bg-gradient-to-r from-[#A855F7] to-[#EC4899] text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(236,72,153,0.5)] transition-all flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5 icon-glow-purple" /> Join Now
              </button>
              <span className="text-[#777777] text-[10px]">
                <Clock className="w-3 h-3 inline mr-1 icon-glow-purple" />
                {upcomingLive[0]?.scheduled_time ? new Date(upcomingLive[0].scheduled_time).toLocaleTimeString() : "Coming soon"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ══ ABOUT INSTRUCTORS ══ */}
      <div className="reveal glass-card rounded-3xl p-5 neon-border overflow-hidden relative">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#A855F7]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Our Instructors</h2>
          
          {/* Static list of teachers with their courses */}
          {[
            {
              name: "Nadiya Ma'am",
              expertise: "Polity, History & GS",
              years: "10+ Years Mentoring",
              students: "2,500+ Students",
              success: "92% Success Rate",
              image: teacherBanner
            },
            {
              name: "Shivam Sir",
              expertise: "Economics, Geography & Current Affairs",
              years: "8+ Years Mentoring",
              students: "1,800+ Students",
              success: "89% Success Rate",
              image: null
            }
          ].map((teacher, idx) => {
            const teacherCourses = courses.filter(c => c.instructor === teacher.name);
            return (
              <div key={teacher.name} className="mb-6 last:mb-0">
                <div className="flex items-start gap-4 mb-3">
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#A855F7]/40 shadow-[0_0_25px_rgba(168,85,247,0.3)] animate-float-slow bg-gradient-to-br from-[#A855F7]/20 to-[#EC4899]/20 flex items-center justify-center">
                      {teacher.image ? (
                        <img src={teacher.image} alt={teacher.name} className="w-full h-full object-cover object-top scale-110" loading="lazy" />
                      ) : (
                        <span className="text-2xl">{teacher.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-[#050505] flex items-center justify-center icon-container-glow">
                      <CheckCircle className="w-3 h-3 text-white icon-glow-purple" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-bold text-base text-white">{teacher.name}</h3>
                      <div className="bg-[#A855F7]/20 text-[#A855F7] text-[9px] font-bold px-2 py-0.5 rounded-full border border-[#A855F7]/30">Verified</div>
                    </div>
                    <p className="text-[#B3B3B3] text-xs">UPSC CSE Mentor · {teacher.expertise}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400 icon-glow-purple" />)}
                      <span className="text-[10px] text-[#777777] ml-1">4.9 · {teacher.students}</span>
                    </div>
                  </div>
                </div>

                {/* Credentials */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 stagger">
                  {[
                    { icon: GraduationCap, label: teacher.years,    bg: "bg-[#A855F7]/10", border: "border-[#A855F7]/20", text: "text-[#A855F7]" },
                    { icon: Medal,         label: "45+ UPSC Clearances",    bg: "bg-amber-500/10",  border: "border-amber-500/20",  text: "text-amber-400" },
                    { icon: Users,         label: teacher.students,        bg: "bg-[#EC4899]/10",   border: "border-[#EC4899]/20",   text: "text-[#EC4899]" },
                    { icon: Award,         label: teacher.success,       bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400" },
                  ].map((c) => (
                    <div key={c.label} className={`flex items-center gap-2 ${c.bg} border ${c.border} rounded-xl p-2.5 hover-scale-sm press`}>
                      <c.icon className={`w-3.5 h-3.5 ${c.text} shrink-0 icon-glow-purple`} />
                      <span className="text-[10px] font-semibold text-[#B3B3B3]">{c.label}</span>
                    </div>
                  ))}
                </div>

                {/* Teacher's Courses */}
                {teacherCourses.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#A855F7]/20">
                    <p className="text-[9px] text-[#777777] font-semibold uppercase tracking-wide mb-2">Courses by {teacher.name}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {teacherCourses.map(course => (
                        <div
                          key={course.id}
                          onClick={() => navigate(`/courses/${course.id}`)}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-[#0D0D0D]/50 border border-[#A855F7]/20 hover:border-[#A855F7]/40 transition-all cursor-pointer hover-scale-sm press"
                        >
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A855F7]/20 to-[#EC4899]/20 flex items-center justify-center text-xl shrink-0">
                            {course.thumbnail_emoji || "📚"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-xs text-white truncate">{course.title}</h4>
                            <p className="text-[10px] text-[#777777]">{course.category}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#A855F7] shrink-0 icon-glow-purple" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ══ WHY CHOOSE US ══ */}
      <div className="reveal glass-card rounded-3xl p-5 neon-border">
        <h2 className="text-lg font-bold text-white mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Why Choose Us?</h2>
        <p className="text-[#777777] text-xs mb-4">Smart, effective, proven UPSC prep</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { icon: Brain,    title: "Concept-First Approach",  desc: "Deep understanding over rote learning",     color: "text-[#A855F7]", bg: "bg-[#A855F7]/10", border: "border-[#A855F7]/20" },
            { icon: FileText, title: "Smart Notes",             desc: "AI-enhanced notes with visual mnemonics",   color: "text-[#EC4899]",   bg: "bg-[#EC4899]/10",   border: "border-[#EC4899]/20" },
            { icon: Pen,      title: "Answer Writing Practice", desc: "Daily practice with mentor feedback",        color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20" },
            { icon: Heart,    title: "Community Support",       desc: "Connect with fellow aspirants 24/7",        color: "text-rose-400",   bg: "bg-rose-500/10",   border: "border-rose-500/20" },
            { icon: MessageCircle, title: "Personal Mentorship", desc: "1-on-1 guidance from UPSC experts",        color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
          ].map((f, i) => (
            <div key={f.title} className={`reveal-left flex items-center gap-3 group-item press rounded-xl px-3 py-3 ${f.bg} border ${f.border} transition-all hover:scale-[1.02] spotlight-card`} style={{ transitionDelay: `${i * 40}ms` }}>
              <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center shrink-0 relative z-[1] icon-glass`}>
                <f.icon className={`w-5 h-5 ${f.color} bounce-on-hover icon-glow-purple`} />
              </div>
              <div className="flex-1 min-w-0 relative z-[1]">
                <h4 className="font-semibold text-sm text-white">{f.title}</h4>
                <p className="text-[#777777] text-[10px]">{f.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#777777] shrink-0 relative z-[1] icon-glow-purple" />
            </div>
          ))}
        </div>
      </div>

      {/* ══ ANNOUNCEMENTS ══ */}
      {announcements.length > 0 && (
        <div className="reveal">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-base text-white">Announcements</h3>
            <button onClick={() => navigate("/notifications")} className="text-[#A855F7] text-xs font-semibold link-underline flex items-center gap-1">
              View all <ChevronRight className="w-3.5 h-3.5 icon-glow-purple" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {announcements.slice(0, 4).map((a, i) => (
              <div
                key={a.id}
                className="reveal glass-card rounded-2xl p-3.5 flex items-start gap-3 card-interactive neon-border"
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  a.type === "info" ? "bg-[#A855F7]/15" : a.type === "success" ? "bg-emerald-500/15" : "bg-amber-500/15"
                } icon-glass`}>
                  <Bell className={`w-4 h-4 ${
                    a.type === "info" ? "text-[#A855F7] icon-glow-purple" : a.type === "success" ? "text-emerald-400 icon-glow-purple" : "text-amber-400 icon-glow-purple"
                  }`} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-sm text-white">{a.title}</h4>
                  <p className="text-[#777777] text-xs line-clamp-1 mt-0.5">{a.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ STUDENT REVIEWS — infinite auto-scroll carousel ══ */}
      <div className="reveal">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>Student Wall</h2>
            <div className="flex items-center gap-0.5 mt-0.5">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}
              <span className="text-[10px] font-bold text-[#777777] ml-1">4.9/5 · 500+ Reviews</span>
            </div>
          </div>
        </div>
        <div className="carousel-wrapper -mx-4">
          <div className="carousel-track px-4 gap-3">
            {[...reviews, ...reviews].map((r, i) => (
              <div
                key={i}
                className="glass-card rounded-3xl p-4 w-[268px] shrink-0 card-interactive neon-border"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[9px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-purple-500/30">
                    <Medal className="w-2.5 h-2.5" />
                    {r.rank}
                  </div>
                  <span className="text-[10px] text-[#777777]">{r.year}</span>
                </div>
                <Quote className="w-6 h-6 text-[#A855F7]/30 mb-1.5" />
                <p className="text-[#B3B3B3] text-xs leading-relaxed mb-3">"{r.text}"</p>
                <div className="flex items-center gap-2.5 pt-2.5 border-t border-[#A855F7]/20">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A855F7] to-[#EC4899] flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0">
                    {r.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white">{r.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="w-2.5 h-2.5 text-[#777777]" />
                      <p className="text-[10px] text-[#777777]">{r.location}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(r.rating)].map((_, j) => <Star key={j} className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ FAQ SECTION ══ */}
      <div className="reveal glass-card rounded-3xl p-5 neon-border">
        <h2 className="text-lg font-bold text-white mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Frequently Asked Questions</h2>
        <p className="text-[#777777] text-xs mb-4">Everything you need to know before enrolling</p>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                openFaq === i ? 'border-[#A855F7]/40 shadow-sm shadow-[#A855F7]/15 bg-[#A855F7]/5' : 'border-[#A855F7]/20 bg-[#0D0D0D]/30'
              }`}
            >
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-left gap-3 press"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="text-sm font-semibold text-white leading-snug">{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#A855F7] shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`}
                />
              </button>
              <div className={`faq-answer ${openFaq === i ? 'open' : ''}`}>
                <p className="text-[#B3B3B3] text-xs leading-relaxed px-4 pb-3.5">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ FINAL CTA / MOTIVATION BANNER ══ */}
      <div className="reveal relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#A855F7]/80 via-[#1a1040] to-[#EC4899]/50 p-6 shadow-[0_0_40px_rgba(168,85,247,0.3)] text-center neon-border animate-gradient-shift" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.8), rgba(26,16,64,1), rgba(236,72,153,0.5))', backgroundSize: '200% 200%' }}>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#A855F7]/20 rounded-full blur-3xl animate-float pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-[#EC4899]/20 rounded-full blur-3xl animate-float-reverse pointer-events-none" />
        <div className="relative z-10">
          <p className="text-[#C084FC]/70 text-[10px] font-semibold uppercase tracking-widest mb-2">Ready to Transform?</p>
          <h2 className="text-white font-extrabold text-xl mb-1 animate-text-glow" style={{ fontFamily: 'Poppins, sans-serif' }}>
            "The future belongs to those<br />who <span className="text-shimmer">prepare</span> for it today"
          </h2>
          <p className="text-[#B3B3B3] text-xs mb-5">Join 50K+ aspirants on the path to IAS · First 2 lectures free</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/courses')}
              className="btn-action ripple text-sm font-extrabold px-7 py-3.5 rounded-full urgency-pulse"
            >
              Start Your Journey 🚀
            </button>
            <button
              onClick={() => navigate('/live-classes')}
              className="bg-[#0D0D0D]/50 text-white text-sm font-semibold px-6 py-3.5 rounded-full border border-[#A855F7]/30 hover:bg-[#0D0D0D]/70 hover:border-[#A855F7]/50 transition-all press shadow-[0_0_15px_rgba(168,85,247,0.1)]"
            >
              Watch Demo
            </button>
          </div>
        </div>
      </div>

      {/* ══ MY RESULTS ══ */}
      <div
        className="reveal glass-card rounded-3xl p-4 cursor-pointer flex items-center gap-4 card-interactive ripple neon-glow neon-border"
        onClick={() => navigate("/results")}
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#A855F7] to-[#EC4899] flex items-center justify-center shadow-[0_0_25px_rgba(168,85,247,0.4)] shrink-0 animate-float-slow">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm text-white">My Performance</h4>
          <p className="text-[#777777] text-xs">Track quiz scores & analytics</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#A855F7]/15 flex items-center justify-center hover-scale border border-[#A855F7]/30">
          <ChevronRight className="w-4 h-4 text-[#A855F7]" />
        </div>
      </div>

      {/* ══ AI MENTOR FLOATING BUTTON ══ */}
      <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-40">
        <button 
          onClick={() => navigate('/doubts')}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-[#A855F7] to-[#EC4899] flex items-center justify-center shadow-[0_0_35px_rgba(168,85,247,0.5)] hover:scale-110 transition-all animate-float-slow neon-glow-purple animate-glow-breathe"
        >
          <Brain className="w-6 h-6 text-white" />
        </button>
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-[#050505] animate-pulse" />
      </div>

    </div>
  );
};

export default HomePage;
