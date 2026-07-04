import { useState } from "react";
import { complaintService } from "@/services/complaintService";
import { Complaint } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search, Loader2, FileSearch } from "lucide-react";
import { Link } from "react-router-dom";

const TrackComplaint = () => {
  const [searchId, setSearchId] = useState("");
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    setLoading(true);
    setSearched(true);
    const result = await complaintService.trackComplaint(searchId.trim());
    setComplaint(result ?? null);
    setLoading(false);
  };

  return (
    <div className="px-8 py-8 max-w-lg">
      <Card className="shadow-lg animate-fade-in-up">
        <CardHeader className="text-center pb-4">
          <FileSearch className="h-9 w-9 text-saffron mx-auto mb-1.5" />
          <CardTitle className="text-xl">Track Your Complaint</CardTitle>
          <CardDescription className="text-xs">Enter your complaint ID to check current status</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <Input
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="e.g. CMP-001"
              className="flex-1 h-9 text-sm"
            />
            <Button type="submit" className="bg-saffron text-saffron-foreground hover:bg-saffron/90 h-9" disabled={loading}>
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
            </Button>
          </form>

          {searched && !loading && (
            complaint ? (
              <div className="space-y-3 animate-fade-in-up">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs font-bold text-saffron">{complaint.complaintId}</span>
                  <StatusBadge status={complaint.status} />
                </div>
                <h3 className="font-bold text-base">{complaint.title}</h3>
                <p className="text-xs text-muted-foreground">{complaint.description}</p>
                <div className="text-xs space-y-1">
                  <p><strong>Category:</strong> <span className="capitalize">{complaint.category}</span></p>
                  <p><strong>Location:</strong> {complaint.location.address}</p>
                  <p><strong>Reported:</strong> {new Date(complaint.createdAt).toLocaleDateString()}</p>
                  {complaint.assignedWorkerName && <p><strong>Assigned to:</strong> {complaint.assignedWorkerName}</p>}
                </div>
                <Link to={`/complaint/${complaint.id}`}>
                  <Button variant="outline" className="w-full h-9 text-sm">View Full Details</Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-7 text-muted-foreground">
                <p className="text-sm font-semibold mb-1">No complaint found</p>
                <p className="text-xs">Please check the complaint ID and try again</p>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TrackComplaint;
