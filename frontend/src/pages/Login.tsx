import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      console.log("Starting login process...");
      const user = await authService.login(email, password);
      console.log("Login successful, user:", user);
      console.log("Storing in localStorage...");
      login(user);
      
      // Verify localStorage
      console.log("LocalStorage user:", localStorage.getItem("user"));
      console.log("LocalStorage token:", localStorage.getItem("token"));
      
      toast({ title: "Welcome back!", description: `Logged in as ${user.name}` });
      const path = user.role === "admin" ? "/admin" : user.role === "worker" ? "/worker" : "/dashboard";
      console.log("Will navigate to:", path);
      
      // Small delay to ensure state updates before navigation
      setTimeout(() => {
        console.log("Navigating now...");
        navigate(path);
      }, 300);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Invalid email or password";
      console.error("Login error caught:", errorMessage);
      alert("Login Error: " + errorMessage); // Show alert so user sees the error
      toast({ title: "Login failed", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-muted px-4 py-12">
      <Card className="w-full max-w-md shadow-xl animate-fade-in-up">
        <CardHeader className="text-center">
          <Shield className="h-12 w-12 text-saffron mx-auto mb-2" />
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Login to your Civic Connect account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="citizen@demo.com" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter any password" required />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="remember" />
              <Label htmlFor="remember" className="text-sm font-normal">Remember me</Label>
            </div>
            <Button type="submit" className="w-full bg-saffron text-saffron-foreground hover:bg-saffron/90" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Don't have an account? <Link to="/register" className="text-saffron font-semibold hover:underline">Register</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
