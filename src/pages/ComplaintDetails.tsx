import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { complaintService } from "@/services/complaintService";
import { Complaint } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, User, Clock, Loader2 } from "lucide-react";

const ComplaintDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      complaintService.getComplaintById(id).then((data) => {
        setComplaint(data ?? null);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-saffron" /></div>;
  if (!complaint) return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold mb-4">Complaint Not Found</h2>
      <Link to="/dashboard"><Button variant="outline">Back to Dashboard</Button></Link>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <Card className="shadow-xl animate-fade-in-up">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-mono font-bold text-saffron mb-1">{complaint.complaintId}</p>
              <CardTitle className="text-2xl">{complaint.title}</CardTitle>
            </div>
            <StatusBadge status={complaint.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {complaint.image && (
            <img src={complaint.image} alt="Issue" className="w-full h-64 object-cover rounded-lg" />
          )}

          <div>
            <h3 className="font-semibold mb-1">Description</h3>
            <p className="text-muted-foreground text-sm">{complaint.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-saffron mt-0.5" />
              <div>
                <p className="font-semibold">Location</p>
                <p className="text-muted-foreground">{complaint.location.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-saffron mt-0.5" />
              <div>
                <p className="font-semibold">Reported On</p>
                <p className="text-muted-foreground">{new Date(complaint.createdAt).toLocaleString()}</p>
              </div>
            </div>
            {complaint.assignedWorkerName && (
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-saffron mt-0.5" />
                <div>
                  <p className="font-semibold">Assigned Worker</p>
                  <p className="text-muted-foreground">{complaint.assignedWorkerName}</p>
                </div>
              </div>
            )}
          </div>

          {/* Map */}
          <div className="rounded-lg overflow-hidden border">
            <iframe
              title="Location Map"
              width="100%"
              height="250"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${complaint.location.lng - 0.01},${complaint.location.lat - 0.01},${complaint.location.lng + 0.01},${complaint.location.lat + 0.01}&layer=mapnik&marker=${complaint.location.lat},${complaint.location.lng}`}
              className="border-0"
            />
          </div>

          {/* Timeline */}
          <div>
            <h3 className="font-semibold mb-4">Status Timeline</h3>
            <div className="space-y-4">
              {complaint.timeline.map((entry, i) => (
                <div key={entry.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-saffron" />
                    {i < complaint.timeline.length - 1 && <div className="w-0.5 flex-1 bg-border" />}
                  </div>
                  <div className="pb-4">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={entry.status} />
                      <span className="text-xs text-muted-foreground">{new Date(entry.date).toLocaleString()}</span>
                    </div>
                    <p className="text-sm mt-1">{entry.message}</p>
                    <p className="text-xs text-muted-foreground">by {entry.by}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplaintDetails;
