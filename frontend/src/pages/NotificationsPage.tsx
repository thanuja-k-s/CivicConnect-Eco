import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { notificationService } from "@/services/notificationService";
import { AppNotification, NotificationType } from "@/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Bell, BellOff, CheckCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const TYPE_CONFIG: Record<NotificationType, { icon: string; color: string; bg: string }> = {
  EVENT:              { icon: "📅", color: "text-blue-700",  bg: "bg-blue-50" },
  BADGE:              { icon: "🏆", color: "text-amber-700", bg: "bg-amber-50" },
  COMPLAINT:          { icon: "📍", color: "text-red-700",   bg: "bg-red-50" },
  SYSTEM:             { icon: "ℹ️", color: "text-gray-700",  bg: "bg-gray-50" },
  NGO_RECOMMENDATION: { icon: "🚨", color: "text-green-700", bg: "bg-green-50" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "Just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

const NotificationsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<NotificationType | "ALL">("ALL");

  useEffect(() => {
    if (!user) return;
    notificationService.getUserNotifications(Number(user.id)).then(data => {
      setNotifications(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  const handleMarkRead = async (id: number) => {
    await notificationService.markRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    await notificationService.markAllRead(Number(user.id));
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    toast({ title: "All notifications marked as read" });
  };

  const FILTER_TYPES: Array<NotificationType | "ALL"> = ["ALL", "EVENT", "BADGE", "COMPLAINT", "NGO_RECOMMENDATION", "SYSTEM"];
  const filtered = notifications.filter(n => filterType === "ALL" || n.type === filterType);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Compact header */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-700 text-white py-6 px-8">
        <div className="flex items-center justify-between max-w-3xl">
          <div className="flex items-center gap-2.5">
            <Bell className="h-5 w-5" />
            <div>
              <h1 className="text-[22px] font-extrabold leading-tight">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-green-200 text-xs">{unreadCount} unread</p>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllRead} variant="ghost"
              className="text-white/80 hover:text-white hover:bg-white/10 text-xs gap-1 h-8">
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </Button>
          )}
        </div>
      </div>

      <div className="px-8 py-5 max-w-3xl">
        {/* Type filter pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-2.5 mb-4">
          {FILTER_TYPES.map(type => {
            const cfg = type !== "ALL" ? TYPE_CONFIG[type] : null;
            return (
              <button key={type} onClick={() => setFilterType(type)}
                className={cn("px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all border",
                  filterType === type
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-green-300")}>
                {cfg ? `${cfg.icon} ` : "🔔 "}
                {type === "ALL" ? "All" : type.replace("_", " ")}
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <BellOff className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="font-medium text-sm">No notifications</p>
            <p className="text-xs mt-1">You're all caught up! Join events to receive updates.</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {filtered.map(notif => {
              const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.SYSTEM;
              return (
                <div key={notif.id}
                  onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                  className={cn(
                    "flex gap-3 p-3 rounded-xl border transition-all cursor-pointer hover:shadow-sm",
                    notif.isRead
                      ? "bg-white border-gray-100 opacity-70"
                      : "bg-white border-green-200 shadow-sm"
                  )}>
                  {/* Type icon */}
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-base", cfg.bg)}>
                    {cfg.icon}
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn("text-xs font-semibold", notif.isRead ? "text-gray-600" : "text-gray-900")}>
                        {notif.title}
                      </p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-gray-400">{timeAgo(notif.createdAt)}</span>
                        {!notif.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
