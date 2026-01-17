import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PlayerProvider } from "@/contexts/PlayerContext";
import { useNotificationPermission } from "@/hooks/useNotificationPermission";
import NotificationPermission from "@/components/NotificationPermission";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Search from "./pages/Search";
import Playlists from "./pages/Playlists";
import NowPlaying from "./pages/NowPlaying";
import Charts from "./pages/Charts";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { hasBeenAsked, markAsAsked } = useNotificationPermission();

  if (!hasBeenAsked) {
    return <NotificationPermission onPermissionGranted={markAsAsked} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/search" element={<Search />} />
        <Route path="/playlists" element={<Playlists />} />
        <Route path="/now-playing" element={<NowPlaying />} />
        <Route path="/charts/:industry" element={<Charts />} />
        <Route path="/profile" element={<Profile />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <PlayerProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </PlayerProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;