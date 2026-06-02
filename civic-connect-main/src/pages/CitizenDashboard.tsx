import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { complaintService } from "@/services/complaintService";
import { Complaint } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "@/components/StatusBadge";
import { Plus, Eye, Loader2, FileX } from "lucide-react";

const CitizenDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      console.log("[Dashboard] ✓ User loaded from context:", user);
      console.log("[Dashboard] Token in localStorage:", localStorage.getItem("token") ? "✓ YES" : "✗ NO");
      complaintService.getMyComplaints(user.id).then((data) => {
        console.log("[Dashboard] ✓ Complaints received:", data.length, "items");
        setComplaints(data);
        setLoading(false);
      }).catch((error) => {
        console.error("[Dashboard] ✗ Error loading complaints:", error);
        setLoading(false);
      });
    } else {
      console.warn("[Dashboard] ✗ No user found in context");
      setLoading(false);
    }
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user?.name} 👋</h1>
          <p className="text-muted-foreground">Manage and track your civic complaints</p>
        </div>
        <Link to="/report">
          <Button className="bg-saffron text-saffron-foreground hover:bg-saffron/90 gap-2">
            <Plus className="h-4 w-4" /> Report New Issue
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Complaints</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-saffron" /></div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-12">
              <FileX className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">No complaints yet. Report your first civic issue!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complaints.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-xs font-bold text-saffron">{c.complaintId}</TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">{c.title}</TableCell>
                      <TableCell className="capitalize">{c.category}</TableCell>
                      <TableCell><StatusBadge status={c.status} /></TableCell>
                      <TableCell className="text-sm">{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Link to={`/complaint/${c.id}`}>
                          <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CitizenDashboard;
