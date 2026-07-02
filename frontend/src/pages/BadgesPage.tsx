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

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-green-600" /></div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-700 text-white py-10 px-4 text-center">
        <div className="text-5xl mb-2">🏆</div>
        <h1 className="text-3xl font-extrabold">Eco Badges</h1>
        <p className="text-emerald-200 text-sm mt-1">Earn badges by accumulating Eco Points through environmental action</p>
        {user && points && (
          <div className="mt-4 inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm font-semibold">
            ✨ Your Points: <span className="text-yellow-300 font-extrabold">{totalPoints.toLocaleString()}</span>
          </div>
        )}
      </div>

      <div className="container mx-auto max-w-3xl px-4 py-8">
        {/* Progress to next badge */}
        {user && nextBadge && (
          <Card className="mb-6 shadow-sm border-0 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-700">Progress to <strong>{nextBadge.name}</strong> {nextBadge.icon}</p>
                <p className="text-xs text-gray-500">{totalPoints} / {nextBadge.requiredPoints} pts</p>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressToNext}%` }} />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {nextBadge.requiredPoints - totalPoints > 0
                  ? `${(nextBadge.requiredPoints - totalPoints).toLocaleString()} more points needed`
                  : "Unlocking soon..."}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Badge grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {allBadges.map(badge => {
            const isEarned = earnedCodes.has(badge.badgeCode);
            const earnedEntry = earnedBadges.find(ub => ub.badge.badgeCode === badge.badgeCode);
            return (
              <Card key={badge.id}
                className={cn("shadow-sm border-0 transition-all duration-300 hover:shadow-md",
                  isEarned ? "bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200" : "bg-gray-50 opacity-70")}>
                <CardContent className="p-5 text-center">
                  <div className={cn("text-4xl mb-3 transition-all", isEarned ? "" : "grayscale opacity-40")}>
                    {badge.icon}
                  </div>
                  <h3 className={cn("font-bold text-sm mb-1", isEarned ? "text-green-800" : "text-gray-500")}>
                    {badge.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{badge.description}</p>
                  <div className={cn("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold",
                    isEarned ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500")}>
                    {isEarned ? (
                      <><CheckCircle2 className="h-3 w-3" /> Earned</>
                    ) : (
                      <><Lock className="h-3 w-3" /> {badge.requiredPoints.toLocaleString()} pts</>
                    )}
                  </div>
                  {isEarned && earnedEntry && (
                    <p className="text-xs text-gray-400 mt-2">
                      Awarded {new Date(earnedEntry.awardedAt).toLocaleDateString("en-IN")}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Points breakdown */}
        {user && points && (
          <Card className="mt-6 shadow-sm border-0">
            <CardContent className="p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Your Eco Points Breakdown</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { label: "This Week", value: points.weeklyPoints, color: "text-blue-600" },
                  { label: "This Month", value: points.monthlyPoints, color: "text-purple-600" },
                  { label: "All Time", value: points.lifetimePoints, color: "text-green-700" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className={cn("text-2xl font-extrabold", color)}>{value.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
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
