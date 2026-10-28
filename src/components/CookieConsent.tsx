import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const CONSENT_KEY = 'ttr_analytics_consent';
const METRIKA_ID = 113841365;

function loadMetrika() {
  if (document.getElementById('ttr-metrika-script')) return;
  const w = window as Window & { ym?: (...args: any[]) => void };
  w.ym = w.ym || function (...args: any[]) {
    ((w.ym as any).a = (w.ym as any).a || []).push(args);
  };
  const script = document.createElement('script');
  script.id = 'ttr-metrika-script';
  script.async = true;
  script.src = 'https://mc.yandex.ru/metrika/tag.js?id=' + METRIKA_ID;
  document.head.appendChild(script);
  w.ym(METRIKA_ID, 'init', {
    webvisor: true, clickmap: true, accurateTrackBounce: true,
    trackLinks: true, url: window.location.href,
  });
}

export default function CookieConsent() {
  const [choice, setChoice] = useState<string | null>(() => localStorage.getItem(CONSENT_KEY));
  useEffect(() => {
    if (choice === 'accepted') loadMetrika();
  }, [choice]);

  const choose = (value: 'accepted' | 'rejected') => {
    localStorage.setItem(CONSENT_KEY, value);
    setChoice(value);
    if (value === 'rejected' && document.getElementById('ttr-metrika-script')) {
      // An already loaded analytics library cannot reliably be unloaded; stop subsequent hits.
      window.location.reload();
    }
  };

  if (choice) return null;
  return (
    <section role="dialog" aria-label="Настройки cookies" className="fixed bottom-3 left-3 right-3 z-[100] mx-auto max-w-3xl rounded-xl border-2 border-amber-700 bg-amber-50 p-4 shadow-2xl text-amber-950">
      <p className="font-semibold mb-1">🍪 Cookies и аналитика</p>
      <p className="text-sm mb-3">Для работы аккаунта и игры используются необходимые данные браузера и Supabase. С вашего разрешения мы подключим Яндекс.Метрику (включая Вебвизор), чтобы анализировать посещения и улучшать сайт. Отказ от аналитики не ограничивает игру. Подробнее — в <Link to="/privacy" className="underline font-semibold">политике конфиденциальности</Link>.</p>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => choose('accepted')} className="rounded-lg bg-amber-800 px-4 py-2 text-white font-semibold">Разрешить аналитику</button>
        <button onClick={() => choose('rejected')} className="rounded-lg border border-amber-700 px-4 py-2 font-semibold">Только необходимые</button>
      </div>
    </section>
  );
}
