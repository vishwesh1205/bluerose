import AppSidebar from "@/components/AppSidebar";
import AppHeader from "@/components/AppHeader";
import HeroSection from "@/components/HeroSection";
import MusicPlayer from "@/components/MusicPlayer";
import MobileNav from "@/components/MobileNav";
import MiniPlayer from "@/components/MiniPlayer";
import TrendingPlaylists from "@/components/TrendingPlaylists";

const Index = () => {
  return (
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
            <TrendingPlaylists />
          </div>
        </div>

        {/* Music Player */}
        <MusicPlayer />

        {/* Mobile Mini Player & Navigation */}
        <MiniPlayer />
        <MobileNav />
      </main>
    </div>
  );
};

export default Index;