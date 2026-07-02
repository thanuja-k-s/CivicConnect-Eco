import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { complaintService } from "@/services/complaintService";
import { Complaint } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2, MapPin, CheckCircle2, FileX,
  Flame, AlertTriangle, Shield, Zap, Mic, Camera,
  Navigation, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const PRIORITY_CONFIG = {
  CRITICAL: { label: "CRITICAL", color: "text-red-700",    bg: "bg-red-100",    border: "border-red-400",    Icon: Flame },
  HIGH:     { label: "HIGH",     color: "text-orange-700", bg: "bg-orange-100", border: "border-orange-400", Icon: AlertTriangle },
  MEDIUM:   { label: "MEDIUM",   color: "text-yellow-700", bg: "bg-yellow-100", border: "border-yellow-400", Icon: Shield },
  LOW:      { label: "LOW",      color: "text-blue-700",   bg: "bg-blue-100",   border: "border-blue-400",   Icon: Zap },
};

const PRIORITY_ORDER: Record<string, number> = {
  CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 4,
};

const PriorityBadge = ({ level }: { level?: string }) => {
  if (!level) return null;
  const cfg = PRIORITY_CONFIG[level as keyof typeof PRIORITY_CONFIG];
  if (!cfg) return null;
  return (
    <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1", cfg.color, cfg.bg, cfg.border)}>
      <cfg.Icon className="h-3 w-3" />{level}
    </span>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
const WorkerDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusUpdates, setStatusUpdates] = useState<Record<string, { status: string; notes: string }>>({});
  const [filterPriority, setFilterPriority] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      console.log("[WorkerDashboard] Worker logged in:", user.name);
      // Fetch priority-sorted complaints (CRITICAL first)
      complaintService.getAllComplaintsByPriority().then((data) => {
        console.log("[WorkerDashboard] Loaded complaints (priority-sorted):", data.length);
        setComplaints(data);
        setLoading(false);
      });
    }
  }, [user]);

  // ─── Sort complaints: CRITICAL → HIGH → MEDIUM → LOW, then by date ──────────
  const sortedComplaints = useMemo(() => {
    const filtered = filterPriority === "all"
      ? complaints
      : complaints.filter((c) => c.priorityLevel === filterPriority);

    return [...filtered].sort((a, b) => {
      const pa = PRIORITY_ORDER[a.priorityLevel || ""] || 5;
      const pb = PRIORITY_ORDER[b.priorityLevel || ""] || 5;
      if (pa !== pb) return pa - pb;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [complaints, filterPriority]);

  const handleStatusChange = (complaintId: string, newStatus: string) => {
    setStatusUpdates((prev) => ({
      ...prev,
      [complaintId]: {
        status: newStatus,
        notes: prev[complaintId]?.notes || "",
      },
    }));
  };

  const handleNotesChange = (complaintId: string, notes: string) => {
    setStatusUpdates((prev) => ({
      ...prev,
      [complaintId]: {
        status: prev[complaintId]?.status || "pending",
        notes,
      },
    }));
  };

  const handleUpdateComplaint = async (complaintId: string, id: string) => {
    const update = statusUpdates[complaintId];
    if (!update) {
      toast({ title: "No changes", description: "Update the status first", variant: "destructive" });
      return;
    }

    setUpdating(id);
    try {
      console.log(`[WorkerDashboard] Updating complaint ${id}:`, update);
      const updatedComplaint = await complaintService.updateComplaintStatus(id, update.status, update.notes);
      setComplaints((prev) =>
        prev.map((c) =>
          String(c.id) === String(id)
            ? updatedComplaint || { ...c, status: update.status as any }
            : c
        )
      );
      setStatusUpdates((prev) => {
        const updated = { ...prev };
        delete updated[complaintId];
        return updated;
      });
      setExpandedId(null);
      const statusMessage = update.status === "resolved"
        ? "✅ Marked as Resolved!"
        : `📋 Status updated to ${update.status}!`;
      toast({ title: statusMessage });
    } catch (error) {
      console.error("[WorkerDashboard] Error updating:", error);
      toast({ title: "Failed to update", variant: "destructive" });
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-900";
      case "in_progress": return "bg-blue-100 text-blue-900";
      case "resolved": return "bg-green-100 text-green-900";
      default: return "bg-gray-100 text-gray-900";
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="h-10 w-10 animate-spin text-saffron" />
    </div>
  );

  const pendingComplaints   = complaints.filter((c) => c.status === "pending");
  const inProgressComplaints = complaints.filter((c) => c.status === "in_progress");
  const resolvedComplaints  = complaints.filter((c) => c.status === "resolved");
  const criticalComplaints  = complaints.filter((c) => c.priorityLevel === "CRITICAL");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold mb-1">Worker Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome, {user?.name}. Complaints are sorted by priority — CRITICAL first.
            </p>
          </div>
          {criticalComplaints.length > 0 && (
            <div className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full shadow-lg animate-pulse">
              <Flame className="h-4 w-4" />
              <span className="font-bold text-sm">{criticalComplaints.length} Critical</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Summary Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{pendingComplaints.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-3xl font-bold text-blue-600">{inProgressComplaints.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-3xl font-bold text-green-600">{resolvedComplaints.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-300">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-3xl font-bold text-red-600">{criticalComplaints.length}</p>
              </div>
              <Flame className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Priority Filter ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm font-medium text-slate-600">Filter by priority:</span>
        <div className="flex gap-2 flex-wrap">
          {["all", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={cn(
                "text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors",
                filterPriority === p
                  ? p === "all"
                    ? "bg-slate-800 text-white border-slate-800"
                    : p === "CRITICAL"
                    ? "bg-red-600 text-white border-red-600"
                    : p === "HIGH"
                    ? "bg-orange-500 text-white border-orange-500"
                    : p === "MEDIUM"
                    ? "bg-yellow-500 text-white border-yellow-500"
                    : "bg-blue-500 text-white border-blue-500"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              )}
            >
              {p === "all" ? "All" : p}
              {p !== "all" && (
                <span className="ml-1.5">
                  ({complaints.filter(c => c.priorityLevel === p).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Complaint Cards ──────────────────────────────────────────────────── */}
      {sortedComplaints.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileX className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">No complaints to manage at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedComplaints.map((complaint) => {
            const isExpanded = expandedId === complaint.id;
            const update = statusUpdates[complaint.complaintId];
            const priorityCfg = complaint.priorityLevel
              ? PRIORITY_CONFIG[complaint.priorityLevel as keyof typeof PRIORITY_CONFIG]
              : null;
            const isCritical = complaint.priorityLevel === "CRITICAL";

            return (
              <Card
                key={complaint.id}
                className={cn(
                  "hover:shadow-md transition-shadow cursor-pointer border-l-4",
                  isCritical
                    ? "border-l-red-500 bg-red-50/30"
                    : complaint.priorityLevel === "HIGH"
                    ? "border-l-orange-400"
                    : complaint.priorityLevel === "MEDIUM"
                    ? "border-l-yellow-400"
                    : complaint.priorityLevel === "LOW"
                    ? "border-l-blue-400"
                    : "border-l-slate-200"
                )}
                onClick={() => setExpandedId(isExpanded ? null : complaint.id)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-xs font-mono font-bold text-saffron">{complaint.complaintId}</p>
                        {complaint.createdFromVoice && (
                          <span title="Voice reported" className="flex items-center gap-0.5 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">
                            <Mic className="h-3 w-3" /> Voice
                          </span>
                        )}
                        {complaint.createdFromCamera && (
                          <span title="Camera captured" className="flex items-center gap-0.5 text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-medium">
                            <Camera className="h-3 w-3" /> Camera
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-lg leading-tight">{complaint.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <p className="text-sm text-muted-foreground uppercase tracking-wide">
                          {complaint.category?.replace(/-/g, " ")}
                        </p>
                        {complaint.aiCategory && complaint.aiCategory !== complaint.category && (
                          <span className="text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            AI: {complaint.aiCategory.replace(/-/g, " ")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <StatusBadge status={complaint.status} />
                      {complaint.priorityLevel && <PriorityBadge level={complaint.priorityLevel} />}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">{complaint.description}</p>

                  <div className="text-sm space-y-1">
                    <p><strong>Location:</strong> {complaint.location?.address || "N/A"}</p>
                    {complaint.locationAccuracy && (
                      <p className="text-xs text-muted-foreground">
                        GPS accuracy: ±{Math.round(complaint.locationAccuracy)} m
                      </p>
                    )}
                    <p><strong>Reported by:</strong> {complaint.citizenName || "Citizen"}</p>
                    <p><strong>Date:</strong> {new Date(complaint.createdAt).toLocaleDateString()}</p>
                    {complaint.priorityReason && (
                      <p className="text-xs italic text-muted-foreground">
                        AI reason: {complaint.priorityReason}
                      </p>
                    )}
                  </div>

                  {/* Complaint photo */}
                  {(complaint.image || complaint.imageUrl) && (
                    <div className="w-full rounded-lg overflow-hidden border border-slate-200"
                      style={{ aspectRatio: "16/9", maxHeight: "160px", maxWidth: "400px" }}
                    >
                      <img
                        src={complaint.image || complaint.imageUrl}
                        alt="Issue"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Navigation / Map button */}
                  {complaint.location && complaint.location.lat && (
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${complaint.location.lat}&mlon=${complaint.location.lng}#map=17/${complaint.location.lat}/${complaint.location.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="outline" size="sm" className="gap-2 w-full">
                        <Navigation className="h-4 w-4" />
                        Navigate to Location
                        <MapPin className="h-4 w-4 ml-auto" />
                      </Button>
                    </a>
                  )}

                  {/* Status Update Section */}
                  {isExpanded && complaint.status !== "resolved" && (
                    <div
                      className={`mt-6 pt-6 border-t space-y-4 ${getStatusColor(update?.status || complaint.status)} p-4 rounded-lg`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div>
                        <label className="block text-sm font-medium mb-2">Update Status</label>
                        <Select
                          value={update?.status || complaint.status}
                          onValueChange={(value) => handleStatusChange(complaint.complaintId, value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {(update?.status === "resolved" || complaint.status === "resolved") && (
                        <div>
                          <label className="block text-sm font-medium mb-2">Resolution Notes</label>
                          <Textarea
                            value={update?.notes || complaint.resolutionNotes || ""}
                            onChange={(e) => handleNotesChange(complaint.complaintId, e.target.value)}
                            placeholder="Add notes about how the issue was resolved…"
                            className="min-h-[80px]"
                          />
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-success text-success-foreground hover:bg-success/90 gap-2 flex-1"
                          onClick={() => handleUpdateComplaint(complaint.complaintId, complaint.id)}
                          disabled={updating === complaint.id}
                        >
                          {updating === complaint.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                          Save Changes
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setExpandedId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {complaint.status === "RESOLVED" && complaint.resolutionNotes && (
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg mt-4">
                      <p className="text-sm font-medium text-green-900 mb-2">Resolution Notes:</p>
                      <p className="text-sm text-green-800">{complaint.resolutionNotes}</p>
                    </div>
                  )}

                  {complaint.status !== "resolved" && !isExpanded && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedId(complaint.id);
                      }}
                    >
                      Update Status
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WorkerDashboard;
