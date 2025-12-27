import { useState } from "react";
import { ListPlus, Plus, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { usePlaylists } from "@/hooks/usePlaylists";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface AddToPlaylistProps {
  trackId: string;
  size?: "sm" | "default" | "icon";
  variant?: "ghost" | "outline" | "default";
  className?: string;
}

const AddToPlaylist = ({ trackId, size = "icon", variant = "ghost", className = "" }: AddToPlaylistProps) => {
  const { isAuthenticated } = useAuth();
  const { playlists, addTrackToPlaylist, createPlaylist, loading } = usePlaylists();
  const [isOpen, setIsOpen] = useState(false);
  const [showNewPlaylistDialog, setShowNewPlaylistDialog] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [addingToPlaylist, setAddingToPlaylist] = useState<string | null>(null);
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);

  const handleAddToPlaylist = async (playlistId: string) => {
    setAddingToPlaylist(playlistId);
    try {
      await addTrackToPlaylist(playlistId, trackId);
    } finally {
      setAddingToPlaylist(null);
      setIsOpen(false);
    }
  };

  const handleCreateAndAdd = async () => {
    if (!newPlaylistName.trim()) {
      toast.error("Please enter a playlist name");
      return;
    }

    setCreatingPlaylist(true);
    try {
      const newPlaylist = await createPlaylist(newPlaylistName.trim());
      if (newPlaylist) {
        await addTrackToPlaylist(newPlaylist.id, trackId);
        setShowNewPlaylistDialog(false);
        setNewPlaylistName("");
        setIsOpen(false);
      }
    } finally {
      setCreatingPlaylist(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Button
        size={size}
        variant={variant}
        className={`text-muted-foreground hover:text-foreground ${className}`}
        onClick={() => toast.error("Please sign in to add to playlists")}
      >
        <ListPlus className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size={size}
            variant={variant}
            className={`text-muted-foreground hover:text-foreground ${className}`}
          >
            <ListPlus className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-card border-border">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">Add to playlist</p>
          </div>
          <DropdownMenuSeparator className="bg-border" />
          
          <DropdownMenuItem
            className="gap-2 hover:bg-muted focus:bg-muted cursor-pointer"
            onClick={() => {
              setShowNewPlaylistDialog(true);
              setIsOpen(false);
            }}
          >
            <Plus className="w-4 h-4 text-primary" />
            <span>Create new playlist</span>
          </DropdownMenuItem>
          
          {playlists.length > 0 && (
            <>
              <DropdownMenuSeparator className="bg-border" />
              <div className="max-h-48 overflow-y-auto">
                {playlists.map((playlist) => (
                  <DropdownMenuItem
                    key={playlist.id}
                    className="gap-2 hover:bg-muted focus:bg-muted cursor-pointer"
                    onClick={() => handleAddToPlaylist(playlist.id)}
                    disabled={addingToPlaylist === playlist.id}
                  >
                    {addingToPlaylist === playlist.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded bg-gradient-to-br from-primary/50 to-secondary/50 flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                        {playlist.title.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="truncate">{playlist.title}</span>
                  </DropdownMenuItem>
                ))}
              </div>
            </>
          )}
          
          {loading && playlists.length === 0 && (
            <div className="px-2 py-4 text-center">
              <Loader2 className="w-4 h-4 animate-spin mx-auto text-muted-foreground" />
            </div>
          )}
          
          {!loading && playlists.length === 0 && (
            <div className="px-2 py-3 text-center text-sm text-muted-foreground">
              No playlists yet
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create New Playlist Dialog */}
      <Dialog open={showNewPlaylistDialog} onOpenChange={setShowNewPlaylistDialog}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Create New Playlist</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Playlist name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="bg-background border-border"
              onKeyDown={(e) => e.key === "Enter" && handleCreateAndAdd()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowNewPlaylistDialog(false);
                setNewPlaylistName("");
              }}
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateAndAdd}
              disabled={creatingPlaylist || !newPlaylistName.trim()}
              className="bg-gradient-to-r from-primary to-secondary text-primary-foreground"
            >
              {creatingPlaylist ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create & Add"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddToPlaylist;
