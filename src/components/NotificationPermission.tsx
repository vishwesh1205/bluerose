import { useState, useEffect } from "react";
import { Bell, BellRing, Music, Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface NotificationPermissionProps {
  onPermissionGranted: () => void;
}

const NotificationPermission = ({ onPermissionGranted }: NotificationPermissionProps) => {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | "unsupported">("default");
  const [isRequesting, setIsRequesting] = useState(false);
  const [showSkipWarning, setShowSkipWarning] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    if (!("Notification" in window)) {
      setPermissionStatus("unsupported");
      return;
    }

    // Check current permission status
    setPermissionStatus(Notification.permission);

    // If already granted, proceed
    if (Notification.permission === "granted") {
      onPermissionGranted();
    }
  }, [onPermissionGranted]);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      // If notifications not supported, still allow app usage
      onPermissionGranted();
      return;
    }

    setIsRequesting(true);

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);

      if (permission === "granted") {
        // Show a test notification
        new Notification("🎵 Caffeine Music", {
          body: "Notifications enabled! You'll see music controls here.",
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          silent: true,
        });
        
        setTimeout(() => {
          onPermissionGranted();
        }, 1500);
      } else if (permission === "denied") {
        setShowSkipWarning(true);
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      setShowSkipWarning(true);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSkip = () => {
    // Store that user skipped, but allow app usage
    localStorage.setItem("notification_permission_skipped", "true");
    onPermissionGranted();
  };

  // If already granted, don't show anything
  if (permissionStatus === "granted") {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative z-10 w-full max-w-md mx-4">
        <Card className="glass-effect border-border/40 p-8 text-center">
          {/* Icon */}
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-2xl opacity-20 blur-xl animate-pulse" />
            <div className="relative w-full h-full bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center">
              <BellRing className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold font-display mb-2">
            Enable Music Notifications
          </h1>

          {/* Description */}
          <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
            To show music controls on your lock screen and in your notification area, 
            we need notification permission. This lets you control playback without opening the app.
          </p>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 text-left">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                <Smartphone className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs">Lock screen controls</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 text-left">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                <Music className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs">Now playing info</span>
            </div>
          </div>

          {/* Permission denied warning */}
          {permissionStatus === "denied" && (
            <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-left">
              <p className="text-sm text-destructive font-medium mb-1">Permission Denied</p>
              <p className="text-xs text-muted-foreground">
                You've blocked notifications. To enable them, go to your browser settings 
                and allow notifications for this site.
              </p>
            </div>
          )}

          {/* Skip warning */}
          {showSkipWarning && permissionStatus !== "denied" && (
            <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-left">
              <p className="text-sm text-yellow-500 font-medium mb-1">Are you sure?</p>
              <p className="text-xs text-muted-foreground">
                Without notifications, you won't see music controls on your lock screen 
                or in the notification area.
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="space-y-3">
            {permissionStatus !== "denied" ? (
              <Button
                size="lg"
                onClick={requestPermission}
                disabled={isRequesting}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              >
                {isRequesting ? (
                  <span className="flex items-center gap-2">
                    <Bell className="w-5 h-5 animate-bounce" />
                    Requesting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Enable Notifications
                  </span>
                )}
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={handleSkip}
                className="w-full h-12 text-base font-semibold"
              >
                Continue Anyway
              </Button>
            )}

            {/* Skip option */}
            {permissionStatus !== "denied" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (showSkipWarning) {
                    handleSkip();
                  } else {
                    setShowSkipWarning(true);
                  }
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                {showSkipWarning ? "Skip anyway" : "Maybe later"}
              </Button>
            )}
          </div>

          {/* Unsupported notice */}
          {permissionStatus === "unsupported" && (
            <div className="mt-6 p-4 rounded-xl bg-muted/50 text-left">
              <p className="text-sm text-muted-foreground">
                Your browser doesn't support notifications. You can still use the app, 
                but lock screen controls may not be available.
              </p>
              <Button
                size="lg"
                onClick={onPermissionGranted}
                className="w-full mt-4 h-12"
              >
                Continue to App
              </Button>
            </div>
          )}
        </Card>

        {/* Footer text */}
        <p className="text-center text-xs text-muted-foreground/60 mt-4">
          We respect your privacy. Notifications are only used for music controls.
        </p>
      </div>
    </div>
  );
};

export default NotificationPermission;