import { Home, Compass, Layers, Heart, ListMusic, TrendingUp, Clock, Music2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isAuthenticated
  } = useAuth();
  const isActive = (path: string) => location.pathname === path;
  return <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-sidebar-border p-6 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-10 px-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
          <Music2 size={20} className="text-primary-foreground" />
        </div>
        <span className="font-bold text-xl tracking-tight gradient-text-brand">caffeine
      </span>
      </div>

      {/* Main Navigation */}
      <nav className="space-y-1">
        <NavItem icon={<Home size={20} />} label="Home" active={isActive("/")} onClick={() => navigate("/")} />
        <NavItem icon={<Compass size={20} />} label="Explore" active={isActive("/search")} onClick={() => navigate("/search")} />
        <NavItem icon={<Layers size={20} />} label="Library" active={isActive("/playlists")} onClick={() => navigate("/playlists")} />
      </nav>

      {/* Playlists Section */}
      {isAuthenticated && <div className="mt-10">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-4">
            Playlists
          </p>
          <nav className="space-y-1">
            <NavItem icon={<Heart size={20} className="text-accent fill-accent" />} label="Liked Songs" onClick={() => navigate("/playlists")} />
            <NavItem icon={<ListMusic size={20} />} label="My Playlists" onClick={() => navigate("/playlists")} />
            <NavItem icon={<TrendingUp size={20} />} label="Viral Hits" />
            
          </nav>
        </div>}

      {/* Upgrade Card */}
      
    </aside>;
};
interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}
const NavItem = ({
  icon,
  label,
  active = false,
  onClick
}: NavItemProps) => <button onClick={onClick} className={`flex items-center gap-4 w-full px-4 py-3 rounded-xl transition-all ${active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
    <span className={active ? "scale-110 transition-transform" : ""}>{icon}</span>
    <span className="font-semibold text-sm tracking-tight">{label}</span>
  </button>;
export default AppSidebar;