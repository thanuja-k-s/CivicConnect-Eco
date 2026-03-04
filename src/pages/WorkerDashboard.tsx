import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { workerService } from "@/services/workerService";
import { Complaint } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin, CheckCircle2, Upload, FileX } from "lucide-react";

const WorkerDashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      workerService.getAssignedTasks(user.id).then((data) => {
        setTasks(data);
        setLoading(false);
      });
    }
  }, [user]);

  const handleResolve = async (complaintId: string) => {
    setResolving(complaintId);
    try {
      await workerService.markResolved(complaintId, user?.name || "Worker");
      setTasks((prev) => prev.filter((t) => t.id !== complaintId));
      toast({ title: "✅ Marked as Resolved!" });
    } catch {
      toast({ title: "Failed to resolve", variant: "destructive" });
    } finally {
      setResolving(null);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-saffron" /></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Worker Dashboard</h1>
      <p className="text-muted-foreground mb-8">Welcome, {user?.name}. Here are your assigned tasks.</p>

      {tasks.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileX className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">No assigned tasks at the moment. Check back later!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tasks.map((task) => (
            <Card key={task.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-mono font-bold text-saffron mb-1">{task.complaintId}</p>
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{task.description}</p>
                <div className="text-sm">
                  <p className="capitalize"><strong>Category:</strong> {task.category}</p>
                  <p><strong>Location:</strong> {task.location.address}</p>
                  <p><strong>Reported by:</strong> {task.citizenName}</p>
                </div>

                {task.image && (
                  <img src={task.image} alt="Issue" className="w-full h-40 object-cover rounded-lg" />
                )}

                <div className="flex flex-wrap gap-2">
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${task.location.lat}&mlon=${task.location.lng}#map=17/${task.location.lat}/${task.location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="gap-1">
                      <MapPin className="h-4 w-4" /> Open in Maps
                    </Button>
                  </a>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Upload className="h-4 w-4" /> Upload Photo
                  </Button>
                  <Button
                    size="sm"
                    className="bg-success text-success-foreground hover:bg-success/90 gap-1"
                    onClick={() => handleResolve(task.id)}
                    disabled={resolving === task.id}
                  >
                    {resolving === task.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Mark Resolved
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkerDashboard;
