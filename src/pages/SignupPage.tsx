import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { useNavigate, Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { toast } from "sonner";

const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) return toast.error("Please fill all fields");
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    try {
      await signup(email.trim(), password, name.trim());
      toast.success("Account created! Check your email to verify, then sign in.");
      navigate("/login");
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.toLowerCase().includes("already")) toast.error("This email is already registered. Try signing in.");
      else toast.error(msg || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6 animate-slide-up">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-3">
            <GraduationCap className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Join EduMaster</h1>
          <p className="text-muted-foreground text-sm mt-1">Create your student account</p>
        </div>

        <Card className="p-5">
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Full Name</Label>
              <Input placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="text-primary font-medium">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
