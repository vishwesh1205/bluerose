import { useState, useEffect, useCallback } from "react";

export const useNotificationPermission = () => {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | "unsupported" | "pending">("pending");
  const [hasBeenAsked, setHasBeenAsked] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    if (!("Notification" in window)) {
      setPermissionStatus("unsupported");
      setHasBeenAsked(true);
      return;
    }

    // Check if user has already been asked (either granted, denied, or skipped)
    const currentPermission = Notification.permission;
    const wasSkipped = localStorage.getItem("notification_permission_skipped") === "true";

    if (currentPermission === "granted" || currentPermission === "denied" || wasSkipped) {
      setHasBeenAsked(true);
      setPermissionStatus(currentPermission);
    } else {
      setHasBeenAsked(false);
      setPermissionStatus(currentPermission);
    }
  }, []);

  const markAsAsked = useCallback(() => {
    setHasBeenAsked(true);
  }, []);

  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!("Notification" in window) || Notification.permission !== "granted") {
      return null;
    }

    try {
      return new Notification(title, options);
    } catch (error) {
      console.error("Error showing notification:", error);
      return null;
    }
  }, []);

  return {
    permissionStatus,
    hasBeenAsked,
    markAsAsked,
    showNotification,
    isSupported: permissionStatus !== "unsupported",
  };
};