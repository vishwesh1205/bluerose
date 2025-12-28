import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ListMusic, Plus, Play, Trash2, Music, ArrowLeft, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import MusicPlayer from "@/components/MusicPlayer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { usePlaylists, Playlist, PlaylistTrack } from "@/hooks/usePlaylists";
import { usePlayer } from "@/contexts/PlayerContext";
import { useAuth } from "@/hooks/useAuth";
import AddToPlaylist from "@/components/AddToPlaylist";

const Playlists = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { playlists, loading, createPlaylist, deletePlaylist, getPlaylistTracks } = usePlaylists();
  const { loadTrack, addToQueue, queue } = usePlayer();
  
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [playlistTracks, setPlaylistTracks] = useState<PlaylistTrack[]>([]);
  const [tracksLoading, setTracksLoading] = useState(false);
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDesc, setNewPlaylistDesc] = useState("");

  // Load playlist tracks when a playlist is selected
  useEffect(() => {
    if (selectedPlaylist) {
      setTracksLoading(true);
      getPlaylistTracks(selectedPlaylist.id).then((tracks) => {
        setPlaylistTracks(tracks);
        setTracksLoading(false);
      });
    }
  }, [selectedPlaylist, getPlaylistTracks]);

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    await createPlaylist(newPlaylistName, newPlaylistDesc);
    setNewPlaylistName("");
    setNewPlaylistDesc("");
    setIsCreateOpen(false);
  };

  const handleDeletePlaylist = async (e: React.MouseEvent, playlistId: string) => {
    e.stopPropagation();
    await deletePlaylist(playlistId);
    if (selectedPlaylist?.id === playlistId) {
      setSelectedPlaylist(null);
      setPlaylistTracks([]);
    }
  };

  const handlePlayTrack = (track: PlaylistTrack) => {
    loadTrack({
      id: track.id,
      videoId: track.videoId,
      title: track.title,
      artist: track.artists.join(", ") || "Unknown Artist",
      thumbnail: track.thumbnail,
      duration: track.duration,
    });
  };

  const handlePlayAll = () => {
    if (playlistTracks.length === 0) return;
    
    // Play the first track
    handlePlayTrack(playlistTracks[0]);
    
    // Add rest to queue
    playlistTracks.slice(1).forEach((track) => {
      addToQueue({
        id: track.id,
        videoId: track.videoId,
        title: track.title,
        artist: track.artists.join(", ") || "Unknown Artist",
        thumbnail: track.thumbnail,
        duration: track.duration,
      });
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-32 flex flex-col items-center justify-center text-center px-4">
          <ListMusic className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Sign in to view playlists</h2>
          <p className="text-muted-foreground mb-6">Create and manage your music playlists</p>
          <Button onClick={() => navigate("/auth")} className="bg-gradient-to-r from-primary to-secondary">
            Sign In
          </Button>
        </div>
        <MusicPlayer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-32 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            {selectedPlaylist ? (
              <Button 
                variant="ghost" 
                onClick={() => setSelectedPlaylist(null)}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Playlists
              </Button>
            ) : (
              <h1 className="text-3xl font-bold gradient-text font-display">Your Playlists</h1>
            )}
            
            {!selectedPlaylist && (
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                    <Plus className="w-4 h-4" />
                    Create Playlist
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="gradient-text">Create New Playlist</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <Input
                      placeholder="Playlist name"
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      className="bg-muted/50 border-border"
                    />
                    <Input
                      placeholder="Description (optional)"
                      value={newPlaylistDesc}
                      onChange={(e) => setNewPlaylistDesc(e.target.value)}
                      className="bg-muted/50 border-border"
                    />
                    <Button 
                      onClick={handleCreatePlaylist}
                      disabled={!newPlaylistName.trim()}
                      className="w-full bg-gradient-to-r from-primary to-secondary"
                    >
                      Create
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Content */}
          {selectedPlaylist ? (
            // Playlist Detail View
            <div className="space-y-6">
              {/* Playlist Header */}
              <div className="flex items-end gap-6 p-6 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-border/50">
                <div className="w-48 h-48 rounded-xl bg-gradient-to-br from-primary/50 to-secondary/50 flex items-center justify-center shrink-0">
                  <ListMusic className="w-20 h-20 text-foreground/70" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Playlist</p>
                  <h2 className="text-4xl font-bold mb-2 truncate">{selectedPlaylist.title}</h2>
                  {selectedPlaylist.description && (
                    <p className="text-muted-foreground mb-4">{selectedPlaylist.description}</p>
                  )}
                  <p className="text-sm text-muted-foreground">{playlistTracks.length} songs</p>
                </div>
              </div>

              {/* Play All Button */}
              {playlistTracks.length > 0 && (
                <div className="flex items-center gap-4">
                  <Button 
                    onClick={handlePlayAll}
                    size="lg"
                    className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 rounded-full px-8"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    Play All
                  </Button>
                </div>
              )}

              {/* Tracks List */}
              {tracksLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : playlistTracks.length === 0 ? (
                <div className="text-center py-12">
                  <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No songs in this playlist yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Search for songs and add them here</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {/* Table Header */}
                  <div className="grid grid-cols-[40px_1fr_120px_40px] gap-4 px-4 py-2 text-sm text-muted-foreground border-b border-border/50">
                    <span>#</span>
                    <span>Title</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /></span>
                    <span></span>
                  </div>

                  {/* Tracks */}
                  {playlistTracks.map((track, index) => (
                    <div
                      key={track.id}
                      className="grid grid-cols-[40px_1fr_120px_40px] gap-4 px-4 py-3 rounded-lg hover:bg-muted/50 group cursor-pointer transition-colors"
                      onClick={() => handlePlayTrack(track)}
                    >
                      <span className="text-muted-foreground group-hover:hidden">{index + 1}</span>
                      <Play className="w-4 h-4 hidden group-hover:block text-primary" />
                      
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={track.thumbnail}
                          alt={track.title}
                          className="w-10 h-10 rounded object-cover"
                        />
                        <div className="min-w-0">
                          <p className="font-medium truncate">{track.title}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {track.artists.join(", ") || "Unknown Artist"}
                          </p>
                        </div>
                      </div>
                      
                      <span className="text-sm text-muted-foreground flex items-center">
                        {track.duration > 0 ? formatDuration(track.duration) : "--:--"}
                      </span>
                      
                      <div onClick={(e) => e.stopPropagation()}>
                        <AddToPlaylist trackId={track.id} size="icon" variant="ghost" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Playlists Grid View
            <>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : playlists.length === 0 ? (
                <div className="text-center py-12">
                  <ListMusic className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-xl font-medium mb-2">No playlists yet</p>
                  <p className="text-muted-foreground mb-6">Create your first playlist to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {playlists.map((playlist) => (
                    <div
                      key={playlist.id}
                      className="group relative p-4 rounded-xl bg-card/50 hover:bg-card border border-border/50 hover:border-border cursor-pointer transition-all"
                      onClick={() => setSelectedPlaylist(playlist)}
                    >
                      {/* Cover */}
                      <div className="aspect-square rounded-lg bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center mb-4 overflow-hidden relative">
                        <ListMusic className="w-12 h-12 text-foreground/50" />
                        
                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
                            <Play className="w-5 h-5 fill-current text-primary-foreground ml-0.5" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Info */}
                      <h3 className="font-semibold truncate mb-1">{playlist.title}</h3>
                      {playlist.description && (
                        <p className="text-sm text-muted-foreground truncate">{playlist.description}</p>
                      )}
                      
                      {/* Delete Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive"
                        onClick={(e) => handleDeletePlaylist(e, playlist.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <MusicPlayer />
    </div>
  );
};

export default Playlists;
