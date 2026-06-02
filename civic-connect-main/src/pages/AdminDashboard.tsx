import { useEffect, useState } from "react";
import { adminService } from "@/services/adminService";
import { Complaint, Worker } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ClipboardList, Clock, UserCheck, CheckCircle2, Search, XCircle } from "lucide-react";

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([adminService.getAllComplaints(), adminService.getWorkers()]).then(([c, w]) => {
      setComplaints(c);
      setWorkers(w);
      setLoading(false);
    });
  }, []);

  const handleAssign = async (complaintId: string, workerId: string) => {
    try {
      const updated = await adminService.assignWorker(complaintId, workerId);
      setComplaints((prev) => prev.map((c) => (c.id === complaintId ? updated : c)));
      toast({ title: "Worker assigned", description: `Assigned to ${updated.assignedWorkerName}` });
    } catch {
      toast({ title: "Failed to assign", variant: "destructive" });
    }
  };

  const handleReject = async (complaintId: string) => {
    try {
      const updated = await adminService.updateStatus(complaintId, "rejected", "Rejected by admin");
      setComplaints((prev) => prev.map((c) => (c.id === complaintId ? updated : c)));
      toast({ title: "Complaint rejected" });
    } catch {
      toast({ title: "Failed to reject", variant: "destructive" });
    }
  };

  const filtered = complaints.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.complaintId.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === "all" || c.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const countByStatus = (s: string) => complaints.filter((c) => c.status === s).length;

  const summaryCards = [
    { label: "Total", count: complaints.length, icon: ClipboardList, color: "text-primary" },
    { label: "Pending", count: countByStatus("pending"), icon: Clock, color: "text-warning" },
    { label: "Assigned", count: countByStatus("assigned"), icon: UserCheck, color: "text-info" },
    { label: "Resolved", count: countByStatus("resolved"), icon: CheckCircle2, color: "text-success" },
  ];

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-saffron" /></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {summaryCards.map((s, i) => (
          <Card key={i}>
            <CardContent className="pt-6 text-center">
              <s.icon className={`h-8 w-8 mx-auto mb-2 ${s.color}`} />
              <div className="text-3xl font-extrabold">{s.count}</div>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Complaints</CardTitle>
          <div className="flex flex-col md:flex-row gap-3 mt-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by ID or title..." className="pl-9" />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-[180px] bg-popover"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="road">Road</SelectItem>
                <SelectItem value="garbage">Garbage</SelectItem>
                <SelectItem value="water">Water</SelectItem>
                <SelectItem value="drainage">Drainage</SelectItem>
                <SelectItem value="streetlight">Streetlight</SelectItem>
                <SelectItem value="illegal-dumping">Illegal Dumping</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assign Worker</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs font-bold text-saffron">{c.complaintId}</TableCell>
                    <TableCell className="font-medium max-w-[180px] truncate">{c.title}</TableCell>
                    <TableCell className="capitalize">{c.category}</TableCell>
                    <TableCell><StatusBadge status={c.status} /></TableCell>
                    <TableCell>
                      {c.status === "pending" ? (
                        <Select onValueChange={(v) => handleAssign(c.id, v)}>
                          <SelectTrigger className="w-[140px] bg-popover"><SelectValue placeholder="Assign..." /></SelectTrigger>
                          <SelectContent className="bg-popover">
                            {workers.map((w) => (
                              <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-sm text-muted-foreground">{c.assignedWorkerName || "—"}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {c.status === "pending" && (
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleReject(c.id)}>
                          <XCircle className="h-4 w-4 mr-1" /> Reject
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
