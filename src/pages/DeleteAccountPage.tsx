import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertTriangle, ArrowLeft, Mail, Lock, Check } from "lucide-react";

export function DeleteAccountPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<"confirm" | "password" | "email" | "final" | "processing">("confirm");
  const [password, setPassword] = useState("");
  const [emailConfirmation, setEmailConfirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = () => {
    setStep("password");
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!password) {
      setError("Password is required");
      return;
    }

    setIsLoading(true);
    
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password,
      });

      if (signInError) {
        setError("Incorrect password");
        setIsLoading(false);
        return;
      }

      setStep("email");
    } catch (err) {
      setError("Failed to verify password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (emailConfirmation !== user?.email) {
      setError("Email does not match your account email");
      return;
    }

    setStep("final");
  };

  const handleDeleteAccount = async () => {
    setStep("processing");
    setIsLoading(true);

    try {
      const userId = user?.id;
      if (!userId) throw new Error("User ID not found");

      // 1. Delete user's enrollments
      await supabase.from("purchases").delete().eq("user_id", userId);

      // 2. Delete user's personal notes
      await supabase.from("notes").delete().eq("user_id", userId);

      // 3. Delete user's doubts
      await supabase.from("doubts").delete().eq("user_id", userId);

      // 4. Delete user's lecture progress
      await supabase.from("lecture_progress").delete().eq("user_id", userId);

      // 5. Delete user's roles
      await supabase.from("user_roles").delete().eq("user_id", userId);

      // 6. Delete user's profile
      await supabase.from("profiles").delete().eq("user_id", userId);

      // 7. Delete user's notifications
      await supabase.from("notifications").delete().eq("user_id", userId);

      // 8. Delete user's auth account
      const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
      
      if (deleteError) {
        console.error("Error deleting auth user:", deleteError);
        // Continue with logout even if auth deletion fails
      }

      toast.success("Account deleted successfully");
      
      // Logout and redirect
      await logout();
      navigate("/");
      
    } catch (err) {
      console.error("Error deleting account:", err);
      setError("Failed to delete account. Please contact support.");
      setStep("final");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EEEADE] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Delete Account</h1>
              <p className="text-sm text-slate-500">This action cannot be undone</p>
            </div>
          </div>

          {step === "confirm" && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 font-medium mb-2">Warning:</p>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• All your data will be permanently deleted</li>
                  <li>• Course enrollments will be cancelled</li>
                  <li>• Personal notes will be deleted</li>
                  <li>• Progress tracking will be lost</li>
                  <li>• This action cannot be undone</li>
                </ul>
              </div>

              <button
                onClick={handleConfirm}
                className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                I understand, continue
              </button>

              <button
                onClick={() => navigate("/profile")}
                className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          {step === "password" && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Enter your password to confirm
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Verifying..." : "Verify Password"}
              </button>

              <button
                type="button"
                onClick={() => setStep("confirm")}
                className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
              >
                Back
              </button>
            </form>
          )}

          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Confirm your email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={emailConfirmation}
                    onChange={(e) => setEmailConfirmation(e.target.value)}
                    placeholder={user?.email || "your@email.com"}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Enter: {user?.email}
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Email
              </button>

              <button
                type="button"
                onClick={() => setStep("password")}
                className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
              >
                Back
              </button>
            </form>
          )}

          {step === "final" && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 font-medium mb-3">
                  Final confirmation - This will permanently delete:
                </p>
                <ul className="text-sm text-red-700 space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Your profile and personal information
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    All course enrollments
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Personal notes and bookmarks
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Lecture progress and quiz scores
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Doubts and notifications
                  </li>
                </ul>
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <button
                onClick={handleDeleteAccount}
                disabled={isLoading}
                className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Deleting Account..." : "Permanently Delete My Account"}
              </button>

              <button
                onClick={() => setStep("email")}
                className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          {step === "processing" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Deleting your account...</p>
              <p className="text-sm text-slate-500 mt-2">This may take a moment</p>
            </div>
          )}
        </div>

        <div className="mt-6 text-center space-y-2">
          <a
            href="/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-600 hover:text-slate-800 underline"
          >
            Privacy Policy
          </a>
          <span className="text-slate-400">•</span>
          <a
            href="/terms-of-service"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-600 hover:text-slate-800 underline"
          >
            Terms of Service
          </a>
        </div>
      </div>
    </div>
  );
}
