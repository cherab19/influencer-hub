import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle, Plus, Trash2, Users, ArrowRight, ArrowLeft,
  Zap, Star, Camera
} from "lucide-react";
import AvatarUpload from "@/components/AvatarUpload";

const STEPS = ["Welcome", "Your Profile", "Social Links", "Choose Plan", "Submit"];

const CATEGORIES = [
  "comedy", "lifestyle", "tech", "beauty", "education",
  "food", "travel", "sports", "music", "fashion", "health", "business"
];
const PLATFORMS = ["tiktok", "instagram", "youtube", "facebook", "twitter", "telegram"];
const PLATFORM_ICONS: Record<string, string> = {
  tiktok: "🎵", instagram: "📸", youtube: "▶️",
  facebook: "👍", twitter: "🐦", telegram: "✈️",
};

const PLANS = [
  {
    key: "free",
    name: "Free",
    price: 0,
    icon: Users,
    color: "border-border",
    desc: "Get started — profile not public yet",
    features: ["Profile creation", "Basic dashboard", "Up to 3 social links"],
  },
  {
    key: "pro",
    name: "Pro",
    price: 299,
    icon: Zap,
    color: "border-primary",
    desc: "Appear in the public directory",
    features: ["Public directory listing", "10 social links", "Analytics", "Campaign access"],
    popular: true,
  },
  {
    key: "elite",
    name: "Elite",
    price: 599,
    icon: Star,
    color: "border-accent",
    desc: "Featured on homepage with top ranking",
    features: ["Featured on homepage", "Top search ranking", "Verified badge", "Unlimited links", "Priority support"],
  },
];

interface OnboardingWizardProps {
  onComplete: () => void;
  influencerProfileId?: string;
}

export default function OnboardingWizard({ onComplete, influencerProfileId }: OnboardingWizardProps) {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Step 2 - profile
  const [bio, setBio] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [followersCount, setFollowersCount] = useState("");
  const [engagementRate, setEngagementRate] = useState("");
  const [adPrice, setAdPrice] = useState("");

  // Step 3 - social links
  const [socialLinks, setSocialLinks] = useState<
    Array<{ platform: string; handle: string; followers_count: string; url: string }>
  >([{ platform: "instagram", handle: "", followers_count: "", url: "" }]);

  // Step 4 - plan
  const [selectedPlan, setSelectedPlan] = useState("free");

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: "tiktok", handle: "", followers_count: "", url: "" }]);
  };

  const removeSocialLink = (i: number) => {
    setSocialLinks(socialLinks.filter((_, idx) => idx !== i));
  };

  const updateSocialLink = (i: number, field: string, value: string) => {
    setSocialLinks(socialLinks.map((l, idx) => idx === i ? { ...l, [field]: value } : l));
  };

  const handleNext = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const handleBack = () => setStep(s => Math.max(s - 1, 0));

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Upsert influencer profile
      const { data: ipData, error: ipErr } = await supabase
        .from("influencer_profiles")
        .upsert({
          user_id: user.id,
          bio,
          category: category as any,
          location,
          followers_count: parseInt(followersCount) || 0,
          engagement_rate: parseFloat(engagementRate) || 0,
          ad_price: parseFloat(adPrice) || 0,
          subscription_plan: selectedPlan as any,
          status: "pending",
        }, { onConflict: "user_id" })
        .select()
        .single();

      if (ipErr) throw ipErr;

      // Insert social links
      const validLinks = socialLinks.filter(l => l.platform && l.handle);
      if (validLinks.length > 0 && ipData?.id) {
        // Delete old links first
        await supabase.from("social_links").delete().eq("influencer_id", ipData.id);
        await supabase.from("social_links").insert(
          validLinks.map(l => ({
            influencer_id: ipData.id,
            platform: l.platform as any,
            handle: l.handle,
            followers_count: parseInt(l.followers_count) || 0,
            url: l.url || null,
          }))
        );
      }

      // Create subscription record
      await supabase.from("subscriptions").upsert({
        user_id: user.id,
        plan: selectedPlan as any,
        status: "active",
      }, { onConflict: "user_id" });

      queryClient.invalidateQueries({ queryKey: ["my-influencer-profile"] });
      toast({ title: "Profile submitted! 🎉", description: "Your profile is under review. We'll notify you once approved." });
      onComplete();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="gradient-hero p-6 rounded-t-2xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-white">InfluencerHub</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-white mb-1">Welcome, {profile?.full_name?.split(" ")[0]}! 👋</h2>
          <p className="text-white/70 text-sm">Let's set up your influencer profile in just a few steps.</p>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-4">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < step ? "bg-white text-primary" :
                  i === step ? "bg-white/30 text-white border-2 border-white" :
                  "bg-white/10 text-white/40"
                }`}>
                  {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 w-6 ${i < step ? "bg-white" : "bg-white/20"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Step 0: Welcome */}
              {step === 0 && (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">You're almost there!</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
                    Complete your profile to start getting discovered by top Ethiopian brands and advertisers.
                  </p>
                  <div className="grid grid-cols-3 gap-3 text-left mb-6">
                    {[
                      { icon: "📝", title: "Complete Profile", desc: "Add bio, category & pricing" },
                      { icon: "📱", title: "Social Links", desc: "Link your accounts" },
                      { icon: "🚀", title: "Go Live", desc: "Get discovered by brands" },
                    ].map(item => (
                      <div key={item.title} className="bg-muted/50 rounded-xl p-3 text-center">
                        <div className="text-2xl mb-2">{item.icon}</div>
                        <p className="text-xs font-semibold text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                  {/* Avatar upload in welcome step */}
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-3">First, add a profile photo</p>
                    <div className="flex justify-center">
                      <AvatarUpload userId={user?.id} currentAvatar={profile?.avatar_url} onUploaded={refreshProfile} />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Profile */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="font-display text-lg font-bold text-foreground">Your Influencer Profile</h3>
                  <div>
                    <Label>Bio <span className="text-muted-foreground text-xs">(tell brands about yourself)</span></Label>
                    <Textarea
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      placeholder="I create lifestyle content for Ethiopian audiences on TikTok and Instagram..."
                      rows={4}
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Category</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(c => (
                            <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Input
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        placeholder="e.g. Addis Ababa"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Total Followers</Label>
                      <Input type="number" value={followersCount} onChange={e => setFollowersCount(e.target.value)} placeholder="50000" className="mt-1" />
                    </div>
                    <div>
                      <Label>Engagement Rate (%)</Label>
                      <Input type="number" step="0.1" value={engagementRate} onChange={e => setEngagementRate(e.target.value)} placeholder="4.5" className="mt-1" />
                    </div>
                    <div>
                      <Label>Ad Price (ETB)</Label>
                      <Input type="number" value={adPrice} onChange={e => setAdPrice(e.target.value)} placeholder="1500" className="mt-1" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Social Links */}
              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="font-display text-lg font-bold text-foreground">Your Social Media</h3>
                  <p className="text-sm text-muted-foreground">Add your social media accounts so brands know where to find you.</p>
                  {socialLinks.map((link, i) => (
                    <div key={i} className="bg-muted/30 border border-border rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{PLATFORM_ICONS[link.platform] || "🌐"}</span>
                          <Select value={link.platform} onValueChange={v => updateSocialLink(i, "platform", v)}>
                            <SelectTrigger className="w-36 h-8 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PLATFORMS.map(p => (
                                <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {socialLinks.length > 1 && (
                          <button onClick={() => removeSocialLink(i)} className="text-destructive hover:bg-destructive/10 p-1 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Handle (without @)</Label>
                          <Input
                            value={link.handle}
                            onChange={e => updateSocialLink(i, "handle", e.target.value)}
                            placeholder="yourhandle"
                            className="mt-1 h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Followers on this platform</Label>
                          <Input
                            type="number"
                            value={link.followers_count}
                            onChange={e => updateSocialLink(i, "followers_count", e.target.value)}
                            placeholder="10000"
                            className="mt-1 h-8 text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Profile URL (optional)</Label>
                        <Input
                          value={link.url}
                          onChange={e => updateSocialLink(i, "url", e.target.value)}
                          placeholder="https://instagram.com/yourhandle"
                          className="mt-1 h-8 text-sm"
                        />
                      </div>
                    </div>
                  ))}
                  {socialLinks.length < 6 && (
                    <button
                      onClick={addSocialLink}
                      className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border rounded-xl text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add another platform
                    </button>
                  )}
                </div>
              )}

              {/* Step 3: Plan */}
              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="font-display text-lg font-bold text-foreground">Choose Your Plan</h3>
                  <p className="text-sm text-muted-foreground">You can upgrade anytime from your dashboard.</p>
                  <div className="space-y-3">
                    {PLANS.map(plan => {
                      const Icon = plan.icon;
                      return (
                        <button
                          key={plan.key}
                          onClick={() => setSelectedPlan(plan.key)}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                            selectedPlan === plan.key
                              ? `${plan.color} bg-primary/5`
                              : "border-border hover:border-muted-foreground/30"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                                plan.key === "elite" ? "gradient-accent" :
                                plan.key === "pro" ? "gradient-hero" : "bg-muted"
                              }`}>
                                <Icon className={`w-4 h-4 ${plan.key === "free" ? "text-muted-foreground" : "text-white"}`} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-display font-semibold text-foreground">{plan.name}</span>
                                  {plan.popular && <Badge className="text-xs py-0 bg-primary/10 text-primary border-primary/20">Most Popular</Badge>}
                                </div>
                                <p className="text-xs text-muted-foreground">{plan.desc}</p>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-display font-bold text-foreground">
                                {plan.price === 0 ? "Free" : `ETB ${plan.price}`}
                              </p>
                              {plan.price > 0 && <p className="text-xs text-muted-foreground">/month</p>}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {plan.features.map(f => (
                              <span key={f} className="text-xs flex items-center gap-1 text-muted-foreground">
                                <CheckCircle className="w-3 h-3 text-success" />{f}
                              </span>
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 4: Submit */}
              {step === 4 && (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-success" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">You're all set!</h3>
                  <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-6">
                    Submit your profile for review. Our team typically approves profiles within 24 hours.
                  </p>
                  <div className="bg-muted/30 rounded-xl p-4 text-left space-y-2 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Category</span>
                      <span className="font-medium text-foreground capitalize">{category || "—"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Location</span>
                      <span className="font-medium text-foreground">{location || "—"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Social accounts</span>
                      <span className="font-medium text-foreground">{socialLinks.filter(l => l.handle).length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Selected plan</span>
                      <span className="font-medium text-foreground capitalize">{selectedPlan}</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer nav */}
        <div className="p-6 pt-0 flex items-center justify-between gap-3">
          {step > 0 ? (
            <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          ) : (
            <div />
          )}
          {step < STEPS.length - 1 ? (
            <Button onClick={handleNext} className="flex items-center gap-2 ml-auto">
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleFinish} disabled={saving} className="ml-auto flex items-center gap-2">
              {saving ? "Submitting..." : "Submit Profile"}
              {!saving && <CheckCircle className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
