import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PublicNav from "@/components/PublicNav";
import { Link } from "react-router-dom";
import { Check, Star, Zap } from "lucide-react";

const PLANS = [
  {
    name: "Free",
    key: "free",
    price: 0,
    tagline: "Get started",
    description: "Perfect for new influencers just getting started.",
    features: [
      "Create a profile",
      "Manage social media links",
      "Not listed in public directory",
      "Access campaign marketplace",
      "Basic analytics",
    ],
    cta: "Get Started Free",
    variant: "outline" as const,
    highlighted: false,
    badge: null,
  },
  {
    name: "Pro",
    key: "pro",
    price: 299,
    tagline: "Most Popular",
    description: "For influencers ready to get discovered and grow.",
    features: [
      "Everything in Free",
      "Listed in public directory",
      "Up to 10 social links",
      "Priority in search results",
      "Campaign application access",
      "Analytics dashboard",
      "Direct messages from brands",
    ],
    cta: "Upgrade to Pro",
    variant: "default" as const,
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Elite",
    key: "elite",
    price: 599,
    tagline: "Maximum exposure",
    description: "For top creators who want maximum visibility.",
    features: [
      "Everything in Pro",
      "Featured on homepage",
      "Top priority search ranking",
      "Verified badge",
      "Unlimited social links",
      "Advanced analytics & reports",
      "Dedicated account support",
      "Early access to new features",
    ],
    cta: "Go Elite",
    variant: "outline" as const,
    highlighted: false,
    badge: "⚡ Elite",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Simple Pricing</Badge>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              Choose the right plan for your goals
            </h1>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">
              Start for free, upgrade when you're ready to grow. No hidden fees, cancel anytime.
            </p>
          </div>

          {/* Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative bg-card rounded-2xl border p-6 shadow-card flex flex-col ${
                  plan.highlighted ? "border-primary ring-2 ring-primary shadow-blue" : "border-border"
                } ${plan.key === "elite" ? "border-accent" : ""}`}
              >
                {plan.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold ${
                    plan.highlighted ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
                  }`}>
                    {plan.badge}
                  </div>
                )}

                <div className="mb-5">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                    plan.highlighted ? "gradient-hero" :
                    plan.key === "elite" ? "gradient-accent" : "bg-muted"
                  }`}>
                    {plan.key === "free" && <Zap className={`w-5 h-5 ${plan.highlighted ? "text-white" : "text-muted-foreground"}`} />}
                    {plan.key === "pro" && <Zap className="w-5 h-5 text-white" />}
                    {plan.key === "elite" && <Star className="w-5 h-5 text-accent-foreground" />}
                  </div>
                  <h2 className="font-display text-xl font-bold text-foreground">{plan.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-end gap-1">
                    <span className="font-display text-4xl font-bold text-foreground">
                      {plan.price === 0 ? "Free" : `ETB ${plan.price.toLocaleString()}`}
                    </span>
                    {plan.price > 0 && <span className="text-muted-foreground text-sm mb-1">/month</span>}
                  </div>
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        plan.highlighted ? "text-primary" : plan.key === "elite" ? "text-accent" : "text-success"
                      }`} />
                      <span className="text-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.variant}
                  className={`w-full ${plan.highlighted ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""} ${plan.key === "elite" ? "border-accent text-accent hover:bg-accent hover:text-accent-foreground" : ""}`}
                  asChild
                >
                  <Link to="/auth?tab=signup">{plan.cta}</Link>
                </Button>
              </motion.div>
            ))}
          </div>

          {/* FAQ note */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground text-sm">
              Prices are in Ethiopian Birr (ETB). Plans auto-renew monthly. Cancel anytime from your dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
