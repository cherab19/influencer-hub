import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PublicNav from "@/components/PublicNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, MapPin, Star, MessageSquare, DollarSign, X } from "lucide-react";
import { formatFollowers } from "@/components/InfluencerCard";
import { Link } from "react-router-dom";
import { useState } from "react";

const PLATFORM_ICONS: Record<string, string> = {
  tiktok: "🎵", instagram: "📸", youtube: "▶️", facebook: "👍", twitter: "🐦", telegram: "✈️",
};

export default function InfluencerProfilePage() {
  const { id } = useParams<{ id: string }>();

  const { data: influencer, isLoading } = useQuery({
    queryKey: ["influencer-profile", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("influencer_profiles")
        .select(`
          *,
          profiles!inner(full_name, avatar_url, email),
          social_links(*)
        `)
        .eq("user_id", id)
        .single();
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <PublicNav />
        <div className="pt-24 container mx-auto px-4">
          <div className="animate-pulse max-w-3xl mx-auto">
            <div className="h-48 bg-muted rounded-2xl mb-4" />
            <div className="h-8 bg-muted rounded w-1/3 mb-3" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!influencer) {
    return (
      <div className="min-h-screen bg-background">
        <PublicNav />
        <div className="pt-24 container mx-auto px-4 text-center">
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Influencer not found</h1>
          <Button asChild><Link to="/directory">Back to Directory</Link></Button>
        </div>
      </div>
    );
  }

  const profile = (influencer as any).profiles;
  const socialLinks = (influencer as any).social_links || [];
  const initials = profile?.full_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <div className="pt-20">
        {/* Cover */}
        <div className="h-32 md:h-48 gradient-hero" />

        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Profile header */}
            <div className="flex flex-col md:flex-row gap-5 -mt-14 md:-mt-20 mb-6">
              <div className="relative flex-shrink-0">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.full_name} className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-card object-cover shadow-lg" />
                ) : (
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-card gradient-hero flex items-center justify-center text-white font-display font-bold text-3xl shadow-lg">
                    {initials}
                  </div>
                )}
                {influencer.is_verified && (
                  <CheckCircle className="absolute -bottom-1 -right-1 w-6 h-6 text-primary bg-card rounded-full" />
                )}
              </div>

              <div className="flex-1 pt-4 md:pt-16">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="font-display text-2xl font-bold text-foreground">{profile?.full_name}</h1>
                      {influencer.is_verified && <Badge className="bg-primary/10 text-primary border-primary/20">✓ Verified</Badge>}
                      {influencer.subscription_plan === "elite" && <Badge className="bg-accent text-accent-foreground">⚡ Elite</Badge>}
                    </div>
                    {influencer.category && (
                      <Badge variant="secondary" className="mt-1">{influencer.category}</Badge>
                    )}
                    {influencer.location && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <MapPin className="w-3 h-3" />
                        {influencer.location}
                      </div>
                    )}
                  </div>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Contact
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left: Bio + Platforms */}
              <div className="md:col-span-2 space-y-5">
                {influencer.bio && (
                  <div className="bg-card rounded-xl border border-border p-5">
                    <h2 className="font-display font-semibold text-foreground mb-2">About</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">{influencer.bio}</p>
                  </div>
                )}

                {socialLinks.length > 0 && (
                  <div className="bg-card rounded-xl border border-border p-5">
                    <h2 className="font-display font-semibold text-foreground mb-4">Social Media</h2>
                    <div className="space-y-3">
                      {socialLinks.map((link: any) => (
                        <div key={link.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{PLATFORM_ICONS[link.platform] || "🌐"}</span>
                            <div>
                              <p className="text-sm font-medium text-foreground capitalize">{link.platform}</p>
                              {link.handle && <p className="text-xs text-muted-foreground">@{link.handle}</p>}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-display font-bold text-foreground">{formatFollowers(link.followers_count)}</p>
                            <p className="text-xs text-muted-foreground">followers</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Stats */}
              <div className="space-y-4">
                <div className="bg-card rounded-xl border border-border p-5 space-y-4">
                  <h2 className="font-display font-semibold text-foreground">Key Stats</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Followers</span>
                      <span className="font-display font-bold text-foreground">{formatFollowers(influencer.followers_count)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Engagement Rate</span>
                      <span className="font-display font-bold text-primary">{influencer.engagement_rate?.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-border pt-3">
                      <span className="text-sm text-muted-foreground">Ad Price (per post)</span>
                      <span className="font-display font-bold text-foreground">ETB {influencer.ad_price?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-primary rounded-xl p-5 text-primary-foreground">
                  <DollarSign className="w-8 h-8 mb-2 opacity-80" />
                  <h3 className="font-display font-bold text-lg mb-1">Ready to collaborate?</h3>
                  <p className="text-sm opacity-80 mb-4">Send a campaign request and start working together.</p>
                  <Button className="w-full bg-white text-primary hover:bg-white/90 font-semibold">
                    Send Campaign Request
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
