import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ngoService } from "@/services/ngoService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Leaf, Loader2, Building2, ChevronRight, CheckCircle2 } from "lucide-react";

const STEPS = ["Organization", "Contact", "Details"];

const NgoRegistrationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "", registrationNumber: "", organizationType: "NGO",
    contactPersonName: "", email: "", phone: "",
    address: "", description: "", website: "",
  });

  const update = (field: string, value: string) => setForm(p => ({ ...p, [field]: value }));

  const handleSubmit = async () => {
    if (!user) { toast({ title: "Please log in first", variant: "destructive" }); return; }
    setLoading(true);
    try {
      await ngoService.register({
        ...form,
        createdByUserId: Number(user.id),
      });
      setSubmitted(true);
      toast({ title: "Registration submitted!", description: "Pending admin review." });
    } catch (e: any) {
      toast({ title: "Registration failed", description: e.response?.data?.error || "Try again", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
        <Card className="w-full max-w-md text-center shadow-2xl border-green-200">
          <CardContent className="pt-10 pb-8 space-y-4">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-800">Registration Submitted!</h2>
            <p className="text-gray-600">Your NGO/Eco Club registration is under review. You'll receive an email once approved.</p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
              ⏳ Status: <strong>PENDING</strong> — Admin review in progress
            </div>
            <Button onClick={() => navigate("/dashboard")} className="w-full bg-green-600 hover:bg-green-700 text-white">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 px-4 py-12">
      <Card className="w-full max-w-2xl shadow-2xl border-0">
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Leaf className="h-7 w-7 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white">NGO / Eco Club Registration</CardTitle>
              <CardDescription className="text-green-100">Join CivicConnect Eco as an environmental organization</CardDescription>
            </div>
          </div>
          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i <= step ? "bg-white text-green-700" : "bg-white/30 text-white"}`}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span className={`text-sm ${i === step ? "text-white font-semibold" : "text-green-200"}`}>{s}</span>
                {i < STEPS.length - 1 && <ChevronRight className="h-4 w-4 text-green-300" />}
              </div>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {step === 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2"><Building2 className="h-4 w-4" /> Organization Details</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label>Organization Name *</Label>
                  <Input value={form.name} onChange={e => update("name", e.target.value)} placeholder="Green Earth Foundation" />
                </div>
                <div>
                  <Label>Registration Number *</Label>
                  <Input value={form.registrationNumber} onChange={e => update("registrationNumber", e.target.value)} placeholder="NGO/2024/12345" />
                </div>
              </div>
              <div>
                <Label>Organization Type *</Label>
                <Select value={form.organizationType} onValueChange={v => update("organizationType", v)}>
                  <SelectTrigger className="bg-popover"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="NGO">NGO (Non-Governmental Organization)</SelectItem>
                    <SelectItem value="ECO_CLUB">Eco Club</SelectItem>
                    <SelectItem value="COLLEGE_CLUB">College Environmental Club</SelectItem>
                    <SelectItem value="VOLUNTEER_ORG">Volunteer Organization</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => setStep(1)} disabled={!form.name || !form.registrationNumber}
                className="w-full bg-green-600 hover:bg-green-700 text-white">
                Next: Contact Information →
              </Button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">Contact Information</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label>Contact Person Name *</Label>
                  <Input value={form.contactPersonName} onChange={e => update("contactPersonName", e.target.value)} placeholder="Dr. Priya Sharma" />
                </div>
                <div>
                  <Label>Email Address *</Label>
                  <Input type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="contact@ngo.org" />
                </div>
                <div>
                  <Label>Phone Number *</Label>
                  <Input value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="10-digit number" />
                </div>
                <div>
                  <Label>Website (Optional)</Label>
                  <Input value={form.website} onChange={e => update("website", e.target.value)} placeholder="https://your-ngo.org" />
                </div>
              </div>
              <div>
                <Label>Address *</Label>
                <Input value={form.address} onChange={e => update("address", e.target.value)} placeholder="Full address of your organization" />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(0)} className="flex-1">← Back</Button>
                <Button onClick={() => setStep(2)} disabled={!form.contactPersonName || !form.email || !form.phone || !form.address}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                  Next: About Your Org →
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">About Your Organization</h3>
              <div>
                <Label>Description *</Label>
                <textarea value={form.description} onChange={e => update("description", e.target.value)}
                  placeholder="Tell us about your mission, activities, and environmental focus..."
                  className="w-full min-h-[120px] px-3 py-2 border border-input rounded-md text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700">
                <p className="font-semibold mb-1">✅ What happens after submission?</p>
                <ol className="list-decimal list-inside space-y-1 text-green-600">
                  <li>Admin reviews your registration (1-3 business days)</li>
                  <li>You receive an email notification</li>
                  <li>Once approved, you can create environmental events</li>
                </ol>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">← Back</Button>
                <Button onClick={handleSubmit} disabled={loading || !form.description}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Registration
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NgoRegistrationPage;
