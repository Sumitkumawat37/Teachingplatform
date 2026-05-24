import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { useNavigate, Link } from "react-router-dom";
import { GraduationCap, ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";

const ForgotPasswordPage = () => {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const success = await resetPassword(email);
      if (success) {
        toast.success("Password reset link sent to your email");
        navigate("/login");
      } else {
        toast.error("Failed to send reset link. Please try again.");
      }
    } catch (err: any) {
      console.error('Password reset error:', err);
      toast.error(err.message || "Failed to send reset link. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F7F7FA] flex flex-col md:flex-row">

      {/* LEFT: branding */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-violet-500 to-pink-500 pt-14 pb-20 px-6 flex flex-col items-center md:w-1/2 md:min-h-screen md:pt-0 md:pb-0 md:items-start md:justify-center md:px-14">
        <div className="relative z-10 flex flex-col items-center text-center md:items-start md:text-left">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
            <Mail className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Reset Password
          </h1>
          <p className="text-violet-100 text-sm md:text-base mt-1.5 md:mt-3">Enter your email to receive a password reset link</p>
        </div>
      </div>

      {/* RIGHT: form */}
      <div className="flex-1 flex items-start md:items-center justify-center px-4 pt-0 pb-8 md:py-0 -mt-8 md:mt-0 relative z-10">
        <div className="w-full max-w-sm">
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </button>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-5">
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="rounded-xl border-slate-200 bg-slate-50 h-12 pl-4 text-slate-800 focus:border-violet-300 focus:ring-2 focus:ring-violet-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-600 to-pink-500 text-white py-3.5 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-70"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : 'Send Reset Link'}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <p className="text-center text-xs text-slate-400">
                We'll send a password reset link to your email address
              </p>
            </div>
          </div>

          <p className="text-center text-sm text-slate-500 mt-5">
            Remember your password?{' '}
            <Link to="/login" className="text-violet-600 font-semibold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
