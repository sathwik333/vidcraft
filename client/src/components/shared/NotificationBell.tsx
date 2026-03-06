import { useNotifications } from "@/hooks/useNotifications";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Bell,
  CheckCheck,
  Video,
  AlertCircle,
  Info,
  CreditCard,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Notification } from "@/stores/useNotificationStore";

function getNotificationIcon(type: string) {
  switch (type) {
    case "generation_complete":
      return <Video className="h-4 w-4 text-emerald-500" />;
    case "generation_failed":
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case "credits_low":
      return <CreditCard className="h-4 w-4 text-gold-500" />;
    default:
      return <Info className="h-4 w-4 text-blue-500" />;
  }
}

function NotificationItem({
  notification,
  onRead,
}: {
  notification: Notification;
  onRead: (id: string) => void;
}) {
  return (
    <DropdownMenuItem
      className="flex items-start gap-3 p-3 cursor-pointer focus:bg-[hsl(var(--muted-foreground))]/5"
      onClick={() => {
        if (!notification.read) {
          onRead(notification.id);
        }
      }}
    >
      {/* Icon */}
      <div className="mt-0.5 shrink-0">{getNotificationIcon(notification.type)}</div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className={`text-sm truncate ${
              notification.read
                ? "text-[hsl(var(--muted-foreground))]"
                : "font-medium"
            }`}
          >
            {notification.title}
          </p>
          {!notification.read && (
            <div className="h-2 w-2 shrink-0 rounded-full bg-gold-500" />
          )}
        </div>
        <p className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-2 mt-0.5">
          {notification.message}
        </p>
        <p className="text-xs text-[hsl(var(--muted-foreground))]/60 mt-1">
          {formatDistanceToNow(new Date(notification.created_at), {
            addSuffix: true,
          })}
        </p>
      </div>
    </DropdownMenuItem>
  );
}

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-9 w-9 p-0 rounded-full"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs text-gold-500 hover:text-gold-600"
              onClick={(e) => {
                e.preventDefault();
                markAllAsRead();
              }}
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bell className="h-8 w-8 text-[hsl(var(--muted-foreground))]/40 mb-2" />
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              No notifications yet
            </p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]/60">
              You will be notified when your videos are ready
            </p>
          </div>
        ) : (
          notifications.slice(0, 10).map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRead={markAsRead}
            />
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
