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
import AvatarUpload from "@/components/AvatarUpload";
import {
  LayoutDashboard, Search, Megaphone, MessageSquare,
  CreditCard, LogOut, Menu, Users, Plus, X, Send
} from "lucide-react";
import InfluencerCard from "@/components/InfluencerCard";

const NAV_ITEMS = [
  { path: "/dashboard/advertiser", label: "Dashboard", icon: LayoutDashboard, end: true },
  { path: "/dashboard/advertiser/find", label: "Find Influencers", icon: Search },
  { path: "/dashboard/advertiser/campaigns", label: "Campaigns", icon: Megaphone },
  { path: "/dashboard/advertiser/messages", label: "Messages", icon: MessageSquare },
  { path: "/dashboard/advertiser/billing", label: "Billing", icon: CreditCard },
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
              <div className="w-full h-full bg-accent flex items-center justify-center text-accent-foreground text-xs font-bold">
                {profile?.full_name?.charAt(0) || "?"}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-sidebar-foreground truncate">{profile?.full_name}</p>
            <p className="text-xs text-sidebar-foreground/50">Advertiser</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = item.end ? location.pathname === item.path : location.pathname.startsWith(item.path);
          const isMessages = item.label === "Messages";
          return (
            <Link key={item.path} to={item.path} onClick={onClose}
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
        <button onClick={() => { signOut(); navigate("/"); }}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors">
          <LogOut className="w-4 h-4" />Sign out
        </button>
      </div>
    </aside>
  );
}

function AdvertiserHome() {
  const { user } = useAuth();
  const { data: campaigns } = useQuery({
    queryKey: ["my-campaigns", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("campaigns").select("*").eq("advertiser_id", user!.id);
      return data || [];
    },
    enabled: !!user,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Advertiser Dashboard</h1>
        <p className="text-muted-foreground text-sm">Manage your campaigns and find influencers</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Campaigns", value: campaigns?.length || 0 },
          { label: "Active Campaigns", value: campaigns?.filter((c: any) => c.status === "active").length || 0 },
          { label: "Total Budget", value: `ETB ${campaigns?.reduce((s: number, c: any) => s + (c.budget || 0), 0).toLocaleString() || 0}` },
          { label: "Applications", value: "—" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl border border-border p-4 shadow-card">
            <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-foreground">Recent Campaigns</h2>
          <Button size="sm" asChild><Link to="/dashboard/advertiser/campaigns">View all</Link></Button>
        </div>
        {campaigns && campaigns.length > 0 ? (
          <div className="space-y-2">
            {campaigns.slice(0, 5).map((c: any) => (
              <div key={c.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">{c.title}</p>
                  <p className="text-xs text-muted-foreground">ETB {c.budget?.toLocaleString() || "—"}</p>
                </div>
                <Badge variant={c.status === "active" ? "default" : "secondary"}>{c.status}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">No campaigns yet. <Link to="/dashboard/advertiser/campaigns" className="text-primary hover:underline">Create your first campaign.</Link></p>
        )}
      </div>
    </div>
  );
}

function FindInfluencers() {
  const [search, setSearch] = useState("");
  const { data: influencers, isLoading } = useQuery({
    queryKey: ["all-influencers-adv", search],
    queryFn: async () => {
      const { data } = await supabase
        .from("influencer_profiles")
        .select(`*, profiles!inner(full_name, avatar_url), social_links(platform, followers_count)`)
        .in("subscription_plan", ["pro", "elite"])
        .eq("status", "approved");
      return data || [];
    },
  });

  const filtered = (influencers || []).filter((inf: any) =>
    !search || (inf.profiles?.full_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Find Influencers</h1>
        <p className="text-muted-foreground text-sm">Discover creators for your campaigns</p>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search influencers..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />)
          : filtered.map((inf: any) => (
            <InfluencerCard
              key={inf.id}
              id={inf.user_id}
              name={inf.profiles?.full_name || "Influencer"}
              avatar={inf.profiles?.avatar_url}
              category={inf.category}
              location={inf.location}
              followersCount={inf.followers_count}
              engagementRate={inf.engagement_rate}
              adPrice={inf.ad_price}
              isVerified={inf.is_verified}
              subscriptionPlan={inf.subscription_plan}
              platforms={inf.social_links}
            />
          ))
        }
      </div>
    </div>
  );
}

function CampaignManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", budget: "", target_platform: "", target_category: "", deadline: "" });

  const { data: campaigns } = useQuery({
    queryKey: ["my-campaigns", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("campaigns").select("*").eq("advertiser_id", user!.id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      await supabase.from("campaigns").insert({
        advertiser_id: user!.id,
        title: form.title,
        description: form.description,
        budget: parseFloat(form.budget) || null,
        target_platform: (form.target_platform || null) as any,
        target_category: (form.target_category || null) as any,
        deadline: form.deadline || null,
        status: "active",
      });
    },
    onSuccess: () => {
      toast({ title: "Campaign created!" });
      setShowForm(false);
      setForm({ title: "", description: "", budget: "", target_platform: "", target_category: "", deadline: "" });
      queryClient.invalidateQueries({ queryKey: ["my-campaigns"] });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const PLATFORMS = ["tiktok", "instagram", "youtube", "facebook", "twitter", "telegram"];
  const CATEGORIES = ["comedy", "lifestyle", "tech", "beauty", "education", "food", "travel", "sports", "music", "fashion", "health", "business"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Campaigns</h1>
          <p className="text-muted-foreground text-sm">Create and manage your campaigns</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />New Campaign
        </Button>
      </div>

      {showForm && (
        <div className="bg-card rounded-xl border border-border p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-foreground">New Campaign</h2>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>
          <div className="space-y-4">
            <div><Label>Campaign Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Ramadan Product Launch" className="mt-1" /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe what you need..." className="mt-1" rows={3} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Budget (ETB)</Label><Input type="number" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} placeholder="5000" className="mt-1" /></div>
              <div><Label>Deadline</Label><Input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Target Platform</Label>
                <Select value={form.target_platform} onValueChange={v => setForm({ ...form, target_platform: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Any platform" /></SelectTrigger>
                  <SelectContent>{PLATFORMS.map(p => <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Target Category</Label>
                <Select value={form.target_category} onValueChange={v => setForm({ ...form, target_category: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Any category" /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => createMutation.mutate()} disabled={!form.title || createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Campaign"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {campaigns && campaigns.length > 0 ? (
        <div className="space-y-3">
          {campaigns.map((c: any) => (
            <div key={c.id} className="bg-card rounded-xl border border-border p-5 shadow-card">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="font-display font-semibold text-foreground">{c.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{c.description}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {c.target_platform && <Badge variant="secondary">{c.target_platform}</Badge>}
                    {c.target_category && <Badge variant="outline">{c.target_category}</Badge>}
                    {c.budget && <Badge className="bg-success/10 text-success border-success/20">ETB {c.budget?.toLocaleString()}</Badge>}
                    {c.deadline && <Badge variant="outline">Due {new Date(c.deadline).toLocaleDateString()}</Badge>}
                  </div>
                </div>
                <Badge variant={c.status === "active" ? "default" : c.status === "completed" ? "secondary" : "outline"}>{c.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <Megaphone className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-display font-semibold text-foreground mb-1">No campaigns yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Create your first campaign to start working with influencers</p>
          <Button onClick={() => setShowForm(true)}>Create Campaign</Button>
        </div>
      )}
    </div>
  );
}

function AdvertiserMessages() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [newRecipientId, setNewRecipientId] = useState("");
  const [newBody, setNewBody] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages, refetch } = useQuery({
    queryKey: ["adv-messages", user?.id],
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
      .channel(`adv-messages-inbox-${user.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `recipient_id=eq.${user.id}`,
      }, () => {
        refetch();
        toast({ title: "New message!", description: "You have a new message." });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const openThread = async (senderId: string) => {
    setSelectedThread(senderId);
    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("recipient_id", user!.id)
      .eq("sender_id", senderId)
      .eq("is_read", false);
    queryClient.invalidateQueries({ queryKey: ["adv-messages"] });
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
    ? messages?.filter((m: any) => m.sender?.user_id === selectedThread) || []
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Messages</h1>
          <p className="text-muted-foreground text-sm">Real-time conversations with influencers</p>
        </div>
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
                  <p className="text-xs text-muted-foreground mt-1">Contact influencers from the directory</p>
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
                  <p className="text-sm text-muted-foreground">Select a conversation to read</p>
                  <p className="text-xs text-muted-foreground mt-1">Or contact an influencer from the <Link to="/dashboard/advertiser/find" className="text-primary hover:underline">directory</Link></p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Billing() {
  const { user, profile, refreshProfile } = useAuth();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Billing & Account</h1>
        <p className="text-muted-foreground text-sm">Manage payments and your profile photo</p>
      </div>
      {/* Avatar section */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-card">
        <h2 className="font-display font-semibold text-foreground mb-4">Profile Photo</h2>
        <div className="flex items-center gap-4">
          <AvatarUpload userId={user?.id} currentAvatar={profile?.avatar_url} onUploaded={refreshProfile} size="lg" />
          <div>
            <p className="text-sm font-medium text-foreground">Upload a company logo or photo</p>
            <p className="text-xs text-muted-foreground mt-1">Click the photo to upload. JPG, PNG or WebP. Max 5MB.</p>
          </div>
        </div>
      </div>
      <div className="bg-card rounded-xl border border-border p-8 text-center shadow-card">
        <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display font-semibold text-foreground mb-2">No payments yet</h2>
        <p className="text-sm text-muted-foreground">Payment history will appear here after your first campaign payment.</p>
      </div>
    </div>
  );
}

export default function AdvertiserDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) { navigate("/auth"); return null; }

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:block flex-shrink-0"><Sidebar /></div>
      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 shadow-lg"><Sidebar mobile onClose={() => setMobileNavOpen(false)} /></div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileNavOpen(false)} />
        </div>
      )}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded gradient-hero flex items-center justify-center"><Users className="w-3 h-3 text-white" /></div>
            <span className="font-display font-bold text-sm">InfluencerHub</span>
          </div>
          <button onClick={() => setMobileNavOpen(true)} className="p-1.5 rounded-lg hover:bg-muted"><Menu className="w-5 h-5" /></button>
        </header>
        <main className="flex-1 p-5 lg:p-8 overflow-auto">
          <Routes>
            <Route index element={<AdvertiserHome />} />
            <Route path="find" element={<FindInfluencers />} />
            <Route path="campaigns" element={<CampaignManager />} />
            <Route path="messages" element={<AdvertiserMessages />} />
            <Route path="billing" element={<Billing />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
