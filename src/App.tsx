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
import SeoLanding from "./pages/SeoLanding";
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
    if (robots) robots.setAttribute('content', ['/', '/rules', '/privacy', '/play-with-friends', '/play-solo', '/how-to-play'].includes(pathname) ? 'index, follow, max-image-preview:large' : 'noindex, nofollow');
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      if (['/', '/rules', '/privacy', '/play-with-friends', '/play-solo', '/how-to-play'].includes(pathname)) canonical.setAttribute('href', 'https://tickettoride.online' + (pathname === '/' ? '/' : pathname));
      else canonical.removeAttribute('href');
    }
    const seo = {
      '/': { title: 'Железнодорожная стратегия онлайн — играть бесплатно без регистрации', description: 'Бесплатная браузерная игра про строительство железных дорог. Играйте с друзьями по коду комнаты или против бота. Без скачивания и регистрации.' },
      '/rules': { title: 'Правила Ticket to Ride: Europe — как играть онлайн | Ticket to Ride', description: 'Подробные правила Ticket to Ride: Europe на русском: как строить маршруты, брать карты, выполнять билеты, использовать станции, туннели и паромы.' },
      '/play-with-friends': { title: 'Настольная стратегия с друзьями онлайн — без регистрации', description: 'Создайте комнату и играйте с друзьями в железнодорожную стратегию онлайн. Бесплатно, без скачивания и регистрации, для 2–4 игроков.' },
      '/play-solo': { title: 'Игра про поезда против бота — бесплатно и без регистрации', description: 'Играйте против бота в железнодорожную стратегию по карте Европы. Соло-режим запускается прямо в браузере, без регистрации и скачивания.' },
      '/how-to-play': { title: 'Как играть в железнодорожную стратегию — первые шаги', description: 'Короткое руководство для новичков: как выбрать режим, собирать карты вагонов, строить дороги и выполнять билеты с маршрутами.' },
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
          "/": { title: "Railway Strategy Online — Play Free Without Registration", description: "Play a free railway strategy game in your browser. Build routes across Europe with friends or against a bot. No download or registration." },
          "/play-with-friends": { title: "Play a Railway Strategy Game Online With Friends", description: "Create a room and play a railway strategy game online with 2–4 friends. No registration or download required." },
          "/play-solo": { title: "Play a Railway Strategy Game Against a Bot", description: "Practice building railway routes across Europe against a computer opponent. Free browser game, no sign-up required." },
          "/how-to-play": { title: "How to Play a Railway Strategy Game — Beginner Guide", description: "Learn the basics: destination tickets, train cards, claiming routes and scoring points in a railway strategy game." },
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
            <Route path="/play-with-friends" element={<SeoLanding page="friends" />} />
            <Route path="/play-solo" element={<SeoLanding page="solo" />} />
            <Route path="/how-to-play" element={<SeoLanding page="guide" />} />
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
