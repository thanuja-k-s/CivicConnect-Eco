import { Complaint, ComplaintCategory, ComplaintStatus } from "@/types";

/**
 * mapComplaint
 *
 * Maps a raw backend response (flat structure) to the frontend Complaint interface (nested).
 * Handles both camelCase and snake_case fallbacks.
 * Extended to map all new Eco module fields.
 */
export const mapComplaint = (data: any): Complaint => {
    if (!data) return null as any;

    // Normalize (backend is capitalized/spaced, frontend is lowercase/hyphenated)
    const normalizeStatus = (val: string) => val?.toLowerCase() || "";
    const normalizeCategory = (val: string) => val?.toLowerCase().replace(/ /g, "-") || "";

    // Handle common snake_case/camelCase fallbacks
    const getField = (obj: any, camel: string, snake: string) =>
        obj[camel] !== undefined ? obj[camel] : obj[snake];

    const citizen = getField(data, "citizen", "citizen");
    const worker = getField(data, "assignedWorker", "assigned_worker");

    return {
        // ─── Core fields ──────────────────────────────────────────────────────
        id: (data.id || data._id || "").toString(),
        complaintId: getField(data, "complaintId", "complaint_id") || "",
        title: data.title || "",
        description: data.description || "",
        category: normalizeCategory(data.category) as ComplaintCategory,
        status: normalizeStatus(data.status) as ComplaintStatus,
        image: getField(data, "photoUrl", "photo_url") || data.image || null,
        photoUrl: getField(data, "photoUrl", "photo_url") || null,

        // Location (flat and nested)
        address: getField(data, "address", "address") || "",
        latitude: getField(data, "latitude", "latitude") || null,
        longitude: getField(data, "longitude", "longitude") || null,
        location: {
            lat: getField(data, "latitude", "latitude") || 28.6139,
            lng: getField(data, "longitude", "longitude") || 77.209,
            address: getField(data, "address", "address") || "New Delhi, India",
        },

        // Citizen / worker
        citizenId: citizen?.id?.toString() || data.citizenId?.toString() || "",
        citizenName: citizen?.fullName || citizen?.name || data.citizenName || "",
        assignedWorkerId: worker?.id?.toString() || data.assignedWorkerId?.toString() || undefined,
        assignedWorkerName: worker?.fullName || worker?.name || data.assignedWorkerName || undefined,

        // Timestamps
        createdAt: getField(data, "createdAt", "created_at") || new Date().toISOString(),
        updatedAt: getField(data, "updatedAt", "updated_at") || new Date().toISOString(),

        // Timeline (generated if not present)
        timeline: data.timeline
            ? data.timeline.map((t: any) => ({
                  ...t,
                  status: normalizeStatus(t.status) as ComplaintStatus,
              }))
            : [
                  {
                      id: "1",
                      status: normalizeStatus(data.status) as ComplaintStatus,
                      message: "Status: " + (data.status || "Pending"),
                      date: getField(data, "createdAt", "created_at") || new Date().toISOString(),
                      by: citizen?.fullName || citizen?.name || "System",
                  },
              ],

        // ─── ECO: Voice fields ─────────────────────────────────────────────────
        voiceTranscript: getField(data, "voiceTranscript", "voice_transcript") || undefined,
        createdFromVoice: getField(data, "createdFromVoice", "created_from_voice") ?? false,

        // ─── ECO: GPS fields ───────────────────────────────────────────────────
        locationAccuracy: getField(data, "locationAccuracy", "location_accuracy") || undefined,

        // ─── ECO: Camera fields ────────────────────────────────────────────────
        imageUrl: getField(data, "imageUrl", "image_url") || undefined,
        createdFromCamera: getField(data, "createdFromCamera", "created_from_camera") ?? false,

        // ─── ECO: AI category fields ───────────────────────────────────────────
        aiCategory: getField(data, "aiCategory", "ai_category") || undefined,
        aiConfidence: getField(data, "aiConfidence", "ai_confidence") || undefined,

        // ─── ECO: AI priority fields ───────────────────────────────────────────
        priorityLevel: getField(data, "priorityLevel", "priority_level") || undefined,
        priorityReason: getField(data, "priorityReason", "priority_reason") || undefined,

        // ─── ECO: Image analysis result ────────────────────────────────────────
        imageAnalysisResult: getField(data, "imageAnalysisResult", "image_analysis_result") || undefined,

        // Resolution notes
        resolutionNotes: getField(data, "resolutionNotes", "resolution_notes") || undefined,
    };
};
