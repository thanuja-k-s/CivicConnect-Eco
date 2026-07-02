import api from "./api";
import { AppNotification, EcoImpactStats } from "@/types";

export const notificationService = {
  getUserNotifications: async (userId: number) => {
    const res = await api.get(`/notifications/user/${userId}`);
    return res.data as AppNotification[];
  },

  getUnreadCount: async (userId: number) => {
    const res = await api.get(`/notifications/user/${userId}/unread-count`);
    return (res.data as { count: number }).count;
  },

  markRead: async (notificationId: number) => {
    await api.put(`/notifications/${notificationId}/read`);
  },

  markAllRead: async (userId: number) => {
    await api.put(`/notifications/user/${userId}/read-all`);
  },
};

export const impactService = {
  getDashboard: async () => {
    const res = await api.get("/impact/dashboard");
    return res.data as EcoImpactStats;
  },
};
