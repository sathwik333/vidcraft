import { useEffect, useCallback } from "react";
import { Bell, CheckCircle2, XCircle, CreditCard, Info, CheckCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotificationStore, type Notification } from "@/stores/useNotificationStore";
import { cn } from "@/lib/utils";

function getIcon(type: string) {
  switch (type) {
    case "generation_complete":
      return <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />;
    case "generation_failed":
      return <XCircle className="w-4 h-4 text-red-500 shrink-0" />;
    case "credits":
      return <CreditCard className="w-4 h-4 text-gold-500 shrink-0" />;
    default:
      return <Info className="w-4 h-4 text-blue-500 shrink-0" />;
  }
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function NotificationItem({
  notification,
  onRead,
  onDelete,
}: {
  notification: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      onClick={() => !notification.read && onRead(notification.id)}
      className={cn(
        "w-full text-left px-4 py-3 flex gap-3 items-start transition-colors group cursor-pointer",
        "hover:bg-[hsl(var(--accent))]",
        !notification.read && "bg-gold-500/5"
      )}
    >
      <div className="mt-0.5">{getIcon(notification.type)}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p
            className={cn(
              "text-sm truncate",
              !notification.read
                ? "font-semibold text-[hsl(var(--foreground))]"
                : "font-medium text-[hsl(var(--muted-foreground))]"
            )}
          >
            {notification.title}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-500/10 text-[hsl(var(--muted-foreground))] hover:text-red-500 shrink-0"
            title="Delete notification"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-[10px] text-[hsl(var(--muted-foreground))]/60 mt-1">
          {timeAgo(notification.created_at)}
        </p>
      </div>
    </div>
  );
}

export function NotificationBell() {
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications } =
    useNotificationStore();

  // Fetch on mount and poll every 30s
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleRead = useCallback(
    (id: string) => {
      markAsRead(id);
    },
    [markAsRead]
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 p-0 max-h-[400px] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--border))]">
          <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">
            Notifications
          </h3>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))] hover:text-gold-500 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))] hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto max-h-[320px] divide-y divide-[hsl(var(--border))]">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Bell className="w-8 h-8 text-[hsl(var(--muted-foreground))]/30 mx-auto mb-2" />
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                No notifications yet
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onRead={handleRead}
                onDelete={deleteNotification}
              />
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
