import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Users, Menu, X, Bell } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function PublicNav() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDashboard = () => {
    if (!profile) return navigate("/auth");
    if (profile.role === "influencer") navigate("/dashboard/influencer");
    else if (profile.role === "advertiser") navigate("/dashboard/advertiser");
    else if (profile.role === "admin") navigate("/dashboard/admin");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
              <Users className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              Influencer<span className="text-primary">Hub</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/directory" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Find Influencers
            </Link>
            <Link to="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Button variant="ghost" size="sm" onClick={handleDashboard}>
                  Dashboard
                </Button>
                <Button variant="outline" size="sm" onClick={signOut}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/auth">Sign in</Link>
                </Button>
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                  <Link to="/auth?tab=signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={cn(
          "md:hidden overflow-hidden transition-all duration-200",
          mobileOpen ? "max-h-64 pb-4" : "max-h-0"
        )}>
          <div className="flex flex-col gap-2 pt-2 border-t border-border">
            <Link to="/directory" className="px-2 py-2 text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>
              Find Influencers
            </Link>
            <Link to="/pricing" className="px-2 py-2 text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>
              Pricing
            </Link>
            {user ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => { handleDashboard(); setMobileOpen(false); }}>Dashboard</Button>
                <Button variant="outline" size="sm" onClick={() => { signOut(); setMobileOpen(false); }}>Sign out</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild><Link to="/auth" onClick={() => setMobileOpen(false)}>Sign in</Link></Button>
                <Button size="sm" asChild><Link to="/auth?tab=signup" onClick={() => setMobileOpen(false)}>Get Started</Link></Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
