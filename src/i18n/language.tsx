import { useEffect, useState } from 'react';
export type Language = 'ru' | 'en';
export const LANGUAGE_KEY = 'ttr_language';
export const dictionary: Record<string, string> = {
  "Добро пожаловать!": "Welcome!",
  "Ваше имя": "Your name",
  "Введите имя...": "Enter your name...",
  "➕ Создать комнату": "➕ Create room",
  "🔗 Присоединиться по коду": "🔗 Join with code",
  "Играть соло против бота": "Play solo vs bot",
  "(без регистрации)": "(no registration)",
  "Открытые комнаты": "Public rooms",
  "Нет открытых комнат": "No public rooms",
  "Постройте железнодорожную империю в Европе!": "Build a railway empire across Europe!",
  "Название комнаты": "Room name",
  "Моя игра...": "My game...",
  "← Назад": "← Back",
  "Код комнаты": "Room code",
  "Введите код...": "Enter code...",
  "2-4 игрока": "2–4 players",
  "30-60 мин": "30–60 min",
  "46 городов": "46 cities",
  "Правила игры": "Game rules",
  "Главная": "Home",
  "Конфиденциальность": "Privacy",
  "Карта сайта:": "Site map:",
  "Разработчик:": "Developer:",
  "или": "or",
  "Подробные правила на отдельной странице →": "Detailed rules on a separate page →",
  "Восстановление сессии...": "Restoring session...",
  "Подключение к серверу...": "Connecting to server...",
  "ЕВРОПА": "EUROPE",
  "У вас есть активная игра": "You have an active game",
  "Игрок:": "Player:",
  "Код комнаты:": "Room code:",
  "🚂 Вернуться в игру": "🚂 Return to game",
  "🏠 Остаться на главной": "🏠 Stay on home page",
  "Создатель:": "Created by:",
  "Вдохновлено настольной игрой Ticket to Ride: Europe": "Inspired by the Ticket to Ride: Europe board game",
  "Вдохновлено": "Inspired by",
  "🔒 Для игры с друзьями необходима регистрация. Соло-тренировка доступна без аккаунта.": "🔒 Playing with friends requires an account. Solo mode is available without registration.",
  "Ожидание хода...": "Waiting for your turn...",
  "Сейчас ходит другой игрок": "Another player is taking a turn",
  "Ваш ход": "Your turn",
  "Вагонов:": "Trains:",
  "🎴 Взять карты": "🎴 Draw train cards",
  "🎫 Взять маршруты": "🎫 Draw tickets",
  "🚃 Построить путь": "🚃 Claim route",
  "Выберите город для станции": "Choose a city for your station",
  "❌ Отмена": "❌ Cancel",
  "Выберите первую карту из открытых или из колоды": "Choose your first face-up or deck card",
  "Выберите вторую карту (локомотив недоступен)": "Choose your second card (wild card unavailable)",
  "Выберите маршруты для сохранения (минимум 1)": "Choose tickets to keep (at least 1)",
  "Выбран маршрут": "Route selected",
  "Нужно": "Required",
  "Выбрано:": "Selected:",
  "Карты вагонов": "Train cards",
  "Всего карт:": "Total cards:",
  "Выбрано карт:": "Selected cards:",
  "Нет карт в руке": "No cards in hand",
  "Маршруты": "Tickets",
  "Нет маршрутов": "No destination tickets",
  "Выберите маршруты": "Choose destination tickets",
  "Наведите курсор на билет на 5 секунд, чтобы посмотреть его города на карте.": "Hover over a ticket for 5 seconds to view its cities on the map.",
  "Вернуться к билетам": "Back to tickets",
  "🏛️ Построить станцию": "🏛️ Build station",
  "Стоимость:": "Cost:",
  "📍 Город:": "📍 City:",
  "Выберите": "Choose",
  "↩ Изменить город": "↩ Change city",
  "Выбранные карты:": "Selected cards:",
  "Все карты должны быть одного цвета (или локомотивы)": "All cards must be the same color (or wild cards)",
  "↩ Выбрать другой город": "↩ Choose another city",
  "Построить": "Build",
  "очков": "points",
  "Осталось вагонов": "Trains remaining",
  "Билеты маршрутов": "Destination tickets",
  "Осталось станций": "Stations remaining",
  "В сети": "Online",
  "Не в сети": "Offline",
  "Сбросить масштаб и положение карты": "Reset map zoom and position",
  "Скрыть названия городов": "Hide city names",
  "Показать названия городов": "Show city names",
  "Скрыть построенные станции": "Hide built stations",
  "Показать построенные станции": "Show built stations",
  "Станций на карте пока нет": "No stations have been built yet",
  "Длина:": "Length:",
  "• Туннель": "• Tunnel",
  "ОЧКИ": "POINTS",
  "Ticket to Ride: Европа": "Ticket to Ride: Europe",
  "🎯 Соло": "🎯 Solo",
  "Ход:": "Turn:",
  "Вернуть панели": "Restore panels",
  "🏛️ Нажмите на свободный город на карте, чтобы выбрать место для станции": "🏛️ Click an available city on the map to place a station",
  "Игроки": "Players",
  "🃏 Колода": "🃏 Deck",
  "↻ Перевыбрать карты": "↻ Choose different cards",
  "✕ Отменить маршрут": "✕ Cancel route",
  "Карты": "Cards",
  "Билеты": "Tickets",
  "Мои карты и билеты": "My cards and tickets",
  "🚂 Комната ожидания": "🚂 Waiting room",
  "Приватная": "Private",
  "Открытая": "Public",
  "Вы": "You",
  "Ваш цвет:": "Your color:",
  "Онлайн": "Online",
  "Оффлайн": "Offline",
  "Ожидание игрока...": "Waiting for a player...",
  "Удалить комнату": "Delete room",
  "Ожидание начала игры от хоста...": "Waiting for the host to start...",
  "💡 Для игры нужно от 2 до 4 игроков": "💡 2 to 4 players are required",
  "Другие игроки могут присоединиться по коду комнаты": "Other players can join using the room code",
  "Закрыть": "Close",
  "Войти": "Sign in",
  "Загрузка...": "Loading...",
  "Сохранить": "Save",
  "Отмена": "Cancel",
  "Продолжить": "Continue",
  "Назад": "Back",
  "Подтвердить": "Confirm",
  "Начать игру": "Start game",
  "Создать комнату": "Create room",
  "Присоединиться": "Join",
  "Выход": "Exit",
  "Выйти": "Leave",
  "Настройки": "Settings",
  "История": "History",
  "Победа!": "Victory!",
  "Поражение": "Defeat",
  "Красный": "Red",
  "Синий": "Blue",
  "Зелёный": "Green",
  "Жёлтый": "Yellow",
  "Чёрный": "Black",
  "Локомотив": "Locomotive",
  "Туннель": "Tunnel",
  "Паром": "Ferry",
  "Станция": "Station",
  "Новая игра": "New game",
  "Готово": "Done",
  "Сохранено": "Saved",
  "Ошибка": "Error",
  "Попробовать снова": "Try again",
  "Профиль": "Profile",
  "Регистрация": "Sign up",
  "Пароль": "Password",
  "Почта": "Email",
  "Забыли пароль?": "Forgot password?",
  "Войти в аккаунт": "Sign in to your account",
  "Игра окончена": "Game over",
  "Победитель": "Winner",
  "Счёт": "Score",
  "Маршруты выполнены": "Completed tickets",
  "Карты маршрутов": "Destination tickets",
  "Ход соперника": "Opponent's turn",
  "Играть": "Play",
  "Обучение": "Tutorial",
  "Как играть": "How to play",
  "Цель игры": "Goal of the game",
  "Подготовка": "Setup",
  "Игровой процесс": "Gameplay",
  "Подсчёт очков": "Scoring",
  "Завершение игры": "End of game",
  "Вопросы и ответы": "Questions and answers",
  "📜 Правила игры": "📜 Game rules",
  "TICKET TO RIDE: ЕВРОПА": "TICKET TO RIDE: EUROPE",
  "🚀 Как начать играть за 1 минуту": "🚀 Get started in one minute",
  "Войдите в аккаунт.": "Sign in to your account.",
  "Создайте комнату или присоединитесь к другу по коду. Для тренировки выберите соло-режим.": "Create a room or join a friend using a code. For practice, choose solo mode.",
  "Получите карты.": "Draw your cards.",
  "Цветные карты вагонов нужны для строительства дорог, а карты назначений показывают, какие города требуется соединить.": "Colored train cards let you build routes, while destination tickets show the cities you need to connect.",
  "Делайте одно действие за ход:": "Take one action per turn:",
  "берите карты вагонов, стройте маршрут, получайте новые назначения или ставьте станцию.": "draw train cards, claim a route, draw tickets or build a station.",
  "Соединяйте города.": "Connect cities.",
  "Цепочка ваших дорог между двумя городами выполняет назначение и приносит очки. Неисполненное назначение отнимает очки.": "A continuous connection between the two cities completes a ticket and earns points. Unfinished tickets lose points.",
  "Побеждает игрок с наибольшим количеством очков": "The player with the most points wins",
  "после завершения партии.": "at the end of the game.",
  "Подготовка к игре": "Game setup",
  "4 карты вагонов": "4 train cards",
  "Стартовая рука из колоды": "Starting hand from the deck",
  "45 вагончиков": "45 train pieces",
  "Вашего цвета для постройки": "In your color for claiming routes",
  "3 карты назначений": "3 destination tickets",
  "Оставьте минимум 1 карту": "Keep at least one card",
  "5 открытых карт": "5 face-up cards",
  "Рядом с колодой вагонов": "Next to the train deck",
  "Ход игры": "Taking turns",
  "Игроки ходят по очереди. В свой ход выполните": "Players take turns. On your turn, perform",
  "одно": "one",
  "из четырёх действий:": "of four actions:",
  "Взять карты вагонов": "Draw train cards",
  "Возьмите": "Draw",
  "2 карты": "2 cards",
  "— из открытых или из колоды (вслепую)": "— from the face-up row or blind from the deck",
  "Локомотив из колоды считается обычной картой": "A locomotive drawn from the deck counts as a normal card",
  "Занять маршрут": "Claim a route",
  "Серые маршруты": "Gray routes",
  "Локомотивы": "Locomotives",
  "Паромы": "Ferries",
  "Туннели": "Tunnels",
  "Взять карты назначений": "Draw destination tickets",
  "из колоды": "from the deck",
  "Оставьте минимум": "Keep at least",
  "1 карту": "1 card",
  "Невыполненные": "Unfinished tickets",
  "Построить станцию 🏛️": "Build a station 🏛️",
  "У каждого игрока": "Each player has",
  "3 станции": "3 stations",
  "в начале игры": "at the start of the game",
  "Станцию можно построить в любом городе": "You can build a station in any city",
  "без станции": "without a station",
  "Неиспользованные станции": "Unused stations",
  "Подсчёт очков": "Scoring",
  "Очки за построенные маршруты:": "Points for claimed routes:",
  "1 вагон": "1 train",
  "2 вагона": "2 trains",
  "3 вагона": "3 trains",
  "4 вагона": "4 trains",
  "5 вагонов": "5 trains",
  "6 вагонов": "6 trains",
  "8 вагонов": "8 trains",
  "Карты назначений": "Destination tickets",
  "Самый длинный путь": "Longest continuous route",
  "Конец игры": "End of the game",
  "последний раунд": "final round",
  "Особенности версии Europe": "Special rules for Europe",
  "Туннели ⛰️": "Tunnels ⛰️",
  "3 карты": "3 cards",
  "совпадающего цвета": "matching color",
  "Цель игры": "Goal of the game",
  "Быстрый старт: 5 шагов": "Quick start: 5 steps",
  "Зарегистрируйтесь или войдите": "Sign up or sign in",
  "Посмотрите на свои билеты.": "Check your destination tickets.",
  "Собирайте цветные карты вагонов.": "Collect colored train cards.",
  "Занимайте маршруты": "Claim routes",
  "Считайте очки:": "Count your points:",
  "Подготовка к партии": "Setting up the game",
  "Что можно сделать в свой ход": "What you can do on your turn",
  "1. Взять карты вагонов": "1. Draw train cards",
  "2. Занять железнодорожный маршрут": "2. Claim a railway route",
  "3. Взять новые билеты": "3. Draw new destination tickets",
  "4. Построить станцию": "4. Build a station",
  "Особые дороги на карте Европы": "Special routes on the Europe map",
  "Двойные маршруты": "Double routes",
  "Сколько очков дают дороги": "How many points routes earn",
  "Когда заканчивается игра": "When the game ends",
  "Частые вопросы": "Frequently asked questions",
  "Можно ли играть без регистрации?": "Can I play without registering?",
  "Нет, для начала игры нужен аккаунт. Правила и главная страница доступны без входа.": "Yes. Solo mode is available without an account; multiplayer requires registration.",
  "Обязательно ли соединять города напрямую?": "Must cities be connected directly?",
  "Что делать, если соперник занял нужную дорогу?": "What if an opponent claims the route I need?",
  "Как научиться играть?": "How can I learn to play?",
  "Готовы сыграть в Ticket to Ride: Europe?": "Ready to play Ticket to Ride: Europe?",
  "Перейти к игре →": "Go to game →",
  "Подробное руководство для новичков": "Detailed beginner's guide",
  "Правила Ticket to Ride: Europe — как играть онлайн": "Ticket to Ride: Europe rules — how to play online",
  "Соло-игры не учитываются в статистике": "Solo games are not counted in statistics",
  "🚂 Построенные пути": "🚂 Claimed routes",
  "Правила подсчёта очков:": "Scoring rules:",
  "Выйти в лобби": "Return to lobby",
  "📜 История игры": "📜 Game history",
  "Ожидание действий...": "Waiting for actions...",
  "Закрыть уведомление": "Dismiss notification",
  "Показать или скрыть колоду (O)": "Show or hide deck (O)",
  "Мои карты и билеты (J)": "My cards and tickets (J)"
};
export const getLanguage = (): Language => {
  try { return localStorage.getItem(LANGUAGE_KEY) === 'en' ? 'en' : 'ru'; } catch { return 'ru'; }
};
export const setLanguage = (language: Language) => {
  try { localStorage.setItem(LANGUAGE_KEY, language); } catch {}
  document.documentElement.lang = language;
  window.dispatchEvent(new Event('ttr-language-change'));
};
export function useLanguage() {
  const [language, setCurrent] = useState<Language>(getLanguage);
  useEffect(() => {
    const update = () => setCurrent(getLanguage());
    window.addEventListener('ttr-language-change', update);
    window.addEventListener('storage', update);
    return () => { window.removeEventListener('ttr-language-change', update); window.removeEventListener('storage', update); };
  }, []);
  return { language, setLanguage, t: (ru: string) => language === 'en' ? dictionary[ru] || ru : ru };
}
const originalText = new WeakMap<Text, string>();
const originalAttrs = new WeakMap<Element, Map<string,string>>();
const attrNames = ['placeholder', 'title', 'aria-label', 'alt'];
function translateText(ru: string, language: Language): string {
  if (language === 'ru') return ru;
  const exact = dictionary[ru.trim()];
  if (exact) return ru.replace(ru.trim(), exact);
  // Translate short dynamic UI fragments while preserving counts and values.
  let result = ru;
  for (const [source, target] of Object.entries(dictionary).sort((a,b) => b[0].length - a[0].length)) {
    if (source.length < 4) continue;
    result = result.replaceAll(source, target);
  }
  return result;
}
export function LanguageDOMBridge() {
  const { language } = useLanguage();
  useEffect(() => {
    document.documentElement.lang = language;
    let updating = false;
    const apply = (root: Node) => {
      if (updating) return;
      updating = true;
      try {
        const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        const nodes: Text[] = [];
        if (root.nodeType === Node.TEXT_NODE) nodes.push(root as Text);
        while (walk.nextNode()) nodes.push(walk.currentNode as Text);
        for (const node of nodes) {
          if (node.parentElement?.closest('script,style,textarea,[data-no-translate]')) continue;
          const current = node.textContent || '';
          if (!originalText.has(node)) originalText.set(node, current);
          const source = originalText.get(node)!;
          const translated = translateText(source, language);
          if (current !== translated) node.textContent = translated;
        }
        const elements = root.nodeType === Node.ELEMENT_NODE
          ? [root as Element, ...(root as Element).querySelectorAll('*')]
          : [];
        for (const el of elements) {
          if (el.closest('[data-no-translate]')) continue;
          let originals = originalAttrs.get(el);
          if (!originals) { originals = new Map(); originalAttrs.set(el, originals); }
          for (const name of attrNames) {
            const current = el.getAttribute(name);
            if (current === null) continue;
            if (!originals.has(name)) originals.set(name, current);
            const translated = translateText(originals.get(name)!, language);
            if (current !== translated) el.setAttribute(name, translated);
          }
        }
      } finally { updating = false; }
    };
    apply(document.body);
    const observer = new MutationObserver(records => {
      if (updating) return;
      for (const record of records) {
        if (record.type === 'characterData') {
          const node = record.target as Text;
          const source = originalText.get(node);
          if (source !== undefined && node.textContent === translateText(source, language)) continue;
          originalText.set(node, node.textContent || '');
          apply(node);
        } else if (record.type === 'childList') {
          record.addedNodes.forEach(node => apply(node));
        }
      }
    });
    observer.observe(document.body, { subtree: true, childList: true, characterData: true });
    return () => observer.disconnect();
  }, [language]);
  return null;
}
