import { ComplaintStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig: Record<ComplaintStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-warning text-warning-foreground" },
  assigned: { label: "Assigned", className: "bg-info text-info-foreground" },
  in_progress: { label: "In Progress", className: "bg-info text-info-foreground" },
  resolved: { label: "Resolved", className: "bg-success text-success-foreground" },
  rejected: { label: "Rejected", className: "bg-destructive text-destructive-foreground" },
};

const StatusBadge = ({ status }: { status: ComplaintStatus }) => {
  const config = statusConfig[status];
  return (
    <Badge className={cn("text-xs font-semibold", config.className)}>
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
