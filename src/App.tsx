
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import CurrentSlabs from "./pages/CurrentSlabs";
import DevelopmentSlabs from "./pages/DevelopmentSlabs";
import OutboundSamples from "./pages/OutboundSamples";
import CategoryPage from "./pages/CategoryPage";
import FamilySlabsPage from "./pages/FamilySlabsPage";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/current" element={<CurrentSlabs />} />
          <Route path="/development" element={<DevelopmentSlabs />} />
          <Route path="/outbound" element={<OutboundSamples />} />
          <Route path="/category/:categoryName" element={<CategoryPage />} />
          <Route path="/category/:categoryName/family/:familyName" element={<FamilySlabsPage />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
