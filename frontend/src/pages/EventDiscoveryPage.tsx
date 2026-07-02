import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { eventService } from "@/services/eventService";
import { NgoEvent } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Search, Loader2, Navigation, Calendar, Users, Star, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const EVENT_TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "TREE_PLANTATION", label: "🌳 Tree Plantation" },
  { value: "BEACH_CLEANUP", label: "🏖️ Beach Cleanup" },
  { value: "LAKE_CLEANUP", label: "🌊 Lake Cleanup" },
  { value: "ROAD_CLEANUP", label: "🛣️ Road Cleanup" },
  { value: "PLASTIC_COLLECTION", label: "♻️ Plastic Collection" },
  { value: "RECYCLING_WORKSHOP", label: "🔄 Recycling Workshop" },
  { value: "AWARENESS_CAMPAIGN", label: "📢 Awareness Campaign" },
  { value: "COMMUNITY_CLEANUP", label: "🏘️ Community Cleanup" },
  { value: "WATER_CONSERVATION", label: "💧 Water Conservation" },
  { value: "OTHER", label: "📌 Other" },
];

const STATUS_COLOR: Record<string, string> = {
  UPCOMING: "bg-blue-100 text-blue-700", ONGOING: "bg-green-100 text-green-700",
  COMPLETED: "bg-gray-100 text-gray-500", CANCELLED: "bg-red-100 text-red-600",
};

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const EventDiscoveryPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [events, setEvents] = useState<NgoEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [radiusKm, setRadiusKm] = useState("20");

  useEffect(() => {
    eventService.getUpcomingEvents().then(evts => {
      setEvents(evts);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const findNearby = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async pos => {
      const { latitude: lat, longitude: lng } = pos.coords;
      setUserLat(lat); setUserLng(lng);
      try {
        const nearby = await eventService.getNearbyEvents(lat, lng, parseFloat(radiusKm));
        const withDist = nearby.map(e => ({
          ...e,
          distanceKm: haversine(lat, lng, e.latitude, e.longitude),
        })).sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
        setEvents(withDist);
        toast({ title: `Found ${withDist.length} events within ${radiusKm} km` });
      } catch {
        toast({ title: "Failed to fetch nearby events", variant: "destructive" });
      } finally {
        setLocating(false);
      }
    }, () => {
      setLocating(false);
      toast({ title: "Location access denied", variant: "destructive" });
    });
  };

  const filtered = events.filter(e =>
    (typeFilter === "all" || e.eventType === typeFilter) &&
    (search === "" || e.title.toLowerCase().includes(search.toLowerCase()) || e.locationName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero */}
      <div className="bg-gradient-to-r from-green-700 via-emerald-600 to-teal-600 text-white py-12 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">🌿 Discover Eco Events</h1>
          <p className="text-green-100 mb-6">Join environmental events near you. Earn Eco Points. Make an impact.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-lg mx-auto">
            <Select value={radiusKm} onValueChange={setRadiusKm}>
              <SelectTrigger className="bg-white/20 text-white border-white/30 w-full sm:w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {["5", "10", "20", "50"].map(r => <SelectItem key={r} value={r}>{r} km radius</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={findNearby} disabled={locating}
              className="bg-white text-green-700 hover:bg-green-50 font-semibold flex-1">
              {locating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Navigation className="mr-2 h-4 w-4" />}
              {locating ? "Finding..." : "Find Events Near Me"}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events or locations..." className="pl-9" />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-56 bg-popover">
              <Filter className="mr-2 h-4 w-4 text-gray-400" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {EVENT_TYPE_OPTIONS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-green-600" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <MapPin className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No events found</p>
            <p className="text-sm mt-1">Try a wider search radius or different filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map(event => (
              <div key={event.id}
                onClick={() => navigate(`/events/${event.id}`)}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-100 overflow-hidden group">
                {/* Card top accent */}
                <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500" />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold", STATUS_COLOR[event.status])}>
                      {event.status}
                    </span>
                    {event.distanceKm !== undefined && (
                      <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                        <Navigation className="h-3 w-3" />
                        {event.distanceKm < 1 ? `${(event.distanceKm * 1000).toFixed(0)} m` : `${event.distanceKm.toFixed(1)} km`}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 text-base mb-1 group-hover:text-green-700 transition-colors">{event.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">{event.description}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {event.date}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {event.locationName}</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {event.currentParticipants}/{event.maxParticipants}</span>
                    <span className="flex items-center gap-1 text-amber-600 font-semibold"><Star className="h-3 w-3" /> {event.rewardPoints} pts</span>
                  </div>
                  {event.ngoName && <p className="text-xs text-green-600 mt-2 font-medium">by {event.ngoName}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDiscoveryPage;
