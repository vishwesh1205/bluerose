import { Home, Compass, Layers, Heart, ListMusic, TrendingUp, Clock, Music2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-sidebar-border p-6 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-10 px-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
          <Music2 size={20} className="text-primary-foreground" />
        </div>
        <span className="font-bold text-xl tracking-tight gradient-text-brand">SonicFlow</span>
      </div>

      {/* Main Navigation */}
      <nav className="space-y-1">
        <NavItem
          icon={<Home size={20} />}
          label="Home"
          active={isActive("/")}
          onClick={() => navigate("/")}
        />
        <NavItem
          icon={<Compass size={20} />}
          label="Explore"
          active={isActive("/search")}
          onClick={() => navigate("/search")}
        />
        <NavItem
          icon={<Layers size={20} />}
          label="Library"
          active={isActive("/playlists")}
          onClick={() => navigate("/playlists")}
        />
      </nav>

      {/* Playlists Section */}
      {isAuthenticated && (
        <div className="mt-10">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-4">
            Playlists
          </p>
          <nav className="space-y-1">
            <NavItem
              icon={<Heart size={20} className="text-accent fill-accent" />}
              label="Liked Songs"
              onClick={() => navigate("/playlists")}
            />
            <NavItem
              icon={<ListMusic size={20} />}
              label="My Playlists"
              onClick={() => navigate("/playlists")}
            />
            <NavItem icon={<TrendingUp size={20} />} label="Viral Hits" />
            <NavItem icon={<Clock size={20} />} label="Recently Played" />
          </nav>
        </div>
      )}

      {/* Upgrade Card */}
      <div className="mt-auto p-4 bg-muted/50 rounded-2xl border border-border">
        <p className="text-sm font-medium mb-1">Upgrade to Pro</p>
        <p className="text-xs text-muted-foreground mb-3">
          Get ad-free music and offline playback.
        </p>
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold">
          Try Free for 30 Days
        </Button>
      </div>
    </aside>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const NavItem = ({ icon, label, active = false, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-4 w-full px-4 py-3 rounded-xl transition-all ${
      active
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
    }`}
  >
    <span className={active ? "scale-110 transition-transform" : ""}>{icon}</span>
    <span className="font-semibold text-sm tracking-tight">{label}</span>
  </button>
);

export default AppSidebar;
