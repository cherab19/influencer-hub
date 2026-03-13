import { useState } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  LayoutDashboard, User, BarChart3, Megaphone, MessageSquare,
  CreditCard, LogOut, Menu, X, Users, TrendingUp, DollarSign,
  CheckCircle, Star, Zap
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const NAV_ITEMS = [
  { path: "/dashboard/influencer", label: "Dashboard", icon: LayoutDashboard, end: true },
  { path: "/dashboard/influencer/profile", label: "My Profile", icon: User },
  { path: "/dashboard/influencer/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/dashboard/influencer/campaigns", label: "Campaigns", icon: Megaphone },
  { path: "/dashboard/influencer/messages", label: "Messages", icon: MessageSquare },
  { path: "/dashboard/influencer/subscription", label: "Subscription", icon: CreditCard },
];

function Sidebar({ mobile, onClose }: { mobile?: boolean; onClose?: () => void }) {
  const location = useLocation();
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className={`${mobile ? "w-full" : "w-64 min-h-screen"} bg-sidebar flex flex-col`}>
      <div className="p-5 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-hero flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-sidebar-foreground">InfluencerHub</span>
        </Link>
        <div className="mt-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center text-white text-xs font-bold">
            {profile?.full_name?.charAt(0) || "?"}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-sidebar-foreground truncate">{profile?.full_name}</p>
            <p className="text-xs text-sidebar-foreground/50">Influencer</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = item.end ? location.pathname === item.path : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive
                ? "bg-sidebar-primary/20 text-sidebar-primary font-medium"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={() => { signOut(); navigate("/"); }}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}

// ─── Sub-pages ───────────────────────────────────────────────

function DashboardHome() {
  const { user } = useAuth();
  const { data: influencerProfile } = useQuery({
    queryKey: ["my-influencer-profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("influencer_profiles").select("*").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const mockData = [
    { month: "Jan", followers: 1200 }, { month: "Feb", followers: 1800 },
    { month: "Mar", followers: 2400 }, { month: "Apr", followers: 2100 },
    { month: "May", followers: 3200 }, { month: "Jun", followers: 4100 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Welcome back! Here's your overview.</p>
      </div>

      {/* Status banner */}
      {influencerProfile && influencerProfile.status !== "approved" && (
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 flex items-start gap-3">
          <Star className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Profile Pending Approval</p>
            <p className="text-xs text-muted-foreground">Your profile is under review. It will be listed publicly once approved.</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Followers", value: influencerProfile?.followers_count?.toLocaleString() || "0", icon: Users, trend: "+12%" },
          { label: "Engagement Rate", value: `${influencerProfile?.engagement_rate || 0}%`, icon: TrendingUp, trend: "+2.1%" },
          { label: "Ad Price", value: `ETB ${influencerProfile?.ad_price?.toLocaleString() || "0"}`, icon: DollarSign, trend: null },
          { label: "Plan", value: influencerProfile?.subscription_plan?.toUpperCase() || "FREE", icon: Zap, trend: null },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl border border-border p-4 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className="w-4 h-4 text-muted-foreground" />
              {stat.trend && <span className="text-xs text-success font-medium">{stat.trend}</span>}
            </div>
            <p className="font-display text-xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-card rounded-xl border border-border p-5 shadow-card">
        <h2 className="font-display font-semibold text-foreground mb-4">Follower Growth</h2>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={mockData}>
            <defs>
              <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(221, 91%, 45%)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="hsl(221, 91%, 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Area type="monotone" dataKey="followers" stroke="hsl(221, 91%, 45%)" strokeWidth={2} fill="url(#colorFollowers)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ProfileEditor() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: influencerProfile } = useQuery({
    queryKey: ["my-influencer-profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("influencer_profiles").select("*").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: socialLinks } = useQuery({
    queryKey: ["my-social-links", influencerProfile?.id],
    queryFn: async () => {
      const { data } = await supabase.from("social_links").select("*").eq("influencer_id", influencerProfile!.id);
      return data || [];
    },
    enabled: !!influencerProfile?.id,
  });

  const [form, setForm] = useState({
    bio: "", category: "", location: "", followers_count: "0",
    engagement_rate: "0", ad_price: "0",
  });

  useState(() => {
    if (influencerProfile) {
      setForm({
        bio: influencerProfile.bio || "",
        category: influencerProfile.category || "",
        location: influencerProfile.location || "",
        followers_count: String(influencerProfile.followers_count || 0),
        engagement_rate: String(influencerProfile.engagement_rate || 0),
        ad_price: String(influencerProfile.ad_price || 0),
      });
    }
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        bio: form.bio,
        category: form.category as any,
        location: form.location,
        followers_count: parseInt(form.followers_count) || 0,
        engagement_rate: parseFloat(form.engagement_rate) || 0,
        ad_price: parseFloat(form.ad_price) || 0,
      };

      if (influencerProfile) {
        await supabase.from("influencer_profiles").update(payload).eq("user_id", user!.id);
      } else {
        await supabase.from("influencer_profiles").insert({ ...payload, user_id: user!.id });
      }
    },
    onSuccess: () => {
      toast({ title: "Profile saved!" });
      queryClient.invalidateQueries({ queryKey: ["my-influencer-profile"] });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const CATEGORIES = ["comedy", "lifestyle", "tech", "beauty", "education", "food", "travel", "sports", "music", "fashion", "health", "business"];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground text-sm">Edit your public influencer profile</p>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-5">
        <div>
          <Label>Bio</Label>
          <Textarea placeholder="Tell brands about yourself..." value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} className="mt-1" rows={4} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Category</Label>
            <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Location</Label>
            <Input placeholder="e.g. Addis Ababa" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="mt-1" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Total Followers</Label>
            <Input type="number" value={form.followers_count} onChange={e => setForm({ ...form, followers_count: e.target.value })} className="mt-1" />
          </div>
          <div>
            <Label>Engagement Rate (%)</Label>
            <Input type="number" step="0.1" value={form.engagement_rate} onChange={e => setForm({ ...form, engagement_rate: e.target.value })} className="mt-1" />
          </div>
          <div>
            <Label>Ad Price (ETB)</Label>
            <Input type="number" value={form.ad_price} onChange={e => setForm({ ...form, ad_price: e.target.value })} className="mt-1" />
          </div>
        </div>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </div>
  );
}

function Analytics() {
  const engagementData = [
    { month: "Jan", rate: 3.2 }, { month: "Feb", rate: 4.1 }, { month: "Mar", rate: 3.8 },
    { month: "Apr", rate: 5.2 }, { month: "May", rate: 4.7 }, { month: "Jun", rate: 6.1 },
  ];
  const earningsData = [
    { month: "Jan", earnings: 0 }, { month: "Feb", earnings: 500 }, { month: "Mar", earnings: 1200 },
    { month: "Apr", earnings: 800 }, { month: "May", earnings: 2100 }, { month: "Jun", earnings: 3500 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground text-sm">Track your growth and performance</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-card rounded-xl border border-border p-5 shadow-card">
          <h2 className="font-display font-semibold text-foreground mb-4">Engagement Rate (%)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={engagementData}>
              <defs>
                <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="rate" stroke="hsl(38, 92%, 50%)" strokeWidth={2} fill="url(#engGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 shadow-card">
          <h2 className="font-display font-semibold text-foreground mb-4">Campaign Earnings (ETB)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={earningsData}>
              <defs>
                <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="earnings" stroke="hsl(142, 71%, 45%)" strokeWidth={2} fill="url(#earnGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Campaigns() {
  const { user } = useAuth();
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["available-campaigns"],
    queryFn: async () => {
      const { data } = await supabase.from("campaigns").select(`*, advertiser_profiles(company_name)`).eq("status", "active");
      return data || [];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Campaign Marketplace</h1>
        <p className="text-muted-foreground text-sm">Browse and apply to brand campaigns</p>
      </div>
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}</div>
      ) : campaigns && campaigns.length > 0 ? (
        <div className="space-y-3">
          {campaigns.map((c: any) => (
            <div key={c.id} className="bg-card rounded-xl border border-border p-5 shadow-card flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h3 className="font-display font-semibold text-foreground">{c.title}</h3>
                <p className="text-sm text-muted-foreground">{(c.advertiser_profiles as any)?.company_name || "Brand"}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {c.target_platform && <Badge variant="secondary">{c.target_platform}</Badge>}
                  {c.target_category && <Badge variant="outline">{c.target_category}</Badge>}
                  {c.budget && <Badge className="bg-success/10 text-success">ETB {c.budget?.toLocaleString()}</Badge>}
                </div>
              </div>
              <Button size="sm">Apply Now</Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <Megaphone className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-display font-semibold text-foreground mb-1">No active campaigns</h3>
          <p className="text-sm text-muted-foreground">Check back soon for new opportunities</p>
        </div>
      )}
    </div>
  );
}

function Messages() {
  const { user } = useAuth();
  const { data: messages } = useQuery({
    queryKey: ["my-messages", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("messages").select(`*, sender:profiles!messages_sender_id_fkey(full_name, avatar_url)`).eq("recipient_id", user!.id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Messages</h1>
        <p className="text-muted-foreground text-sm">Your inbox</p>
      </div>
      {messages && messages.length > 0 ? (
        <div className="space-y-2">
          {messages.map((msg: any) => (
            <div key={msg.id} className={`bg-card rounded-xl border p-4 shadow-card ${!msg.is_read ? "border-primary/30 bg-primary/5" : "border-border"}`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full gradient-hero flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {msg.sender?.full_name?.charAt(0) || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{msg.sender?.full_name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{new Date(msg.created_at).toLocaleDateString()}</p>
                  </div>
                  {msg.subject && <p className="text-xs font-medium text-muted-foreground">{msg.subject}</p>}
                  <p className="text-sm text-muted-foreground truncate">{msg.body}</p>
                </div>
                {!msg.is_read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-display font-semibold text-foreground mb-1">No messages yet</h3>
          <p className="text-sm text-muted-foreground">Brands will contact you here</p>
        </div>
      )}
    </div>
  );
}

function Subscription() {
  const { user } = useAuth();
  const { data: subscription } = useQuery({
    queryKey: ["my-subscription", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("subscriptions").select("*").eq("user_id", user!.id).eq("status", "active").single();
      return data;
    },
    enabled: !!user,
  });

  const PLANS = [
    { key: "free", name: "Free", price: 0, features: ["Profile creation", "Basic listing", "Up to 3 social links"] },
    { key: "pro", name: "Pro", price: 299, features: ["Public directory listing", "10 social links", "Analytics dashboard", "Campaign access"] },
    { key: "elite", name: "Elite", price: 599, features: ["Featured on homepage", "Top ranking", "Verified badge", "Unlimited links", "Priority support"] },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Subscription</h1>
        <p className="text-muted-foreground text-sm">Manage your plan</p>
      </div>

      {subscription && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">Current Plan: <strong>{subscription.plan.toUpperCase()}</strong></p>
            <p className="text-xs text-muted-foreground">Status: {subscription.status}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((plan) => (
          <div key={plan.key} className={`bg-card rounded-xl border p-5 shadow-card ${subscription?.plan === plan.key ? "border-primary ring-2 ring-primary" : "border-border"}`}>
            <h3 className="font-display font-semibold text-foreground mb-1">{plan.name}</h3>
            <p className="font-display text-2xl font-bold text-foreground mb-3">
              {plan.price === 0 ? "Free" : `ETB ${plan.price}/mo`}
            </p>
            <ul className="space-y-1.5 mb-4">
              {plan.features.map(f => <li key={f} className="text-xs text-muted-foreground flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-success" />{f}</li>)}
            </ul>
            {subscription?.plan === plan.key ? (
              <Badge className="w-full justify-center py-2 bg-primary/10 text-primary border-primary/20">Current Plan</Badge>
            ) : (
              <Button variant="outline" size="sm" className="w-full">Select {plan.name}</Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Dashboard Layout ────────────────────────────────────

export default function InfluencerDashboard() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) { navigate("/auth"); return null; }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 shadow-lg">
            <Sidebar mobile onClose={() => setMobileNavOpen(false)} />
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileNavOpen(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded gradient-hero flex items-center justify-center">
              <Users className="w-3 h-3 text-white" />
            </div>
            <span className="font-display font-bold text-sm">InfluencerHub</span>
          </div>
          <button onClick={() => setMobileNavOpen(true)} className="p-1.5 rounded-lg hover:bg-muted">
            <Menu className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 p-5 lg:p-8 overflow-auto">
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="profile" element={<ProfileEditor />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="campaigns" element={<Campaigns />} />
            <Route path="messages" element={<Messages />} />
            <Route path="subscription" element={<Subscription />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
