import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { useNavigate, Link } from "react-router-dom";
import { GraduationCap, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"student" | "admin">("student");
  const [email, setEmail] = useState("student@demo.com");
  const [password, setPassword] = useState("123456");

  const handleRoleSwitch = (r: "student" | "admin") => {
    setRole(r);
    setEmail(r === "admin" ? "teacher@demo.com" : "student@demo.com");
    setPassword("123456");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(email, password);
    if (success) {
      navigate(email.includes("teacher") ? "/admin" : "/");
    } else {
      toast.error("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6 animate-slide-up">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-3">
            <GraduationCap className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">EduMaster</h1>
          <p className="text-muted-foreground text-sm mt-1">Sign in to continue learning</p>
        </div>

        {/* Role Toggle */}
        <div className="flex gap-2 bg-muted p-1 rounded-xl">
          <button
            onClick={() => handleRoleSwitch("student")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              role === "student" ? "bg-card card-shadow text-foreground" : "text-muted-foreground"
            }`}
          >
            Student
          </button>
          <button
            onClick={() => handleRoleSwitch("admin")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              role === "admin" ? "bg-card card-shadow text-foreground" : "text-muted-foreground"
            }`}
          >
            Teacher
          </button>
        </div>

        <Card className="p-5">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Demo Credentials Info */}
            <div className="bg-accent/50 rounded-lg p-3 text-xs">
              <p className="font-semibold text-accent-foreground mb-1">Demo Credentials:</p>
              <p className="text-muted-foreground">Student: student@demo.com / 123456</p>
              <p className="text-muted-foreground">Teacher: teacher@demo.com / 123456</p>
            </div>

            <Button type="submit" className="w-full" size="lg">Sign In</Button>
          </form>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account? <Link to="/signup" className="text-primary font-medium">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
