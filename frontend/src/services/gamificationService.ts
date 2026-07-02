import api from "./api";
import { Badge, UserBadge, EcoPoints, EcoPointTransaction, LeaderboardEntry } from "@/types";

export const gamificationService = {
  // ── Badges ──────────────────────────────────────────────────────────────────
  getAllBadges: async () => {
    const res = await api.get("/gamification/badges");
    return res.data as Badge[];
  },

  getUserBadges: async (userId: number) => {
    const res = await api.get(`/gamification/badges/user/${userId}`);
    return res.data as UserBadge[];
  },

  // ── Eco Points ───────────────────────────────────────────────────────────────
  getUserPoints: async (userId: number) => {
    const res = await api.get(`/gamification/points/${userId}`);
    return res.data as EcoPoints;
  },

  getUserTransactions: async (userId: number) => {
    const res = await api.get(`/gamification/points/${userId}/transactions`);
    return res.data as EcoPointTransaction[];
  },

  // ── Leaderboard ──────────────────────────────────────────────────────────────
  getLeaderboard: async (period: "weekly" | "monthly" | "all-time" = "all-time") => {
    const res = await api.get(`/gamification/leaderboard?period=${period}`);
    return res.data as LeaderboardEntry[];
  },
};
