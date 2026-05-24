import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";

export type Role = "student" | "admin" | "super_admin";

// Emails that get super_admin role (add yours here for production)
const SUPER_ADMIN_EMAILS = ["superadmin@demo.com"];

interface AuthState {
  isLoggedIn: boolean;
  role: Role;
  user: { name: string; email: string; id: string } | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  signUpWithGoogle: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<boolean>;
  logout: () => Promise<void>;
  switchRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    isLoggedIn: false,
    role: "student",
    user: null,
    loading: true,
  });

  // Prevent duplicate calls when both onAuthStateChange + getSession fire
  const lastSessionToken = useRef<string | null>("__init__");

  const setUserFromSession = async (session: Session | null) => {
    const token = session?.access_token ?? null;
    if (lastSessionToken.current === token) return;
    lastSessionToken.current = token;

    if (!session?.user) {
      setAuth({ isLoggedIn: false, role: "student", user: null, loading: false });
      return;
    }
    const u = session.user;
    console.log('Setting user from session:', u.email, u.id);

    // Google OAuth users have name/avatar in user_metadata
    const googleName = u.user_metadata?.full_name || u.user_metadata?.name || "";
    const googleAvatar = u.user_metadata?.avatar_url || u.user_metadata?.picture || null;

    // Parallel fetch — 2× faster than sequential
    let roleData: any[] = [];
    let profile: any = null;
    try {
      const [roleRes, profileRes] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", u.id),
        supabase.from("profiles").select("name,avatar_url").eq("user_id", u.id).maybeSingle(),
      ]);
      roleData = roleRes.data ?? [];
      profile = profileRes.data;
      console.log('Fetched profile:', profile, 'roleData:', roleData);
    } catch (err) {
      console.error("Error fetching profile/role:", err);
    }

    // Auto-create profile for new users (e.g., Google OAuth first-timers)
    if (!profile) {
      const nameToUse = googleName || u.email?.split("@")[0] || "User";
      console.log('Creating new profile for:', u.email, 'with name:', nameToUse);
      try {
        const { data: newProfile, error: profileError } = await supabase
          .from("profiles")
          .insert({
            user_id: u.id,
            name: nameToUse,
            email: u.email,
            avatar_url: googleAvatar,
          })
          .select("name,avatar_url")
          .single();
        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Try upsert as fallback
          const { data: upsertProfile } = await supabase
            .from("profiles")
            .upsert({
              user_id: u.id,
              name: nameToUse,
              email: u.email,
              avatar_url: googleAvatar,
            }, { onConflict: "user_id" })
            .select("name,avatar_url")
            .single();
          profile = upsertProfile;
        } else {
          profile = newProfile;
          console.log('Profile created successfully:', profile);
        }
      } catch (err) {
        console.error("Error creating profile:", err);
      }
    }

    // Auto-create role for new users
    if (roleData.length === 0) {
      console.log('Creating student role for:', u.id);
      try {
        const { error: roleError } = await supabase.from("user_roles").insert({ user_id: u.id, role: "student" });
        if (roleError) {
          console.error('Role creation error:', roleError);
        } else {
          console.log('Role created successfully');
          roleData = [{ role: "student" }];
        }
      } catch (err) {
        console.error("Error creating role:", err);
      }
    }

    const isAdmin = roleData?.some((r) => r.role === "admin") ?? false;
    const isSuperAdmin = SUPER_ADMIN_EMAILS.includes((u.email ?? "").toLowerCase());
    const role: Role = isSuperAdmin ? "super_admin" : isAdmin ? "admin" : "student";

    const displayName = profile?.name || googleName || u.email?.split("@")[0] || "User";

    console.log('Setting auth state:', { isLoggedIn: true, role, user: { name: displayName, email: u.email, id: u.id } });

    setAuth({
      isLoggedIn: true,
      role,
      user: { name: displayName, email: u.email || "", id: u.id },
      loading: false,
    });
  };

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      if (mounted) {
        await setUserFromSession(session);
        // Show welcome toast for new sign-ups
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('action') === 'signup' && session?.user) {
          toast.success(`Welcome aboard, ${session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Student'}! 🎉`);
          // Clean up URL
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    });

    // getSession covers the case where onAuthStateChange hasn't fired yet
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      if (mounted) setUserFromSession(session);
    }).catch((err) => {
      console.error('Auth session error:', err);
      if (mounted) {
        setAuth({ isLoggedIn: false, role: "student", user: null, loading: false });
      }
    });

    // Timeout to prevent infinite loading if Supabase fails
    timeoutId = setTimeout(() => {
      if (mounted && auth.loading) {
        console.warn('Auth initialization timeout - forcing render');
        setAuth({ isLoggedIn: false, role: "student", user: null, loading: false });
      }
    }, 5000);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // 1. Try normal sign-in first
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
    if (!signInErr) return true;

    // 2. For demo accounts — auto-create if missing, then retry
    const demoEmails = ["student@demo.com", "teacher@demo.com", "superadmin@demo.com"];
    if (!demoEmails.includes(email) || password !== "123456") return false;

    const name = email === "teacher@demo.com" ? "Shivam Sir"
               : email === "superadmin@demo.com" ? "Super Admin"
               : "Demo Student";

    // Attempt signup — ignore errors ("already registered" is fine)
    const { data: signUpData } = await supabase.auth.signUp({ email, password, options: { data: { name } } });

    // Assign role if new user was created
    if (signUpData.user) {
      const role = email === "teacher@demo.com" ? "admin" 
                  : email === "superadmin@demo.com" ? "admin" 
                  : "student";
      
      await supabase.from("user_roles").insert({
        user_id: signUpData.user.id,
        role: role
      });

      // Also create profile if needed
      await supabase.from("profiles").upsert({
        user_id: signUpData.user.id,
        name: name
      }, { onConflict: "user_id" });
    }

    // 3. Retry sign-in (works when email confirmation is disabled)
    const { error: retryErr } = await supabase.auth.signInWithPassword({ email, password });
    return !retryErr;
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    const redirectUrl = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name }, emailRedirectTo: redirectUrl },
    });

    if (error) {
      const msg = error.message?.trim() || (error as any).error_description || "Signup failed. Please try again.";
      throw new Error(String(msg));
    }

    // Manually create profile & role as fallback if the DB trigger failed
    if (data?.user) {
      try {
        await supabase.from("profiles")
          .upsert({ user_id: data.user.id, name, email }, { onConflict: "user_id" });
      } catch (_) {}
      try {
        await supabase.from("user_roles")
          .upsert({ user_id: data.user.id, role: "student" }, { onConflict: "user_id,role" });
      } catch (_) {}
    }

    // Sign out immediately — user must verify email before logging in
    await supabase.auth.signOut();

    // Send verification email via Vercel serverless function (only on production)
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      try {
        const res = await fetch('/api/email/send-verification', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name, frontendUrl: window.location.origin }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error("Verification email error:", err);
        }
      } catch (fetchErr) {
        console.error("Could not reach email service:", fetchErr);
      }
    }

    return true;
  };

  const logout = async () => {
    // Instantly clear UI state, then sign out in background
    lastSessionToken.current = null;
    setAuth({ isLoggedIn: false, role: "student", user: null, loading: false });
    supabase.auth.signOut();
  };

  const switchRole = (role: Role) => {
    setAuth((prev) => ({ ...prev, role }));
  };

  const signInWithGoogle = async (): Promise<boolean> => {
    try {
      // Sign out any existing session to ensure clean login
      await supabase.auth.signOut();
      
      const redirectUrl = `${window.location.origin}/?action=signin`;
      console.log('Google Sign In redirect URL:', redirectUrl);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        console.error('Google sign-in error:', error);
        toast.error('Google sign-in failed. Please try again.');
        return false;
      }

      return true;
    } catch (err) {
      console.error('Google sign-in error:', err);
      toast.error('Google sign-in failed. Please try again.');
      return false;
    }
  };

  const signUpWithGoogle = async (): Promise<boolean> => {
    try {
      // Sign out any existing session to ensure clean signup
      await supabase.auth.signOut();
      
      const redirectUrl = `${window.location.origin}/?action=signup`;
      console.log('Google Sign Up redirect URL:', redirectUrl);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        console.error('Google sign-up error:', error);
        toast.error('Google sign-up failed. Please try again.');
        return false;
      }

      return true;
    } catch (err) {
      console.error('Google sign-up error:', err);
      toast.error('Google sign-up failed. Please try again.');
      return false;
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      // Send password reset email via Vercel serverless function
      const res = await fetch('/api/email/send-password-reset', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          frontendUrl: window.location.origin 
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Password reset email error:", err);
        throw new Error(err.error || "Failed to send reset link");
      }

      return true;
    } catch (err: any) {
      console.error('Password reset error:', err.message || err);
      if (err.message?.includes('Failed to fetch') || err.message?.includes('fetch')) {
        throw new Error("Backend service is not running. Please start the backend server.");
      }
      throw new Error(err.message || "Failed to send reset link");
    }
  };

  const updatePassword = async (newPassword: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error('Password update error:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Password update error:', err);
      return false;
    }
  };

  if (auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mx-auto mb-3 animate-pulse">
            <span className="text-primary-foreground text-lg">📚</span>
          </div>
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ ...auth, login, signup, signInWithGoogle, signUpWithGoogle, resetPassword, updatePassword, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
