import { ComplaintStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-warning text-warning-foreground" },
  in_progress: { label: "In Progress", className: "bg-info text-info-foreground" },
  resolved: { label: "Resolved", className: "bg-success text-success-foreground" },
  rejected: { label: "Rejected", className: "bg-destructive text-destructive-foreground" },
};

const StatusBadge = ({ status }: { status?: string }) => {
  const normalizedStatus = status?.toLowerCase() || "pending";
  const config = statusConfig[normalizedStatus] || { label: normalizedStatus, className: "bg-gray-500 text-white" };
  return (
    <Badge className={cn("text-xs font-semibold", config.className)}>
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
