import { Card } from "@/components/ui/card";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const playlists = [
  {
    id: 1,
    title: "Chill Vibes",
    description: "Relax and unwind",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: 2,
    title: "Focus Flow",
    description: "Deep concentration",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 3,
    title: "Workout Energy",
    description: "High intensity beats",
    color: "from-orange-500 to-red-500",
  },
  {
    id: 4,
    title: "Late Night Jazz",
    description: "Smooth and mellow",
    color: "from-indigo-500 to-purple-500",
  },
];

const TrendingPlaylists = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-8">
          Trending <span className="text-primary">Playlists</span>
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {playlists.map((playlist) => (
            <Card 
              key={playlist.id}
              className="group relative overflow-hidden backdrop-blur-sm bg-card/50 border-border hover:bg-card/80 transition-all duration-300 cursor-pointer"
            >
              <div className="p-6">
                <div className={`w-full aspect-square rounded-lg bg-gradient-to-br ${playlist.color} mb-4 flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <Button 
                    size="icon"
                    className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-primary hover:bg-primary/90 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all shadow-xl"
                  >
                    <Play className="w-5 h-5 ml-0.5" />
                  </Button>
                </div>
                <h3 className="font-semibold mb-1">{playlist.title}</h3>
                <p className="text-sm text-muted-foreground">{playlist.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingPlaylists;
