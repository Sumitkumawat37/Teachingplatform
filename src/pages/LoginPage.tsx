import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { useNavigate, Link } from "react-router-dom";
import { GraduationCap, Eye, EyeOff, Shield, Users, Star } from "lucide-react";
import { toast } from "sonner";

const LoginPage = () => {
  const { login, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      // Navigation handled by auth state change
    } else {
      toast.error("Invalid credentials. Please check email and password.");
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const success = await signInWithGoogle();
    setLoading(false);
    if (!success) {
      toast.error("Google sign-in failed. Please try again.");
    }
  };

  const featureItems = [
    { icon: Users,  text: "1000+ active students" },
    { icon: Star,   text: "4.1 rated platform" },
    { icon: Shield, text: "Expert guidance" },
  ];

  const proofItems = [
    { icon: Users,  label: "1000+ Students", color: "text-purple-400" },
    { icon: Star,   label: "4.1 Rating",       color: "text-amber-400" },
    { icon: Shield, label: "Expert Guidance",  color: "text-emerald-400" },
  ];

  return (
    <div className="min-h-screen bg-[#F7F7FA] flex flex-col md:flex-row">

      {/* LEFT: branding */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-violet-500 to-pink-500 pt-14 pb-20 px-6 flex flex-col items-center md:w-1/2 md:min-h-screen md:pt-0 md:pb-0 md:items-start md:justify-center md:px-14">
        <div className="relative z-10 flex flex-col items-center text-center md:items-start md:text-left">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
            UPSC by Nadiya Ma&apos;am
          </h1>
          <p className="text-violet-100 text-sm md:text-base mt-1.5 md:mt-3">Sign in to continue your UPSC prep</p>

          <div className="hidden md:flex flex-col gap-3 mt-10">
            {featureItems.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-violet-100 text-sm font-medium">{f.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT: form */}
      <div className="flex-1 flex items-start md:items-center justify-center px-4 pt-0 pb-8 md:py-0 -mt-8 md:mt-0 relative z-10">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-5">
            <h2 className="text-xl font-bold text-slate-800 mb-5 text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>Sign In</h2>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl border-slate-200 bg-slate-50 h-12 pl-4 text-slate-800 focus:border-violet-300 focus:ring-2 focus:ring-violet-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-xl border-slate-200 bg-slate-50 h-12 pl-4 pr-11 text-slate-800 focus:border-violet-300 focus:ring-2 focus:ring-violet-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-600 to-pink-500 text-white py-3.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-70"
                style={{ boxShadow: '0 10px 24px rgba(139,92,246,0.18)' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-violet-600 text-xs font-semibold hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-slate-400">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-slate-50 hover:bg-slate-100 text-slate-700 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-70 border border-slate-200"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-slate-500 mt-5">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-violet-600 font-semibold hover:underline">Sign Up</Link>
          </p>

          <div className="flex items-center justify-center gap-4 mt-5 pt-4 border-t border-slate-200">
            {proofItems.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.label} className="flex flex-col items-center gap-0.5">
                  <Icon className={`w-4 h-4 ${b.color}`} />
                  <span className="text-[9px] font-semibold text-slate-400 whitespace-nowrap">{b.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
