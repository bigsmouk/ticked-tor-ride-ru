import { Link } from 'react-router-dom';

const points = [
  ['1 вагон', '1 очко'], ['2 вагона', '2 очка'], ['3 вагона', '4 очка'],
  ['4 вагона', '7 очков'], ['6 вагонов', '15 очков'], ['8 вагонов', '21 очко'],
];

export default function Rules() {
  return (
    <div className="min-h-screen bg-amber-50 text-amber-950">
      <header className="bg-primary text-primary-foreground border-b-4 border-amber-500">
        <div className="mx-auto max-w-4xl px-4 py-5 flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="font-display text-xl font-bold text-amber-300 hover:underline" aria-label="Ticket to Ride — на главную">🚂 Ticket to Ride: Europe</Link>
          <nav aria-label="Навигация" className="flex gap-5 text-sm">
            <Link to="/" className="hover:underline">Главная</Link>
            <Link to="/privacy" className="hover:underline">Конфиденциальность</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">
        <article className="rounded-xl bg-white shadow-lg p-5 sm:p-10 space-y-8 leading-relaxed">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">Подробное руководство для новичков</p>
            <h1 className="text-3xl sm:text-4xl font-bold mt-2">Правила Ticket to Ride: Europe — как играть онлайн</h1>
            <p className="mt-3 text-lg">Стройте железнодорожные пути между городами Европы, выполняйте билеты с заданиями и набирайте больше очков, чем соперники. Здесь объясняем правила простыми словами и на примерах.</p>
          </div>
          <section className="rounded-xl bg-amber-100 p-5 space-y-3">
            <h2 className="text-2xl font-bold">Быстрый старт: 5 шагов</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li><strong>Зарегистрируйтесь или войдите</strong> на сайте, создайте комнату либо присоединитесь к другу по коду. Есть и соло-тренировка.</li>
              <li><strong>Посмотрите на свои билеты.</strong> Каждый билет показывает два города, которые нужно соединить непрерывной цепочкой железных дорог.</li>
              <li><strong>Собирайте цветные карты вагонов.</strong> Они нужны, чтобы занимать участки между соседними городами.</li>
              <li><strong>Занимайте маршруты</strong> и постепенно соединяйте города из билетов.</li>
              <li><strong>Считайте очки:</strong> за построенные дороги, выполненные билеты и бонусы. Невыполненные билеты уменьшают итоговый счёт.</li>
            </ol>
          </section>
          <section className="space-y-3">
            <h2 className="text-2xl font-bold">Цель игры</h2>
            <p>Победить по очкам. Очки дают построенные маршруты и выполненные карты назначений (билеты). Билет выполнен, если между указанными городами есть непрерывное соединение из ваших дорог; станции могут помочь учесть отдельный участок соперника.</p>
            <p><strong>Пример:</strong> в билете написано «Париж — Берлин». Необязательно строить прямую дорогу: можно проложить цепочку через промежуточные города. Главное, чтобы все её участки были соединены.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-2xl font-bold">Подготовка к партии</h2>
            <p>В начале игрок получает 45 вагончиков своего цвета, 3 станции и стартовые карты вагонов и назначений. На столе также доступны пять открытых карт вагонов и закрытая колода.</p>
            <p><strong>Карты вагонов</strong> бывают разных цветов. <strong>Локомотив</strong> — универсальная карта, которая заменяет карту любого цвета. <strong>Билет</strong> — задание соединить два города за указанное число очков.</p>
          </section>
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Что можно сделать в свой ход</h2>
            <p>Игроки ходят по очереди. За один ход выбирается только <strong>одно</strong> из четырёх действий.</p>
            <div className="space-y-4">
              <div className="rounded-lg border border-amber-200 p-4">
                <h3 className="text-xl font-semibold">1. Взять карты вагонов</h3>
                <p>Обычно можно взять две карты: из пяти открытых или вслепую из колоды. Если берёте открытый локомотив, он считается единственной картой за ход. Локомотив, вытянутый вслепую, считается обычной картой.</p>
              </div>
              <div className="rounded-lg border border-amber-200 p-4">
                <h3 className="text-xl font-semibold">2. Занять железнодорожный маршрут</h3>
                <p>Выберите свободный участок на карте и отдайте столько карт подходящего цвета, сколько на нём клеток. Например, для синего участка длиной 3 нужны три синие карты; локомотивы могут заменить недостающие. Для серого участка подойдут карты любого <em>одного</em> цвета. После постройки участок становится вашим, а нужное число вагончиков расходуется.</p>
              </div>
              <div className="rounded-lg border border-amber-200 p-4">
                <h3 className="text-xl font-semibold">3. Взять новые билеты</h3>
                <p>Возьмите три карты назначений и оставьте минимум одну. Выполненный билет прибавит указанные очки в конце партии, невыполненный — отнимет. Не берите слишком много билетов, если не успеваете строить пути.</p>
              </div>
              <div className="rounded-lg border border-amber-200 p-4">
                <h3 className="text-xl font-semibold">4. Построить станцию</h3>
                <p>Станция позволяет при проверке билетов воспользоваться одним маршрутом другого игрока, который примыкает к городу со станцией. Первая станция стоит одну карту вагонов, вторая — две одного цвета, третья — три одного цвета. Неиспользованные станции приносят по 4 очка в конце партии.</p>
              </div>
            </div>
          </section>
          <section className="space-y-3">
            <h2 className="text-2xl font-bold">Особые дороги на карте Европы</h2>
            <h3 className="text-lg font-semibold">Туннели</h3>
            <p>После выбора карт для туннеля открываются три верхние карты колоды. За каждую карту цвета строящегося маршрута и за каждый локомотив потребуется доплатить ещё одну карту соответствующего цвета или локомотив. Если доплатить не получается, строительство отменяется и первоначальные карты остаются на руке.</p>
            <h3 className="text-lg font-semibold">Паромы</h3>
            <p>На паромах есть клетки с изображением локомотива. Для них обязательно нужно потратить указанное число карт локомотивов; оставшиеся клетки оплачиваются обычными картами подходящего цвета или локомотивами.</p>
            <h3 className="text-lg font-semibold">Двойные маршруты</h3>
            <p>Иногда два города соединяют две параллельные дороги. Один игрок не может занять обе. В партиях с двумя или тремя игроками обычно доступна только одна из них: после занятия первой вторая блокируется.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-2xl font-bold">Сколько очков дают дороги</h2>
            <p>Чем длиннее построенный маршрут, тем больше очков за него начисляется.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {points.map(([length, score]) => <div key={length} className="rounded-lg bg-amber-100 p-3 text-center"><strong>{length}</strong><br />{score}</div>)}
            </div>
            <p>Кроме очков за дороги, в конце игры прибавляются выполненные билеты, вычитаются невыполненные, начисляются очки за оставшиеся станции и бонус за самую длинную непрерывную дорогу.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-2xl font-bold">Когда заканчивается игра</h2>
            <p>Когда у одного из игроков остаётся два или меньше вагончиков, начинается последний круг: каждый игрок, включая запустившего финал, получает ещё один ход. Затем подсчитываются итоговые очки. Побеждает участник с наибольшим результатом.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-2xl font-bold">Частые вопросы</h2>
            <h3 className="text-lg font-semibold">Можно ли играть без регистрации?</h3>
            <p>Нет, для начала игры нужен аккаунт. Правила и главная страница доступны без входа.</p>
            <h3 className="text-lg font-semibold">Обязательно ли соединять города напрямую?</h3>
            <p>Нет. Можно соединять их через другие города, главное — непрерывная цепочка подходящих дорог.</p>
            <h3 className="text-lg font-semibold">Что делать, если соперник занял нужную дорогу?</h3>
            <p>Найдите объездной маршрут либо воспользуйтесь станцией, если это позволяет выполнить билет.</p>
            <h3 className="text-lg font-semibold">Как научиться играть?</h3>
            <p>Начните с соло-тренировки, попробуйте взять карты вагонов и построить короткий маршрут. После этого переходите к выполнению билетов.</p>
          </section>
          <div className="rounded-xl bg-primary text-white p-5 text-center space-y-3">
            <h2 className="text-xl font-bold">Готовы сыграть в Ticket to Ride: Europe?</h2>
            <Link to="/" className="inline-block rounded-lg bg-amber-400 px-6 py-3 font-bold text-amber-950 hover:bg-amber-300">Перейти к игре →</Link>
          </div>
          <p className="text-xs text-amber-700">Неофициальная браузерная адаптация, вдохновлённая настольной игрой Ticket to Ride: Europe. Описание правил предназначено для ознакомления с игровой механикой.</p>
        </article>
      </main>
      <footer className="bg-primary text-amber-100 py-6 mt-8">
        <nav aria-label="Карта сайта" className="max-w-4xl mx-auto px-4 flex flex-wrap gap-5 text-sm">
          <Link to="/" className="hover:underline">Главная</Link>
          <Link to="/rules" className="hover:underline">Правила игры</Link>
          <Link to="/privacy" className="hover:underline">Конфиденциальность и cookies</Link>
        </nav>
      </footer>
    </div>
  );
}
