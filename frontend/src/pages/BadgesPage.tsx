import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { gamificationService } from "@/services/gamificationService";
import { Badge, UserBadge, EcoPoints } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Lock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const BadgesPage = () => {
  const { user } = useAuth();
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<UserBadge[]>([]);
  const [points, setPoints] = useState<EcoPoints | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const badges = await gamificationService.getAllBadges();
      setAllBadges(badges);
      if (user) {
        const [earned, pts] = await Promise.all([
          gamificationService.getUserBadges(Number(user.id)),
          gamificationService.getUserPoints(Number(user.id)),
        ]);
        setEarnedBadges(earned);
        setPoints(pts);
      }
      setLoading(false);
    };
    load().catch(() => setLoading(false));
  }, [user]);

  const earnedCodes = new Set(earnedBadges.map(ub => ub.badge.badgeCode));
  const totalPoints = points?.totalPoints || 0;
  const nextBadge = allBadges.find(b => !earnedCodes.has(b.badgeCode));
  const progressToNext = nextBadge ? Math.min((totalPoints / nextBadge.requiredPoints) * 100, 100) : 100;

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Compact Hero */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-700 text-white py-7 px-8">
        <div className="flex items-center gap-3">
          <div className="text-4xl">🏆</div>
          <div>
            <h1 className="text-[26px] font-extrabold leading-tight">Eco Badges</h1>
            <p className="text-emerald-200 text-xs mt-0.5">Earn badges by accumulating Eco Points through environmental action</p>
          </div>
          {user && points && (
            <div className="ml-auto inline-flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap">
              ✨ <span className="text-yellow-300 font-extrabold">{totalPoints.toLocaleString()}</span> pts
            </div>
          )}
        </div>
      </div>

      <div className="px-8 py-5 max-w-4xl">
        {/* Progress to next badge */}
        {user && nextBadge && (
          <Card className="mb-4 shadow-sm border-0 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-semibold text-gray-700">Progress to <strong>{nextBadge.name}</strong> {nextBadge.icon}</p>
                <p className="text-[10px] text-gray-500">{totalPoints} / {nextBadge.requiredPoints} pts</p>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressToNext}%` }} />
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                {nextBadge.requiredPoints - totalPoints > 0
                  ? `${(nextBadge.requiredPoints - totalPoints).toLocaleString()} more points needed`
                  : "Unlocking soon..."}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Badge grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {allBadges.map(badge => {
            const isEarned = earnedCodes.has(badge.badgeCode);
            const earnedEntry = earnedBadges.find(ub => ub.badge.badgeCode === badge.badgeCode);
            return (
              <Card key={badge.id}
                className={cn("shadow-sm border-0 transition-all duration-300 hover:shadow-md",
                  isEarned ? "bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200" : "bg-gray-50 opacity-70")}>
                <CardContent className="p-3.5 text-center">
                  <div className={cn("text-3xl mb-2 transition-all", isEarned ? "" : "grayscale opacity-40")}>
                    {badge.icon}
                  </div>
                  <h3 className={cn("font-bold text-xs mb-0.5", isEarned ? "text-green-800" : "text-gray-500")}>
                    {badge.name}
                  </h3>
                  <p className="text-[10px] text-gray-500 mb-2 line-clamp-2">{badge.description}</p>
                  <div className={cn("inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-semibold",
                    isEarned ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500")}>
                    {isEarned ? (
                      <><CheckCircle2 className="h-2.5 w-2.5" /> Earned</>
                    ) : (
                      <><Lock className="h-2.5 w-2.5" /> {badge.requiredPoints.toLocaleString()} pts</>
                    )}
                  </div>
                  {isEarned && earnedEntry && (
                    <p className="text-[9px] text-gray-400 mt-1.5">
                      {new Date(earnedEntry.awardedAt).toLocaleDateString("en-IN")}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Points breakdown */}
        {user && points && (
          <Card className="mt-4 shadow-sm border-0">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-800 mb-3 text-sm">Your Eco Points Breakdown</h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: "This Week", value: points.weeklyPoints, color: "text-blue-600" },
                  { label: "This Month", value: points.monthlyPoints, color: "text-purple-600" },
                  { label: "All Time", value: points.lifetimePoints, color: "text-green-700" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-2.5">
                    <p className={cn("text-xl font-extrabold", color)}>{value.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BadgesPage;
