import { Play, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-music.jpg";

const HeroSection = () => {
  const categories = ["For You", "Relax", "Workout", "Focus", "Party", "Travel"];

  const recentMixes = [
    { id: 1, title: "Daily Mix 1", artist: "Lofi Girl, Chillhop", color: "bg-primary" },
    { id: 2, title: "Discover Weekly", artist: "New music for you", color: "bg-secondary" },
    { id: 3, title: "On Repeat", artist: "Your favorite tracks", color: "bg-accent" },
    { id: 4, title: "Release Radar", artist: "Latest from artists", color: "bg-amber-600" },
  ];

  const trendingAlbums = [
    { id: 1, title: "Midnight City", artist: "Neon Dreams", year: "2024", img: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop" },
    { id: 2, title: "Soulful Echoes", artist: "The Harmonics", year: "2023", img: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=300&h=300&fit=crop" },
    { id: 3, title: "Digital Horizon", artist: "Synthwave Pro", year: "2024", img: "https://images.unsplash.com/photo-1459749411177-042180ce673b?w=300&h=300&fit=crop" },
    { id: 4, title: "Acoustic Nights", artist: "Clara Woods", year: "2024", img: "https://images.unsplash.com/photo-1514525253344-a8130a43af31?w=300&h=300&fit=crop" },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-6 md:px-10 pb-32 custom-scrollbar">
      {/* Welcome & Categories */}
      <div className="mb-8 mt-2">
        <h2 className="text-3xl font-bold mb-6">Good evening</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat, i) => (
            <button
              key={i}
              className={`px-6 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                i === 0
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Album Hero */}
      <section className="mb-12 relative overflow-hidden rounded-3xl group">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent z-10"></div>
        <img
          src={heroImage}
          className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-700"
          alt="Hero"
        />
        <div className="absolute inset-0 z-20 p-8 flex flex-col justify-end max-w-lg">
          <span className="px-3 py-1 bg-foreground/10 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest w-fit mb-3">
            Featured Artist
          </span>
          <h3 className="text-4xl font-extrabold mb-2 tracking-tight">Midnight Melancholy</h3>
          <p className="text-muted-foreground mb-6 line-clamp-2">
            The latest masterpiece from Digital Ghost. Experience a journey through sound and light.
          </p>
          <div className="flex gap-4">
            <Button className="px-8 py-3 bg-foreground text-background rounded-full font-bold flex items-center gap-2 hover:bg-foreground/90">
              <Play size={18} fill="currentColor" /> Play Now
            </Button>
            <Button
              variant="outline"
              className="px-8 py-3 bg-foreground/10 backdrop-blur-md border-foreground/20 rounded-full font-bold hover:bg-foreground/20"
            >
              Save Album
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {recentMixes.map((mix) => (
          <div
            key={mix.id}
            className="group flex items-center bg-card border border-border/30 rounded-xl overflow-hidden hover:bg-muted/60 transition-all cursor-pointer relative"
          >
            <div className={`w-16 h-16 ${mix.color} shrink-0 flex items-center justify-center`}>
              <Music2 size={24} className="text-primary-foreground/80" />
            </div>
            <div className="px-4 py-2 flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{mix.title}</p>
              <p className="text-xs text-muted-foreground truncate">{mix.artist}</p>
            </div>
            <button className="absolute right-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 p-2.5 bg-primary rounded-full shadow-xl transition-all duration-300">
              <Play size={16} fill="white" className="ml-0.5 text-primary-foreground" />
            </button>
          </div>
        ))}
      </div>

      {/* New Releases Carousel */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">New Releases</h3>
          <button className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">
            Show All
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {trendingAlbums.map((album) => (
            <div key={album.id} className="group cursor-pointer">
              <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 shadow-lg ring-1 ring-border">
                <img
                  src={album.img}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  alt={album.title}
                />
                <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="p-4 bg-foreground text-background rounded-full transform scale-90 group-hover:scale-100 transition-transform">
                    <Play size={20} fill="currentColor" />
                  </button>
                </div>
              </div>
              <h4 className="font-bold text-sm truncate mb-0.5">{album.title}</h4>
              <p className="text-xs text-muted-foreground truncate">
                {album.artist} • {album.year}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HeroSection;
