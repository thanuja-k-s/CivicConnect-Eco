import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ngoService } from "@/services/ngoService";
import { eventService } from "@/services/eventService";
import { NgoEvent } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin, Calendar, Users, Star, Leaf } from "lucide-react";

const EVENT_TYPES = [
  { value: "TREE_PLANTATION", label: "🌳 Tree Plantation" },
  { value: "BEACH_CLEANUP", label: "🏖️ Beach Cleanup" },
  { value: "LAKE_CLEANUP", label: "🌊 Lake Cleanup" },
  { value: "ROAD_CLEANUP", label: "🛣️ Road Cleanup" },
  { value: "PLASTIC_COLLECTION", label: "♻️ Plastic Collection Drive" },
  { value: "RECYCLING_WORKSHOP", label: "🔄 Recycling Workshop" },
  { value: "AWARENESS_CAMPAIGN", label: "📢 Awareness Campaign" },
  { value: "E_WASTE_COLLECTION", label: "💻 E-Waste Collection" },
  { value: "WATER_CONSERVATION", label: "💧 Water Conservation Drive" },
  { value: "COMMUNITY_CLEANUP", label: "🏘️ Community Cleanup" },
  { value: "WILDLIFE_PROTECTION", label: "🦁 Wildlife Protection" },
  { value: "OTHER", label: "📌 Other" },
];

const CreateEventPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [ngoId, setNgoId] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", eventType: "TREE_PLANTATION",
    date: "", startTime: "", endTime: "",
    locationName: "", latitude: "", longitude: "",
    maxParticipants: "100", rewardPoints: "50",
    requiredMaterials: "", organizerNotes: "",
  });

  useEffect(() => {
    if (!user) return;
    ngoService.getMyNgo(Number(user.id)).then(ngo => {
      if (ngo.status !== "ACTIVE") {
        toast({ title: "NGO not active", description: "Your NGO must be approved to create events.", variant: "destructive" });
        navigate("/ngo/dashboard");
      } else {
        setNgoId(ngo.id);
      }
    }).catch(() => {
      toast({ title: "NGO not found", description: "Please register your NGO first.", variant: "destructive" });
      navigate("/ngo/register");
    });
  }, [user]);

  const update = (field: string, value: string) => setForm(p => ({ ...p, [field]: value }));

  const captureLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        update("latitude", pos.coords.latitude.toString());
        update("longitude", pos.coords.longitude.toString());
        setLocating(false);
        toast({ title: "Location captured ✅" });
      },
      () => {
        setLocating(false);
        toast({ title: "Location access denied", variant: "destructive" });
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ngoId) return;
    setLoading(true);
    try {
      const payload = {
        ...form,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        maxParticipants: parseInt(form.maxParticipants),
        rewardPoints: parseInt(form.rewardPoints),
        ngoId,
      };
      const event = await eventService.createEvent(payload as any);
      toast({ title: "Event created! 🎉", description: `"${event.title}" is now live.` });
      navigate("/ngo/dashboard");
    } catch (e: any) {
      toast({ title: "Failed to create event", description: e.response?.data?.error || "Try again", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
          <Leaf className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Create Environmental Event</h1>
          <p className="text-sm text-gray-500">Organize and inspire community action</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card className="shadow-sm border-0 bg-white">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base flex items-center gap-2"><Calendar className="h-4 w-4 text-green-600" /> Event Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div>
              <Label>Event Title *</Label>
              <Input value={form.title} onChange={e => update("title", e.target.value)} required placeholder="Annual Beach Cleanup Drive 2024" />
            </div>
            <div>
              <Label>Description *</Label>
              <textarea value={form.description} onChange={e => update("description", e.target.value)} required
                placeholder="Describe the event, its goals, and what participants can expect..."
                className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <Label>Event Type *</Label>
              <Select value={form.eventType} onValueChange={v => update("eventType", v)}>
                <SelectTrigger className="bg-popover"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover">
                  {EVENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Date *</Label>
                <Input type="date" value={form.date} onChange={e => update("date", e.target.value)} required min={new Date().toISOString().split("T")[0]} />
              </div>
              <div>
                <Label>Start Time</Label>
                <Input type="time" value={form.startTime} onChange={e => update("startTime", e.target.value)} />
              </div>
              <div>
                <Label>End Time</Label>
                <Input type="time" value={form.endTime} onChange={e => update("endTime", e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="shadow-sm border-0 bg-white">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4 text-green-600" /> Event Location</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div>
              <Label>Location Name *</Label>
              <Input value={form.locationName} onChange={e => update("locationName", e.target.value)} required placeholder="Marina Beach, Chennai" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Latitude *</Label>
                <Input type="number" step="any" value={form.latitude} onChange={e => update("latitude", e.target.value)} required placeholder="13.0827" />
              </div>
              <div>
                <Label>Longitude *</Label>
                <Input type="number" step="any" value={form.longitude} onChange={e => update("longitude", e.target.value)} required placeholder="80.2707" />
              </div>
            </div>
            <Button type="button" variant="outline" onClick={captureLocation} disabled={locating}
              className="border-green-300 text-green-700 hover:bg-green-50 w-full">
              {locating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
              {locating ? "Capturing..." : "Use My Current Location"}
            </Button>
          </CardContent>
        </Card>

        {/* Capacity & Points */}
        <Card className="shadow-sm border-0 bg-white">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4 text-green-600" /> Capacity & Rewards</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Max Participants</Label>
                <Input type="number" value={form.maxParticipants} onChange={e => update("maxParticipants", e.target.value)} min="1" max="10000" />
              </div>
              <div>
                <Label>Reward Points <Star className="inline h-3 w-3 text-amber-500" /></Label>
                <Input type="number" value={form.rewardPoints} onChange={e => update("rewardPoints", e.target.value)} min="0" max="500" />
              </div>
            </div>
            <div>
              <Label>Required Materials (Optional)</Label>
              <Input value={form.requiredMaterials} onChange={e => update("requiredMaterials", e.target.value)} placeholder="Gloves, trash bags, water bottles..." />
            </div>
            <div>
              <Label>Organizer Notes (Optional)</Label>
              <Input value={form.organizerNotes} onChange={e => update("organizerNotes", e.target.value)} placeholder="Special instructions for volunteers..." />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => navigate("/ngo/dashboard")} className="flex-1">Cancel</Button>
          <Button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            🌿 Create Event
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateEventPage;
