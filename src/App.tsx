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
import Privacy from "./pages/Privacy";
import About from "./pages/About";
import Rules from "./pages/Rules";
import CookieConsent from "./components/CookieConsent";
import { useAuth } from "./hooks/useAuth";
import { Navigate } from "react-router-dom";
import { useGameStore } from "./stores/gameStore";
import { LanguageDOMBridge, useLanguage } from "./i18n/language";
import { LanguageSwitcher } from "./components/LanguageSwitcher";

const queryClient = new QueryClient();

const AnalyticsRouteTracker = () => {
  const { pathname, search } = useLocation();
  const initial = useRef(true);
  const { language } = useLanguage();
  useEffect(() => {
    const robots = document.querySelector('meta[name="robots"]');
    if (robots) robots.setAttribute('content', ['/', '/rules', '/privacy'].includes(pathname) ? 'index, follow, max-image-preview:large' : 'noindex, nofollow');
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      if (['/', '/rules', '/privacy'].includes(pathname)) canonical.setAttribute('href', 'https://tickettoride.online' + (pathname === '/' ? '/' : pathname));
      else canonical.removeAttribute('href');
    }
    const seo = {
      '/': { title: 'Ticket to Ride: Europe — играть онлайн с друзьями бесплатно', description: 'Ticket to Ride: Europe — настольная стратегия онлайн. Стройте железные дороги по Европе, собирайте карты и выполняйте маршруты. Играйте с друзьями бесплатно.' },
      '/rules': { title: 'Правила Ticket to Ride: Europe — как играть онлайн | Ticket to Ride', description: 'Подробные правила Ticket to Ride: Europe на русском: как строить маршруты, брать карты, выполнять билеты, использовать станции, туннели и паромы.' },
      '/privacy': { title: 'Конфиденциальность и cookies | Ticket to Ride', description: 'Политика конфиденциальности Ticket to Ride: Europe: регистрация, Supabase, cookies, Яндекс.Метрика и обработка данных.' },
    }[pathname];
    if (pathname === '/about') {
      document.title = language === 'en' ? 'About the Creator | Railway Game' : 'Об авторе и проекте | Железнодорожная игра';
      document.querySelector('meta[name="description"]')?.setAttribute('content', language === 'en' ? 'About the creator and the independent browser game.' : 'Об авторе и независимой браузерной игре.');
      document.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title);
      document.querySelector('meta[property="og:description"]')?.setAttribute('content', language === 'en' ? 'About the creator and the independent browser game.' : 'Об авторе и независимой браузерной игре.');
    }
    if (seo) {
      if (language === "en") {
        const en = {
          "/": { title: "Ticket to Ride: Europe — Play Online with Friends", description: "Play Ticket to Ride: Europe online. Build railway routes across Europe, collect cards and complete destination tickets." },
          "/rules": { title: "Ticket to Ride: Europe — Rules and How to Play", description: "Learn how to play Ticket to Ride: Europe: routes, destination tickets, stations, tunnels, ferries and scoring." },
          "/privacy": { title: "Privacy Policy and Cookies | Ticket to Ride", description: "Learn about accounts, cookies, analytics and data processing for Ticket to Ride: Europe." },
        }[pathname];
        if (en) Object.assign(seo, en);
      }
      document.title = seo.title;
      const desc = document.querySelector('meta[name="description"]');
      desc?.setAttribute('content', seo.description);
      document.querySelector('meta[property="og:title"]')?.setAttribute('content', seo.title);
      document.querySelector('meta[property="og:description"]')?.setAttribute('content', seo.description);
      document.querySelector('meta[property="og:url"]')?.setAttribute('content', 'https://tickettoride.online' + (pathname === '/' ? '/' : pathname));
      document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', seo.title);
      document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', seo.description);
    }
    if (initial.current) { initial.current = false; return; }
    // Metrika init counts the first page; hit() tracks subsequent SPA navigation.
    const tracker = (window as Window & { ym?: (id: number, action: string, url: string) => void }).ym;
    if (localStorage.getItem('ttr_analytics_consent') === 'accepted') tracker?.(113841365, 'hit', window.location.origin + pathname + search);
  }, [pathname, search, language]);
  return null;
};

const RegisteredOnly = ({ children }: { children: React.ReactNode }) => {
  const soloGame = useGameStore(state => Boolean(state.currentRoom?.isSoloMode));
  const { isAuthenticated, user, loading } = useAuth();
  if (soloGame) return <>{children}</>;
  if (loading) return <div className="min-h-screen flex items-center justify-center">Проверка авторизации…</div>;
  return (isAuthenticated || Boolean(user?.is_anonymous)) ? <>{children}</> : <Navigate to="/" replace />;
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnalyticsRouteTracker />
          <CookieConsent />
          <LanguageDOMBridge />
          <div className="fixed bottom-3 left-3 z-[100]"><LanguageSwitcher /></div>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/test" element={<TestSandbox />} />
            <Route path="/calibration" element={<MapCalibration />} />
            <Route path="/routes" element={<RouteCalibration />} />
            <Route path="/test-calibration" element={<TestMapCalibration />} />
            <Route path="/test-routes" element={<TestRouteCalibration />} />
            <Route path="/waiting" element={<RegisteredOnly><WaitingRoom /></RegisteredOnly>} />
            <Route path="/game" element={<RegisteredOnly><Game /></RegisteredOnly>} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/about" element={<About />} />
            <Route path="/rules" element={<Rules />} />
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
