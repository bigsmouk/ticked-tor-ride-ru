import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RulesModalProps {
  trigger?: React.ReactNode;
}

export const RulesModal: React.FC<RulesModalProps> = ({ trigger }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <button className="btn-vintage rounded-lg px-6 py-3">
            📜 Правила игры
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="font-display text-2xl flex items-center gap-3">
            📜 Правила игры Ticket to Ride: Europe
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] px-6 py-4">
          <div className="space-y-6 text-sm leading-relaxed">
            
            {/* Цель игры */}
            <section>
              <h3 className="font-display text-lg font-bold text-primary mb-2 flex items-center gap-2">
                🎯 Цель игры
              </h3>
              <p className="text-foreground/90">
                Набрать наибольшее количество очков, строя железнодорожные маршруты между городами Европы. 
                Очки начисляются за построенные маршруты и выполненные карточки назначений. 
                За невыполненные назначения очки вычитаются.
              </p>
            </section>

            {/* Подготовка */}
            <section>
              <h3 className="font-display text-lg font-bold text-primary mb-2 flex items-center gap-2">
                🃏 Подготовка к игре
              </h3>
              <ul className="list-disc list-inside space-y-1 text-foreground/90">
                <li>Каждый игрок получает <strong>4 карты вагонов</strong> из колоды</li>
                <li>Каждый игрок получает <strong>45 вагончиков</strong> своего цвета</li>
                <li>Игрокам раздаются <strong>3 карты назначений</strong>, из которых нужно оставить минимум 2</li>
                <li>5 карт вагонов выкладываются в открытую рядом с колодой</li>
              </ul>
            </section>

            {/* Ход игры */}
            <section>
              <h3 className="font-display text-lg font-bold text-primary mb-2 flex items-center gap-2">
                🔄 Ход игры
              </h3>
              <p className="text-foreground/90 mb-3">
                Игроки ходят по очереди. В свой ход игрок должен выполнить <strong>одно</strong> из трёх действий:
              </p>
              
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-accent/30 border border-border">
                  <h4 className="font-semibold text-foreground mb-1">1. Взять карты вагонов 🎴</h4>
                  <ul className="list-disc list-inside text-foreground/80 text-xs space-y-1">
                    <li>Возьмите <strong>2 карты</strong> — из открытых или из колоды</li>
                    <li>Если берёте <strong>локомотив</strong> из открытых — это единственная карта за ход</li>
                    <li>Локомотив из колоды считается обычной картой</li>
                  </ul>
                </div>

                <div className="p-3 rounded-lg bg-accent/30 border border-border">
                  <h4 className="font-semibold text-foreground mb-1">2. Занять маршрут 🛤️</h4>
                  <ul className="list-disc list-inside text-foreground/80 text-xs space-y-1">
                    <li>Сыграйте карты нужного цвета по количеству вагонов на маршруте</li>
                    <li>Для <strong>серых маршрутов</strong> подойдут карты любого одного цвета</li>
                    <li><strong>Локомотивы</strong> заменяют карты любого цвета</li>
                    <li>На <strong>паромах</strong> 🚢 требуется определённое число локомотивов</li>
                    <li><strong>Туннели</strong> 🚇 — потяните 3 карты из колоды; за каждое совпадение цвета доплатите 1 карту</li>
                  </ul>
                </div>

                <div className="p-3 rounded-lg bg-accent/30 border border-border">
                  <h4 className="font-semibold text-foreground mb-1">3. Взять карты назначений 🎫</h4>
                  <ul className="list-disc list-inside text-foreground/80 text-xs space-y-1">
                    <li>Возьмите <strong>3 карты назначений</strong> из колоды</li>
                    <li>Оставьте минимум <strong>1 карту</strong>, остальные сбросьте</li>
                    <li>Выполненные назначения приносят очки в конце игры</li>
                    <li>Невыполненные — вычитаются из вашего счёта!</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Очки */}
            <section>
              <h3 className="font-display text-lg font-bold text-primary mb-2 flex items-center gap-2">
                ⭐ Подсчёт очков
              </h3>
              
              <div className="mb-3">
                <h4 className="font-semibold text-foreground mb-2">Очки за маршруты:</h4>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded bg-muted">1 вагон → <strong>1 очко</strong></div>
                  <div className="p-2 rounded bg-muted">2 вагона → <strong>2 очка</strong></div>
                  <div className="p-2 rounded bg-muted">3 вагона → <strong>4 очка</strong></div>
                  <div className="p-2 rounded bg-muted">4 вагона → <strong>7 очков</strong></div>
                  <div className="p-2 rounded bg-muted">5 вагонов → <strong>10 очков</strong></div>
                  <div className="p-2 rounded bg-muted">6 вагонов → <strong>15 очков</strong></div>
                </div>
              </div>

              <div className="space-y-2 text-foreground/90">
                <p><strong>🎫 Карты назначений:</strong> Если города соединены вашими маршрутами — получите указанные очки. Иначе — потеряете столько же.</p>
                <p><strong>🏆 Самый длинный путь:</strong> Игрок с самым длинным непрерывным маршрутом получает <strong>+10 очков</strong>.</p>
              </div>
            </section>

            {/* Конец игры */}
            <section>
              <h3 className="font-display text-lg font-bold text-primary mb-2 flex items-center gap-2">
                🏁 Конец игры
              </h3>
              <p className="text-foreground/90">
                Когда у любого игрока остаётся <strong>2 или меньше вагончиков</strong>, 
                начинается последний раунд. Все игроки (включая триггера) делают ещё по одному ходу, 
                после чего подсчитываются финальные очки.
              </p>
            </section>

            {/* Особенности Europe */}
            <section>
              <h3 className="font-display text-lg font-bold text-primary mb-2 flex items-center gap-2">
                🌍 Особенности версии Europe
              </h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg border border-border">
                  <h4 className="font-semibold text-foreground mb-1">🚇 Туннели</h4>
                  <p className="text-foreground/80 text-xs">
                    Маршруты, помеченные как туннели, требуют проверки: вытяните 3 карты из колоды. 
                    За каждую карту того же цвета (или локомотив) нужно доплатить по 1 карте. 
                    Если не можете — маршрут не занимается, карты остаются на руке.
                  </p>
                </div>
                
                <div className="p-3 rounded-lg border border-border">
                  <h4 className="font-semibold text-foreground mb-1">🚢 Паромы</h4>
                  <p className="text-foreground/80 text-xs">
                    На паромных маршрутах часть вагонов отмечена символом локомотива — 
                    эти позиции можно заполнить только картами локомотивов.
                  </p>
                </div>
                
                <div className="p-3 rounded-lg border border-border">
                  <h4 className="font-semibold text-foreground mb-1">🚃 Двойные маршруты</h4>
                  <p className="text-foreground/80 text-xs">
                    Между некоторыми городами есть два параллельных маршрута. 
                    Один игрок не может занять оба. При игре вдвоём второй маршрут блокируется после занятия первого.
                  </p>
                </div>
              </div>
            </section>

            {/* Советы */}
            <section>
              <h3 className="font-display text-lg font-bold text-primary mb-2 flex items-center gap-2">
                💡 Советы новичкам
              </h3>
              <ul className="list-disc list-inside space-y-1 text-foreground/90">
                <li>Планируйте маршруты заранее, но будьте гибкими</li>
                <li>Не берите слишком много назначений — рискуете потерять очки</li>
                <li>Следите за вагонами противников — могут занять ваш маршрут</li>
                <li>Локомотивы ценны — не тратьте их попусту</li>
                <li>Длинные маршруты приносят больше очков за вагон</li>
              </ul>
            </section>

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
