import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Users, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") === "signup" ? "signup" : "login";
  const defaultRole = (searchParams.get("role") as "influencer" | "advertiser") || "influencer";

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupRole, setSignupRole] = useState<"influencer" | "advertiser">(defaultRole);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setLoading(false);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Welcome back!" });
      // Redirect based on role — profile is fetched after login via onAuthStateChange
      // Small delay to allow profile to load
      setTimeout(async () => {
        const { data } = await import("@/integrations/supabase/client").then(m =>
          m.supabase.from("profiles").select("role").eq("user_id", (await m.supabase.auth.getUser()).data.user!.id).single()
        );
        const role = data?.role || "influencer";
        const routes: Record<string, string> = {
          influencer: "/dashboard/influencer",
          advertiser: "/dashboard/advertiser",
          admin: "/dashboard/admin",
        };
        navigate(routes[role] || "/");
      }, 300);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword.length < 6) {
      toast({ title: "Password too short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await signUp(signupEmail, signupPassword, signupName, signupRole);
    setLoading(false);
    if (error) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Account created!", description: "Please check your email to confirm your account." });
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-white rounded-full blur-3xl" />
        </div>
        <Link to="/" className="flex items-center gap-2 relative z-10">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white">InfluencerHub</span>
        </Link>
        <div className="relative z-10">
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            Ethiopia's Leading Influencer Marketplace
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Connect with top creators, run campaigns, and grow your brand across Ethiopian social media.
          </p>
          <div className="space-y-3">
            {["500+ verified Ethiopian influencers", "120+ brands and advertisers", "Seamless campaign management"].map((f) => (
              <div key={f} className="flex items-center gap-2 text-white/90">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs">✓</span>
                </div>
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/50 text-xs relative z-10">© 2025 InfluencerHub 🇪🇹</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>

          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">InfluencerHub</span>
          </div>

          <Tabs defaultValue={defaultTab}>
            <TabsList className="w-full mb-6">
              <TabsTrigger value="login" className="flex-1">Sign in</TabsTrigger>
              <TabsTrigger value="signup" className="flex-1">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <h1 className="font-display text-2xl font-bold text-foreground mb-1">Welcome back</h1>
              <p className="text-muted-foreground text-sm mb-6">Sign in to your InfluencerHub account</p>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" placeholder="you@example.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative mt-1">
                    <Input id="login-password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <h1 className="font-display text-2xl font-bold text-foreground mb-1">Create account</h1>
              <p className="text-muted-foreground text-sm mb-6">Join InfluencerHub today</p>
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <Label>I am a...</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setSignupRole("influencer")}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${signupRole === "influencer" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
                    >
                      🎭 Influencer
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignupRole("advertiser")}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${signupRole === "advertiser" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
                    >
                      🏢 Brand / Advertiser
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input id="signup-name" placeholder="Abebe Kebede" value={signupName} onChange={e => setSignupName(e.target.value)} required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" type="email" placeholder="you@example.com" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative mt-1">
                    <Input id="signup-password" type={showPassword ? "text" : "password"} placeholder="Min. 6 characters" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Create account"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  By signing up, you agree to our Terms of Service.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
