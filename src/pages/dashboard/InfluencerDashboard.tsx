import { useState, useEffect, useRef } from "react";
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
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import OnboardingWizard from "@/components/OnboardingWizard";
import AvatarUpload from "@/components/AvatarUpload";
import {
  LayoutDashboard, User, BarChart3, Megaphone, MessageSquare,
  CreditCard, LogOut, Menu, X, Users, TrendingUp, DollarSign,
  CheckCircle, Star, Zap, Send
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
  const unreadCount = useUnreadMessages();

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
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name || ""} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full gradient-hero flex items-center justify-center text-white text-xs font-bold">
                {profile?.full_name?.charAt(0) || "?"}
              </div>
            )}
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
          const isMessages = item.label === "Messages";
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
              <span className="flex-1">{item.label}</span>
              {isMessages && unreadCount > 0 && (
                <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
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
  const unreadCount = useUnreadMessages();
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
      {influencerProfile && influencerProfile.status === "pending" && (
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 flex items-start gap-3">
          <Star className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Profile Pending Approval</p>
            <p className="text-xs text-muted-foreground">Your profile is under review. It will be listed publicly once approved.</p>
          </div>
        </div>
      )}

      {/* Unread messages banner */}
      {unreadCount > 0 && (
        <Link to="/dashboard/influencer/messages">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-center justify-between gap-3 hover:bg-primary/10 transition-colors">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-primary" />
              <p className="text-sm font-medium text-foreground">
                You have <strong>{unreadCount}</strong> unread message{unreadCount > 1 ? "s" : ""}
              </p>
            </div>
            <span className="text-xs text-primary font-medium">View inbox →</span>
          </div>
        </Link>
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
  const { user, profile, refreshProfile } = useAuth();
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

  const { data: socialLinks, refetch: refetchLinks } = useQuery({
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

  const [newLink, setNewLink] = useState({ platform: "instagram", handle: "", followers_count: "", url: "" });

  useEffect(() => {
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
  }, [influencerProfile]);

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

  const addLinkMutation = useMutation({
    mutationFn: async () => {
      if (!influencerProfile?.id) throw new Error("Profile not found");
      await supabase.from("social_links").insert({
        influencer_id: influencerProfile.id,
        platform: newLink.platform as any,
        handle: newLink.handle,
        followers_count: parseInt(newLink.followers_count) || 0,
        url: newLink.url || null,
      });
    },
    onSuccess: () => {
      toast({ title: "Social link added!" });
      setNewLink({ platform: "instagram", handle: "", followers_count: "", url: "" });
      refetchLinks();
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteLinkMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("social_links").delete().eq("id", id);
    },
    onSuccess: () => refetchLinks(),
  });

  const CATEGORIES = ["comedy", "lifestyle", "tech", "beauty", "education", "food", "travel", "sports", "music", "fashion", "health", "business"];
  const PLATFORMS = ["tiktok", "instagram", "youtube", "facebook", "twitter", "telegram"];
  const PLATFORM_ICONS: Record<string, string> = {
    tiktok: "🎵", instagram: "📸", youtube: "▶️", facebook: "👍", twitter: "🐦", telegram: "✈️",
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground text-sm">Edit your public influencer profile</p>
      </div>

      {/* Avatar section */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-card">
        <h2 className="font-display font-semibold text-foreground mb-4">Profile Photo</h2>
        <div className="flex items-center gap-4">
          <AvatarUpload userId={user?.id} currentAvatar={profile?.avatar_url} onUploaded={refreshProfile} size="lg" />
          <div>
            <p className="text-sm font-medium text-foreground">Upload a profile photo</p>
            <p className="text-xs text-muted-foreground mt-1">Click the photo to upload. JPG, PNG or WebP. Max 5MB.</p>
          </div>
        </div>
      </div>

      {/* Profile info */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-5">
        <h2 className="font-display font-semibold text-foreground">Profile Info</h2>
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

      {/* Social links */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-4">
        <h2 className="font-display font-semibold text-foreground">Social Media Links</h2>
        {socialLinks && socialLinks.length > 0 && (
          <div className="space-y-2">
            {socialLinks.map((link: any) => (
              <div key={link.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{PLATFORM_ICONS[link.platform] || "🌐"}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground capitalize">{link.platform}</p>
                    {link.handle && <p className="text-xs text-muted-foreground">@{link.handle}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-display font-bold text-foreground">{link.followers_count?.toLocaleString()}</span>
                  <button
                    onClick={() => deleteLinkMutation.mutate(link.id)}
                    className="text-destructive hover:bg-destructive/10 p-1 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add new link */}
        <div className="border border-dashed border-border rounded-xl p-4 space-y-3">
          <p className="text-sm font-medium text-foreground">Add Social Link</p>
          <div className="grid grid-cols-2 gap-3">
            <Select value={newLink.platform} onValueChange={v => setNewLink({ ...newLink, platform: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PLATFORMS.map(p => <SelectItem key={p} value={p}>{PLATFORM_ICONS[p]} {p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input placeholder="Handle (without @)" value={newLink.handle} onChange={e => setNewLink({ ...newLink, handle: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input type="number" placeholder="Followers count" value={newLink.followers_count} onChange={e => setNewLink({ ...newLink, followers_count: e.target.value })} />
            <Input placeholder="Profile URL (optional)" value={newLink.url} onChange={e => setNewLink({ ...newLink, url: e.target.value })} />
          </div>
          <Button
            size="sm"
            onClick={() => addLinkMutation.mutate()}
            disabled={!newLink.handle || addLinkMutation.isPending}
          >
            {addLinkMutation.isPending ? "Adding..." : "Add Link"}
          </Button>
        </div>
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
                  {c.budget && <Badge className="bg-success/10 text-success border-success/20">ETB {c.budget?.toLocaleString()}</Badge>}
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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages, refetch } = useQuery({
    queryKey: ["my-messages", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("messages")
        .select(`*, sender:profiles!messages_sender_id_fkey(full_name, avatar_url, user_id)`)
        .eq("recipient_id", user!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  // Real-time subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`messages-inbox-${user.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `recipient_id=eq.${user.id}`,
      }, (payload) => {
        refetch();
        toast({
          title: "New message!",
          description: "You have a new message in your inbox.",
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // Mark as read when opening thread
  const openThread = async (senderId: string) => {
    setSelectedThread(senderId);
    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("recipient_id", user!.id)
      .eq("sender_id", senderId)
      .eq("is_read", false);
    queryClient.invalidateQueries({ queryKey: ["my-messages"] });
  };

  const sendReply = async () => {
    if (!replyBody.trim() || !selectedThread) return;
    await supabase.from("messages").insert({
      sender_id: user!.id,
      recipient_id: selectedThread,
      body: replyBody.trim(),
    });
    setReplyBody("");
    refetch();
  };

  // Group messages by sender
  const threads = messages ? Object.values(
    messages.reduce((acc: any, msg: any) => {
      const key = msg.sender?.user_id || msg.sender_id;
      if (!acc[key]) acc[key] = { sender: msg.sender, messages: [], hasUnread: false };
      acc[key].messages.push(msg);
      if (!msg.is_read) acc[key].hasUnread = true;
      return acc;
    }, {})
  ) as any[] : [];

  const threadMessages = selectedThread
    ? messages?.filter((m: any) => m.sender?.user_id === selectedThread || m.sender_id === selectedThread) || []
    : [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Messages</h1>
        <p className="text-muted-foreground text-sm">Real-time conversations with brands</p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card" style={{ height: 480 }}>
        <div className="flex h-full">
          {/* Thread list */}
          <div className="w-64 border-r border-border flex flex-col flex-shrink-0">
            <div className="p-3 border-b border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Inbox</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {threads.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <MessageSquare className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">No messages yet</p>
                </div>
              )}
              {threads.map((thread: any) => (
                <button
                  key={thread.sender?.user_id}
                  onClick={() => openThread(thread.sender?.user_id)}
                  className={`w-full text-left p-3 hover:bg-muted/50 transition-colors border-b border-border/50 ${
                    selectedThread === thread.sender?.user_id ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden">
                      {thread.sender?.avatar_url
                        ? <img src={thread.sender.avatar_url} alt="" className="w-full h-full object-cover" />
                        : thread.sender?.full_name?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-foreground truncate">{thread.sender?.full_name || "Unknown"}</p>
                        {thread.hasUnread && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{thread.messages[0]?.body}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Message pane */}
          <div className="flex-1 flex flex-col min-w-0">
            {selectedThread ? (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {threadMessages.map((msg: any) => {
                    const isOwn = msg.sender_id === user?.id;
                    return (
                      <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-xs rounded-xl px-3 py-2 text-sm ${
                          isOwn ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                        }`}>
                          <p>{msg.body}</p>
                          <p className={`text-xs mt-1 ${isOwn ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
                <div className="p-3 border-t border-border flex gap-2">
                  <Input
                    value={replyBody}
                    onChange={e => setReplyBody(e.target.value)}
                    placeholder="Type a reply..."
                    className="flex-1 h-9 text-sm"
                    onKeyDown={e => e.key === "Enter" && sendReply()}
                  />
                  <Button size="sm" onClick={sendReply} disabled={!replyBody.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-6">
                <div>
                  <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Select a conversation to read messages</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
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
  const [showOnboarding, setShowOnboarding] = useState(false);

  const { data: influencerProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["my-influencer-profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("influencer_profiles").select("*").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  // Show onboarding if profile has no bio and no category (fresh signup)
  useEffect(() => {
    if (!profileLoading && influencerProfile !== undefined) {
      const isNewUser = !influencerProfile?.bio && !influencerProfile?.category;
      setShowOnboarding(isNewUser);
    }
  }, [influencerProfile, profileLoading]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) { navigate("/auth"); return null; }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Onboarding wizard */}
      {showOnboarding && (
        <OnboardingWizard
          onComplete={() => setShowOnboarding(false)}
          influencerProfileId={influencerProfile?.id}
        />
      )}

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
