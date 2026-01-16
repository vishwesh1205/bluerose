import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const AppHeader = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();
  const userInitial = user?.email?.charAt(0).toUpperCase() || "U";

  return (
    <header className="h-16 flex items-center justify-end px-6 md:px-10 shrink-0 z-10">
      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side */}
      <div className="flex items-center gap-4">
        {loading ? (
          <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
        ) : isAuthenticated ? (
          <div className="flex items-center gap-3 pl-4 border-l border-border">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user?.email?.split('@')[0]}</p>
              <p className="text-xs text-primary">Premium</p>
            </div>
            <Avatar
              onClick={() => navigate('/profile')}
              className="w-10 h-10 cursor-pointer ring-2 ring-border hover:ring-primary transition-all"
            >
              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-bold">
                {userInitial}
              </AvatarFallback>
            </Avatar>
          </div>
        ) : (
          <Button
            onClick={() => navigate("/auth")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          >
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
};

export default AppHeader;