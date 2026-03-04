import api from "./api";
import { Complaint, ComplaintCategory } from "@/types";
import { mapComplaint } from "./mappingUtils";

export const complaintService = {
  async getMyComplaints(citizenId: string): Promise<Complaint[]> {
    try {
      // silent401: background fetch — don't logout user if this fails
      const response = await api.get(`/complaints/citizen/${citizenId}`, {
        silent401: true,
      });
      return Array.isArray(response.data) ? response.data.map(mapComplaint) : [];
    } catch (error) {
      console.error("Error fetching complaints:", error);
      return [];
    }
  },

  async getComplaintById(id: string): Promise<Complaint | undefined> {
    try {
      // silent401: background fetch
      const response = await api.get(`/complaints/${id}`, { silent401: true });
      return response.data ? mapComplaint(response.data) : undefined;
    } catch (error) {
      console.error("Error fetching complaint:", error);
      return undefined;
    }
  },

  async createComplaint(data: {
    title: string;
    description: string;
    category: ComplaintCategory;
    image?: string;
    citizenId?: number | string;
    location: { lat: number; lng: number; address: string };
  }): Promise<Complaint> {
    try {
      const payload = {
        title: data.title,
        description: data.description,
        category: data.category,
        address: data.location.address,
        latitude: data.location.lat,
        longitude: data.location.lng,
        photoUrl: data.image || null,
        status: "PENDING",
        citizenId: data.citizenId,
      };
      console.log("Submitting complaint:", payload);
      const response = await api.post("/complaints", payload);
      console.log("Complaint created successfully:", response.data);
      return mapComplaint(response.data);
    } catch (error) {
      console.error("Error creating complaint:", error);
      throw error;
    }
  },

  async trackComplaint(id: string): Promise<Complaint | undefined> {
    try {
      console.log(`Tracking complaint with ID: ${id}`);
      // 1. Try tracking by user-friendly CMP-ID first
      const response = await api.get(`/complaints/complaint-id/${id}`, {
        silent401: true,
      });
      if (response.data) {
        return mapComplaint(response.data);
      }
    } catch (error) {
      console.log(`CMP-ID track failed for ${id}, checking if it is a database ID...`);
    }

    // 2. If it is numeric, try searching by database primary key ID
    if (/^\d+$/.test(id)) {
      try {
        const response = await api.get(`/complaints/${id}`, { silent401: true });
        return response.data ? mapComplaint(response.data) : undefined;
      } catch (error) {
        console.error("Error tracking by database ID:", error);
      }
    }

    return undefined;
  },
};



