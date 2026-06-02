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
    <div className="container mx-auto px-4 py-12 max-w-xl">
      <Card className="shadow-xl animate-fade-in-up">
        <CardHeader className="text-center">
          <FileSearch className="h-12 w-12 text-saffron mx-auto mb-2" />
          <CardTitle className="text-2xl">Track Your Complaint</CardTitle>
          <CardDescription>Enter your complaint ID to check current status</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <Input
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="e.g. CMP-001"
              className="flex-1"
            />
            <Button type="submit" className="bg-saffron text-saffron-foreground hover:bg-saffron/90" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </form>

          {searched && !loading && (
            complaint ? (
              <div className="space-y-4 animate-fade-in-up">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-sm font-bold text-saffron">{complaint.complaintId}</span>
                  <StatusBadge status={complaint.status} />
                </div>
                <h3 className="font-bold text-lg">{complaint.title}</h3>
                <p className="text-sm text-muted-foreground">{complaint.description}</p>
                <div className="text-sm">
                  <p><strong>Category:</strong> <span className="capitalize">{complaint.category}</span></p>
                  <p><strong>Location:</strong> {complaint.location.address}</p>
                  <p><strong>Reported:</strong> {new Date(complaint.createdAt).toLocaleDateString()}</p>
                  {complaint.assignedWorkerName && <p><strong>Assigned to:</strong> {complaint.assignedWorkerName}</p>}
                </div>
                <Link to={`/complaint/${complaint.id}`}>
                  <Button variant="outline" className="w-full">View Full Details</Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-lg font-semibold mb-1">No complaint found</p>
                <p className="text-sm">Please check the complaint ID and try again</p>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TrackComplaint;
