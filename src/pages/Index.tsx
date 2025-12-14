import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SearchSection from "@/components/SearchSection";
import TrendingPlaylists from "@/components/TrendingPlaylists";
import AICompanion from "@/components/AICompanion";
import MusicPlayer from "@/components/MusicPlayer";
import { TopCharts } from "@/components/TopCharts";
import { PlayerProvider } from "@/contexts/PlayerContext";

const Index = () => {
  return (
    <PlayerProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-16 pb-32">
          <HeroSection />
          <SearchSection />
          <TopCharts />
          <TrendingPlaylists />
          <AICompanion />
        </main>
        <MusicPlayer />
      </div>
    </PlayerProvider>
  );
};

export default Index;
