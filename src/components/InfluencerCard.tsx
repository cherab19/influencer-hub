import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const PLATFORM_ICONS: Record<string, string> = {
  tiktok: "🎵",
  instagram: "📸",
  youtube: "▶️",
  facebook: "👍",
  twitter: "🐦",
  telegram: "✈️",
};

const CATEGORY_COLORS: Record<string, string> = {
  comedy: "bg-yellow-100 text-yellow-800",
  lifestyle: "bg-pink-100 text-pink-800",
  tech: "bg-blue-100 text-blue-800",
  beauty: "bg-purple-100 text-purple-800",
  education: "bg-green-100 text-green-800",
  food: "bg-orange-100 text-orange-800",
  travel: "bg-cyan-100 text-cyan-800",
  sports: "bg-red-100 text-red-800",
  music: "bg-indigo-100 text-indigo-800",
  fashion: "bg-rose-100 text-rose-800",
  health: "bg-emerald-100 text-emerald-800",
  business: "bg-slate-100 text-slate-800",
};

interface InfluencerCardProps {
  id: string;
  name: string;
  avatar?: string | null;
  category?: string | null;
  location?: string | null;
  followersCount: number;
  engagementRate: number;
  adPrice: number;
  isVerified?: boolean;
  subscriptionPlan?: string;
  platforms?: Array<{ platform: string; followers_count: number }>;
}

export function formatFollowers(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

export default function InfluencerCard({
  id, name, avatar, category, location, followersCount,
  engagementRate, adPrice, isVerified, subscriptionPlan, platforms,
}: InfluencerCardProps) {
  const initials = name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";
  const isElite = subscriptionPlan === "elite";

  return (
    <div className={`relative bg-card rounded-xl border shadow-card hover:shadow-lg transition-all duration-150 overflow-hidden group ${isElite ? "ring-2 ring-accent" : ""}`}>
      {isElite && (
        <div className="absolute top-0 left-0 right-0 h-1 gradient-accent" />
      )}
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="relative flex-shrink-0">
            {avatar ? (
              <img src={avatar} alt={name} className="w-14 h-14 rounded-full object-cover ring-2 ring-border" />
            ) : (
              <div className="w-14 h-14 rounded-full gradient-hero flex items-center justify-center text-primary-foreground font-display font-bold text-lg">
                {initials}
              </div>
            )}
            {isVerified && (
              <CheckCircle className="absolute -bottom-1 -right-1 w-5 h-5 text-primary bg-card rounded-full" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-display font-semibold text-foreground truncate">{name}</h3>
            </div>
            {category && (
              <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${CATEGORY_COLORS[category] || "bg-muted text-muted-foreground"}`}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </span>
            )}
            {location && (
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-3 bg-muted/50 rounded-lg p-2.5">
          <div className="text-center">
            <p className="text-sm font-display font-bold text-foreground">{formatFollowers(followersCount)}</p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </div>
          <div className="text-center border-x border-border">
            <p className="text-sm font-display font-bold text-foreground">{engagementRate?.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Eng. Rate</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-display font-bold text-foreground">ETB {formatFollowers(adPrice)}</p>
            <p className="text-xs text-muted-foreground">Ad Price</p>
          </div>
        </div>

        {/* Platforms */}
        {platforms && platforms.length > 0 && (
          <div className="flex gap-1.5 mb-3 flex-wrap">
            {platforms.slice(0, 4).map((p) => (
              <span key={p.platform} className="text-sm bg-muted rounded-md px-2 py-0.5 flex items-center gap-1">
                {PLATFORM_ICONS[p.platform] || "🌐"}
                <span className="text-xs text-muted-foreground">{formatFollowers(p.followers_count)}</span>
              </span>
            ))}
          </div>
        )}

        <Button asChild variant="outline" className="w-full text-sm font-medium group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
          <Link to={`/influencer/${id}`}>View Profile</Link>
        </Button>
      </div>
    </div>
  );
}
