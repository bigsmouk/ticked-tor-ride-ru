import { useEffect, useRef } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import WaitingRoom from "./pages/WaitingRoom";
import Game from "./pages/Game";
import TestSandbox from "./pages/TestSandbox";
import MapCalibration from "./pages/MapCalibration";
import RouteCalibration from "./pages/RouteCalibration";
import TestMapCalibration from "./pages/TestMapCalibration";
import TestRouteCalibration from "./pages/TestRouteCalibration";
import EmailConfirmed from "./pages/EmailConfirmed";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AnalyticsRouteTracker = () => {
  const { pathname, search } = useLocation();
  const initial = useRef(true);
  useEffect(() => {
    const robots = document.querySelector('meta[name="robots"]');
    if (robots) robots.setAttribute('content', pathname === '/' ? 'index, follow, max-image-preview:large' : 'noindex, nofollow');
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      if (pathname === '/') canonical.setAttribute('href', 'https://tickettoride.online/');
      else canonical.removeAttribute('href');
    }
    if (initial.current) { initial.current = false; return; }
    // Metrika init counts the first page; hit() tracks subsequent SPA navigation.
    const tracker = (window as Window & { ym?: (id: number, action: string, url: string) => void }).ym;
    tracker?.(113841365, 'hit', window.location.origin + pathname + search);
  }, [pathname, search]);
  return null;
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnalyticsRouteTracker />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/test" element={<TestSandbox />} />
            <Route path="/calibration" element={<MapCalibration />} />
            <Route path="/routes" element={<RouteCalibration />} />
            <Route path="/test-calibration" element={<TestMapCalibration />} />
            <Route path="/test-routes" element={<TestRouteCalibration />} />
            <Route path="/waiting" element={<WaitingRoom />} />
            <Route path="/game" element={<Game />} />
            <Route path="/email-confirmed" element={<EmailConfirmed />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
