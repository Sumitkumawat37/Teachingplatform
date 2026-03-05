import React, { createContext, useContext, useState, ReactNode } from "react";

type Role = "student" | "admin";

interface AuthState {
  isLoggedIn: boolean;
  role: Role;
  user: { name: string; email: string } | null;
}

interface AuthContextType extends AuthState {
  login: (role: Role) => void;
  logout: () => void;
  switchRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    isLoggedIn: true,
    role: "student",
    user: { name: "Demo Student", email: "student@edumaster.com" },
  });

  const login = (role: Role) => {
    setAuth({
      isLoggedIn: true,
      role,
      user: role === "admin"
        ? { name: "Teacher Admin", email: "teacher@edumaster.com" }
        : { name: "Demo Student", email: "student@edumaster.com" },
    });
  };

  const logout = () => {
    setAuth({ isLoggedIn: false, role: "student", user: null });
  };

  const switchRole = (role: Role) => {
    login(role);
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
