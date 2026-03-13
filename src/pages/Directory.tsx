import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PublicNav from "@/components/PublicNav";
import InfluencerCard from "@/components/InfluencerCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, SlidersHorizontal } from "lucide-react";

const CATEGORIES = ["comedy", "lifestyle", "tech", "beauty", "education", "food", "travel", "sports", "music", "fashion", "health", "business"];
const PLATFORMS = ["tiktok", "instagram", "youtube", "facebook", "twitter", "telegram"];
const FOLLOWER_RANGES = [
  { label: "Any", min: 0, max: Infinity },
  { label: "1K - 10K", min: 1000, max: 10000 },
  { label: "10K - 100K", min: 10000, max: 100000 },
  { label: "100K - 1M", min: 100000, max: 1000000 },
  { label: "1M+", min: 1000000, max: Infinity },
];

export default function DirectoryPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [platform, setPlatform] = useState("all");
  const [followerRange, setFollowerRange] = useState("Any");
  const [location, setLocation] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data: influencers, isLoading } = useQuery({
    queryKey: ["directory-influencers", category, platform, followerRange, location],
    queryFn: async () => {
      let query = supabase
        .from("influencer_profiles")
        .select(`
          *,
          profiles!inner(full_name, avatar_url),
          social_links(platform, followers_count)
        `)
        .in("subscription_plan", ["pro", "elite"])
        .eq("status", "approved")
        .order("subscription_plan", { ascending: false });

      if (category && category !== "all") query = query.eq("category", category as any);
      if (location) query = query.ilike("location", `%${location}%`);

      const range = FOLLOWER_RANGES.find(r => r.label === followerRange);
      if (range && followerRange !== "Any") {
        query = query.gte("followers_count", range.min);
        if (range.max !== Infinity) query = query.lte("followers_count", range.max);
      }

      const { data } = await query;
      return data || [];
    },
  });

  const filtered = (influencers || []).filter((inf: any) => {
    const name = inf.profiles?.full_name?.toLowerCase() || "";
    const matchSearch = !search || name.includes(search.toLowerCase()) ||
      (inf.location || "").toLowerCase().includes(search.toLowerCase());
    const matchPlatform = platform === "all" || (inf.social_links || []).some((l: any) => l.platform === platform);
    return matchSearch && matchPlatform;
  });

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <div className="pt-20">
        {/* Header */}
        <div className="bg-card border-b border-border py-8">
          <div className="container mx-auto px-4">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">Influencer Directory</h1>
            <p className="text-muted-foreground mb-5">Discover top Ethiopian content creators</p>

            <div className="flex gap-2 flex-wrap">
              <div className="flex-1 min-w-[240px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or location..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </Button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger><SelectValue placeholder="Platform" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    {PLATFORMS.map(p => <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={followerRange} onValueChange={setFollowerRange}>
                  <SelectTrigger><SelectValue placeholder="Followers" /></SelectTrigger>
                  <SelectContent>
                    {FOLLOWER_RANGES.map(r => <SelectItem key={r.label} value={r.label}>{r.label}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Location (e.g. Addis Ababa)"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Grid */}
        <div className="container mx-auto px-4 py-8">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-card rounded-xl border border-border p-5 animate-pulse">
                  <div className="flex gap-3 mb-4">
                    <div className="w-14 h-14 rounded-full bg-muted" />
                    <div className="flex-1"><div className="h-4 bg-muted rounded mb-2 w-3/4" /><div className="h-3 bg-muted rounded w-1/2" /></div>
                  </div>
                  <div className="h-16 bg-muted rounded-lg mb-3" />
                  <div className="h-9 bg-muted rounded-lg" />
                </div>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">{filtered.length} influencer{filtered.length !== 1 ? "s" : ""} found</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filtered.map((inf: any) => (
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
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">No influencers found</h3>
              <p className="text-muted-foreground text-sm">Try adjusting your filters or search term</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
