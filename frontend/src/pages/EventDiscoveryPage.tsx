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
      {/* Compact Hero */}
      <div className="bg-gradient-to-r from-green-700 via-emerald-600 to-teal-600 text-white px-8 py-8">
        <div className="max-w-5xl">
          <h1 className="text-2xl md:text-[28px] font-extrabold mb-1 leading-tight">🌿 Discover Eco Events</h1>
          <p className="text-green-100 text-sm mb-5">Join environmental events near you. Earn Eco Points. Make an impact.</p>
          <div className="flex flex-col sm:flex-row gap-2.5 max-w-2xl">
            <Select value={radiusKm} onValueChange={setRadiusKm}>
              <SelectTrigger
                className="bg-white/20 text-white border-white/30 h-[46px] text-[14px] rounded-[10px]"
                style={{ width: "200px" }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {["5", "10", "20", "50"].map(r => <SelectItem key={r} value={r}>{r} km radius</SelectItem>)}
              </SelectContent>
            </Select>
            <Button
              onClick={findNearby}
              disabled={locating}
              className="bg-white text-green-700 hover:bg-green-50 font-semibold h-[46px] text-[15px] rounded-[10px]"
              style={{ width: "400px", maxWidth: "100%" }}
            >
              {locating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Navigation className="mr-2 h-4 w-4" />}
              {locating ? "Finding..." : "Find Events Near Me"}
            </Button>
          </div>
        </div>
      </div>

      {/* Controls + Cards */}
      <div className="px-8 py-6 max-w-[1400px]">
        {/* Search + Filter bar */}
        <div className="flex flex-col sm:flex-row gap-2.5 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search events or locations..."
              className="pl-9 h-[46px] text-[15px] rounded-[10px]"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger
              className="bg-popover h-[46px] text-[14px] rounded-[10px]"
              style={{ width: "180px" }}
            >
              <Filter className="mr-2 h-3.5 w-3.5 text-gray-400" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {EVENT_TYPE_OPTIONS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-14 text-gray-400">
            <MapPin className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="font-medium text-sm">No events found</p>
            <p className="text-xs mt-1">Try a wider search radius or different filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(event => (
              <div
                key={event.id}
                onClick={() => navigate(`/events/${event.id}`)}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100 overflow-hidden group hover:-translate-y-0.5"
              >
                {/* Card top accent */}
                <div className="h-1.5 bg-gradient-to-r from-green-500 to-emerald-500" />
                <div className="p-3.5">
                  <div className="flex items-start justify-between mb-2">
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold", STATUS_COLOR[event.status])}>
                      {event.status}
                    </span>
                    {event.distanceKm !== undefined && (
                      <span className="flex items-center gap-0.5 text-[10px] text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full font-medium">
                        <Navigation className="h-2.5 w-2.5" />
                        {event.distanceKm < 1 ? `${(event.distanceKm * 1000).toFixed(0)} m` : `${event.distanceKm.toFixed(1)} km`}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 text-[13px] mb-1 leading-snug group-hover:text-green-700 transition-colors line-clamp-1">
                    {event.title}
                  </h3>
                  <p className="text-[11px] text-gray-500 line-clamp-2 mb-2.5 leading-relaxed">{event.description}</p>
                  <div className="flex flex-col gap-1 text-[10.5px] text-gray-500">
                    <span className="flex items-center gap-1"><Calendar className="h-2.5 w-2.5" /> {event.date}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-2.5 w-2.5" /> {event.locationName}</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="flex items-center gap-1"><Users className="h-2.5 w-2.5" /> {event.currentParticipants}/{event.maxParticipants}</span>
                      <span className="flex items-center gap-1 text-amber-600 font-semibold"><Star className="h-2.5 w-2.5" /> {event.rewardPoints} pts</span>
                    </div>
                  </div>
                  {event.ngoName && (
                    <p className="text-[10px] text-green-600 mt-2 font-medium truncate">by {event.ngoName}</p>
                  )}
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
