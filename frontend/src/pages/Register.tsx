import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield, Leaf } from "lucide-react";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email"),
  phone: z.string().trim().regex(/^\d{10}$/, "Phone must be 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["citizen", "worker", "ngo"]),
});

const Register = () => {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "",
    role: "citizen" as "citizen" | "worker" | "ngo",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = registerSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => { fieldErrors[err.path[0] as string] = err.message; });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const user = await authService.register(form);
      login(user);
      toast({ title: "Registration successful!", description: `Welcome, ${user.name}` });
      // Route based on role
      if (user.role === "worker") navigate("/worker");
      else if (user.role === "ngo") navigate("/ngo/register");
      else navigate("/dashboard");
    } catch (err: any) {
      const msg = err?.message || "Please try again";
      toast({ title: "Registration failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const isNgo = form.role === "ngo";

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4 py-8">
      <Card className="w-full max-w-sm shadow-lg animate-fade-in-up">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-1.5">
            {isNgo
              ? <Leaf className="h-9 w-9 text-green-600" />
              : <Shield className="h-9 w-9 text-saffron" />}
          </div>
          <CardTitle className="text-xl">Create Account</CardTitle>
          <CardDescription className="text-xs">
            {isNgo
              ? "Register as an NGO / Eco Club representative"
              : "Register as a Citizen or Worker"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleSubmit} className="space-y-3">
            {(["name", "email", "phone", "password"] as const).map((field) => (
              <div key={field}>
                <Label htmlFor={field} className="capitalize text-xs">{field}</Label>
                <Input
                  id={field}
                  type={field === "password" ? "password" : field === "email" ? "email" : "text"}
                  value={form[field]}
                  onChange={(e) => update(field, e.target.value)}
                  placeholder={field === "phone" ? "10-digit number" : `Enter ${field}`}
                  required
                  className="h-9 text-sm"
                />
                {errors[field] && <p className="text-destructive text-[10px] mt-0.5">{errors[field]}</p>}
              </div>
            ))}
            <div>
              <Label className="text-xs">Register As</Label>
              <Select value={form.role} onValueChange={(v) => update("role", v)}>
                <SelectTrigger className="bg-popover h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="citizen">🧑 Citizen</SelectItem>
                  <SelectItem value="worker">👷 Government Worker</SelectItem>
                  <SelectItem value="ngo">🌿 NGO / Eco Club Representative</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isNgo && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 text-[10px] text-green-700">
                <p className="font-semibold mb-1">🌿 NGO Registration Process:</p>
                <ol className="list-decimal list-inside space-y-0.5 text-green-600">
                  <li>Create your account here</li>
                  <li>Complete NGO registration details</li>
                  <li>Admin reviews &amp; approves (1-3 days)</li>
                  <li>Start creating events!</li>
                </ol>
              </div>
            )}

            <Button
              type="submit"
              className={`w-full h-9 text-sm ${isNgo ? "bg-green-600 hover:bg-green-700" : "bg-saffron hover:bg-saffron/90 text-saffron-foreground"} text-white`}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              {isNgo ? "🌿 Register & Set Up NGO" : "Register"}
            </Button>
          </form>
          <p className="text-center text-xs text-muted-foreground mt-3">
            Already have an account? <Link to="/login" className="text-saffron font-semibold hover:underline">Login</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
