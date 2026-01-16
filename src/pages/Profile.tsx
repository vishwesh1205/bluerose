import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Mail, LogOut, User, Shield, Music } from "lucide-react";
import { useEffect } from "react";

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, signOut, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const userInitial = user.email?.charAt(0).toUpperCase() || "U";
  const username = user.email?.split("@")[0] || "User";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-4 px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">Profile</h1>
        </div>
      </header>

      <main className="px-6 py-8 max-w-2xl mx-auto">
        {/* Profile Card */}
        <Card className="bg-card border-border mb-6 overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-primary/30 via-secondary/20 to-accent/30" />
          <CardContent className="pt-0 pb-6">
            <div className="flex flex-col items-center -mt-12">
              <Avatar className="w-24 h-24 ring-4 ring-background shadow-xl">
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-3xl font-bold">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
              <h2 className="mt-4 text-2xl font-bold">{username}</h2>
              <span className="px-3 py-1 mt-2 text-xs font-medium bg-primary/20 text-primary rounded-full">
                Premium Member
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card className="bg-card border-border mb-6">
          <CardContent className="p-0">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Account Information
              </h3>
              
              <div className="flex items-center gap-4 py-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Mail size={18} className="text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium truncate">{user.email}</p>
                </div>
              </div>

              <Separator className="my-2" />

              <div className="flex items-center gap-4 py-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <User size={18} className="text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Username</p>
                  <p className="font-medium">{username}</p>
                </div>
              </div>

              <Separator className="my-2" />

              <div className="flex items-center gap-4 py-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Shield size={18} className="text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Account Status</p>
                  <p className="font-medium text-secondary">Active</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card className="bg-card border-border mb-6">
          <CardContent className="p-0">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Quick Links
              </h3>
              
              <button
                onClick={() => navigate("/playlists")}
                className="w-full flex items-center gap-4 py-3 hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Music size={18} className="text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">My Playlists</p>
                  <p className="text-sm text-muted-foreground">Manage your music collections</p>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Sign Out */}
        <Button
          onClick={handleSignOut}
          variant="destructive"
          className="w-full h-12 text-base font-medium"
        >
          <LogOut size={18} className="mr-2" />
          Sign Out
        </Button>
      </main>
    </div>
  );
};

export default Profile;
