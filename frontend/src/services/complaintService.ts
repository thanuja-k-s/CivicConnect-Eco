import api from "./api";
import { Complaint, ComplaintCategory } from "@/types";
import { mapComplaint } from "./mappingUtils";

export const complaintService = {
  async getMyComplaints(citizenId: string): Promise<Complaint[]> {
    try {
      console.log(`[ComplaintService] Fetching complaints for citizen ID: ${citizenId}`);
      const response = await api.get(`/complaints/citizen/${citizenId}`, { silent401: true });
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
      const response = await api.get(`/complaints/${id}`, { silent401: true });
      return response.data ? mapComplaint(response.data) : undefined;
    } catch (error) {
      console.error("Error fetching complaint:", error);
      return undefined;
    }
  },

  /**
   * Creates a new complaint.
   * Extended to include voice transcript, GPS accuracy, camera image,
   * AI category/priority, and source flags.
   */
  async createComplaint(data: {
    title: string;
    description: string;
    category: ComplaintCategory;
    image?: string;
    citizenId?: number | string;
    location: { lat: number; lng: number; address: string };

    // ─── Eco Extensions ─────────────────────────────────────────────────────
    voiceTranscript?: string;
    locationAccuracy?: number;
    imageUrl?: string;
    aiCategory?: string;
    aiConfidence?: number;
    priorityLevel?: string;
    priorityReason?: string;
    imageAnalysisResult?: string;
    createdFromVoice?: boolean;
    createdFromCamera?: boolean;
  }): Promise<Complaint> {
    try {
      const payload = {
        // Core fields
        title: data.title,
        description: data.description,
        category: data.category,
        address: data.location.address,
        latitude: data.location.lat,
        longitude: data.location.lng,
        photoUrl: data.image || data.imageUrl || null,
        status: "PENDING",
        citizenId: data.citizenId,

        // Eco extension fields
        voiceTranscript: data.voiceTranscript || null,
        locationAccuracy: data.locationAccuracy || null,
        imageUrl: data.imageUrl || data.image || null,
        aiCategory: data.aiCategory || null,
        aiConfidence: data.aiConfidence || null,
        priorityLevel: data.priorityLevel || null,
        priorityReason: data.priorityReason || null,
        imageAnalysisResult: data.imageAnalysisResult || null,
        createdFromVoice: data.createdFromVoice ?? false,
        createdFromCamera: data.createdFromCamera ?? false,
      };
      console.log("Submitting complaint:", { ...payload, photoUrl: payload.photoUrl ? "[base64]" : null });
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
      const response = await api.get(`/complaints/complaint-id/${id}`, { silent401: true });
      if (response.data) {
        return mapComplaint(response.data);
      }
    } catch (error) {
      console.log(`CMP-ID track failed for ${id}, checking if it is a database ID...`);
    }

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
      console.log("[ComplaintService] Fetching all complaints");
      const response = await api.get(`/complaints`);
      const result = Array.isArray(response.data) ? response.data.map(mapComplaint) : [];
      console.log("[ComplaintService] ✓ All complaints fetched:", result.length, "items");
      return result;
    } catch (error) {
      console.error("[ComplaintService] ✗ Error fetching all complaints:", error);
      return [];
    }
  },

  /** Fetch all complaints sorted by priority (CRITICAL first) — for worker queue */
  async getAllComplaintsByPriority(): Promise<Complaint[]> {
    try {
      const response = await api.get(`/complaints/sorted-by-priority`);
      return Array.isArray(response.data) ? response.data.map(mapComplaint) : [];
    } catch (error) {
      console.error("[ComplaintService] ✗ Error fetching priority-sorted complaints:", error);
      // Fallback to unsorted list
      return this.getAllComplaints();
    }
  },

  /** Fetch only CRITICAL (emergency) complaints — for admin dashboard */
  async getEmergencyComplaints(): Promise<Complaint[]> {
    try {
      const response = await api.get(`/complaints/emergency`);
      return Array.isArray(response.data) ? response.data.map(mapComplaint) : [];
    } catch (error) {
      console.error("[ComplaintService] ✗ Error fetching emergency complaints:", error);
      return [];
    }
  },

  /** Fetch complaints filtered by priority level */
  async getComplaintsByPriority(level: string): Promise<Complaint[]> {
    try {
      const response = await api.get(`/complaints/priority/${level}`);
      return Array.isArray(response.data) ? response.data.map(mapComplaint) : [];
    } catch (error) {
      console.error("[ComplaintService] ✗ Error fetching complaints by priority:", error);
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
