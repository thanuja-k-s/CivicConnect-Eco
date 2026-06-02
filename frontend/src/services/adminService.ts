import api from "./api";
import { Complaint, ComplaintStatus, Worker } from "@/types";
import { mapComplaint } from "./mappingUtils";

export const adminService = {
  async getAllComplaints(): Promise<Complaint[]> {
    try {
      const response = await api.get("/complaints", { silent401: true });
      return Array.isArray(response.data) ? response.data.map(mapComplaint) : [];
    } catch (error) {
      console.error("Error fetching all complaints:", error);
      return [];
    }
  },

  async getWorkers(): Promise<Worker[]> {
    try {
      const response = await api.get("/users/role/WORKER"); // Backend uses uppercase
      // Backend User has fullName, frontend Worker has name
      return Array.isArray(response.data) ? response.data.map((u: any) => ({
        id: u.id.toString(),
        name: u.fullName || u.name || "Unknown Worker",
        email: u.email
      })) : [];
    } catch (error) {
      console.error("Error fetching workers:", error);
      return [];
    }
  },

  async assignWorker(complaintId: string, workerId: string): Promise<Complaint> {
    try {
      const response = await api.post(`/complaints/${complaintId}/assign/${workerId}`);
      return mapComplaint(response.data);
    } catch (error) {
      console.error("Error assigning worker:", error);
      throw error;
    }
  },

  async updateStatus(complaintId: string, status: ComplaintStatus, message: string): Promise<Complaint> {
    try {
      // If backend only has /resolve, we might need to check other status updates
      // For now, assume a generic update or specifically /resolve if status is resolved
      if (status === "resolved") {
        const response = await api.post(`/complaints/${complaintId}/resolve`, message);
        return mapComplaint(response.data);
      }

      // Generic status update if available, or just throw if not implemented
      throw new Error(`Status update for ${status} not directly implemented in generic call`);
    } catch (error) {
      console.error("Error updating status:", error);
      throw error;
    }
  },
};
