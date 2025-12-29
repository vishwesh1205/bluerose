import { Bell, Music2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { User, Heart, ListMusic, LogOut } from "lucide-react";

const AppHeader = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, signOut, loading } = useAuth();

  const userInitial = user?.email?.charAt(0).toUpperCase() || "U";

  return (
    <header className="h-20 flex items-center justify-between px-6 md:px-10 shrink-0 z-10">
      {/* Mobile Logo */}
      <div className="flex items-center gap-2 md:hidden">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Music2 size={20} className="text-primary-foreground" />
        </div>
        <span className="font-bold text-xl">SonicFlow</span>
      </div>
      
      {/* Desktop spacer */}
      <div className="hidden md:block" />

      {/* Right side */}
      <div className="flex items-center gap-4">
        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
        </button>

        {loading ? (
          <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
        ) : isAuthenticated ? (
          <div className="flex items-center gap-3 pl-4 border-l border-border">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user?.email?.split('@')[0]}</p>
              <p className="text-xs text-primary">Premium</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="w-10 h-10 cursor-pointer ring-2 ring-border hover:ring-primary transition-all">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-bold">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card border-border">
                <div className="px-2 py-2">
                  <p className="text-sm font-medium truncate">{user?.email}</p>
                </div>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem className="hover:bg-muted focus:bg-muted">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-muted focus:bg-muted" onClick={() => navigate('/playlists')}>
                  <Heart className="w-4 h-4 mr-2" />
                  Liked Songs
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-muted focus:bg-muted" onClick={() => navigate('/playlists')}>
                  <ListMusic className="w-4 h-4 mr-2" />
                  My Playlists
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem
                  onClick={signOut}
                  className="text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
