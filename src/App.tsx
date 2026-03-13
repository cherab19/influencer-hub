import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import DirectoryPage from "./pages/Directory.tsx";
import PricingPage from "./pages/Pricing.tsx";
import AuthPage from "./pages/Auth.tsx";
import InfluencerProfilePage from "./pages/InfluencerProfile.tsx";
import InfluencerDashboard from "./pages/dashboard/InfluencerDashboard.tsx";
import AdvertiserDashboard from "./pages/dashboard/AdvertiserDashboard.tsx";
import AdminDashboard from "./pages/dashboard/AdminDashboard.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/directory" element={<DirectoryPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/influencer/:id" element={<InfluencerProfilePage />} />
            <Route path="/dashboard/influencer/*" element={<InfluencerDashboard />} />
            <Route path="/dashboard/advertiser/*" element={<AdvertiserDashboard />} />
            <Route path="/dashboard/admin/*" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
