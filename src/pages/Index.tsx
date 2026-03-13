import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PublicNav from "@/components/PublicNav";
import {
  Search, Star, TrendingUp, Users, CheckCircle,
  ArrowRight, Zap, Globe, BarChart3, Shield
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import InfluencerCard from "@/components/InfluencerCard";

const STATS = [
  { label: "Active Influencers", value: "500+", icon: Users },
  { label: "Brands & Advertisers", value: "120+", icon: Globe },
  { label: "Campaigns Completed", value: "1,200+", icon: BarChart3 },
  { label: "Total Reach", value: "15M+", icon: TrendingUp },
];

const HOW_IT_WORKS = [
  {
    step: "01", title: "Create Your Profile",
    desc: "Influencers sign up and build a professional profile showcasing their reach and niche.",
    icon: Users,
  },
  {
    step: "02", title: "Brands Discover You",
    desc: "Advertisers search the directory and find creators that match their campaign goals.",
    icon: Search,
  },
  {
    step: "03", title: "Collaborate & Earn",
    desc: "Accept campaign requests, deliver content, and get paid — all in one platform.",
    icon: Zap,
  },
];

export default function Index() {
  const { data: eliteInfluencers } = useQuery({
    queryKey: ["elite-influencers"],
    queryFn: async () => {
      const { data } = await supabase
        .from("influencer_profiles")
        .select(`
          *,
          profiles!inner(full_name, avatar_url),
          social_links(platform, followers_count)
        `)
        .eq("subscription_plan", "elite")
        .eq("status", "approved")
        .limit(4);
      return data || [];
    },
  });

  return (
    <div className="min-h-screen bg-background font-body">
      <PublicNav />

      {/* Hero Section */}
      <section className="pt-24 pb-16 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="mb-4 bg-white/20 text-white border-white/30 hover:bg-white/30">
              🇪🇹 Ethiopia's #1 Influencer Marketplace
            </Badge>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Connect Brands with{" "}
              <span className="text-accent">Top Ethiopian</span>{" "}
              Influencers
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              InfluencerHub is the centralized marketplace where Ethiopian social media
              creators grow their income and brands run impactful campaigns.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="bg-white text-primary font-semibold hover:bg-white/90 shadow-blue" asChild>
                <Link to="/auth?tab=signup&role=influencer">
                  Join as Influencer <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10" asChild>
                <Link to="/auth?tab=signup&role=advertiser">
                  I'm a Brand
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="mt-10 max-w-2xl mx-auto"
          >
            <div className="flex bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="flex-1 flex items-center gap-2 px-4">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search influencers by name, category, or location..."
                  className="flex-1 py-3.5 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                  onKeyDown={(e) => e.key === "Enter" && (window.location.href = "/directory")}
                />
              </div>
              <Button className="m-1.5 rounded-lg" asChild>
                <Link to="/directory">Search</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="text-center"
              >
                <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="font-display text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Influencers */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Featured Influencers
              </h2>
              <p className="text-muted-foreground mt-1">Top creators on the Elite plan</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/directory">View all <ArrowRight className="ml-1 w-4 h-4" /></Link>
            </Button>
          </div>

          {eliteInfluencers && eliteInfluencers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {eliteInfluencers.map((inf: any, i) => (
                <motion.div key={inf.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <InfluencerCard
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
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-card rounded-xl border border-border p-5 animate-pulse">
                  <div className="flex gap-3 mb-4">
                    <div className="w-14 h-14 rounded-full bg-muted" />
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded mb-2 w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-16 bg-muted rounded-lg mb-3" />
                  <div className="h-9 bg-muted rounded-lg" />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">How It Works</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">A simple 3-step process to start collaborating</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 }}
                className="bg-card rounded-xl border border-border p-6 text-center shadow-card"
              >
                <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-mono text-primary font-bold">{item.step}</span>
                <h3 className="font-display text-lg font-semibold text-foreground mt-1 mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="gradient-hero rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
            </div>
            <div className="relative z-10">
              <h2 className="font-display text-2xl md:text-4xl font-bold text-white mb-4">
                Ready to grow your influence?
              </h2>
              <p className="text-white/80 mb-8 max-w-lg mx-auto">
                Join hundreds of Ethiopian creators and brands already using InfluencerHub.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold" asChild>
                  <Link to="/auth?tab=signup">Start for Free</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10" asChild>
                  <Link to="/pricing">View Plans</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded gradient-hero flex items-center justify-center">
                <Users className="w-3 h-3 text-white" />
              </div>
              <span className="font-display font-bold text-sm text-foreground">InfluencerHub</span>
            </div>
            <p className="text-xs text-muted-foreground">© 2025 InfluencerHub. Made for Ethiopia 🇪🇹</p>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <Link to="/pricing" className="hover:text-foreground">Pricing</Link>
              <Link to="/directory" className="hover:text-foreground">Directory</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
