import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Music, Search, Heart, MessageCircle, User, LogOut, ListMusic } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const userInitial = user?.email?.charAt(0).toUpperCase() || "U";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/90 border-b border-primary/20">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
          <div className="relative">
            <Music className="w-8 h-8 text-primary transition-all group-hover:scale-110" />
            <div className="absolute inset-0 bg-primary/30 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-2xl font-bold text-primary glow-text tracking-wider font-display">
            MELODIA
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1">
          {[
            { icon: Search, label: "Search" },
            { icon: Heart, label: "Liked" },
            { icon: ListMusic, label: "Playlists" },
            { icon: MessageCircle, label: "AI Chat" },
          ].map(({ icon: Icon, label }) => (
            <Button 
              key={label}
              variant="ghost" 
              size="sm" 
              className="gap-2 text-muted-foreground hover:text-primary hover:bg-primary/10 tracking-wide uppercase text-xs"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
        ) : isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full border border-primary/30 hover:border-primary hover:bg-primary/10">
                <Avatar className="w-9 h-9">
                  <AvatarFallback className="bg-primary/20 text-primary font-bold">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card border-primary/20">
              <div className="px-2 py-2">
                <p className="text-sm font-medium truncate text-primary">{user?.email}</p>
              </div>
              <DropdownMenuSeparator className="bg-primary/20" />
              <DropdownMenuItem className="hover:bg-primary/10 hover:text-primary">
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-primary/10 hover:text-primary">
                <Heart className="w-4 h-4 mr-2" />
                Liked Songs
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-primary/10 hover:text-primary">
                <ListMusic className="w-4 h-4 mr-2" />
                My Playlists
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-primary/20" />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive hover:bg-destructive/10">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button 
            onClick={() => navigate("/auth")} 
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground tracking-wider uppercase glow-primary"
          >
            Sign In
          </Button>
        )}
      </div>
      {/* Bottom glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </nav>
  );
};

export default Navbar;