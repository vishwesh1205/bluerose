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
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
          <div className="relative">
            <Music className="w-8 h-8 text-primary transition-all group-hover:scale-110" />
            <div className="absolute inset-0 bg-primary/30 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-2xl font-bold gradient-text font-display">
            Melodia
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1">
          {[
            { icon: Search, label: "Search", path: "/search" },
            { icon: Heart, label: "Liked", path: null },
            { icon: ListMusic, label: "Playlists", path: "/playlists" },
            { icon: MessageCircle, label: "AI Chat", path: null },
          ].map(({ icon: Icon, label, path }) => (
            <Button 
              key={label}
              variant="ghost" 
              size="sm" 
              className="gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium"
              onClick={() => path && navigate(path)}
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
              <Button variant="ghost" size="icon" className="rounded-full border border-border hover:border-primary/50 hover:bg-muted/50">
                <Avatar className="w-9 h-9">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-bold">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card border-border">
              <div className="px-2 py-2">
                <p className="text-sm font-medium truncate gradient-text">{user?.email}</p>
              </div>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem className="hover:bg-muted focus:bg-muted">
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-muted focus:bg-muted">
                <Heart className="w-4 h-4 mr-2" />
                Liked Songs
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-muted focus:bg-muted">
                <ListMusic className="w-4 h-4 mr-2" />
                My Playlists
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive hover:bg-destructive/10 focus:bg-destructive/10">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button 
            onClick={() => navigate("/auth")} 
            size="sm"
            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground font-medium"
          >
            Sign In
          </Button>
        )}
      </div>
      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px abstract-line" />
    </nav>
  );
};

export default Navbar;
