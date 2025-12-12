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
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <Music className="w-8 h-8 text-primary" />
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Melodia
          </span>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <Button variant="ghost" size="sm" className="gap-2">
            <Search className="w-4 h-4" />
            Search
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <Heart className="w-4 h-4" />
            Liked
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <ListMusic className="w-4 h-4" />
            Playlists
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <MessageCircle className="w-4 h-4" />
            AI Chat
          </Button>
        </div>

        {loading ? (
          <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
        ) : isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="w-9 h-9">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-2">
                <p className="text-sm font-medium truncate">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Heart className="w-4 h-4 mr-2" />
                Liked Songs
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ListMusic className="w-4 h-4 mr-2" />
                My Playlists
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={() => navigate("/auth")} size="sm">
            Sign In
          </Button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
