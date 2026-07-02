import api from "./api";
import { Participation } from "@/types";

export const participationService = {
  joinEvent: async (userId: number, eventId: number) => {
    const res = await api.post(`/participation/join/${eventId}`, { userId });
    return res.data as Participation;
  },

  cancelParticipation: async (userId: number, eventId: number) => {
    await api.delete(`/participation/cancel/${eventId}?userId=${userId}`);
  },

  /** GPS-only attendance verification */
  verifyGpsAttendance: async (userId: number, eventId: number, lat: number, lng: number) => {
    const res = await api.post("/participation/attend/gps", {
      userId, eventId, latitude: lat, longitude: lng,
    });
    return res.data as { message: string; status: string; distanceMeters: number; attendedAt: string };
  },

  getUserParticipations: async (userId: number) => {
    const res = await api.get(`/participation/user/${userId}`);
    return res.data as Participation[];
  },

  getEventParticipants: async (eventId: number) => {
    const res = await api.get(`/participation/event/${eventId}`);
    return res.data as Participation[];
  },

  getParticipationStatus: async (userId: number, eventId: number) => {
    const res = await api.get(`/participation/status?userId=${userId}&eventId=${eventId}`);
    return res.data as { status: string; joinedAt?: string };
  },
};
