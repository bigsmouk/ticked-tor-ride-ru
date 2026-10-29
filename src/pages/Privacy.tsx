import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/language';

export default function Privacy() {
  const { language } = useLanguage();
  if (language === 'en') return <main data-no-translate className="min-h-screen bg-amber-50 px-4 py-10 text-amber-950"><article className="mx-auto max-w-3xl rounded-xl bg-white shadow-lg p-6 sm:p-10 space-y-5"><h1 className="text-3xl font-bold">Privacy and cookies</h1><p>Information about Ticket to Ride: Europe (tickettoride.online). Updated October 28, 2026.</p><h2 className="text-xl font-semibold">Information processed</h2><p>Depending on how you use the game, account email, nickname, account and session identifiers, avatar, game rooms, match results, IP address and device information may be processed. Supabase manages authentication credentials.</p><h2 className="text-xl font-semibold">Services</h2><p>Supabase provides authentication and game data storage. Tuqo hosts the website. Yandex Metrica provides optional analytics only after consent. Yandex Webmaster and Google Search Console help monitor search indexing.</p><h2 className="text-xl font-semibold">Cookies and local storage</h2><p>Essential storage supports sessions and gameplay. Analytics consent is stored in localStorage as ttr_analytics_consent. Declining analytics does not prevent gameplay.</p><h2 className="text-xl font-semibold">Your choices</h2><p>Clear the website data in your browser to reset analytics consent. Storage and processing locations depend on the configured providers.</p><h2 className="text-xl font-semibold">Contact and legal information</h2><p>Developer: Timur Simineev. Contact details and data controller information require confirmation before a final legal policy is published.</p><p className="rounded-lg bg-amber-100 p-3">This page is an informational draft and does not establish compliance with all applicable privacy laws.</p><Link className="underline" to="/">← Back to game</Link></article></main>;
  return (
    <main className="min-h-screen bg-amber-50 text-amber-950 px-4 py-10">
      <article className="mx-auto max-w-3xl rounded-xl bg-white shadow-lg p-6 sm:p-10 space-y-5">
        <nav aria-label="Карта сайта" className="flex flex-wrap gap-4 text-sm text-amber-800 underline"><Link to="/">Главная</Link><Link to="/rules">Правила игры</Link><Link to="/privacy">Конфиденциальность</Link></nav>
        <h1 className="text-3xl font-bold">Конфиденциальность и использование cookies</h1>
        <p className="text-sm text-amber-700">Информация о работе сайта «Ticket to Ride: Europe» (tickettoride.online). Дата обновления: 28 октября 2026 года.</p>
        <h2 className="text-xl font-semibold">Какие данные обрабатываются</h2>
        <p>При регистрации и использовании игры могут обрабатываться email, никнейм, идентификатор учётной записи, данные авторизации и сессии, выбранный аватар, игровые комнаты, результаты матчей и технические данные запросов (например, IP-адрес и сведения об устройстве). Пароль обрабатывается сервисом авторизации Supabase; сайт не должен хранить его в открытом виде.</p>
        <h2 className="text-xl font-semibold">Сервисы и цели</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Supabase</strong> — регистрация, вход, хранение профилей, игровых данных и управление сессиями.</li>
          <li><strong>Tuqo</strong> — размещение сайта, доставка страниц и обработка технических запросов к хостингу.</li>
          <li><strong>Яндекс.Метрика</strong> — статистика посещений, кликов и Вебвизор; подключается только после разрешения аналитики.</li>
          <li><strong>Яндекс.Вебмастер</strong> — проверка прав на сайт и управление его присутствием в поиске. Само подтверждение владения сайтом не является отдельной системой пользовательской аналитики.</li>
          <li><strong>Google Search Console</strong> — подтверждение прав на домен, мониторинг индексации, поисковых запросов и технического состояния сайта в поиске Google. Само подключение Search Console не означает установку Google Analytics или дополнительных аналитических cookies на сайте.</li>
        </ul>
        <h2 className="text-xl font-semibold">Cookies и локальное хранилище</h2>
        <p>Необходимые данные используются для входа в аккаунт, поддержания сессии и работы игры. Выбор по аналитике сохраняется в localStorage под ключом <code>ttr_analytics_consent</code>. Если вы разрешите аналитику, Яндекс.Метрика может использовать cookies и аналогичные технологии. Без разрешения скрипт Метрики не загружается.</p>
        <h2 className="text-xl font-semibold">Как изменить выбор</h2>
        <p>Вы можете удалить данные сайта в настройках браузера, после чего плашка выбора появится повторно. Отказ от аналитики не препятствует регистрации и игре.</p>
        <h2 className="text-xl font-semibold">Хранение и защита</h2>
        <p>Данные обрабатываются для предоставления функциональности игры, безопасности и технического обслуживания. Сроки хранения и расположение серверов зависят от настроек подключённых сервисов. Перед публикацией окончательной юридической редакции необходимо уточнить местонахождение баз данных, трансграничную передачу, сроки хранения и основания обработки.</p>
        <h2 className="text-xl font-semibold">Оператор и обращения</h2>
        <p>Разработчик сайта: Симинеев Тимур. <strong>Контакт для обращений по персональным данным и реквизиты оператора требуют подтверждения и публикации владельцем сайта.</strong></p>
        <p className="rounded-lg bg-amber-100 p-3 text-sm">Эта страница — информационный проект политики, а не подтверждение выполнения всех требований законодательства РФ о персональных данных. Для публикации юридически полной политики необходимо проверить требования 152-ФЗ, локализацию данных и уведомление Роскомнадзора применительно к фактической обработке.</p>
      </article>
    </main>
  );
}
