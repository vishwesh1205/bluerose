import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TrendingPlaylists from "@/components/TrendingPlaylists";
import AICompanion from "@/components/AICompanion";
import MusicPlayer from "@/components/MusicPlayer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16 pb-32">
        <HeroSection />
        <TrendingPlaylists />
        <AICompanion />
      </main>
      <MusicPlayer />
    </div>
  );
};

export default Index;
