import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const ResetPasswordPage = () => {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if we have the access token in the URL (from Supabase password reset)
    const accessToken = searchParams.get("access_token");
    if (!accessToken) {
      toast.error("Invalid or expired reset link");
      navigate("/forgot-password");
    }
  }, [searchParams, navigate]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    const success = await updatePassword(newPassword);
    setLoading(false);

    if (success) {
      toast.success("Password reset successfully");
      navigate("/login");
    } else {
      toast.error("Failed to reset password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7FA] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </button>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center mb-4">
              <Lock className="w-7 h-7 text-violet-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">Reset Password</h1>
            <p className="text-slate-500 text-sm mt-2 text-center">Enter your new password below</p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="newPassword" className="text-xs font-semibold text-slate-500 uppercase tracking-wide">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Min. 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="rounded-xl border-slate-200 bg-slate-50 h-12 pl-4 text-slate-800 focus:border-violet-300 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="rounded-xl border-slate-200 bg-slate-50 h-12 pl-4 text-slate-800 focus:border-violet-300 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-pink-500 text-white py-3.5 rounded-xl text-sm font-semibold mt-2 shadow-sm hover:shadow-md transition-all disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Resetting...
                </span>
              ) : 'Reset Password'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <p className="text-center text-xs text-slate-400">
              Your password has been reset. You can now log in with your new password.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
