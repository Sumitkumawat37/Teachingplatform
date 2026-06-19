import { useState, useEffect } from "react";

import { Play, FileText, BookOpen, TrendingUp, Star, Video, Users, ChevronRight, GraduationCap, CheckCircle, Clock, Shield, ChevronDown, Skull, BookMarked, Mail, Youtube, X, ChevronLeft } from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "@/lib/auth-context";

import { usePurchase } from "@/lib/purchase-context";

import { useCourses, useAnnouncements, useLiveClasses } from "@/lib/supabase-data";

import { useScrollReveal } from "@/hooks/useScrollReveal";

import { AnimatedCounter } from "@/components/AnimatedCounter";

import { CustomVideoPlayer } from "@/components/CustomVideoPlayer";

import { SuccessStoriesCarousel } from "@/components/SuccessStoriesCarousel";

import { Dialog, DialogContent } from "@/components/ui/dialog";

import { supabase } from "@/integrations/supabase/client";

import teacherBanner from "../assets/teacher-banner.jpg";
import shivamSaxena from "../assets/shivam-saxena.jpg";



const reviews = [

  { name: "Priya Sharma", rank: "", year: "", location: "Delhi", text: "Nadiya Ma'am ki structured approach ne har concept clear kar diya. Polity se GS-2 tak sab acche se ho gaya. Highly recommend!", rating: 5 },

  { name: "Rahul Verma", rank: "", year: "", location: "Mumbai", text: "Best mentor online maine paya hai. Doubt replies bahut fast hain aur live classes genuinely gold hain.", rating: 5 },

  { name: "Ananya Singh", rank: "", year: "", location: "Bengaluru", text: "Notes + quiz combo brilliant hai. Pehli attempt mein prelims clear kar liya. Koi coaching centre ki zarurat nahi!", rating: 5 },

  { name: "Mohammed Aslam", rank: "", year: "", location: "Hyderabad", text: "Affordable, structured, aur live tests mujhe track par rakhte the. Life-changing experience!", rating: 5 },

  { name: "Sneha Gupta", rank: "", year: "", location: "Pune", text: "Mains preparation mein Nadiya Ma'am ka guidance bohot helpful tha. Answer writing tips ne meri score improve kiye. Thank you so much!", rating: 5 },

  { name: "Vikram Singh", rank: "", year: "", location: "Lucknow", text: "Live classes aur notes combination best hai. Time management bhi sikhaya gaya. Highly recommended for serious aspirants.", rating: 5 },

];



const programs = [

  { icon: Video,    label: "Live Classes",  desc: "Daily 2–3 hr sessions with Nadiya Ma'am",  grad: "from-purple-500 to-pink-500",  path: "/live-classes", badge: "Most Popular", bg: "#F3EEFF" },

  { icon: BookOpen, label: "Video Courses", desc: "Self-paced recorded lectures, rewatch anytime", grad: "from-violet-500 to-purple-500", path: "/courses", badge: null, bg: "#EAF6FF" },

  { icon: FileText, label: "Study Notes",   desc: "Curated notes, PYQs & PDF downloads",       grad: "from-pink-500 to-rose-500", path: "/notes",        badge: "500+ Notes", bg: "#FFEAF4" },

  { icon: Users,    label: "1:1 Mentoring", desc: "Personal guidance from expert faculties",  grad: "from-emerald-500 to-teal-500",  path: "/mentoring", badge: "New", bg: "#ECFFF3" },

];



const faqs = [
  { q: "Mentoring Course mujhe kya provide karega? 🙄", a: "Boss, simple hai! 😎\n\nKya padhna hai?\nUPSC ke liye right sources aur right topics.\n\nKaise padhna hai?\nPrelims + Mains dono ke liye proven study strategy.\n\nSources Ready-Made\nTaaki YouTube aur Telegram ke jungle mein na bhatko.\n\nPersonalized Time Table Guidance\nJob, college ya full-time preparation ke according.\n\nStudy Techniques\nWahi mistakes avoid karne ke liye jo aspirants ke 2-3 saal kha jaati hain.\n\nPlan B / Plan C Guidance\nUPSC dynamic hai. Safety net bhi zaroori hai.\n\nSab kuch sirf ₹499/- mein!" },
  { q: "Then what will be different in 1:1 Mentoring? 🧐", a: "Simple Boss! 😎\n\nHum aapke saath poori journey mein rahenge…jab tak aap Officer nahi ban jaate!\n\n📞 Personalized 1:1 Calls\nAapki strengths, weaknesses aur preparation level ke according guidance.\n\n🎯 Weekly Targets & Accountability\nTaaki consistency sirf motivation reel tak limited na rahe.\n\n📝 Mains Answer Evaluation\nRegular feedback ke saath answer writing improve karenge.\n\n📊 Personalized Study Plan\nAapke available time aur background ke hisaab se.\n\n🚨 Doubt Solving & Course Correction\nGalat direction mein jaane se pehle hi preparation ko track par laayenge.\n\nHow to Join?\n1:1 Mentoring ke liye ek separate application form fill karna hoga.\n\nEligibility:\nAptitude & seriousness assess karne ke liye ek screening test hoga.\n\n40%+ score karne wale aspirants 1:1 Mentoring ke liye eligible honge.\n\nSeats limited hongi, kyunki personal attention sabko dena possible nahi hota." },
  { q: "Polity & Governance course kya UPSC ke dynamic nature ko cater karta hai? 🤨", a: "100% Yes! 🔥\n\nUPSC sirf static Polity nahi puchta, balki usse current governance issues ke saath connect karke questions banata hai.\n\nIsliye course ko 3 phases mein design kiya gaya hai:\n\n📚 Phase 1: NCERT Foundation\nBasic concepts crystal clear karenge.\nKyuki strong building ki shuruaat strong foundation se hoti hai. 🏗️\n\n🏛️ Phase 2: Core Polity & Governance\nConstitution, Parliament, Judiciary, Federalism, Governance, Committees, Current Developments etc. ko UPSC-oriented approach se cover karenge.\n\n📝 Phase 3: PYQs + Mains Answer Writing\nUPSC ne pichle saalon mein kaise questions puche?\nUnka pattern kya hai?\nAur answers kaise likhne hain?\nSab scratch se sikhaya jayega.\n\nEverything in one course, aligned with how UPSC question setters actually think." },
  { q: "Course lene se pehle kaise pata chalega ki ye mere liye useful hai? 🙂", a: "Simple!\nPehli 4 Classes Bilkul FREE hain! (All Courses)\n\nDekhiye ki concepts aapko clear ho rahe hain ya nahi\n\nUske baad hi course continue karne ka decision lijiye.\n\nNo blind purchase. First learn, then decide!\n\n- Except (Mentoring)" },
  { q: "Notes available hain? Aur classes Live hongi ya Recorded?", a: "Dono milenge, Boss! 😎🔥\n\n📝 Notes Included FREE\nCourse ke saath structured notes provide kiye jayenge.\n\n🎥 Classes Live bhi hongi aur Recorded bhi!\n\nWith - Live Doubt Solving Sessions\nConcepts, strategy aur preparation related doubts discuss kiye jayenge!" },
  { q: "Will there be more courses coming up?", a: "Yes, absolutely!\n\nThis is just the beginning. More UPSC-focused courses are in the pipeline.\n\n🌍 International Relations (IR)\n🤝 Social Justice\n📈 Economy\n🏛️ Public Administration (Optional)\n🌐 PSIR (Political Science & International Relations - Optional)\n\nEach course will follow the same philosophy:\n\nStrong Fundamentals\nUPSC-Oriented Approach\nPYQ Integration\nAnswer Writing Focus\n\nOur goal is simple: build a complete UPSC ecosystem where aspirants can learn every subject with clarity and confidence.\n\nMore subjects. More guidance. Same mission." },
];



const HomePage = () => {

  const navigate = useNavigate();

  const { user } = useAuth();

  const { hasPurchased } = usePurchase();

  const { data: courses = [] } = useCourses();

  const { data: announcements = [] } = useAnnouncements();

  const { data: liveClasses = [] } = useLiveClasses();

  const [teacherProfiles, setTeacherProfiles] = useState<any[]>([]);



  const upcomingLive = Array.isArray(liveClasses) ? liveClasses.filter((c) => c.status === "upcoming") : [];

  const purchasedCourses = Array.isArray(courses) ? courses.filter((c) => hasPurchased(c.id)) : [];



  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const scrollRef = useScrollReveal();

  useEffect(() => {
    const fetchTeacherProfiles = async () => {
      try {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("user_id")
          .eq("role", "teacher" as any);
        
        const teacherIds = Array.isArray(roleData) ? roleData.map((r: any) => r.user_id) : [];
        
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

  // Hardcoded faculties to ensure both are always shown
  const hardcodedFaculties = [
    {
      user_id: "nadiya-khan",
      name: "Nadiya Khan",
      bio: "Net qualified faculty / Criminal Lawyer .",
      email: "nadiyakhan0205@gmail.com",
      avatar_url: teacherBanner
    },
    {
      user_id: "shivam-saxena",
      name: "Shivam Saxena",
      bio: "2 Times UPSC-CSE mains Qualified.",
      email: "shivam24892@gmail.com",
      avatar_url: shivamSaxena
    }
  ];

  const displayFaculties = hardcodedFaculties;



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

          { icon: Users,      value: 1000, suffix: "+",  label: "Aspirants",      grad: "from-violet-500 to-purple-600", bg: "#F3EEFF" },

          { icon: Clock,      value: 500,   suffix: "+",  label: "Hours Content",      grad: "from-pink-500 to-rose-500", bg: "#FFEAF4" },

          { icon: BookMarked, value: 5000, suffix: "+",  label: "PYQs Solved",           grad: "from-amber-500 to-orange-500", bg: "#FFF8E7" },

          { icon: Star,       value: 4.1,    suffix: "/5★", label: "Top Rated", grad: "from-emerald-500 to-teal-500", bg: "#ECFFF3" },

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
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Meet Your Mentors</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {displayFaculties.map((teacher) => (
              <div
                key={teacher.user_id}
                className="flex items-center gap-4 rounded-2xl p-4 shadow-sm border border-violet-100/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-slide-up"
                style={{ background: '#F3EEFF' }}
              >
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-violet-200 shrink-0 shadow-sm bg-gradient-to-br from-violet-100 to-pink-100 flex items-center justify-center animate-pulse-slow">
                  {teacher.avatar_url ? (
                    <img
                      src={teacher.avatar_url}
                      alt={teacher.name || "Teacher"}
                      className="w-full h-full object-cover object-top hover:scale-110 transition-transform duration-300"
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
                      {(teacher.name || "T").split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm text-slate-800 truncate">{teacher.name || "Teacher"}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-100 text-violet-600 shrink-0">Faculty</span>
                  </div>
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






      {/* ══ SUCCESS STORIES CAROUSEL ══ */}
      <SuccessStoriesCarousel
        playlistId="PLKqQrIhHYOc0"
        videoIds={["P-PhdwbhVyg", "MzsQ_yla2SI", "mSmMmWHGCBY", "9yn2XDmvoEM"]}
      />

      {/* ══ STUDENT REVIEWS ══ */}

      <div>

        <h2 className="text-lg font-semibold text-slate-800 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Student Reviews</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

          {Array.isArray(reviews) && reviews.slice(0, 2).map((r, i) => (

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

                  {(r.name || "").split(" ").map((n: string) => n[0]).join("").slice(0, 2)}

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

          {Array.isArray(faqs) && faqs.map((faq, i) => (

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

                <div className="text-slate-500 text-xs leading-relaxed px-4 pb-3.5 whitespace-pre-line">{faq.a}</div>

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

            Every topper was once a beginner<br />with strong basics ! 💀

          </h2>

          <p className="text-white/70 text-xs mb-5">Ready to begin with us ? ( first 4 lectures free )</p>

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

          <Skull className="w-5 h-5 text-white" />

        </button>

        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />

      </div>


    </div>

  );

};



export default HomePage;

