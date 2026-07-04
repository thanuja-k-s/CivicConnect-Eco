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
    <div className="px-8 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold">Welcome, {user?.name} 👋</h1>
          <p className="text-muted-foreground text-xs">Manage and track your civic complaints</p>
        </div>
        <Link to="/report">
          <Button className="bg-saffron text-saffron-foreground hover:bg-saffron/90 gap-1.5 h-9 text-sm">
            <Plus className="h-3.5 w-3.5" /> Report New Issue
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">My Complaints</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-7 w-7 animate-spin text-saffron" /></div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-10">
              <FileX className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">No complaints yet. Report your first civic issue!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">ID</TableHead>
                    <TableHead className="text-xs">Title</TableHead>
                    <TableHead className="text-xs">Category</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complaints.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-xs font-bold text-saffron py-2">{c.complaintId}</TableCell>
                      <TableCell className="font-medium max-w-[180px] truncate text-xs py-2">{c.title}</TableCell>
                      <TableCell className="capitalize text-xs py-2">{c.category}</TableCell>
                      <TableCell className="py-2"><StatusBadge status={c.status} /></TableCell>
                      <TableCell className="text-xs py-2">{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="py-2">
                        <Link to={`/complaint/${c.id}`}>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Eye className="h-3.5 w-3.5" /></Button>
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
