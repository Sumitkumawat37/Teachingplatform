import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";

export type Role = "student" | "teacher" | "admin" | "super_admin";

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
  try {
    const token = session?.access_token ?? null;

    console.log("=== setUserFromSession ===");

    if (lastSessionToken.current === token) {
      console.log("Token unchanged, skipping");
      return;
    }

    lastSessionToken.current = token;

    if (!session?.user) {
      console.log("STEP 0 - No session");
      setAuth({
        isLoggedIn: false,
        role: "student",
        user: null,
        loading: false,
      });
      return;
    }

    const u = session.user;

    console.log("STEP 1", u.email);

    let profile: any = null;

    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", u.id)
        .single();

      profile = data;
      console.log("STEP 2", profile);
    } catch (err) {
      console.log("STEP 2A - Profile not found");
    }

    const isGoogleUser =
      u.app_metadata?.provider === "google";

    console.log("STEP 3", isGoogleUser);

    if (isGoogleUser) {
      const name =
        u.user_metadata?.full_name ||
        u.user_metadata?.name ||
        u.email?.split("@")[0] ||
        "";

      const avatar =
        u.user_metadata?.avatar_url ||
        u.user_metadata?.picture ||
        null;

      console.log("STEP 4 - Profile upsert");

      const { error: profileError } =
        await supabase
          .from("profiles")
          .upsert(
            {
              user_id: u.id,
              name,
              email: u.email,
              avatar_url: avatar,
            },
            {
              onConflict: "user_id",
            }
          );

      console.log("STEP 5", profileError);

      const { error: roleError } =
        await supabase
          .from("user_roles")
          .upsert(
            {
              user_id: u.id,
              role: "student",
            },
            {
              onConflict: "user_id,role",
            }
          );

      console.log("STEP 6", roleError);
    }

    console.log("STEP 7 - Loading roles");

    const { data: roleData, error: roleFetchError } =
      await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", u.id);

    console.log("STEP 8", roleData, roleFetchError);

    const isAdmin =
  Array.isArray(roleData) &&
  roleData.some((r: any) => r.role === "admin");

const isTeacher =
  Array.isArray(roleData) &&
  roleData.some((r: any) => r.role === "teacher");

    const isSuperAdmin =
      SUPER_ADMIN_EMAILS.includes(
        (u.email ?? "").toLowerCase()
      );

    const role: Role =
      isSuperAdmin
        ? "super_admin"
        : isAdmin
        ? "admin"
        : isTeacher
        ? "teacher"
        : "student";

    console.log("STEP 9 - Setting auth");

    setAuth({
      isLoggedIn: true,
      role,
      user: {
        id: u.id,
        email: u.email || "",
        name:
          profile?.name ||
          u.user_metadata?.full_name ||
          u.email?.split("@")[0] ||
          "",
      },
      loading: false,
    });

    console.log("STEP 10 - SUCCESS");
  } catch (err) {
    console.error("setUserFromSession failed", err);

    setAuth({
      isLoggedIn: false,
      role: "student",
      user: null,
      loading: false,
    });
  }
};

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setUserFromSession(session);
    });

    // getSession covers the case where onAuthStateChange hasn't fired yet
    supabase.auth.getSession().then(({ data: { session } }) => {
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
    const demoEmails = ["student@demo.com", "teacher@demo.com", "superadmin@demo.com"];
    const isDemoAccount = demoEmails.includes(email) && password === "123456";

    // 1. Try normal sign-in first
    const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });

    if (!signInErr && signInData.user) {
      // For demo accounts, always ensure the correct role is set (upsert)
      if (isDemoAccount) {
        const demoRole = email === "teacher@demo.com" ? "teacher"
                       : email === "superadmin@demo.com" ? "admin"
                       : "student";
        await supabase.from("user_roles")
          .upsert({ user_id: signInData.user.id, role: demoRole as any }, { onConflict: "user_id,role" });
        // Clear cache so setUserFromSession re-fetches roles with updated value
        lastSessionToken.current = null;
        await setUserFromSession(signInData.session);
      }
      return true;
    }

    // 2. For demo accounts — auto-create if missing, then retry
    if (!isDemoAccount) return false;

    const name = email === "teacher@demo.com" ? "Shivam Sir"
               : email === "superadmin@demo.com" ? "Super Admin"
               : "Demo Student";

    // Attempt signup — ignore errors ("already registered" is fine)
    const { data: signUpData } = await supabase.auth.signUp({ email, password, options: { data: { name } } });

    // Assign role if new user was created
    if (signUpData.user) {
      const demoRole = email === "teacher@demo.com" ? "teacher" 
                     : email === "superadmin@demo.com" ? "admin" 
                     : "student";
      await supabase.from("user_roles")
        .upsert({ user_id: signUpData.user.id, role: demoRole as any }, { onConflict: "user_id,role" });
      await supabase.from("profiles")
        .upsert({ user_id: signUpData.user.id, name }, { onConflict: "user_id" });
    }

    // 3. Retry sign-in
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
        console.log('=== Sending verification email request ===');
        console.log('Email:', email);
        console.log('Name:', name);
        console.log('Frontend URL:', window.location.origin);
        
        const res = await fetch('/api/email/send-verification', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name, frontendUrl: window.location.origin }),
        });
        
        console.log('Response status:', res.status);
        console.log('Response ok:', res.ok);
        
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error("Verification email error:", err);
          console.error("Error details:", JSON.stringify(err, null, 2));
        } else {
          const success = await res.json().catch(() => ({}));
          console.log("Email sent successfully:", success);
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
      const redirectUrl = `${window.location.origin}/`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
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

  const resetPassword = async (email: string): Promise<boolean> => {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    // On localhost use Supabase native reset (Vercel API not available locally)
    if (isLocalhost) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw new Error(error.message);
      return true;
    }

    try {
      const res = await fetch('/api/email/send-password-reset', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, frontendUrl: window.location.origin }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Password reset email error:", err);
        throw new Error(err.message || "Failed to send reset link");
      }

      return true;
    } catch (err: any) {
      console.error('Password reset error:', err.message || err);
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
    <AuthContext.Provider value={{ ...auth, login, signup, signInWithGoogle, resetPassword, updatePassword, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
