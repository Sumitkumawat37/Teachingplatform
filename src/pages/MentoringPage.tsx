import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, BookOpen, MessageSquare, Send, CheckCircle, Clock, GraduationCap } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";

const MentoringPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.name || "",
    email: user?.email || "",
    phone: "",
    subject: "",
    preferredTeacher: "",
    availability: "",
    goals: "",
    currentLevel: "",
  });

  const teachers = [
    { id: "nadiya", name: "Nadiya Khan", subject: "Polity & GS-2 Expert", color: "violet" },
    { id: "shivam", name: "Shivam Saxena", subject: "History & GS-1 Expert", color: "pink" },
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
          subject: formData.subject,
          preferred_teacher: formData.preferredTeacher,
          availability: formData.availability,
          goals: formData.goals,
          current_level: formData.currentLevel,
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
            Request Submitted Successfully!
          </h2>
          <p className="text-slate-600 text-sm mb-6">
            Your mentoring request has been received. Our team will contact you within 24-48 hours to schedule your session.
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
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl p-5 border border-violet-100/40" style={{ background: 'linear-gradient(135deg, #F3EEFF 0%, #FFEAF4 100%)' }}>
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center shadow-sm">
            <GraduationCap className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
              1:1 Mentoring Request
            </h1>
            <p className="text-slate-500 text-xs">Get personalized guidance from our expert faculty</p>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-2xl p-4 shadow-sm border border-violet-100/40" style={{ background: '#F3EEFF' }}>
          <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center mb-2">
            <User className="w-5 h-5 text-violet-600" />
          </div>
          <h3 className="font-semibold text-sm text-slate-800">Personal Attention</h3>
          <p className="text-[11px] text-slate-500 mt-1">Get 1:1 guidance tailored to your needs</p>
        </div>
        <div className="rounded-2xl p-4 shadow-sm border border-pink-100/40" style={{ background: '#FFEAF4' }}>
          <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center mb-2">
            <Clock className="w-5 h-5 text-pink-600" />
          </div>
          <h3 className="font-semibold text-sm text-slate-800">Flexible Timing</h3>
          <p className="text-[11px] text-slate-500 mt-1">Schedule sessions at your convenience</p>
        </div>
        <div className="rounded-2xl p-4 shadow-sm border border-emerald-100/40" style={{ background: '#ECFFF3' }}>
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="font-semibold text-sm text-slate-800">Expert Guidance</h3>
          <p className="text-[11px] text-slate-500 mt-1">Learn from UPSC experts with proven track record</p>
        </div>
      </div>

      {/* Mentoring Form */}
      <div className="rounded-2xl p-6 shadow-sm border border-slate-100/60 bg-white">
        <h2 className="text-lg font-semibold text-slate-800 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all text-sm"
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all text-sm"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all text-sm"
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          {/* Preferred Teacher */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Preferred Teacher</label>
            <div className="grid grid-cols-2 gap-3">
              {teachers.map((teacher) => (
                <button
                  key={teacher.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, preferredTeacher: teacher.name })}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    formData.preferredTeacher === teacher.name
                      ? `border-${teacher.color}-500 bg-${teacher.color}-50`
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="text-center">
                    <p className="font-semibold text-sm text-slate-800">{teacher.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{teacher.subject}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Current Level */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Preparation Level</label>
            <select
              required
              value={formData.currentLevel}
              onChange={(e) => setFormData({ ...formData, currentLevel: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all text-sm"
            >
              <option value="">Select your level</option>
              <option value="beginner">Beginner - Just started</option>
              <option value="intermediate">Intermediate - 6-12 months</option>
              <option value="advanced">Advanced - 1+ years</option>
              <option value="mains">Mains Qualified</option>
              <option value="interview">Interview Stage</option>
            </select>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Preferred Availability</label>
            <select
              required
              value={formData.availability}
              onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all text-sm"
            >
              <option value="">Select your preference</option>
              <option value="morning">Morning (9 AM - 12 PM)</option>
              <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
              <option value="evening">Evening (5 PM - 9 PM)</option>
              <option value="weekend">Weekend Only</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>

          {/* Subject/Topic */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject/Topic for Mentoring</label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all text-sm"
                placeholder="e.g., Polity, Essay Writing, Answer Writing"
              />
            </div>
          </div>

          {/* Goals */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Your Goals & Expectations</label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <textarea
                required
                rows={4}
                value={formData.goals}
                onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all text-sm resize-none"
                placeholder="Describe what you hope to achieve from this mentoring session..."
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
        </form>
      </div>
    </div>
  );
};

export default MentoringPage;
