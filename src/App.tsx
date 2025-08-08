
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Setup from "./pages/Setup";
import Draft from "./pages/Draft";
import DraftNew from "./pages/DraftNew";
import NotFound from "./pages/NotFound";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { preloadChampionSplashArts } from "./utils/imagePreloader";

const queryClient = new QueryClient();

const App = () => {
  const [isPreloading, setIsPreloading] = useState(true);
  const [preloadProgress, setPreloadProgress] = useState({ loaded: 0, total: 0, percentage: 0 });

  useEffect(() => {
    // Start preloading champion splash arts on app startup
    const startPreloading = async () => {
      try {
        await preloadChampionSplashArts((progress) => {
          setPreloadProgress(progress);
        });
        
        // Small delay to show completion
        setTimeout(() => {
          setIsPreloading(false);
        }, 500);
        
      } catch (error) {
        console.error('Failed to preload champion splash arts:', error);
        // Don't block the app if preloading fails
        setIsPreloading(false);
      }
    };

    startPreloading();
  }, []);

  // Show loading screen while preloading
  if (isPreloading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lol-dark">
        <div className="text-center">
          <div className="mb-6">
            <div className="w-16 h-16 border-4 border-lol-gold/20 border-t-lol-gold rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-lol-gold mb-2">Loading Champion Draft Arena</h2>
            <p className="text-lol-text/70 mb-4">Preparing champion assets...</p>
          </div>
          
          {preloadProgress.total > 0 && (
            <div className="w-80 mx-auto">
              <div className="flex justify-between text-sm text-lol-text/70 mb-2">
                <span>Champion Splash Arts</span>
                <span>{preloadProgress.loaded} / {preloadProgress.total}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                <div 
                  className="bg-lol-gold h-2 rounded-full transition-all duration-300 ease-out" 
                  style={{ width: `${preloadProgress.percentage}%` }}
                />
              </div>
              <p className="text-xs text-lol-text/50">
                {preloadProgress.percentage}% complete
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Setup />} />
              <Route path="/draft/:draftId" element={<DraftNew />} />
              <Route path="/draft-old/:draftId" element={<Draft />} />
              <Route path="/simulator" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
