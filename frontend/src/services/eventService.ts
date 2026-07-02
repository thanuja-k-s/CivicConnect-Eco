import api from "./api";
import { NgoEvent } from "@/types";

export const eventService = {
  createEvent: async (data: Partial<NgoEvent> & { ngoId: number }) => {
    const res = await api.post("/events", data);
    return res.data as NgoEvent;
  },

  updateEvent: async (id: number, data: Partial<NgoEvent>) => {
    const res = await api.put(`/events/${id}`, data);
    return res.data as NgoEvent;
  },

  getAllEvents: async () => {
    const res = await api.get("/events");
    return res.data as NgoEvent[];
  },

  getUpcomingEvents: async () => {
    const res = await api.get("/events/upcoming");
    return res.data as NgoEvent[];
  },

  getEventById: async (id: number) => {
    const res = await api.get(`/events/${id}`);
    return res.data as NgoEvent;
  },

  getEventsByNgo: async (ngoId: number) => {
    const res = await api.get(`/events/ngo/${ngoId}`);
    return res.data as NgoEvent[];
  },

  getNearbyEvents: async (lat: number, lng: number, radiusKm = 20) => {
    const res = await api.get(`/events/nearby?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`);
    return res.data as NgoEvent[];
  },

  cancelEvent: async (id: number) => {
    const res = await api.put(`/events/${id}/cancel`);
    return res.data as NgoEvent;
  },

  completeEvent: async (id: number) => {
    const res = await api.put(`/events/${id}/complete`);
    return res.data as NgoEvent;
  },
};
