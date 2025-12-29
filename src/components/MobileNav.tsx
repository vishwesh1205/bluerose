import { Home, Compass, Layers, Heart } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const MobileNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background/90 backdrop-blur-lg border-t border-border flex justify-around items-center z-50">
      <MobileNavItem
        icon={<Home size={22} />}
        active={isActive("/")}
        onClick={() => navigate("/")}
      />
      <MobileNavItem
        icon={<Compass size={22} />}
        active={isActive("/search")}
        onClick={() => navigate("/search")}
      />
      <MobileNavItem
        icon={<Layers size={22} />}
        active={isActive("/playlists")}
        onClick={() => navigate("/playlists")}
      />
      <MobileNavItem
        icon={<Heart size={22} />}
        onClick={() => navigate("/playlists")}
      />
    </div>
  );
};

interface MobileNavItemProps {
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

const MobileNavItem = ({ icon, active = false, onClick }: MobileNavItemProps) => (
  <button
    onClick={onClick}
    className={`p-2 transition-all flex flex-col items-center gap-1 ${
      active ? "text-primary scale-110" : "text-muted-foreground"
    }`}
  >
    {icon}
    {active && <span className="w-1 h-1 bg-primary rounded-full"></span>}
  </button>
);

export default MobileNav;
