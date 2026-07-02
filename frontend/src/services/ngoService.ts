import api from "./api";
import { Ngo, NgoStatus } from "@/types";

export const ngoService = {
  register: async (data: {
    name: string; registrationNumber: string; organizationType: string;
    contactPersonName: string; email: string; phone: string; address: string;
    description: string; website?: string; documentUrl?: string; createdByUserId: number;
  }) => {
    const res = await api.post("/ngo/register", data);
    return res.data as Ngo;
  },

  getMyNgo: async (userId: number) => {
    const res = await api.get(`/ngo/my/${userId}`);
    return res.data as Ngo;
  },

  getById: async (id: number) => {
    const res = await api.get(`/ngo/${id}`);
    return res.data as Ngo;
  },

  getPendingNgos: async () => {
    const res = await api.get("/ngo/pending");
    return res.data as Ngo[];
  },

  getActiveNgos: async () => {
    const res = await api.get("/ngo/active");
    return res.data as Ngo[];
  },

  getAllNgos: async () => {
    const res = await api.get("/ngo/all");
    return res.data as Ngo[];
  },

  approveNgo: async (id: number) => {
    const res = await api.put(`/ngo/${id}/approve`);
    return res.data as Ngo;
  },

  rejectNgo: async (id: number, reason?: string) => {
    const res = await api.put(`/ngo/${id}/reject`, { reason });
    return res.data as Ngo;
  },

  suspendNgo: async (id: number) => {
    const res = await api.put(`/ngo/${id}/suspend`);
    return res.data as Ngo;
  },
};
