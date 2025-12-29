import AppSidebar from "@/components/AppSidebar";
import AppHeader from "@/components/AppHeader";
import HeroSection from "@/components/HeroSection";
import MusicPlayer from "@/components/MusicPlayer";
import MobileNav from "@/components/MobileNav";
import { TopCharts } from "@/components/TopCharts";
import TrendingPlaylists from "@/components/TrendingPlaylists";
import AICompanion from "@/components/AICompanion";
import { PlayerProvider } from "@/contexts/PlayerContext";

const Index = () => {
  return (
    <PlayerProvider>
      <div className="flex h-screen bg-background text-foreground overflow-hidden">
        {/* Sidebar - Desktop Only */}
        <AppSidebar />

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {/* Header */}
          <AppHeader />

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto pb-32 custom-scrollbar">
            <HeroSection />
            <div className="px-6 md:px-10">
              <TopCharts />
              <TrendingPlaylists />
              <AICompanion />
            </div>
          </div>

          {/* Music Player */}
          <MusicPlayer />

          {/* Mobile Navigation */}
          <MobileNav />
        </main>
      </div>
    </PlayerProvider>
  );
};

export default Index;
