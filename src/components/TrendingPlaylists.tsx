import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const industries = [
  {
    id: "kollywood",
    title: "Kollywood",
    description: "Top Tamil Hits",
    gradient: "from-violet-600 to-purple-500",
    language: "Tamil",
  },
  {
    id: "tollywood",
    title: "Tollywood", 
    description: "Top Telugu Hits",
    gradient: "from-pink-600 to-rose-500",
    language: "Telugu",
  },
  {
    id: "bollywood",
    title: "Bollywood",
    description: "Top Hindi Hits",
    gradient: "from-cyan-500 to-teal-500",
    language: "Hindi",
  },
  {
    id: "mollywood",
    title: "Mollywood",
    description: "Top Malayalam Hits",
    gradient: "from-orange-500 to-amber-500",
    language: "Malayalam",
  },
  {
    id: "hollywood",
    title: "Hollywood",
    description: "Top English Hits",
    gradient: "from-blue-600 to-indigo-500",
    language: "English",
  },
  {
    id: "sandalwood",
    title: "Sandalwood",
    description: "Top Kannada Hits",
    gradient: "from-emerald-500 to-green-500",
    language: "Kannada",
  },
];

const TrendingPlaylists = () => {
  const navigate = useNavigate();

  const goToChart = (industry: typeof industries[0]) => {
    navigate(`/charts/${industry.id}`);
  };

  return (
    <section className="pb-12 relative">
      {/* Abstract orbs */}
      <div className="absolute -left-20 top-1/2 w-40 h-40 bg-secondary/10 rounded-full blur-[80px]" />
      <div className="absolute -right-20 top-1/3 w-32 h-32 bg-primary/10 rounded-full blur-[60px]" />
      
      <div className="container mx-auto relative z-10">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 font-display">
          Regional <span className="gradient-text">Playlists</span>
        </h2>
        <p className="text-muted-foreground mb-6 text-sm">
          The songs everyone's playing right now
        </p>
        
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {industries.map((industry) => (
              <CarouselItem key={industry.id} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                <div 
                  className="group relative overflow-hidden rounded-xl glass-effect border border-border/30 hover:border-primary/40 transition-all duration-300 cursor-pointer hover:scale-[1.02]"
                  onClick={() => goToChart(industry)}
                >
                  <div className="p-4">
                    <div className={`w-full aspect-square rounded-lg bg-gradient-to-br ${industry.gradient} mb-3 flex items-center justify-center relative overflow-hidden shadow-lg`}>
                      <span className="text-4xl md:text-5xl font-bold text-white/90 drop-shadow-lg font-display relative z-10">
                        {industry.title.charAt(0)}
                      </span>
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <Button 
                        size="icon"
                        className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-white text-black hover:bg-white/90 border-0 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all shadow-xl"
                      >
                        <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                      </Button>
                    </div>
                    <h3 className="font-semibold text-sm mb-0.5 text-foreground">{industry.title}</h3>
                    <p className="text-xs text-muted-foreground">{industry.description}</p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-4 bg-background/80 border-border/50 hover:bg-background" />
          <CarouselNext className="hidden md:flex -right-4 bg-background/80 border-border/50 hover:bg-background" />
        </Carousel>
      </div>
    </section>
  );
};

export default TrendingPlaylists;