import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { complaintService } from "@/services/complaintService";
import { Complaint } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MapPin, CheckCircle2, FileX } from "lucide-react";

const WorkerDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusUpdates, setStatusUpdates] = useState<Record<string, { status: string; notes: string }>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      console.log("[WorkerDashboard] Worker logged in:", user.name);
      complaintService.getAllComplaints().then((data) => {
        console.log("[WorkerDashboard] Loaded complaints:", data.length);
        console.log("[WorkerDashboard] Status breakdown:");
        const statusCounts = data.reduce((acc, c) => {
          const status = c.status || "UNKNOWN";
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        console.log("[WorkerDashboard] Statuses:", statusCounts);
        data.forEach((c, i) => {
          if (i < 5) console.log(`[WorkerDashboard] Complaint ${i}: ID=${c.id}, Status="${c.status}"`);
        });
        setComplaints(data);
        setLoading(false);
      });
    }
  }, [user]);

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
      
      // Update local state with the response from server
      setComplaints((prev) =>
        prev.map((c) =>
          String(c.id) === String(id)
            ? updatedComplaint || { ...c, status: update.status, resolutionNotes: update.notes }
            : c
        )
      );
      
      setStatusUpdates((prev) => {
        const updated = { ...prev };
        delete updated[complaintId];
        return updated;
      });
      
      setExpandedId(null);
      
      const statusMessage = update.status === "resolved" ? "✅ Marked as Resolved!" : `📋 Status updated to ${update.status}!`;
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
      case "pending":
        return "bg-yellow-100 text-yellow-900";
      case "in_progress":
        return "bg-blue-100 text-blue-900";
      case "resolved":
        return "bg-green-100 text-green-900";
      default:
        return "bg-gray-100 text-gray-900";
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-saffron" />
      </div>
    );

  // Calculate complaint counts - will recalculate whenever complaints array changes
  const pendingComplaints = complaints.filter((c) => {
    const isMatch = c.status === "pending";
    return isMatch;
  });
  const inProgressComplaints = complaints.filter((c) => c.status === "in_progress");
  const resolvedComplaints = complaints.filter((c) => c.status === "resolved");

  // Debug log counts
  console.log(`[WorkerDashboard] Total: ${complaints.length}, Pending: ${pendingComplaints.length}, In Progress: ${inProgressComplaints.length}, Resolved: ${resolvedComplaints.length}`);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Worker Dashboard</h1>
        <p className="text-muted-foreground">Welcome, {user?.name}. Manage and resolve all civic complaints.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
      </div>

      {complaints.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileX className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">No complaints to manage at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {complaints.map((complaint) => {
            const isExpanded = expandedId === complaint.id;
            const update = statusUpdates[complaint.complaintId];

            return (
              <Card
                key={complaint.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : complaint.id)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="text-xs font-mono font-bold text-saffron mb-1">{complaint.complaintId}</p>
                      <CardTitle className="text-lg">{complaint.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{complaint.category.toUpperCase()}</p>
                    </div>
                    <StatusBadge status={complaint.status} />
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{complaint.description}</p>

                  <div className="text-sm space-y-1">
                    <p>
                      <strong>Location:</strong> {complaint.location?.address || "N/A"}
                    </p>
                    <p>
                      <strong>Reported by:</strong> {complaint.citizenName || "Citizen"}
                    </p>
                    <p>
                      <strong>Date:</strong> {new Date(complaint.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {complaint.image && (
                    <div className="w-full rounded-lg overflow-hidden" style={{ aspectRatio: "16 / 9", maxHeight: "120px", maxWidth: "400px" }}>
                      <img src={complaint.image} alt="Issue" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {complaint.location && (
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${complaint.location.lat}&mlon=${complaint.location.lng}#map=17/${complaint.location.lat}/${complaint.location.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="outline" size="sm" className="gap-2 w-full">
                        <MapPin className="h-4 w-4" /> View on Map
                      </Button>
                    </a>
                  )}

                  {/* Status Update Section - Only visible when expanded */}
                  {isExpanded && complaint.status !== "resolved" && (
                    <div
                      className={`mt-6 pt-6 border-t space-y-4 ${getStatusColor(
                        update?.status || complaint.status
                      )} p-4 rounded-lg`}
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
                            placeholder="Add notes about how the issue was resolved..."
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
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setExpandedId(null)}
                        >
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

                  {complaint.status !== "RESOLVED" && !isExpanded && (
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
