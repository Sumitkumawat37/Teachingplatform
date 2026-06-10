import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, Send, CheckCircle, GraduationCap, Target, BookOpen, MessageSquare, Clock, Award, Lightbulb, Users, Mail as MailIcon } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import teacherBanner from "../assets/teacher-banner.jpg";
import shivamSaxena from "../assets/shivam-saxena.jpg";

const MentoringPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.name || "",
    email: user?.email || "",
    phone: "",
    attempt: "",
    preparationStage: "",
    optionalSubject: "",
    preferredLanguage: "",
    mentoringTopic: "",
    message: "",
  });

  const benefits = [
    { icon: Target, title: "Personalized Study Plan", description: "Custom roadmap tailored to your strengths and weaknesses" },
    { icon: Lightbulb, title: "Strategy Discussion", description: "Expert guidance on exam strategy and time management" },
    { icon: BookOpen, title: "Answer Writing Guidance", description: "Learn the art of writing high-scoring answers" },
    { icon: Award, title: "Interview Preparation", description: "Mock interviews and personality development tips" },
    { icon: Users, title: "Motivation & Accountability", description: "Stay motivated with regular check-ins and support" },
    { icon: MessageSquare, title: "Doubt Resolution", description: "Get your doubts cleared by expert faculty" },
  ];

  const mentors = [
    {
      name: "Nadiya Khan",
      subject: "Polity & Governance",
      bio: "Net qualified faculty / Criminal Lawyer .",
      email: "nadiyakhan0205@gmail.com",
      photo: teacherBanner
    },
    {
      name: "Shivam Saxena",
      subject: "Mentoring & Polity",
      bio: "2 Times UPSC-CSE mains Qualified.",
      email: "shivam24892@gmail.com",
      photo: shivamSaxena
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("mentoring_requests" as any)
        .insert({
          user_id: user?.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          attempt: formData.attempt ? parseInt(formData.attempt) : null,
          preparation_stage: formData.preparationStage,
          optional_subject: formData.optionalSubject,
          preferred_language: formData.preferredLanguage,
          mentoring_topic: formData.mentoringTopic,
          message: formData.message,
          status: "pending",
          created_at: new Date().toISOString(),
        });

      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting mentoring request:", err);
      alert("Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl p-8 text-center shadow-sm border border-emerald-100/40" style={{ background: '#ECFFF3' }}>
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Your mentoring request has been submitted successfully. Our team will contact you shortly.
          </h2>
          <p className="text-slate-600 text-sm mb-6">
            We will review your request and get back to you within 24-48 hours.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-emerald-600 text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-emerald-700 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl p-8 border border-violet-100/40" style={{ background: 'linear-gradient(135deg, #F3EEFF 0%, #FFEAF4 100%)' }}>
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/70 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <GraduationCap className="w-8 h-8 text-violet-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            1:1 Mentoring with Expert Faculty
          </h1>
          <p className="text-slate-600 text-sm max-w-2xl mx-auto">
            Guidance for UPSC preparation, strategy building, answer writing, optional subjects, interview preparation, and personalized study planning.
          </p>
        </div>
      </div>

      {/* Benefits Section */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
          What You'll Get
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="rounded-2xl p-5 shadow-sm border border-slate-100/60 bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-250"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center mb-3 shadow-sm">
                <benefit.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-sm text-slate-800 mb-1">{benefit.title}</h3>
              <p className="text-[11px] text-slate-500">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Meet Your Mentors */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Meet Your Mentors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mentors.map((mentor) => (
            <div
              key={mentor.name}
              className="flex items-center gap-4 rounded-2xl p-4 shadow-sm border border-violet-100/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-250"
              style={{ background: '#F3EEFF' }}
            >
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-violet-200 shrink-0 shadow-sm bg-gradient-to-br from-violet-100 to-pink-100 flex items-center justify-center">
                <img
                  src={mentor.photo}
                  alt={mentor.name}
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-sm text-slate-800 truncate">{mentor.name}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-100 text-violet-600 shrink-0">Faculty</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">{mentor.subject}</p>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{mentor.bio}</p>
                <div className="flex items-center gap-1 mt-1.5">
                  <MailIcon className="w-3 h-3 text-violet-400" />
                  <span className="text-[10px] text-slate-400 truncate">{mentor.email}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mentoring Request Form */}
      <div className="rounded-2xl p-6 shadow-sm border border-slate-100/60 bg-white">
        <h2 className="text-lg font-semibold text-slate-800 mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Request Your Mentoring Session
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all text-sm text-slate-800"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all text-sm text-slate-800"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Mobile Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all text-sm text-slate-800"
                placeholder="Enter your mobile number"
              />
            </div>
          </div>

          {/* UPSC Attempt Number */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">UPSC Attempt Number</label>
            <input
              type="number"
              value={formData.attempt}
              onChange={(e) => setFormData({ ...formData, attempt: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all text-sm text-slate-800"
              placeholder="e.g., 1, 2, 3"
            />
          </div>

          {/* Current Preparation Stage */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Preparation Stage</label>
            <select
              required
              value={formData.preparationStage}
              onChange={(e) => setFormData({ ...formData, preparationStage: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all text-sm text-slate-800"
            >
              <option value="">Select your stage</option>
              <option value="beginner">Beginner - Just started</option>
              <option value="foundation">Foundation - 3-6 months</option>
              <option value="intermediate">Intermediate - 6-12 months</option>
              <option value="advanced">Advanced - 1+ years</option>
              <option value="mains">Mains Qualified</option>
              <option value="interview">Interview Stage</option>
            </select>
          </div>

          {/* Optional Subject */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Optional Subject</label>
            <input
              type="text"
              value={formData.optionalSubject}
              onChange={(e) => setFormData({ ...formData, optionalSubject: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all text-sm text-slate-800"
              placeholder="e.g., Geography, Political Science, Sociology"
            />
          </div>

          {/* Preferred Language */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Preferred Language</label>
            <select
              required
              value={formData.preferredLanguage}
              onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all text-sm text-slate-800"
            >
              <option value="">Select language</option>
              <option value="english">English</option>
              <option value="hindi">Hindi</option>
              <option value="both">Both English & Hindi</option>
            </select>
          </div>

          {/* Area Where Mentoring Is Needed */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Area Where Mentoring Is Needed</label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={formData.mentoringTopic}
                onChange={(e) => setFormData({ ...formData, mentoringTopic: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all text-sm text-slate-800"
                placeholder="e.g., Strategy Building, Answer Writing, Interview Prep"
              />
            </div>
          </div>

          {/* Detailed Message */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Detailed Message</label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all text-sm resize-none text-slate-800"
                placeholder="Describe your specific requirements and expectations from the mentoring session..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 to-pink-500 text-white font-semibold py-3 rounded-xl hover:from-violet-700 hover:to-pink-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Request
              </>
            )}
          </button>

          {/* Payment Section */}
          <div className="mt-6 p-4 rounded-xl border border-amber-200 bg-amber-50">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold text-sm text-slate-800">Mentoring Session Fee</h3>
            </div>
            <p className="text-xs text-slate-600 mb-3">One-time payment of ₹100 for personalized mentoring session</p>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
              <div>
                <p className="text-sm font-semibold text-slate-800">₹100</p>
                <p className="text-[10px] text-slate-500">Payment required before session</p>
              </div>
              <button
                type="button"
                className="px-4 py-2 bg-amber-500 text-white text-xs font-semibold rounded-lg hover:bg-amber-600 transition-colors"
                onClick={() => {
                  alert("Payment integration will be added soon. Please contact admin for payment details.");
                }}
              >
                Pay Now
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MentoringPage;
