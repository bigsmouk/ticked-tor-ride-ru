import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/language';

type LandingKey = 'friends' | 'solo' | 'guide';

const pages = {
  friends: {
    eyebrow: 'Бесплатная игра с друзьями',
    title: 'Железнодорожная стратегия онлайн с друзьями — без регистрации',
    intro: 'Соберите компанию из 2–4 человек и стройте железнодорожные маршруты по карте Европы прямо в браузере. Для начала партии не нужно скачивать приложение или создавать аккаунт.',
    sections: [
      { title: 'Как начать играть с друзьями', body: 'Откройте главную страницу, укажите имя и нажмите «Создать комнату». Выберите название и, если хотите играть только своей компанией, включите приватный режим. Скопируйте шестизначный код комнаты и отправьте его друзьям.' },
      { title: 'Как присоединиться к партии', body: 'Друг открывает сайт, вводит своё имя, нажимает «Присоединиться по коду» и указывает код приглашения. Также можно выбрать доступную открытую комнату из списка. Когда в комнате соберутся минимум два игрока, организатор сможет начать игру.' },
      { title: 'Что происходит во время партии', body: 'Игроки по очереди собирают цветные карты вагонов, занимают участки железной дороги между городами и выполняют билеты с маршрутами. Побеждает тот, кто наберёт больше очков.' },
    ],
    questions: [
      ['Нужна ли регистрация?', 'Нет. Для создания комнаты и присоединения к друзьям достаточно указать имя.'],
      ['Сколько человек может играть?', 'В одной партии участвуют от 2 до 4 игроков.'],
      ['Можно ли создать закрытую комнату?', 'Да. Включите приватный режим и поделитесь кодом только с приглашёнными игроками.'],
    ],
    action: 'Создать комнату бесплатно',
  },
  solo: {
    eyebrow: 'Одиночный режим',
    title: 'Железнодорожная стратегия против бота — играть онлайн бесплатно',
    intro: 'Хотите освоить маршруты по Европе или просто сыграть самостоятельно? Запускайте тренировочную партию против компьютерного соперника в браузере без регистрации и установки.',
    sections: [
      { title: 'Как запустить игру против бота', body: 'Перейдите на главную страницу, введите имя и выберите «Играть соло против бота». Игра откроется сразу: приглашать других игроков и создавать аккаунт не требуется.' },
      { title: 'Чему можно научиться в соло-режиме', body: 'Тренируйтесь собирать карты вагонов, прокладывать пути между городами, выполнять билеты и планировать маршруты. Это удобный способ познакомиться с механикой до партии с друзьями.' },
      { title: 'Как перейти к игре с друзьями', body: 'Когда освоитесь, вернитесь на главную страницу и создайте открытую или приватную комнату. Поделитесь кодом приглашения — многопользовательская партия тоже доступна без регистрации.' },
    ],
    questions: [
      ['Нужно ли создавать аккаунт?', 'Нет, одиночный режим запускается без регистрации.'],
      ['Нужно ли скачивать игру?', 'Нет, игра работает прямо в браузере.'],
      ['Можно ли потом играть с друзьями?', 'Да. На главной странице можно создать комнату или присоединиться по коду.'],
    ],
    action: 'Играть против бота',
  },
  guide: {
    eyebrow: 'Короткое обучение для новичков',
    title: 'Как начать играть в железнодорожную стратегию: первые шаги',
    intro: 'Если вы впервые видите карту Европы, цветные карты и билеты с городами, начните с этого короткого руководства. Здесь — практический порядок первых действий; подробные правила вынесены на отдельную страницу.',
    sections: [
      { title: 'Шаг 1. Выберите режим', body: 'Для первой партии проще выбрать соло-тренировку против бота. Если хотите играть компанией, создайте комнату и отправьте друзьям код. Регистрация не нужна ни в одном из режимов.' },
      { title: 'Шаг 2. Посмотрите на билеты', body: 'Билеты показывают пары городов, которые нужно соединить своими железными дорогами. Продумайте несколько соседних участков, образующих непрерывный путь. Прямая дорога между городами не обязательна.' },
      { title: 'Шаг 3. Собирайте карты и стройте дороги', body: 'Цветные карты вагонов нужны для занятия участков карты. Например, участок длиной три клетки обычно требует три подходящие карты. Следите за ходами соперников: они могут занять нужное соединение раньше вас.' },
      { title: 'Шаг 4. Не забывайте об очках', body: 'Очки начисляются за построенные дороги и выполненные билеты. Невыполненные билеты уменьшают итоговый результат. Поэтому в первой партии полезно сосредоточиться на нескольких достижимых заданиях.' },
    ],
    questions: [
      ['С чего лучше начать?', 'Попробуйте соло-режим и постройте несколько коротких маршрутов.'],
      ['Нужно ли знать все правила заранее?', 'Нет. Для начала достаточно понять билеты, карты вагонов и строительство дорог.'],
      ['Где прочитать подробные правила?', 'На отдельной странице правил описаны станции, туннели, паромы, подсчёт очков и завершение партии.'],
    ],
    action: 'Перейти к игре',
  },
} satisfies Record<LandingKey, {
  eyebrow: string; title: string; intro: string;
  sections: { title: string; body: string }[];
  questions: [string, string][]; action: string;
}>;

const englishPages: typeof pages = {
 friends: {eyebrow:'Free multiplayer game',title:'Play a railway strategy game online with friends',intro:'Gather 2–4 players and build railway routes across Europe in your browser. No download or account required.',sections:[{title:'Start a game with friends',body:'Open the home page, enter your name and select Create room. Choose a room name and enable private mode if you only want invited players. Share the six-character room code.'},{title:'Join a game',body:'Open the site, enter your name, select Join with code and enter the invitation code. You can also join a public room. The host starts once at least two players are ready.'},{title:'During the game',body:'Take turns collecting train cards, claiming railway routes and completing destination tickets. The player with the most points wins.'}],questions:[['Is registration required?','No. Enter a player name to create or join a room.'],['How many people can play?','Multiplayer supports 2–4 players.'],['Can I make a private room?','Yes. Enable private mode and share the room code with invited players.']],action:'Create a free room'},
 solo: {eyebrow:'Single-player mode',title:'Play a railway strategy game against a bot',intro:'Practice railway routes across Europe against a computer opponent. Play free in your browser without signing up.',sections:[{title:'Start a solo game',body:'Go to the home page, enter a name and select Play solo vs bot. No account or invitation is needed.'},{title:'Practice your strategy',body:'Collect train cards, connect cities and complete destination tickets before trying multiplayer.'},{title:'Play with friends next',body:'Return to the home page, create a public or private room and share its code with friends.'}],questions:[['Do I need an account?','No. Solo mode works without registration.'],['Do I need to download anything?','No. Play directly in your browser.'],['Can I play with friends later?','Yes. Create a room or join with a code.']],action:'Play against the bot'},
 guide: {eyebrow:'Beginner guide',title:'How to play a railway strategy game: first steps',intro:'New to railway games? Learn the basic steps here, then read the full rules for more details.',sections:[{title:'Step 1. Choose a mode',body:'Start with solo practice or create a room and invite friends with a code. Registration is optional.'},{title:'Step 2. Check destination tickets',body:'Tickets show the pairs of cities you need to connect. Plan a continuous route; it does not have to be direct.'},{title:'Step 3. Collect cards and build',body:'Use matching train cards to claim routes. Watch opponents, who may take the connection you need.'},{title:'Step 4. Score points',body:'Claimed routes and completed tickets earn points. Unfinished tickets reduce your final score.'}],questions:[['Where should I start?','Try solo mode and claim a few short routes.'],['Must I know all the rules?','No. Start with train cards, tickets and route building.'],['Where are the full rules?','The rules page explains stations, tunnels, ferries and scoring.']],action:'Start playing'}
};

export default function SeoLanding({ page }: { page: LandingKey }) {
  const { language } = useLanguage();
  const content = language === 'en' ? englishPages[page] : pages[page];
  return (
    <div data-no-translate className="min-h-screen bg-amber-50 text-amber-950">
      <header className="bg-primary text-primary-foreground border-b-4 border-amber-500">
        <div className="mx-auto max-w-4xl px-4 py-5 flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="font-display text-xl font-bold text-amber-300 hover:underline">🚂 Ticket to Ride: Europe</Link>
          <nav aria-label="Навигация" className="flex flex-wrap gap-4 text-sm">
            <Link to="/" className="hover:underline">{language === "en" ? "Home" : "Главная"}</Link>
            <Link to="/rules" className="hover:underline">{language === "en" ? "Rules" : "Правила"}</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">
        <article className="rounded-xl bg-white shadow-lg p-5 sm:p-10 space-y-8 leading-relaxed">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">{content.eyebrow}</p>
            <h1 className="text-3xl sm:text-4xl font-bold mt-2">{content.title}</h1>
            <p className="mt-4 text-lg">{content.intro}</p>
            <Link to="/" className="inline-block mt-5 rounded-lg bg-amber-600 px-6 py-3 font-bold text-white hover:bg-amber-700">{content.action} →</Link>
          </div>
          {content.sections.map(section => (
            <section key={section.title} className="space-y-2">
              <h2 className="text-2xl font-bold">{section.title}</h2>
              <p>{section.body}</p>
            </section>
          ))}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">{language === "en" ? "Frequently asked questions" : "Частые вопросы"}</h2>
            {content.questions.map(([question, answer]) => (
              <div key={question}><h3 className="text-lg font-semibold">{question}</h3><p>{answer}</p></div>
            ))}
          </section>
          <section className="rounded-xl bg-amber-100 p-5 space-y-3">
            <h2 className="text-xl font-bold">{language === "en" ? "Explore more" : "Узнайте больше об игре"}</h2>
            <nav aria-label="Другие материалы" className="flex flex-col gap-2">
              <Link className="underline text-blue-800" to="/play-with-friends">{language === "en" ? "Play with friends" : "Игра с друзьями без регистрации"}</Link>
              <Link className="underline text-blue-800" to="/play-solo">{language === "en" ? "Play against a bot" : "Игра против бота"}</Link>
              <Link className="underline text-blue-800" to="/how-to-play">{language === "en" ? "Getting started" : "Первые шаги в игре"}</Link>
              <Link className="underline text-blue-800" to="/rules">{language === "en" ? "Full game rules" : "Подробные правила игры"}</Link>
            </nav>
          </section>
          <p className="text-sm text-amber-800">{language === "en" ? "Unofficial browser game inspired by Ticket to Ride: Europe. Not affiliated with the original rights holders." : "Неофициальная браузерная игра, вдохновлённая настольной игрой Ticket to Ride: Europe. Проект не связан с правообладателями оригинальной игры."}</p>
        </article>
      </main>
    </div>
  );
}
