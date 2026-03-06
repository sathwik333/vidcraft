import { useEffect, useRef } from "react";
import { useNotificationStore } from "@/stores/useNotificationStore";

export function useNotifications() {
  const store = useNotificationStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Fetch on mount
    store.fetchNotifications();

    // Poll every 30 seconds
    intervalRef.current = setInterval(() => {
      store.fetchNotifications();
    }, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    notifications: store.notifications,
    unreadCount: store.unreadCount,
    isLoading: store.isLoading,
    markAsRead: store.markAsRead,
    markAllAsRead: store.markAllAsRead,
    refetch: store.fetchNotifications,
  };
}
