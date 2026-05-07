import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

type Role = "student" | "admin";

interface AuthState {
  isLoggedIn: boolean;
  role: Role;
  user: { name: string; email: string; id: string } | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
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

  const fetchRole = async (userId: string): Promise<Role> => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    if (data && data.some((r) => r.role === "admin")) return "admin";
    return "student";
  };

  const setUserFromSession = async (session: Session | null) => {
    if (!session?.user) {
      setAuth({ isLoggedIn: false, role: "student", user: null, loading: false });
      return;
    }
    const u = session.user;
    const role = await fetchRole(u.id);
    const { data: profile } = await supabase.from("profiles").select("name").eq("user_id", u.id).single();
    setAuth({
      isLoggedIn: true,
      role,
      user: { name: profile?.name || u.email?.split("@")[0] || "", email: u.email || "", id: u.id },
      loading: false,
    });
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserFromSession(session);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserFromSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // Auto-create demo accounts on first login attempt
      const isDemoAccount = (email === "student@demo.com" || email === "teacher@demo.com") && password === "123456";
      if (isDemoAccount) {
        const name = email === "teacher@demo.com" ? "Teacher Admin" : "Demo Student";
        const { error: signUpError } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
        if (signUpError) return false;
        // Admin role is now handled by the database trigger for teacher@demo.com
        return true;
      }
      return false;
    }
    return true;
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name }, emailRedirectTo: redirectUrl },
    });
    if (error) {
      console.error("Signup error:", error.message);
      throw error;
    }
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const switchRole = (role: Role) => {
    setAuth((prev) => ({ ...prev, role }));
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
    <AuthContext.Provider value={{ ...auth, login, signup, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
