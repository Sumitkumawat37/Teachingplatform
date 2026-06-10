import { useState, useEffect } from "react";

import { Play, FileText, BookOpen, TrendingUp, Star, Video, Users, ChevronRight, GraduationCap, CheckCircle, Clock, Shield, ChevronDown, Brain, BookMarked, Mail, Youtube } from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "@/lib/auth-context";

import { usePurchase } from "@/lib/purchase-context";

import { useCourses, useAnnouncements, useLiveClasses } from "@/lib/supabase-data";

import { useScrollReveal } from "@/hooks/useScrollReveal";

import { AnimatedCounter } from "@/components/AnimatedCounter";

import { supabase } from "@/integrations/supabase/client";

import teacherBanner from "../assets/teacher-banner.jpg";



const reviews = [

  { name: "Priya Sharma", rank: "AIR 287", year: "UPSC 2024", location: "Delhi", text: "Nadiya Ma'am's structured approach cleared every concept. From polity to GS-2, I aced it all. Highly recommend!", rating: 5 },

  { name: "Rahul Verma", rank: "AIR 412", year: "UPSC 2023", location: "Mumbai", text: "Best mentor I've found online. Doubt replies are super fast and live classes are genuinely gold.", rating: 5 },

  { name: "Ananya Singh", rank: "Mains Qualified", year: "UPSC 2024", location: "Bengaluru", text: "The notes + quiz combo is brilliant. Cracked prelims on first attempt. No coaching centre needed!", rating: 5 },

  { name: "Mohammed Aslam", rank: "AIR 189", year: "UPSC 2024", location: "Hyderabad", text: "Affordable, structured, and the live tests kept me on track. Cleared with AIR 189. Life-changing!", rating: 5 },

];



const programs = [

  { icon: Video,    label: "Live Classes",  desc: "Daily 2–3 hr sessions with Nadiya Ma'am",  grad: "from-purple-500 to-pink-500",  path: "/live-classes", badge: "Most Popular", bg: "#F3EEFF" },

  { icon: BookOpen, label: "Video Courses", desc: "Self-paced recorded lectures, rewatch anytime", grad: "from-violet-500 to-purple-500", path: "/courses", badge: null, bg: "#EAF6FF" },

  { icon: FileText, label: "Study Notes",   desc: "Curated notes, PYQs & PDF downloads",       grad: "from-pink-500 to-rose-500", path: "/notes",        badge: "500+ Notes", bg: "#FFEAF4" },

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

  const [teacherProfiles, setTeacherProfiles] = useState<any[]>([]);
  const [reviewVideos, setReviewVideos] = useState<any[]>([]);



  const upcomingLive = liveClasses.filter((c) => c.status === "upcoming");

  const purchasedCourses = courses.filter((c) => hasPurchased(c.id));



  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const scrollRef = useScrollReveal();

  useEffect(() => {
    const fetchTeacherProfiles = async () => {
      try {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("user_id")
          .eq("role", "teacher" as any);
        
        const teacherIds = roleData?.map((r: any) => r.user_id) || [];
        
        if (teacherIds.length > 0) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .in("user_id", teacherIds);
          setTeacherProfiles(data || []);
        }
      } catch (err) {
        console.error("Error fetching teacher profiles:", err);
      }
    };
    fetchTeacherProfiles();
  }, []);

  useEffect(() => {
    const fetchReviewVideos = async () => {
      try {
        const { data } = await supabase
          .from("course_review_videos" as any)
          .select("*")
          .order("created_at", { ascending: false })
          .limit(6);
        setReviewVideos(data || []);
      } catch (err) {
        console.error("Error fetching review videos:", err);
      }
    };
    fetchReviewVideos();
  }, []);



  return (

    <div className="space-y-10" ref={scrollRef}>



      {/* ══ HERO SECTION ══ */}

      <div className="relative overflow-hidden rounded-[32px] p-8 sm:p-10 md:p-12 border border-white/20" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #C084FC 40%, #F9A8D4 100%)' }}>

        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 sm:gap-8 relative z-10">

          <div className="flex-1 w-full text-center sm:text-left">

            <h1 className="text-white font-bold text-[24px] sm:text-[28px] md:text-4xl leading-tight mb-6 text-center sm:text-left" style={{ fontFamily: 'Poppins, sans-serif' }}>

              Chalo Gen Z<br /><span className="text-white/90">padhte hai!</span>

            </h1>



            <div className="flex gap-3 justify-center sm:justify-start">

              <button

                onClick={() => navigate('/courses')}

                className="bg-white text-violet-700 text-xs sm:text-sm font-semibold px-6 sm:px-8 py-3 sm:py-3.5 rounded-full hover:-translate-y-0.5 transition-all"

                style={{ boxShadow: '0 10px 24px rgba(139,92,246,0.18)' }}

              >

                Start Learning Now

              </button>

              <button

                onClick={() => navigate('/courses')}

                className="bg-white/10 text-white text-xs sm:text-sm font-semibold px-5 sm:px-7 py-3 sm:py-3.5 rounded-full border border-white/25 hover:bg-white/20 transition-all"

              >

                Explore Courses

              </button>

            </div>

          </div>



          {/* Teacher photo */}

          <div className="relative shrink-0 mx-auto sm:mx-0">

            <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-2xl overflow-hidden border-2 border-white/30 shadow-lg">

              <img src={teacherBanner} alt="Nadiya Ma'am" className="w-full h-full object-cover object-top scale-110" loading="lazy" />

            </div>

          </div>

        </div>

      </div>



      {/* ══ STATS CARDS ══ */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

        {[

          { icon: Users,      value: 50000, suffix: "+",  label: "Aspirants",      grad: "from-violet-500 to-purple-600", bg: "#F3EEFF" },

          { icon: Clock,      value: 500,   suffix: "+",  label: "Hours Content",      grad: "from-pink-500 to-rose-500", bg: "#FFEAF4" },

          { icon: BookMarked, value: 10000, suffix: "+",  label: "PYQs Solved",           grad: "from-amber-500 to-orange-500", bg: "#FFF8E7" },

          { icon: Star,       value: 49,    suffix: "/5★", label: "Top Rated", grad: "from-emerald-500 to-teal-500", bg: "#ECFFF3" },

        ].map((s) => (

          <div

            key={s.label}

            className="rounded-2xl p-4 text-center shadow-sm border border-slate-100/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-250"

            style={{ background: s.bg }}

          >

            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${s.grad} flex items-center justify-center mx-auto mb-2 shadow-sm`}>

              <s.icon className="w-4 h-4 text-white" />

            </div>

            <p className="text-lg font-bold text-slate-800">

              {s.suffix === "/5★" ? <><AnimatedCounter end={s.value} duration={1200} /><span className="text-sm">/5★</span></> : <AnimatedCounter end={s.value} suffix={s.suffix} duration={1500} />}

            </p>

            <p className="text-[10px] text-slate-500 font-medium mt-0.5">{s.label}</p>

          </div>

        ))}

      </div>



      {/* ══ MEET YOUR MENTORS ══ */}
      {teacherProfiles.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Meet Your Mentors</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {teacherProfiles.map((teacher) => (
              <div
                key={teacher.user_id}
                className="flex items-center gap-4 rounded-2xl p-4 shadow-sm border border-violet-100/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-250"
                style={{ background: '#F3EEFF' }}
              >
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-violet-200 shrink-0 shadow-sm bg-gradient-to-br from-violet-100 to-pink-100 flex items-center justify-center">
                  {teacher.avatar_url ? (
                    <img
                      src={teacher.avatar_url}
                      alt={teacher.name || "Teacher"}
                      className="w-full h-full object-cover object-top"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget.style.display = 'none');
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = `<span class="text-violet-600 font-bold text-lg">${(teacher.name || "T").split(" ").map(n => n[0]).join("").slice(0, 2)}</span>`;
                        }
                      }}
                    />
                  ) : (
                    <span className="text-violet-600 font-bold text-lg">
                      {(teacher.name || "T").split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm text-slate-800 truncate">{teacher.name || "Teacher"}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-100 text-violet-600 shrink-0">Faculty</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">{teacher.subject || "UPSC Expert & Course Instructor"}</p>
                  {teacher.bio && <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{teacher.bio}</p>}
                  {teacher.email && (
                    <div className="flex items-center gap-1 mt-1.5">
                      <Mail className="w-3 h-3 text-violet-400" />
                      <span className="text-[10px] text-slate-400 truncate">{teacher.email}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}



      {/* ══ OUR PROGRAMS ══ */}

      <div>

        <h2 className="text-lg font-semibold text-slate-800 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Our Programs</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

          {programs.map((item) => (

            <div

              key={item.label}

              className="rounded-2xl p-4 cursor-pointer shadow-sm border border-slate-100/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-250"

              style={{ background: item.bg }}

              onClick={() => navigate(item.path)}

            >

              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.grad} flex items-center justify-center shadow-sm mb-3`}>

                <item.icon className="w-5 h-5 text-white" />

              </div>

              <h4 className="font-semibold text-sm text-slate-800">{item.label}</h4>

              <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">{item.desc}</p>

            </div>

          ))}

        </div>

      </div>



      {/* ══ LIVE CLASS CARD ══ */}

      {upcomingLive.length > 0 && (

        <div className="rounded-2xl p-5 shadow-sm border border-emerald-100/40" style={{ background: '#ECFFF3' }}>

          <div className="flex items-center justify-between mb-3">

            <div className="flex items-center gap-2">

              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />

              <span className="text-red-500 text-xs font-semibold uppercase tracking-wider">Live Now</span>

            </div>

            <button onClick={() => navigate('/live-classes')} className="text-violet-600 text-xs font-semibold flex items-center gap-1">

              View all <ChevronRight className="w-3.5 h-3.5" />

            </button>

          </div>

          <div>

            <h3 className="text-slate-800 font-semibold text-base">{upcomingLive[0]?.title || "Upcoming Live Class"}</h3>

            <p className="text-slate-500 text-xs mt-1">{upcomingLive[0]?.courses?.title || "Subject"}</p>

            <div className="flex items-center gap-3 mt-3">

              <button

                onClick={() => navigate('/live-classes')}

                className="bg-gradient-to-r from-violet-600 to-pink-500 text-white text-xs font-semibold px-5 py-2.5 rounded-full hover:-translate-y-0.5 transition-all flex items-center gap-2"

                style={{ boxShadow: '0 10px 24px rgba(139,92,246,0.18)' }}

              >

                <Play className="w-3.5 h-3.5" /> Join Now

              </button>

              <span className="text-slate-400 text-[11px]">

                <Clock className="w-3 h-3 inline mr-1" />

                {upcomingLive[0]?.scheduled_at ? new Date(upcomingLive[0].scheduled_at).toLocaleTimeString() : "Coming soon"}

              </span>

            </div>

          </div>

        </div>

      )}



      {/* ══ REVIEW VIDEOS ══ */}
      {reviewVideos.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800" style={{ fontFamily: 'Poppins, sans-serif' }}>Review Videos</h2>
            <button onClick={() => navigate('/review-videos')} className="text-violet-600 text-xs font-semibold flex items-center gap-1">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {reviewVideos.slice(0, 6).map((video) => (
              <div
                key={video.id}
                className="rounded-2xl overflow-hidden shadow-sm border border-slate-100/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 cursor-pointer"
                onClick={() => navigate('/review-videos')}
                style={{ background: '#F3EEFF' }}
              >
                <div className="relative aspect-video bg-black">
                  <img
                    src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="w-5 h-5 text-violet-600 ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="font-semibold text-xs text-slate-800 line-clamp-2">{video.title}</h4>
                  {video.description && (
                    <p className="text-slate-400 text-[10px] mt-1 line-clamp-2">{video.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}



      {/* ══ STUDENT REVIEWS ══ */}

      <div>

        <h2 className="text-lg font-semibold text-slate-800 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Student Reviews</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

          {reviews.slice(0, 2).map((r, i) => (

            <div

              key={i}

              className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100/60 hover:shadow-md hover:-translate-y-0.5 transition-all duration-250"

            >

              <div className="flex items-center gap-2 mb-2">

                <div className="bg-gradient-to-r from-violet-500 to-pink-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">

                  {r.rank}

                </div>

                <span className="text-[11px] text-slate-400">{r.year}</span>

              </div>

              <p className="text-slate-600 text-xs leading-relaxed mb-3">"{r.text}"</p>

              <div className="flex items-center gap-2">

                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold text-[10px] shrink-0">

                  {r.name.split(" ").map(n => n[0]).join("").slice(0, 2)}

                </div>

                <div className="min-w-0 flex-1">

                  <p className="text-xs font-semibold text-slate-700 truncate">{r.name}</p>

                  <p className="text-[10px] text-slate-400">{r.location}</p>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>



      {/* ══ FAQ SECTION ══ */}

      <div className="rounded-2xl p-5 shadow-sm border border-violet-100/30" style={{ background: '#F3EEFF' }}>

        <h2 className="text-lg font-semibold text-slate-800 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>FAQ</h2>

        <div className="space-y-2">

          {faqs.slice(0, 2).map((faq, i) => (

            <div

              key={i}

              className={`border rounded-xl overflow-hidden transition-all duration-300 ${

                openFaq === i ? 'border-violet-200 bg-white/80' : 'border-white/60 bg-white/50'

              }`}

            >

              <button

                className="w-full flex items-center justify-between px-4 py-3 text-left gap-3"

                onClick={() => setOpenFaq(openFaq === i ? null : i)}

              >

                <span className="text-sm font-medium text-slate-700 leading-snug">{faq.q}</span>

                <ChevronDown

                  className={`w-4 h-4 text-violet-500 shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`}

                />

              </button>

              <div className={`faq-answer ${openFaq === i ? 'open' : ''}`}>

                <p className="text-slate-500 text-xs leading-relaxed px-4 pb-3.5">{faq.a}</p>

              </div>

            </div>

          ))}

        </div>

      </div>



      {/* ══ FINAL CTA / MOTIVATION BANNER ══ */}

      <div className="relative overflow-hidden rounded-[32px] p-8 text-center" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #C084FC 50%, #F9A8D4 100%)' }}>

        <div className="relative z-10">

          <p className="text-white/60 text-[10px] font-semibold uppercase tracking-widest mb-2">Ready to Transform?</p>

          <h2 className="text-white font-bold text-xl mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>

            The future belongs to those<br />who prepare for it today

          </h2>

          <p className="text-white/70 text-xs mb-5">Join 50K+ aspirants on the path to IAS · First 2 lectures free</p>

          <div className="flex gap-3 justify-center">

            <button

              onClick={() => navigate('/courses')}

              className="bg-white text-violet-700 text-sm font-semibold px-7 py-3 rounded-full hover:-translate-y-0.5 transition-all"

              style={{ boxShadow: '0 10px 24px rgba(139,92,246,0.18)' }}

            >

              Start Your Journey

            </button>

            <button

              onClick={() => navigate('/review-videos')}

              className="bg-white/15 text-white text-sm font-semibold px-6 py-3 rounded-full border border-white/25 hover:bg-white/25 transition-all"

            >

              Watch Review

            </button>

          </div>

        </div>

      </div>



      {/* ══ AI MENTOR FLOATING BUTTON ══ */}

      <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-40">

        <button

          onClick={() => navigate('/doubts')}

          className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/30 hover:scale-105 transition-all"

        >

          <Brain className="w-5 h-5 text-white" />

        </button>

        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />

      </div>



    </div>

  );

};



export default HomePage;

