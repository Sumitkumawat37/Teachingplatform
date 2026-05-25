import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";

export type Role = "student" | "admin" | "super_admin";

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

  const lastSessionToken = useRef<string | null>("__init__");

  const setUserFromSession = async (session: Session | null) => {
    const token = session?.access_token ?? null;

    if (lastSessionToken.current === token) return;

    lastSessionToken.current = token;

    if (!session?.user) {
      setAuth({
        isLoggedIn: false,
        role: "student",
        user: null,
        loading: false,
      });
      return;
    }

    const u = session.user;

    console.log("Setting user from session:", u.email, u.id);

    const googleName =
      u.user_metadata?.full_name ||
      u.user_metadata?.name ||
      "";

    const googleAvatar =
      u.user_metadata?.avatar_url ||
      u.user_metadata?.picture ||
      null;

    let roleData: any[] = [];
    let profile: any = null;

    try {
      const [roleRes, profileRes] = await Promise.all([
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", u.id),

        supabase
          .from("profiles")
          .select("name,avatar_url")
          .eq("user_id", u.id)
          .maybeSingle(),
      ]);

      roleData = roleRes.data ?? [];
      profile = profileRes.data;

      console.log("Fetched profile:", profile);
    } catch (err) {
      console.error("Error fetching profile:", err);
    }

    if (!profile) {
      const nameToUse =
        googleName ||
        u.email?.split("@")[0] ||
        "User";

      try {
        const { data: newProfile, error } = await supabase
          .from("profiles")
          .upsert(
            {
              user_id: u.id,
              name: nameToUse,
              email: u.email,
              avatar_url: googleAvatar,
            },
            {
              onConflict: "user_id",
            }
          )
          .select("name,avatar_url")
          .single();

        if (error) {
          console.error("Profile creation error:", error);
        } else {
          profile = newProfile;
        }
      } catch (err) {
        console.error("Error creating profile:", err);
      }
    }

    if (roleData.length === 0) {
      try {
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

        roleData = [{ role: "student" }];
      } catch (err) {
        console.error("Error creating role:", err);
      }
    }

    const isAdmin =
      roleData?.some((r) => r.role === "admin") ?? false;

    const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(
      (u.email ?? "").toLowerCase()
    );

    const role: Role = isSuperAdmin
      ? "super_admin"
      : isAdmin
      ? "admin"
      : "student";

    const displayName =
      profile?.name ||
      googleName ||
      u.email?.split("@")[0] ||
      "User";

    setAuth({
      isLoggedIn: true,
      role,
      user: {
        name: displayName,
        email: u.email || "",
        id: u.id,
      },
      loading: false,
    });

    toast.success(`Welcome ${displayName}!`);
  };

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(
          "Auth state change:",
          event,
          session?.user?.email
        );

        if (mounted) {
          await setUserFromSession(session);
        }
      }
    );

    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        console.log(
          "Initial session:",
          session?.user?.email
        );

        if (mounted) {
          await setUserFromSession(session);
        }
      })
      .catch((err) => {
        console.error("Session restore error:", err);

        if (mounted) {
          setAuth({
            isLoggedIn: false,
            role: "student",
            user: null,
            loading: false,
          });
        }
      });

    // Timeout to prevent infinite loading
    timeoutId = setTimeout(() => {
      if (mounted && auth.loading) {
        console.warn('Auth initialization timeout - forcing render');
        setAuth({
          isLoggedIn: false,
          role: "student",
          user: null,
          loading: false,
        });
      }
    }, 5000);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    return !error;
  };

  const signup = async (
    email: string,
    password: string,
    name: string
  ): Promise<boolean> => {
    console.log('Signup attempt:', { email, name });
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: window.location.origin,
      },
    });

    console.log('Supabase signup response:', { data, error });

    if (error) {
      console.error('Supabase signup error:', error);
      return false;
    }

    // Create profile and role for the new user
    if (data.user) {
      console.log('Creating profile for user:', data.user.id);
      try {
        const { error: profileError } = await supabase.from('profiles').insert({
          user_id: data.user.id,
          name: name,
          email: email,
        });
        if (profileError) {
          console.error('Profile creation error:', profileError);
        } else {
          console.log('Profile created successfully');
        }
      } catch (err) {
        console.error('Profile creation error:', err);
      }

      try {
        const { error: roleError } = await supabase.from('user_roles').insert({
          user_id: data.user.id,
          role: 'student',
        });
        if (roleError) {
          console.error('Role creation error:', roleError);
        } else {
          console.log('Role created successfully');
        }
      } catch (err) {
        console.error('Role creation error:', err);
      }
    }

    // Send verification email via Nodemailer (only on production)
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      console.log('Sending verification email via API');
      try {
        const res = await fetch('/api/email/send-verification', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name, frontendUrl: window.location.origin }),
        });
        console.log('Email API response status:', res.status);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error("Verification email error:", err);
        } else {
          console.log('Verification email sent successfully');
        }
      } catch (fetchErr) {
        console.error("Could not reach email service:", fetchErr);
      }
    }

    return true;
  };

  const signInWithGoogle = async (): Promise<boolean> => {
    try {
      const { error } =
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: window.location.origin,
          },
        });

      if (error) {
        console.error(error);
        toast.error("Google sign-in failed");
        return false;
      }

      return true;
    } catch (err) {
      console.error(err);
      toast.error("Google sign-in failed");
      return false;
    }
  };

  const signUpWithGoogle = async (): Promise<boolean> => {
    return signInWithGoogle();
  };

  const logout = async () => {
    lastSessionToken.current = null;

    setAuth({
      isLoggedIn: false,
      role: "student",
      user: null,
      loading: false,
    });

    await supabase.auth.signOut();
  };

  const switchRole = (role: Role) => {
    setAuth((prev) => ({
      ...prev,
      role,
    }));
  };

  const resetPassword = async (
    email: string
  ): Promise<boolean> => {
    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

    return !error;
  };

  const updatePassword = async (
    newPassword: string
  ): Promise<boolean> => {
    const { error } =
      await supabase.auth.updateUser({
        password: newPassword,
      });

    return !error;
  };

  if (auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        ...auth,
        login,
        signup,
        signInWithGoogle,
        signUpWithGoogle,
        resetPassword,
        updatePassword,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      "useAuth must be inside AuthProvider"
    );
  }

  return ctx;
}