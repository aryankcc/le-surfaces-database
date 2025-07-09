
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import CurrentSlabs from "./pages/CurrentSlabs";
import DevelopmentSlabs from "./pages/DevelopmentSlabs";
import OutboundSamples from "./pages/OutboundSamples";
import CategoryPage from "./pages/CategoryPage";
import FamilySlabsPage from "./pages/FamilySlabsPage";
import Landing from "./pages/Landing";
import Reports from "./pages/Reports";
import StockAlerts from "./pages/StockAlerts";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Main inventory page */}
            <Route path="/" element={<Index />} />
            
            {/* Authentication */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Slab category pages */}
            <Route path="/current" element={<CurrentSlabs />} />
            <Route path="/development" element={<DevelopmentSlabs />} />
            <Route path="/outbound-samples" element={<OutboundSamples />} />
            
            {/* Category browsing */}
            <Route path="/category/:categoryName" element={<CategoryPage />} />
            <Route path="/category/:categoryName/family/:familyName" element={<FamilySlabsPage />} />
            
            {/* Reports and analytics */}
            <Route path="/reports" element={<Reports />} />
            <Route path="/stock-alerts" element={<StockAlerts />} />
            
            {/* Alternative landing page */}
            <Route path="/landing" element={<Landing />} />
            
            {/* Catch all 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
