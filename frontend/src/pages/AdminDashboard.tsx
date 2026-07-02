import { useEffect, useState, useMemo } from "react";
import { adminService } from "@/services/adminService";
import { complaintService } from "@/services/complaintService";
import { ngoService } from "@/services/ngoService";
import { Complaint, Worker, Ngo } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, ClipboardList, Clock, UserCheck, CheckCircle2,
  Search, XCircle, Flame, AlertTriangle, Shield, Zap,
  Sparkles, MapPin, Mic, Camera, Leaf, Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const PRIORITY_CONFIG = {
  CRITICAL: { label: "CRITICAL", color: "text-red-700", bg: "bg-red-100", border: "border-red-300", Icon: Flame },
  HIGH:     { label: "HIGH",     color: "text-orange-700", bg: "bg-orange-100", border: "border-orange-300", Icon: AlertTriangle },
  MEDIUM:   { label: "MEDIUM",  color: "text-yellow-700", bg: "bg-yellow-100", border: "border-yellow-300", Icon: Shield },
  LOW:      { label: "LOW",     color: "text-blue-700",   bg: "bg-blue-100",   border: "border-blue-300",   Icon: Zap },
};

const PriorityBadge = ({ level }: { level?: string }) => {
  if (!level) return <span className="text-xs text-slate-400">—</span>;
  const cfg = PRIORITY_CONFIG[level as keyof typeof PRIORITY_CONFIG];
  if (!cfg) return <span className="text-xs text-slate-400">{level}</span>;
  return (
    <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full border", cfg.color, cfg.bg, cfg.border)}>
      {level}
    </span>
  );
};

const ALL_CATEGORIES = [
  { value: "all",           label: "All Categories" },
  { value: "garbage",       label: "Garbage" },
  { value: "road",          label: "Road Damage" },
  { value: "water",         label: "Water Leakage" },
  { value: "drainage",      label: "Drainage Issue" },
  { value: "streetlight",   label: "Street Light" },
  { value: "illegal-dumping", label: "Illegal Dumping" },
  { value: "fire-hazard",   label: "Fire Hazard" },
  { value: "electricity",   label: "Electricity" },
  { value: "pollution",     label: "Pollution" },
  { value: "public-safety", label: "Public Safety" },
  { value: "tree-fall",     label: "Tree Fall" },
  { value: "animal-issue",  label: "Animal Issue" },
  { value: "other",         label: "Other" },
];

// ─── Component ────────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [ngos, setNgos] = useState<Ngo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState<"all" | "emergency" | "ngo">("all");
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([
      adminService.getAllComplaints(),
      adminService.getWorkers(),
      ngoService.getAllNgos(),
    ]).then(([c, w, n]) => {
      setComplaints(c);
      setWorkers(w);
      setNgos(n);
      setLoading(false);
    });
  }, []);

  const handleNgoApprove = async (ngoId: number) => {
    try {
      const updated = await ngoService.approveNgo(ngoId);
      setNgos(prev => prev.map(n => n.id === ngoId ? updated : n));
      toast({ title: "✅ NGO Approved", description: `${updated.name} is now active.` });
    } catch { toast({ title: "Failed to approve NGO", variant: "destructive" }); }
  };

  const handleNgoReject = async (ngoId: number) => {
    try {
      const updated = await ngoService.rejectNgo(ngoId, "Does not meet registration requirements");
      setNgos(prev => prev.map(n => n.id === ngoId ? updated : n));
      toast({ title: "NGO Rejected" });
    } catch { toast({ title: "Failed to reject NGO", variant: "destructive" }); }
  };

  const handleNgoSuspend = async (ngoId: number) => {
    try {
      const updated = await ngoService.suspendNgo(ngoId);
      setNgos(prev => prev.map(n => n.id === ngoId ? updated : n));
      toast({ title: "NGO Suspended" });
    } catch { toast({ title: "Failed to suspend NGO", variant: "destructive" }); }
  };

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

  // ─── Derived counts ──────────────────────────────────────────────────────────
  const countByStatus = (s: string) => complaints.filter((c) => c.status === s).length;
  const countByPriority = (p: string) => complaints.filter((c) => c.priorityLevel === p).length;
  const emergencyCount = countByPriority("CRITICAL");
  const voiceCount = complaints.filter((c) => c.createdFromVoice).length;
  const cameraCount = complaints.filter((c) => c.createdFromCamera).length;

  // ─── AI Category stats ───────────────────────────────────────────────────────
  const aiCategoryStats = useMemo(() => {
    const map: Record<string, number> = {};
    complaints.forEach((c) => {
      const cat = c.aiCategory || c.category || "other";
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [complaints]);

  // ─── Filtering ───────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return complaints.filter((c) => {
      const matchSearch =
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.complaintId.toLowerCase().includes(search.toLowerCase());
      const matchCategory = filterCategory === "all" || c.category === filterCategory;
      const matchPriority = filterPriority === "all" || c.priorityLevel === filterPriority;
      const matchStatus = filterStatus === "all" || c.status === filterStatus;
      const matchTab = activeTab === "all" || (activeTab === "emergency" && c.priorityLevel === "CRITICAL");
      return matchSearch && matchCategory && matchPriority && matchStatus && matchTab;
    });
  }, [complaints, search, filterCategory, filterPriority, filterStatus, activeTab]);

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="h-10 w-10 animate-spin text-saffron" />
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        {emergencyCount > 0 && (
          <div className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full shadow-lg animate-pulse">
            <Flame className="h-4 w-4" />
            <span className="font-bold text-sm">{emergencyCount} Emergency Alert{emergencyCount > 1 ? "s" : ""}</span>
          </div>
        )}
      </div>

      {/* ── Status summary cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total",    count: complaints.length,       icon: ClipboardList,  color: "text-primary" },
          { label: "Pending",  count: countByStatus("pending"), icon: Clock,          color: "text-warning" },
          { label: "Assigned", count: countByStatus("assigned"),icon: UserCheck,      color: "text-info" },
          { label: "Resolved", count: countByStatus("resolved"),icon: CheckCircle2,   color: "text-success" },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="pt-6 text-center">
              <s.icon className={`h-8 w-8 mx-auto mb-2 ${s.color}`} />
              <div className="text-3xl font-extrabold">{s.count}</div>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Priority statistics cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map((p) => {
          const cfg = PRIORITY_CONFIG[p];
          return (
            <Card key={p} className={cn("border-2", cfg.border)}>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{p}</p>
                    <p className={cn("text-3xl font-extrabold", cfg.color)}>{countByPriority(p)}</p>
                  </div>
                  <cfg.Icon className={cn("h-8 w-8", cfg.color)} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Eco stats row ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* AI category breakdown */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-500" /> AI Category Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {aiCategoryStats.length === 0
              ? <p className="text-xs text-muted-foreground">No AI data yet</p>
              : aiCategoryStats.map(([cat, count]) => (
                  <div key={cat} className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 capitalize flex-1 truncate">{cat.replace(/-/g, " ")}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                      <div
                        className="bg-indigo-500 h-1.5 rounded-full"
                        style={{ width: `${(count / complaints.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-700 w-5 text-right">{count}</span>
                  </div>
                ))
            }
          </CardContent>
        </Card>

        {/* Eco submission stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Eco Submission Modes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
                <Mic className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Voice Reported</p>
                <p className="font-bold text-lg">{voiceCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
                <Camera className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Camera Captured</p>
                <p className="font-bold text-lg">{cameraCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">With GPS</p>
                <p className="font-bold text-lg">{complaints.filter(c => c.latitude).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live location map link panel */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4 text-green-500" /> Complaint Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              {complaints.filter(c => c.latitude).length} complaints have GPS coordinates.
            </p>
            <a
              href={`https://www.openstreetmap.org/#map=5/20.593/78.962`}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button variant="outline" size="sm" className="w-full gap-2">
                <MapPin className="h-4 w-4" /> View Heatmap Area
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>

      {/* ── Complaints table ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          {/* Tab switcher */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <button
              onClick={() => setActiveTab("all")}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                activeTab === "all"
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              All Complaints
            </button>
            <button
              onClick={() => setActiveTab("emergency")}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2",
                activeTab === "emergency"
                  ? "bg-red-600 text-white"
                  : "bg-red-50 text-red-600 hover:bg-red-100"
              )}
            >
              <Flame className="h-4 w-4" />
              Emergency Only
              {emergencyCount > 0 && (
                <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded-full",
                  activeTab === "emergency" ? "bg-white/20" : "bg-red-200 text-red-700"
                )}>
                  {emergencyCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("ngo")}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2",
                activeTab === "ngo"
                  ? "bg-green-700 text-white"
                  : "bg-green-50 text-green-700 hover:bg-green-100"
              )}
            >
              <Leaf className="h-4 w-4" />
              NGO Management
              {ngos.filter(n => n.status === "PENDING").length > 0 && (
                <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded-full",
                  activeTab === "ngo" ? "bg-white/20" : "bg-amber-200 text-amber-700"
                )}>
                  {ngos.filter(n => n.status === "PENDING").length} pending
                </span>
              )}
            </button>
          </div>

          {/* NGO Management Panel */}
          {activeTab === "ngo" && (
            <div className="mb-4">
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: "Total NGOs", value: ngos.length, color: "text-blue-600" },
                  { label: "Pending Review", value: ngos.filter(n => n.status === "PENDING").length, color: "text-amber-600" },
                  { label: "Active", value: ngos.filter(n => n.status === "ACTIVE").length, color: "text-green-600" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className={cn("text-2xl font-extrabold", color)}>{value}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {ngos.map(ngo => (
                  <div key={ngo.id} className="border border-gray-200 rounded-xl p-4 bg-white">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="h-4 w-4 text-green-600" />
                          <span className="font-semibold text-sm text-gray-900">{ngo.name}</span>
                          <span className={cn("text-xs px-2 py-0.5 rounded-full font-bold border",
                            ngo.status === "ACTIVE" ? "bg-green-100 text-green-700 border-green-200" :
                            ngo.status === "PENDING" ? "bg-amber-100 text-amber-700 border-amber-200" :
                            ngo.status === "REJECTED" ? "bg-red-100 text-red-700 border-red-200" :
                            "bg-gray-100 text-gray-600 border-gray-200"
                          )}>{ngo.status}</span>
                        </div>
                        <p className="text-xs text-gray-500">{ngo.organizationType.replace("_", " ")} · {ngo.registrationNumber}</p>
                        <p className="text-xs text-gray-400">{ngo.email} · {ngo.phone}</p>
                        {ngo.description && <p className="text-xs text-gray-600 mt-1 line-clamp-2">{ngo.description}</p>}
                      </div>
                      <div className="flex gap-2">
                        {ngo.status === "PENDING" && (
                          <>
                            <Button size="sm" onClick={() => handleNgoApprove(ngo.id)}
                              className="bg-green-600 hover:bg-green-700 text-white text-xs">
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleNgoReject(ngo.id)}
                              className="border-red-300 text-red-500 hover:bg-red-50 text-xs">
                              <XCircle className="h-3 w-3 mr-1" /> Reject
                            </Button>
                          </>
                        )}
                        {ngo.status === "ACTIVE" && (
                          <Button size="sm" variant="outline" onClick={() => handleNgoSuspend(ngo.id)}
                            className="border-amber-300 text-amber-600 hover:bg-amber-50 text-xs">
                            Suspend
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {ngos.length === 0 && (
                  <div className="text-center py-10 text-gray-400">
                    <Leaf className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No NGOs registered yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <CardTitle>
            {activeTab === "emergency" ? "🚨 Emergency Complaints" : "All Complaints"}
            <span className="ml-2 text-sm font-normal text-muted-foreground">({filtered.length})</span>
          </CardTitle>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 mt-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by ID or title…"
                className="pl-9"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-[170px] bg-popover">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {ALL_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full md:w-[150px] bg-popover">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="CRITICAL">🔴 CRITICAL</SelectItem>
                <SelectItem value="HIGH">🟠 HIGH</SelectItem>
                <SelectItem value="MEDIUM">🟡 MEDIUM</SelectItem>
                <SelectItem value="LOW">🔵 LOW</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[140px] bg-popover">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
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
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Assign Worker</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No complaints match the current filters.
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((c) => (
                  <TableRow
                    key={c.id}
                    className={cn(c.priorityLevel === "CRITICAL" && "bg-red-50/40 hover:bg-red-50")}
                  >
                    <TableCell className="font-mono text-xs font-bold text-saffron">{c.complaintId}</TableCell>
                    <TableCell className="font-medium max-w-[160px] truncate">
                      <div className="flex items-center gap-1.5">
                        {c.createdFromVoice && <Mic className="h-3 w-3 text-red-400 shrink-0" title="Voice reported" />}
                        {c.createdFromCamera && <Camera className="h-3 w-3 text-indigo-400 shrink-0" title="Camera captured" />}
                        <span className="truncate">{c.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize text-xs">{c.category?.replace(/-/g, " ") || "—"}</TableCell>
                    <TableCell><PriorityBadge level={c.priorityLevel} /></TableCell>
                    <TableCell><StatusBadge status={c.status} /></TableCell>
                    <TableCell>
                      {c.latitude && c.longitude ? (
                        <a
                          href={`https://www.openstreetmap.org/?mlat=${c.latitude}&mlon=${c.longitude}#map=17/${c.latitude}/${c.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline text-xs flex items-center gap-1"
                        >
                          <MapPin className="h-3 w-3" /> View
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {c.status === "pending" ? (
                        <Select onValueChange={(v) => handleAssign(c.id, v)}>
                          <SelectTrigger className="w-[130px] bg-popover text-xs">
                            <SelectValue placeholder="Assign…" />
                          </SelectTrigger>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleReject(c.id)}
                        >
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
