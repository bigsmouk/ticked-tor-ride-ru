import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import WaitingRoom from "./pages/WaitingRoom";
import Game from "./pages/Game";
import TestSandbox from "./pages/TestSandbox";
import MapCalibration from "./pages/MapCalibration";
import TestMapCalibration from "./pages/TestMapCalibration";
import RouteCalibration from "./pages/RouteCalibration";
import EmailConfirmed from "./pages/EmailConfirmed";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/test" element={<TestSandbox />} />
            <Route path="/calibration" element={<MapCalibration />} />
            <Route path="/test-calibration" element={<TestMapCalibration />} />
            <Route path="/routes" element={<RouteCalibration />} />
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
