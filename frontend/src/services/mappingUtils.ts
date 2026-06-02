import { Complaint, ComplaintCategory, ComplaintStatus } from "@/types";

// Map backend response (flat structure) to frontend interface (nested structure)
export const mapComplaint = (data: any): Complaint => {
    if (!data) return null as any;

    // Log raw data for easier debugging of field names if anything is missing
    console.log("Mapping raw complaint data:", data);

    // Normalize (backend is capitalized/spaced, frontend is lowercase/hyphenated)
    const normalizeStatus = (val: string) => val?.toLowerCase() || "";
    const normalizeCategory = (val: string) => val?.toLowerCase().replace(/ /g, "-") || "";

    // Handle common snake_case/camelCase fallbacks from different backend versions
    const getField = (obj: any, camel: string, snake: string) => obj[camel] !== undefined ? obj[camel] : obj[snake];

    const citizen = getField(data, "citizen", "citizen");
    const worker = getField(data, "assignedWorker", "assigned_worker");

    return {
        id: (data.id || data._id || "").toString(),
        complaintId: getField(data, "complaintId", "complaint_id") || "",
        title: data.title || "",
        description: data.description || "",
        category: normalizeCategory(data.category) as ComplaintCategory,
        status: normalizeStatus(data.status) as ComplaintStatus,
        image: getField(data, "photoUrl", "photo_url") || data.image || null,
        location: {
            lat: getField(data, "latitude", "latitude") || 28.6139,
            lng: getField(data, "longitude", "longitude") || 77.209,
            address: getField(data, "address", "address") || "New Delhi, India",
        },
        // Map citizen and assigned worker details
        citizenId: citizen?.id?.toString() || data.citizenId?.toString() || "",
        citizenName: citizen?.fullName || citizen?.name || data.citizenName || "",
        assignedWorkerId: worker?.id?.toString() || data.assignedWorkerId?.toString() || undefined,
        assignedWorkerName: worker?.fullName || worker?.name || data.assignedWorkerName || undefined,
        createdAt: getField(data, "createdAt", "created_at") || new Date().toISOString(),
        updatedAt: getField(data, "updatedAt", "updated_at") || new Date().toISOString(),
        timeline: data.timeline ? data.timeline.map((t: any) => ({
            ...t,
            status: normalizeStatus(t.status) as ComplaintStatus,
        })) : [
            {
                id: "1",
                status: normalizeStatus(data.status) as ComplaintStatus,
                message: "Status: " + (data.status || "Pending"),
                date: getField(data, "createdAt", "created_at") || new Date().toISOString(),
                by: citizen?.fullName || citizen?.name || "System",
            }
        ],
    };
};
