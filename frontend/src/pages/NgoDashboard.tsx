import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ngoService } from "@/services/ngoService";
import { eventService } from "@/services/eventService";
import { participationService } from "@/services/participationService";
import { Ngo, NgoEvent } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Leaf, Calendar, Users, TreePine, Trash2, BarChart3, Plus,
  Clock, CheckCircle2, XCircle, Loader2, TrendingUp, Award, Star
} from "lucide-react";
import { cn } from "@/lib/utils";

const EVENT_TYPE_LABELS: Record<string, string> = {
  TREE_PLANTATION: "🌳 Tree Plantation", BEACH_CLEANUP: "🏖️ Beach Cleanup",
  LAKE_CLEANUP: "🌊 Lake Cleanup", ROAD_CLEANUP: "🛣️ Road Cleanup",
  PLASTIC_COLLECTION: "♻️ Plastic Collection", RECYCLING_WORKSHOP: "🔄 Recycling Workshop",
  AWARENESS_CAMPAIGN: "📢 Awareness Campaign", E_WASTE_COLLECTION: "💻 E-Waste",
  WATER_CONSERVATION: "💧 Water Conservation", COMMUNITY_CLEANUP: "🏘️ Community Cleanup",
  WILDLIFE_PROTECTION: "🦁 Wildlife Protection", OTHER: "📌 Other",
};

const STATUS_STYLES: Record<string, string> = {
  UPCOMING: "bg-blue-100 text-blue-700 border-blue-200",
  ONGOING: "bg-green-100 text-green-700 border-green-200",
  COMPLETED: "bg-gray-100 text-gray-600 border-gray-200",
  CANCELLED: "bg-red-100 text-red-600 border-red-200",
};

const NgoDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [ngo, setNgo] = useState<Ngo | null>(null);
  const [events, setEvents] = useState<NgoEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const myNgo = await ngoService.getMyNgo(Number(user.id));
        setNgo(myNgo);
        if (myNgo.status === "ACTIVE") {
          const evts = await eventService.getEventsByNgo(myNgo.id);
          setEvents(evts);
        }
      } catch {
        // No NGO registered yet
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleCancel = async (eventId: number) => {
    try {
      await eventService.cancelEvent(eventId);
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: "CANCELLED" as const } : e));
      toast({ title: "Event cancelled" });
    } catch {
      toast({ title: "Failed to cancel event", variant: "destructive" });
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-green-600" /></div>
  );

  if (!ngo) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
        <Card className="max-w-md w-full text-center shadow-xl">
          <CardContent className="pt-10 pb-8 space-y-4">
            <Leaf className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-xl font-bold">Register Your NGO/Eco Club</h2>
            <p className="text-gray-500 text-sm">Complete your registration to start creating environmental events and tracking your impact.</p>
            <Button onClick={() => navigate("/ngo/register")} className="w-full bg-green-600 hover:bg-green-700 text-white">
              <Plus className="mr-2 h-4 w-4" /> Register NGO / Eco Club
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (ngo.status === "PENDING") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-amber-50 to-yellow-100 px-4">
        <Card className="max-w-md w-full text-center shadow-xl border-amber-200">
          <CardContent className="pt-10 pb-8 space-y-4">
            <Clock className="h-16 w-16 text-amber-500 mx-auto animate-pulse" />
            <h2 className="text-xl font-bold text-amber-800">Registration Under Review</h2>
            <p className="text-gray-600 text-sm"><strong>{ngo.name}</strong> is pending admin approval. You'll receive an email once approved.</p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
              Status: <strong>PENDING</strong> — Typically reviewed within 1-3 business days
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Stats
  const upcoming = events.filter(e => e.status === "UPCOMING").length;
  const completed = events.filter(e => e.status === "COMPLETED").length;
  const totalParticipants = events.reduce((sum, e) => sum + (e.currentParticipants || 0), 0);

  return (
    <div className="px-8 py-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
            <Leaf className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{ngo.name}</h1>
            <p className="text-xs text-gray-500">{ngo.organizationType.replace("_", " ")} · {ngo.registrationNumber}</p>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 mt-0.5">
              <CheckCircle2 className="h-2.5 w-2.5" /> ACTIVE
            </span>
          </div>
        </div>
        <Button onClick={() => navigate("/ngo/events/create")}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md h-9 text-sm">
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Create New Event
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total Events", value: events.length, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Upcoming", value: upcoming, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Total Volunteers", value: totalParticipants, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Completed", value: completed, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-4 pb-3 px-4">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2", bg)}>
                <Icon className={cn("h-4 w-4", color)} />
              </div>
              <p className="text-xl font-extrabold text-gray-900">{value}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Events Table */}
      <Card className="shadow-sm border-0">
        <CardHeader className="border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" /> My Events
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {events.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No events yet</p>
              <p className="text-sm mt-1">Create your first environmental event to get started</p>
              <Button onClick={() => navigate("/ngo/events/create")} variant="outline"
                className="mt-4 border-green-300 text-green-700 hover:bg-green-50">
                <Plus className="mr-2 h-4 w-4" /> Create Event
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {events.map(event => (
                <div key={event.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900 truncate">{event.title}</span>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", STATUS_STYLES[event.status])}>
                        {event.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{EVENT_TYPE_LABELS[event.eventType] || event.eventType}</span>
                      <span>📅 {event.date}</span>
                      <span>👥 {event.currentParticipants}/{event.maxParticipants}</span>
                      <span>⭐ {event.rewardPoints} pts</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/events/${event.id}`)}>
                      View
                    </Button>
                    {event.status === "UPCOMING" && (
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleCancel(event.id)}>
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NgoDashboard;
