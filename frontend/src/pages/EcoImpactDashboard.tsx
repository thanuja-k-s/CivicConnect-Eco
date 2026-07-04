import { useEffect, useState } from "react";
import { impactService } from "@/services/notificationService";
import { EcoImpactStats } from "@/types";
import { Loader2, TrendingUp, Globe } from "lucide-react";

const STATS = [
  { key: "treesPlanted", label: "Trees Planted", icon: "🌳", color: "from-green-500 to-emerald-600", textColor: "text-green-700", desc: "Trees planted at events" },
  { key: "totalVolunteers", label: "Total Volunteers", icon: "👥", color: "from-blue-500 to-indigo-600", textColor: "text-blue-700", desc: "Unique citizens participated" },
  { key: "wasteCollectedKg", label: "Waste Collected", icon: "🗑️", color: "from-orange-500 to-amber-600", textColor: "text-orange-700", desc: "Kg of waste removed", suffix: " kg" },
  { key: "plasticRemovedKg", label: "Plastic Removed", icon: "♻️", color: "from-teal-500 to-cyan-600", textColor: "text-teal-700", desc: "Kg of plastic cleaned", suffix: " kg" },
  { key: "totalEvents", label: "Total Events", icon: "📅", color: "from-purple-500 to-violet-600", textColor: "text-purple-700", desc: "Environmental events held" },
  { key: "activeNgos", label: "Active NGOs", icon: "🏛️", color: "from-rose-500 to-pink-600", textColor: "text-rose-700", desc: "Organizations engaged" },
  { key: "complaintsResolved", label: "Issues Resolved", icon: "✅", color: "from-lime-500 to-green-600", textColor: "text-lime-700", desc: "Civic complaints resolved" },
  { key: "volunteerHours", label: "Volunteer Hours", icon: "⏱️", color: "from-sky-500 to-blue-600", textColor: "text-sky-700", desc: "Total hours contributed", suffix: " hrs" },
  { key: "co2ReductionEstimateKg", label: "CO₂ Reduced (Est.)", icon: "🌍", color: "from-emerald-500 to-teal-600", textColor: "text-emerald-700", desc: "Estimated kg CO₂ offset", suffix: " kg" },
];

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (value === 0) return;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + increment, value);
      setDisplay(Math.round(current));
      if (current >= value) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display.toLocaleString("en-IN")}{suffix}</>;
}

const EcoImpactDashboard = () => {
  const [stats, setStats] = useState<EcoImpactStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    impactService.getDashboard().then(data => {
      setStats(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-emerald-50 to-white">
      {/* Compact Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-emerald-700 text-white py-8 px-8">
        <div className="absolute inset-0 opacity-10">
          {["🌿", "🌳", "♻️", "🌊", "🌱"].map((emoji, i) => (
            <span key={i} className="absolute text-5xl select-none"
              style={{ top: `${10 + i * 18}%`, left: `${5 + i * 22}%`, opacity: 0.5 }}>
              {emoji}
            </span>
          ))}
        </div>
        <div className="relative max-w-5xl">
          <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs text-green-200 mb-3">
            <Globe className="h-3 w-3" /> Live Environmental Impact Data
          </div>
          <h1 className="text-[28px] md:text-[34px] font-extrabold mb-1.5">Eco Impact Dashboard</h1>
          <p className="text-green-200 text-sm max-w-md">
            Real-time overview of CivicConnect Eco's collective environmental footprint
          </p>
          {stats && (
            <div className="flex gap-3 mt-5">
              {[
                { label: "Events", value: stats.totalEvents },
                { label: "Volunteers", value: stats.totalVolunteers },
                { label: "NGOs", value: stats.activeNgos },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 min-w-[90px] text-center">
                  <p className="text-xl font-extrabold text-white">{value?.toLocaleString()}</p>
                  <p className="text-[10px] text-green-300">{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="px-8 py-6 max-w-[1400px]">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
          {STATS.map(({ key, label, icon, color, textColor, desc, suffix }) => {
            const rawValue = stats ? (stats as any)[key] : 0;
            const value = typeof rawValue === "number" ? rawValue : 0;
            return (
              <div key={key}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group border border-gray-100">
                <div className={`h-1 bg-gradient-to-r ${color}`} />
                <div className="p-4">
                  <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br ${color} shadow-sm mb-3 group-hover:scale-110 transition-transform`}>
                    <span className="text-lg">{icon}</span>
                  </div>
                  <div className={`text-2xl font-extrabold ${textColor} mb-0.5`}>
                    {stats ? <AnimatedCounter value={Math.round(value * 10) / 10} suffix={suffix} /> : "—"}
                  </div>
                  <p className="font-semibold text-gray-800 text-xs">{label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CO2 impact story */}
        {stats && (
          <div className="mt-5 bg-gradient-to-r from-green-700 to-emerald-700 rounded-xl p-5 text-white shadow-md">
            <div className="flex items-start gap-3">
              <div className="text-3xl">🌍</div>
              <div>
                <h3 className="text-sm font-bold mb-1">Carbon Footprint Reduction Estimate</h3>
                <p className="text-green-200 text-xs mb-3">
                  Based on {stats.treesPlanted} trees planted × 21 kg CO₂/tree/year + waste diverted from landfill
                </p>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="bg-white/15 rounded-lg px-3 py-2">
                    <p className="text-lg font-extrabold">{Math.round(stats.co2ReductionEstimateKg).toLocaleString()} kg</p>
                    <p className="text-[10px] text-green-300">Estimated CO₂ offset</p>
                  </div>
                  <div className="bg-white/15 rounded-lg px-3 py-2">
                    <p className="text-lg font-extrabold">{Math.round(stats.co2ReductionEstimateKg / 2400 * 100) / 100}</p>
                    <p className="text-[10px] text-green-300">Equivalent trees/year</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pipeline indicator */}
        <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-1.5 text-sm">
            <TrendingUp className="h-4 w-4 text-green-600" /> CivicConnect Eco — Action Pipeline
          </h3>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { step: "Report", icon: "📍", color: "bg-blue-100 text-blue-700" },
              { step: "AI Analysis", icon: "🤖", color: "bg-purple-100 text-purple-700" },
              { step: "NGO Alert", icon: "🔔", color: "bg-amber-100 text-amber-700" },
              { step: "Event Created", icon: "📅", color: "bg-green-100 text-green-700" },
              { step: "Volunteers Join", icon: "👥", color: "bg-teal-100 text-teal-700" },
              { step: "Eco Impact", icon: "🌿", color: "bg-emerald-100 text-emerald-700" },
            ].map((item, idx, arr) => (
              <div key={item.step} className="flex items-center gap-1.5 shrink-0">
                <div className={`${item.color} rounded-lg px-2.5 py-1.5 text-center min-w-[76px]`}>
                  <div className="text-base mb-0.5">{item.icon}</div>
                  <p className="text-[10px] font-semibold">{item.step}</p>
                </div>
                {idx < arr.length - 1 && (
                  <div className="text-gray-300 font-bold text-xs">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EcoImpactDashboard;
