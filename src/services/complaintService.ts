import api from "./api";
import { Complaint, ComplaintCategory } from "@/types";
import { mapComplaint } from "./mappingUtils";

export const complaintService = {
  async getMyComplaints(citizenId: string): Promise<Complaint[]> {
    try {
      console.log(`[ComplaintService] Fetching complaints for citizen ID: ${citizenId}`);
      // silent401: background fetch — don't logout user if this fails
      const response = await api.get(`/complaints/citizen/${citizenId}`, {
        silent401: true,
      });
      console.log(`[ComplaintService] ✓ Response received:`, response.status, response.data);
      const result = Array.isArray(response.data) ? response.data.map(mapComplaint) : [];
      console.log(`[ComplaintService] ✓ Mapped complaints:`, result.length, "items");
      return result;
    } catch (error) {
      console.error("[ComplaintService] ✗ Error fetching complaints:", error);
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

  async getAllComplaints(): Promise<Complaint[]> {
    try {
      console.log("[ComplaintService] Fetching all complaints for workers");
      const response = await api.get(`/complaints`);
      const result = Array.isArray(response.data) ? response.data.map(mapComplaint) : [];
      console.log("[ComplaintService] ✓ All complaints fetched:", result.length, "items");
      return result;
    } catch (error) {
      console.error("[ComplaintService] ✗ Error fetching all complaints:", error);
      return [];
    }
  },

  async updateComplaintStatus(id: string, status: string, resolutionNotes?: string): Promise<Complaint | undefined> {
    try {
      console.log(`[ComplaintService] Updating complaint ${id} status to ${status}`);
      const payload = {
        status,
        resolutionNotes: resolutionNotes || "",
      };
      console.log("[ComplaintService] Payload:", payload);
      const response = await api.put(`/complaints/${id}/status`, payload);
      console.log(`[ComplaintService] ✓ Complaint updated:`, response.data);
      return response.data ? mapComplaint(response.data) : undefined;
    } catch (error) {
      console.error("[ComplaintService] ✗ Error updating complaint:", error);
      throw error;
    }
  },

  async resolveComplaint(id: string, notes: string): Promise<Complaint | undefined> {
    try {
      console.log(`[ComplaintService] Resolving complaint ${id}`);
      const response = await api.post(`/complaints/${id}/resolve`, notes);
      console.log(`[ComplaintService] ✓ Complaint resolved:`, response.data);
      return response.data ? mapComplaint(response.data) : undefined;
    } catch (error) {
      console.error("[ComplaintService] ✗ Error resolving complaint:", error);
      throw error;
    }
  },
};



