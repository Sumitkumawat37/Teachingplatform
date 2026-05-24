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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#A855F7]/80 via-[#1a1040] to-[#EC4899]/40 p-6 sm:p-8 md:p-10 shadow-[0_0_40px_rgba(168,85,247,0.3)] animate-fade-in neon-border">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 sm:gap-8 relative z-10">
          <div className="flex-1 w-full text-center sm:text-left">
            {/* Main headline */}
            <h1 className="text-white font-extrabold text-[24px] sm:text-[28px] md:text-4xl leading-tight mb-6 animate-slide-in-left animate-text-glow text-center sm:text-left" style={{ animationDelay: '0.08s', fontFamily: 'Poppins, sans-serif' }}>
              Chalo Gen Z<br /><span className="text-shimmer">padhte hai!</span>
            </h1>

            {/* CTAs */}
            <div className="flex gap-3 justify-center sm:justify-start animate-slide-in-left" style={{ animationDelay: '0.24s' }}>
              <button
                onClick={() => navigate('/courses')}
                className="btn-action ripple text-xs sm:text-sm font-extrabold px-6 sm:px-8 py-3 sm:py-4 rounded-full urgency-pulse"
              >
                Start Learning Now
              </button>
              <button
                onClick={() => navigate('/courses')}
                className="bg-[#0D0D0D]/50 backdrop-blur-sm text-white text-xs sm:text-sm font-semibold px-5 sm:px-7 py-3 sm:py-4 rounded-full border border-[#A855F7]/30 hover:bg-[#0D0D0D]/70 hover:border-[#A855F7]/50 transition-all ripple press shadow-[0_0_15px_rgba(168,85,247,0.1)]"
              >
                Explore Courses
              </button>
            </div>
          </div>

          {/* Teacher photo */}
          <div className="relative shrink-0 animate-slide-in-right mx-auto sm:mx-0">
            <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-2 border-[#A855F7]/40 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
              <img src={teacherBanner} alt="Nadiya Ma'am" className="w-full h-full object-cover object-top scale-110" loading="lazy" />
            </div>
          </div>
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

      {/* ══ OUR PROGRAMS ══ */}
      <div className="reveal">
        <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Our Programs</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {programs.map((item, i) => (
            <div
              key={item.label}
              className="reveal-scale glass-card rounded-2xl p-4 cursor-pointer card-interactive relative overflow-hidden"
              style={{ transitionDelay: `${i * 50}ms` }}
              onClick={() => navigate(item.path)}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.grad} flex items-center justify-center shadow-lg mb-3 relative z-[1]`}>
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-bold text-sm text-white relative z-[1]">{item.label}</h4>
              <p className="text-[#777777] text-[10px] mt-0.5 leading-relaxed relative z-[1]">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══ LIVE CLASS CARD ══ */}
      {upcomingLive.length > 0 && (
        <div className="reveal glass-card rounded-2xl p-5 neon-border relative overflow-hidden">
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
            <p className="text-[#B3B3B3] text-xs mt-1">{upcomingLive[0]?.courses?.title || "Subject"}</p>
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={() => navigate('/live-classes')}
                className="bg-gradient-to-r from-[#A855F7] to-[#EC4899] text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(236,72,153,0.5)] transition-all flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5 icon-glow-purple" /> Join Now
              </button>
              <span className="text-[#777777] text-[10px]">
                <Clock className="w-3 h-3 inline mr-1 icon-glow-purple" />
                {upcomingLive[0]?.scheduled_at ? new Date(upcomingLive[0].scheduled_at).toLocaleTimeString() : "Coming soon"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ══ STUDENT REVIEWS ══ */}
      <div className="reveal">
        <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Student Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {reviews.slice(0, 4).map((r, i) => (
            <div
              key={i}
              className="glass-card rounded-2xl p-4 neon-border"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full">
                  {r.rank}
                </div>
                <span className="text-[10px] text-[#777777]">{r.year}</span>
              </div>
              <p className="text-[#B3B3B3] text-xs leading-relaxed mb-3">"{r.text}"</p>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#A855F7] to-[#EC4899] flex items-center justify-center text-white font-bold text-[10px] shrink-0">
                  {r.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">{r.name}</p>
                  <p className="text-[10px] text-[#777777]">{r.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ FAQ SECTION ══ */}
      <div className="reveal glass-card rounded-2xl p-5 neon-border">
        <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>FAQ</h2>
        <div className="space-y-2">
          {faqs.slice(0, 3).map((faq, i) => (
            <div
              key={i}
              className={`border rounded-xl overflow-hidden transition-all duration-300 ${
                openFaq === i ? 'border-[#A855F7]/40 bg-[#A855F7]/5' : 'border-[#A855F7]/20 bg-[#0D0D0D]/30'
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
