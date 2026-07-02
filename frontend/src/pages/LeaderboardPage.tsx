import { useEffect, useState } from "react";
import { gamificationService } from "@/services/gamificationService";
import { LeaderboardEntry } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trophy, Medal, Star, Zap, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type Period = "weekly" | "monthly" | "all-time";

const PERIOD_TABS: { value: Period; label: string }[] = [
  { value: "weekly", label: "📅 This Week" },
  { value: "monthly", label: "📆 This Month" },
  { value: "all-time", label: "🏆 All Time" },
];

const PODIUM_COLORS = [
  "from-yellow-400 to-amber-500",
  "from-gray-300 to-gray-400",
  "from-amber-600 to-orange-600",
];
const PODIUM_HEIGHTS = ["h-28", "h-20", "h-16"];

const LeaderboardPage = () => {
  const [period, setPeriod] = useState<Period>("all-time");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    gamificationService.getLeaderboard(period).then(data => {
      setEntries(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [period]);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-green-800 via-green-700 to-emerald-700 text-white py-10 px-4 text-center">
        <Trophy className="h-12 w-12 mx-auto mb-2 text-yellow-300" />
        <h1 className="text-3xl font-extrabold">Eco Leaderboard</h1>
        <p className="text-green-200 mt-1 text-sm">Top environmental champions of CivicConnect Eco</p>

        {/* Period tabs */}
        <div className="flex gap-2 justify-center mt-5 flex-wrap">
          {PERIOD_TABS.map(t => (
            <button key={t.value} onClick={() => setPeriod(t.value)}
              className={cn("px-4 py-1.5 rounded-full text-sm font-semibold transition-all",
                period === t.value ? "bg-white text-green-800 shadow" : "bg-white/20 text-white hover:bg-white/30")}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="container mx-auto max-w-2xl px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-10 w-10 animate-spin text-green-600" /></div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No data yet</p>
            <p className="text-sm">Start participating in events to appear on the leaderboard!</p>
          </div>
        ) : (
          <>
            {/* Podium */}
            {top3.length >= 1 && (
              <div className="flex items-end justify-center gap-3 mb-8">
                {[top3[1], top3[0], top3[2]].filter(Boolean).map((entry, idx) => {
                  const actualRank = entry.rank;
                  const podiumIdx = actualRank === 1 ? 1 : actualRank === 2 ? 0 : 2;
                  return (
                    <div key={entry.userId} className="flex flex-col items-center gap-2">
                      <div className="text-2xl">{entry.topBadgeIcon || "🌱"}</div>
                      <div className="text-center">
                        <p className="text-xs font-bold text-gray-800 max-w-[80px] truncate">{entry.userName}</p>
                        <p className="text-xs text-gray-500">{entry.totalPoints.toLocaleString()} pts</p>
                      </div>
                      <div className={cn("w-20 rounded-t-xl flex items-center justify-center text-white font-extrabold text-lg bg-gradient-to-b shadow-lg", PODIUM_COLORS[podiumIdx], PODIUM_HEIGHTS[podiumIdx])}>
                        {actualRank === 1 ? "👑" : actualRank === 2 ? "🥈" : "🥉"}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Full ranking */}
            <Card className="shadow-sm border-0">
              <CardHeader className="border-b pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500" /> Full Rankings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {entries.map(entry => (
                  <div key={entry.userId}
                    className={cn("flex items-center gap-4 px-5 py-3.5 border-b last:border-0 hover:bg-gray-50 transition-colors",
                      entry.rank <= 3 && "bg-gradient-to-r from-amber-50/50 to-transparent")}>
                    {/* Rank */}
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold shrink-0",
                      entry.rank === 1 ? "bg-yellow-400 text-yellow-900" :
                      entry.rank === 2 ? "bg-gray-300 text-gray-700" :
                      entry.rank === 3 ? "bg-amber-600 text-white" : "bg-gray-100 text-gray-500")}>
                      {entry.rank}
                    </div>
                    {/* Badge + Name */}
                    <div className="text-xl shrink-0">{entry.topBadgeIcon || "🌱"}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{entry.userName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {entry.topBadgeName && (
                          <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">{entry.topBadgeName}</span>
                        )}
                        <span className="text-xs text-gray-400">{entry.attendedEvents} events attended</span>
                      </div>
                    </div>
                    {/* Points */}
                    <div className="text-right shrink-0">
                      <p className="font-extrabold text-green-700">{entry.totalPoints.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">Eco Points</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
