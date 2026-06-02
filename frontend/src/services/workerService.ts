import api from "./api";
import { Complaint } from "@/types";
import { mapComplaint } from "./mappingUtils";

export const workerService = {
  async getAssignedTasks(workerId: string): Promise<Complaint[]> {
    try {
      const response = await api.get(`/complaints/worker/${workerId}`, { silent401: true });
      return Array.isArray(response.data) ? response.data.map(mapComplaint) : [];
    } catch (error) {
      console.error("Error fetching assigned tasks:", error);
      return [];
    }
  },

  async markResolved(complaintId: string, resolutionNotes: string): Promise<Complaint> {
    try {
      const response = await api.post(`/complaints/${complaintId}/resolve`, resolutionNotes);
      return mapComplaint(response.data);
    } catch (error) {
      console.error("Error marking resolved:", error);
      throw error;
    }
  },
};
