import { useState } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  LayoutDashboard, Users, Megaphone, CreditCard, Shield,
  LogOut, Menu, CheckCircle, XCircle, AlertCircle
} from "lucide-react";

const NAV_ITEMS = [
  { path: "/dashboard/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { path: "/dashboard/admin/influencers", label: "Influencers", icon: Users },
  { path: "/dashboard/admin/advertisers", label: "Advertisers", icon: Shield },
  { path: "/dashboard/admin/campaigns", label: "Campaigns", icon: Megaphone },
  { path: "/dashboard/admin/payments", label: "Payments", icon: CreditCard },
];

function Sidebar({ mobile, onClose }: { mobile?: boolean; onClose?: () => void }) {
  const location = useLocation();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  return (
    <aside className={`${mobile ? "w-full" : "w-64 min-h-screen"} bg-sidebar flex flex-col`}>
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-hero flex items-center justify-center"><Users className="w-4 h-4 text-white" /></div>
          <span className="font-display font-bold text-sidebar-foreground">InfluencerHub</span>
        </div>
        <Badge className="mt-2 bg-destructive/20 text-destructive border-destructive/30">Admin Panel</Badge>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = item.end ? location.pathname === item.path : location.pathname.startsWith(item.path);
          return (
            <Link key={item.path} to={item.path} onClick={onClose}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive
                ? "bg-sidebar-primary/20 text-sidebar-primary font-medium"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"}`}>
              <item.icon className="w-4 h-4 flex-shrink-0" />{item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-sidebar-border">
        <button onClick={() => { signOut(); navigate("/"); }}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent transition-colors">
          <LogOut className="w-4 h-4" />Sign out
        </button>
      </div>
    </aside>
  );
}

function AdminOverview() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [influencers, advertisers, campaigns, payments] = await Promise.all([
        supabase.from("influencer_profiles").select("id, status, subscription_plan"),
        supabase.from("advertiser_profiles").select("id"),
        supabase.from("campaigns").select("id, status"),
        supabase.from("payments").select("amount, status"),
      ]);
      return {
        totalInfluencers: influencers.data?.length || 0,
        pendingApproval: influencers.data?.filter(i => i.status === "pending").length || 0,
        totalAdvertisers: advertisers.data?.length || 0,
        activeCampaigns: campaigns.data?.filter(c => c.status === "active").length || 0,
        totalRevenue: payments.data?.filter(p => p.status === "completed").reduce((s, p) => s + p.amount, 0) || 0,
      };
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Admin Overview</h1>
        <p className="text-muted-foreground text-sm">Platform stats and pending actions</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Influencers", value: stats?.totalInfluencers || 0 },
          { label: "Pending Approval", value: stats?.pendingApproval || 0, alert: (stats?.pendingApproval || 0) > 0 },
          { label: "Advertisers", value: stats?.totalAdvertisers || 0 },
          { label: "Active Campaigns", value: stats?.activeCampaigns || 0 },
        ].map((s) => (
          <div key={s.label} className={`bg-card rounded-xl border p-4 shadow-card ${s.alert ? "border-warning/50 bg-warning/5" : "border-border"}`}>
            {s.alert && <AlertCircle className="w-4 h-4 text-warning mb-2" />}
            <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfluencerManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: influencers, isLoading } = useQuery({
    queryKey: ["admin-influencers"],
    queryFn: async () => {
      const { data } = await supabase
        .from("influencer_profiles")
        .select(`*, profiles!inner(full_name, email)`)
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" }) => {
      await supabase.from("influencer_profiles").update({ status }).eq("id", id);
    },
    onSuccess: () => {
      toast({ title: "Profile updated!" });
      queryClient.invalidateQueries({ queryKey: ["admin-influencers"] });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Influencer Management</h1>
        <p className="text-muted-foreground text-sm">Review and approve influencer profiles</p>
      </div>
      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Category</th>
                <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Plan</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(influencers || []).map((inf: any) => (
                <tr key={inf.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3">
                    <p className="font-medium text-foreground">{inf.profiles?.full_name}</p>
                    <p className="text-xs text-muted-foreground">{inf.profiles?.email}</p>
                  </td>
                  <td className="p-3 hidden md:table-cell">
                    {inf.category ? <Badge variant="secondary">{inf.category}</Badge> : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="p-3 hidden md:table-cell">
                    <Badge variant={inf.subscription_plan === "elite" ? "default" : "outline"}>{inf.subscription_plan}</Badge>
                  </td>
                  <td className="p-3">
                    <Badge variant={inf.status === "approved" ? "default" : inf.status === "rejected" ? "destructive" : "secondary"}
                      className={inf.status === "approved" ? "bg-success/10 text-success border-success/20" : ""}>
                      {inf.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {inf.status !== "approved" && (
                        <Button size="sm" variant="ghost" className="h-7 text-success hover:bg-success/10"
                          onClick={() => approveMutation.mutate({ id: inf.id, status: "approved" })}>
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      {inf.status !== "rejected" && (
                        <Button size="sm" variant="ghost" className="h-7 text-destructive hover:bg-destructive/10"
                          onClick={() => approveMutation.mutate({ id: inf.id, status: "rejected" })}>
                          <XCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!influencers || influencers.length === 0) && (
            <div className="text-center py-10 text-muted-foreground text-sm">No influencers registered yet</div>
          )}
        </div>
      )}
    </div>
  );
}

function AdvertiserManagement() {
  const { data: advertisers } = useQuery({
    queryKey: ["admin-advertisers"],
    queryFn: async () => {
      const { data } = await supabase.from("advertiser_profiles").select(`*, profiles!inner(full_name, email)`).order("created_at", { ascending: false });
      return data || [];
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Advertisers</h1>
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
              <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Company</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(advertisers || []).map((adv: any) => (
              <tr key={adv.id} className="hover:bg-muted/30">
                <td className="p-3">
                  <p className="font-medium text-foreground">{adv.profiles?.full_name}</p>
                  <p className="text-xs text-muted-foreground">{adv.profiles?.email}</p>
                </td>
                <td className="p-3 hidden md:table-cell text-muted-foreground">{adv.company_name || "—"}</td>
                <td className="p-3 text-muted-foreground">{new Date(adv.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!advertisers || advertisers.length === 0) && (
          <div className="text-center py-10 text-muted-foreground text-sm">No advertisers registered yet</div>
        )}
      </div>
    </div>
  );
}

function AdminCampaigns() {
  const { data: campaigns } = useQuery({
    queryKey: ["admin-campaigns"],
    queryFn: async () => {
      const { data } = await supabase.from("campaigns").select(`*, advertiser_profiles(company_name), profiles!inner(full_name)`).order("created_at", { ascending: false });
      return data || [];
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">All Campaigns</h1>
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium text-muted-foreground">Campaign</th>
              <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Budget</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(campaigns || []).map((c: any) => (
              <tr key={c.id} className="hover:bg-muted/30">
                <td className="p-3">
                  <p className="font-medium text-foreground">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.advertiser_profiles?.company_name || "—"}</p>
                </td>
                <td className="p-3 hidden md:table-cell text-muted-foreground">{c.budget ? `ETB ${c.budget.toLocaleString()}` : "—"}</td>
                <td className="p-3"><Badge variant={c.status === "active" ? "default" : "secondary"}>{c.status}</Badge></td>
                <td className="p-3 hidden md:table-cell text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!campaigns || campaigns.length === 0) && (
          <div className="text-center py-10 text-muted-foreground text-sm">No campaigns yet</div>
        )}
      </div>
    </div>
  );
}

function AdminPayments() {
  const { data: payments } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: async () => {
      const { data } = await supabase.from("payments").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Payments</h1>
      {payments && payments.length > 0 ? (
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium text-muted-foreground">Amount</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Method</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="p-3 font-medium text-foreground">{p.currency} {p.amount.toLocaleString()}</td>
                  <td className="p-3"><Badge variant={p.status === "completed" ? "default" : "secondary"}>{p.status}</Badge></td>
                  <td className="p-3 text-muted-foreground">{p.payment_method || "—"}</td>
                  <td className="p-3 text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <CreditCard className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No payments recorded yet</p>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!user || (profile && profile.role !== "admin")) { navigate("/auth"); return null; }

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
            <span className="font-display font-bold text-sm">InfluencerHub Admin</span>
          </div>
          <button onClick={() => setMobileNavOpen(true)} className="p-1.5 rounded-lg hover:bg-muted"><Menu className="w-5 h-5" /></button>
        </header>
        <main className="flex-1 p-5 lg:p-8 overflow-auto">
          <Routes>
            <Route index element={<AdminOverview />} />
            <Route path="influencers" element={<InfluencerManagement />} />
            <Route path="advertisers" element={<AdvertiserManagement />} />
            <Route path="campaigns" element={<AdminCampaigns />} />
            <Route path="payments" element={<AdminPayments />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
