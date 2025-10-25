import { Music, Search, Heart, MessageCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
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
            <MessageCircle className="w-4 h-4" />
            AI Chat
          </Button>
        </div>

        <Button variant="ghost" size="icon" className="rounded-full">
          <User className="w-5 h-5" />
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
