import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Target, 
  Layers, 
  RefreshCw, 
  Star, 
  Flag, 
  Globe, 
  Lightbulb,
  Train,
  Ticket,
  Mountain,
  Ship,
  Route
} from 'lucide-react';

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
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden bg-gradient-to-b from-card to-muted border-4 border-ornament">
        {/* Decorative header */}
        <DialogHeader className="px-6 pt-6 pb-4 bg-primary border-b-4 border-gold">
          <DialogTitle className="font-display text-2xl md:text-3xl text-primary-foreground flex items-center justify-center gap-3">
            <Train className="h-8 w-8 text-gold" />
            <span>Правила игры</span>
            <Train className="h-8 w-8 text-gold scale-x-[-1]" />
          </DialogTitle>
          <p className="text-center text-gold font-display text-lg tracking-widest mt-1">
            ЖЕЛЕЗНОДОРОЖНОЕ ПРИКЛЮЧЕНИЕ: ЕВРОПА
          </p>
        </DialogHeader>
        
        <ScrollArea className="h-[65vh] px-6 py-6">
          <div className="space-y-8 text-sm leading-relaxed">
            
            {/* Цель игры */}
            <section className="rules-section">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-gold/20 border-2 border-gold">
                  <Target className="h-5 w-5 text-gold" />
                </div>
                <h3 className="font-display text-xl font-bold text-primary">
                  Цель игры
                </h3>
              </div>
              <div className="pl-12">
                <p className="text-foreground leading-relaxed">
                  Набрать наибольшее количество очков, строя железнодорожные маршруты между городами Европы. 
                  Очки начисляются за построенные маршруты и выполненные карточки назначений. 
                  За невыполненные назначения очки вычитаются из вашего счёта!
                </p>
              </div>
            </section>

            {/* Подготовка */}
            <section className="rules-section">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-gold/20 border-2 border-gold">
                  <Layers className="h-5 w-5 text-gold" />
                </div>
                <h3 className="font-display text-xl font-bold text-primary">
                  Подготовка к игре
                </h3>
              </div>
              <div className="pl-12">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="p-3 rounded-lg bg-muted/50 border border-border flex items-start gap-3">
                    <span className="text-2xl">🃏</span>
                    <div>
                      <strong className="text-foreground">4 карты вагонов</strong>
                      <p className="text-xs text-muted-foreground">Стартовая рука из колоды</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border border-border flex items-start gap-3">
                    <span className="text-2xl">🚃</span>
                    <div>
                      <strong className="text-foreground">45 вагончиков</strong>
                      <p className="text-xs text-muted-foreground">Вашего цвета для постройки</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border border-border flex items-start gap-3">
                    <span className="text-2xl">🎫</span>
                    <div>
                      <strong className="text-foreground">3 карты назначений</strong>
                      <p className="text-xs text-muted-foreground">Оставьте минимум 1 карту</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border border-border flex items-start gap-3">
                    <span className="text-2xl">🎴</span>
                    <div>
                      <strong className="text-foreground">5 открытых карт</strong>
                      <p className="text-xs text-muted-foreground">Рядом с колодой вагонов</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Ход игры */}
            <section className="rules-section">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-gold/20 border-2 border-gold">
                  <RefreshCw className="h-5 w-5 text-gold" />
                </div>
                <h3 className="font-display text-xl font-bold text-primary">
                  Ход игры
                </h3>
              </div>
              <div className="pl-12">
                <p className="text-foreground mb-4">
                  Игроки ходят по очереди. В свой ход выполните <strong className="text-gold">одно</strong> из четырёх действий:
                </p>
                
                <div className="space-y-4">
                  {/* Действие 1 */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-blue-600/5 border-2 border-blue-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-500 text-white font-bold text-sm">1</span>
                      <h4 className="font-display font-bold text-foreground text-base">Взять карты вагонов</h4>
                    </div>
                    <ul className="list-none space-y-2 text-foreground/90">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500">•</span>
                        Возьмите <strong>2 карты</strong> — из открытых или из колоды (вслепую)
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500">•</span>
                        <strong className="text-amber-600">Локомотив</strong> из открытых — засчитывается за 2 карты (единственная карта за ход)
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500">•</span>
                        Локомотив из колоды считается обычной картой
                      </li>
                    </ul>
                  </div>

                  {/* Действие 2 */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-green-600/5 border-2 border-green-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-green-500 text-white font-bold text-sm">2</span>
                      <h4 className="font-display font-bold text-foreground text-base">Занять маршрут</h4>
                    </div>
                    <ul className="list-none space-y-2 text-foreground/90">
                      <li className="flex items-start gap-2">
                        <span className="text-green-500">•</span>
                        Сыграйте карты нужного цвета в количестве вагонов на маршруте
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500">•</span>
                        <strong>Серые маршруты</strong> — подойдут карты любого одного цвета
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500">•</span>
                        <strong className="text-amber-600">Локомотивы</strong> заменяют карты любого цвета
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500">•</span>
                        <strong>Паромы</strong> ⛵ — требуют определённое число локомотивов
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500">•</span>
                        <strong>Туннели</strong> ⛰️ — вытяните 3 карты из колоды; за каждое совпадение цвета доплатите 1 карту
                      </li>
                    </ul>
                  </div>

                  {/* Действие 3 */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-purple-600/5 border-2 border-purple-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-purple-500 text-white font-bold text-sm">3</span>
                      <h4 className="font-display font-bold text-foreground text-base">Взять карты назначений</h4>
                    </div>
                    <ul className="list-none space-y-2 text-foreground/90">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500">•</span>
                        Возьмите <strong>3 карты назначений</strong> из колоды
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500">•</span>
                        Оставьте минимум <strong>1 карту</strong>, остальные можно сбросить
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500">•</span>
                        Выполненные назначения приносят указанные очки в конце игры
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500">•</span>
                        <strong className="text-red-500">Невыполненные</strong> — вычитаются из вашего счёта!
                      </li>
                    </ul>
                  </div>

                  {/* Действие 4 - Станции */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-600/5 border-2 border-amber-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-500 text-white font-bold text-sm">4</span>
                      <h4 className="font-display font-bold text-foreground text-base">Построить станцию 🏛️</h4>
                    </div>
                    <ul className="list-none space-y-2 text-foreground/90">
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500">•</span>
                        У каждого игрока <strong>3 станции</strong> в начале игры
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500">•</span>
                        Станцию можно построить в любом городе <strong>без станции</strong>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500">•</span>
                        <strong>Стоимость:</strong> 1-я станция — 1 карта, 2-я — 2 карты одного цвета, 3-я — 3 карты
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500">•</span>
                        Станция позволяет использовать <strong>1 чужой маршрут</strong> из этого города для выполнения назначений
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500">•</span>
                        <strong className="text-green-500">Неиспользованные станции</strong> приносят +4 очка каждая в конце игры
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Очки */}
            <section className="rules-section">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-gold/20 border-2 border-gold">
                  <Star className="h-5 w-5 text-gold" />
                </div>
                <h3 className="font-display text-xl font-bold text-primary">
                  Подсчёт очков
                </h3>
              </div>
              <div className="pl-12 space-y-4">
                {/* Таблица очков */}
                <div>
                  <h4 className="font-display font-semibold text-foreground mb-3">Очки за построенные маршруты:</h4>
                  <div className="grid grid-cols-4 md:grid-cols-7 gap-2 text-center">
                    <div className="p-3 rounded-lg bg-gradient-to-b from-muted to-muted/50 border-2 border-border">
                      <div className="text-2xl mb-1">🚃</div>
                      <div className="text-xs text-muted-foreground">1 вагон</div>
                      <div className="font-bold text-gold text-lg">1</div>
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-b from-muted to-muted/50 border-2 border-border">
                      <div className="text-2xl mb-1">🚃🚃</div>
                      <div className="text-xs text-muted-foreground">2 вагона</div>
                      <div className="font-bold text-gold text-lg">2</div>
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-b from-muted to-muted/50 border-2 border-border">
                      <div className="text-2xl mb-1">🚃×3</div>
                      <div className="text-xs text-muted-foreground">3 вагона</div>
                      <div className="font-bold text-gold text-lg">4</div>
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-b from-muted to-muted/50 border-2 border-border">
                      <div className="text-2xl mb-1">🚃×4</div>
                      <div className="text-xs text-muted-foreground">4 вагона</div>
                      <div className="font-bold text-gold text-lg">7</div>
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-b from-muted to-muted/50 border-2 border-border">
                      <div className="text-2xl mb-1">🚃×5</div>
                      <div className="text-xs text-muted-foreground">5 вагонов</div>
                      <div className="font-bold text-gold text-lg">10</div>
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-b from-muted to-muted/50 border-2 border-border">
                      <div className="text-2xl mb-1">🚃×6</div>
                      <div className="text-xs text-muted-foreground">6 вагонов</div>
                      <div className="font-bold text-gold text-lg">15</div>
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-2 border-amber-500/50">
                      <div className="text-2xl mb-1">⛰️×8</div>
                      <div className="text-xs text-muted-foreground">8 вагонов</div>
                      <div className="font-bold text-amber-500 text-lg">21</div>
                    </div>
                  </div>
                </div>

                {/* Бонусы */}
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-2 border-amber-500/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Ticket className="h-5 w-5 text-amber-600" />
                      <h4 className="font-display font-bold text-foreground">Карты назначений</h4>
                    </div>
                    <p className="text-sm text-foreground/80">
                      Если города соединены вашими маршрутами — получите указанные очки. 
                      Иначе — <strong className="text-red-500">потеряете</strong> столько же!
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-2 border-purple-500/50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🏛️</span>
                      <h4 className="font-display font-bold text-foreground">Неиспользованные станции</h4>
                    </div>
                    <p className="text-sm text-foreground/80">
                      Каждая станция, которую вы <strong>не построили</strong>, приносит бонус
                    </p>
                    <div className="mt-2 text-center">
                      <span className="inline-block px-4 py-2 rounded-full bg-purple-500 text-white font-display font-bold text-xl">
                        +4 очка
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-gradient-to-br from-gold/30 to-gold/10 border-2 border-gold">
                    <div className="flex items-center gap-2 mb-2">
                      <Route className="h-5 w-5 text-gold" />
                      <h4 className="font-display font-bold text-foreground">Самый длинный путь</h4>
                    </div>
                    <p className="text-sm text-foreground/80">
                      Игрок с самым длинным непрерывным маршрутом получает бонус
                    </p>
                    <div className="mt-2 text-center">
                      <span className="inline-block px-4 py-2 rounded-full bg-gold text-primary-foreground font-display font-bold text-xl">
                        +10 очков
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Конец игры */}
            <section className="rules-section">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-gold/20 border-2 border-gold">
                  <Flag className="h-5 w-5 text-gold" />
                </div>
                <h3 className="font-display text-xl font-bold text-primary">
                  Конец игры
                </h3>
              </div>
              <div className="pl-12">
                <div className="p-4 rounded-xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border-2 border-red-500/30">
                  <p className="text-foreground leading-relaxed">
                    Когда у любого игрока остаётся <strong className="text-red-500">2 или меньше вагончиков</strong>, 
                    начинается <strong>последний раунд</strong>. Все игроки (включая того, кто запустил финал) 
                    делают ещё по одному ходу, после чего подсчитываются финальные очки.
                  </p>
                </div>
              </div>
            </section>

            {/* Особенности Europe */}
            <section className="rules-section">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-gold/20 border-2 border-gold">
                  <Globe className="h-5 w-5 text-gold" />
                </div>
                <h3 className="font-display text-xl font-bold text-primary">
                  Особенности версии Europe
                </h3>
              </div>
              <div className="pl-12 space-y-3">
                {/* Туннели */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-slate-500/10 to-slate-600/5 border-2 border-slate-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Mountain className="h-5 w-5 text-slate-600" />
                    <h4 className="font-display font-bold text-foreground">Туннели ⛰️</h4>
                  </div>
                  <p className="text-foreground/80">
                    Маршруты с зигзагообразной границей — это туннели. При попытке занять такой маршрут:
                  </p>
                  <ol className="list-decimal list-inside mt-2 space-y-1 text-foreground/80">
                    <li>Вытяните <strong>3 карты</strong> из колоды вагонов</li>
                    <li>За каждую карту <strong>совпадающего цвета</strong> (или локомотив) — доплатите 1 карту</li>
                    <li>Если не можете доплатить — маршрут не занимается, ваши карты остаются на руке</li>
                  </ol>
                </div>
                
                {/* Паромы */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-cyan-600/5 border-2 border-cyan-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Ship className="h-5 w-5 text-cyan-600" />
                    <h4 className="font-display font-bold text-foreground">Паромы ⛵</h4>
                  </div>
                  <p className="text-foreground/80">
                    На паромных маршрутах некоторые позиции отмечены символом локомотива. 
                    Эти позиции <strong className="text-amber-600">можно заполнить только картами локомотивов</strong>.
                  </p>
                </div>
                
                {/* Двойные маршруты */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-violet-600/5 border-2 border-violet-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Route className="h-5 w-5 text-violet-600" />
                    <h4 className="font-display font-bold text-foreground">Двойные маршруты</h4>
                  </div>
                  <p className="text-foreground/80">
                    Между некоторыми городами есть два параллельных маршрута разных цветов.
                  </p>
                  <ul className="mt-2 space-y-1 text-foreground/80">
                    <li>• Один игрок <strong>не может</strong> занять оба маршрута</li>
                    <li>• При игре <strong>вдвоём</strong> — второй маршрут блокируется после занятия первого</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Советы */}
            <section className="rules-section">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-gold/20 border-2 border-gold">
                  <Lightbulb className="h-5 w-5 text-gold" />
                </div>
                <h3 className="font-display text-xl font-bold text-primary">
                  Советы новичкам
                </h3>
              </div>
              <div className="pl-12">
                <div className="grid gap-2 md:grid-cols-2">
                  <div className="p-3 rounded-lg bg-muted/50 border border-border flex items-start gap-3">
                    <span className="text-lg">🗺️</span>
                    <p className="text-sm text-foreground/90">Планируйте маршруты заранее, но будьте гибкими</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border border-border flex items-start gap-3">
                    <span className="text-lg">⚠️</span>
                    <p className="text-sm text-foreground/90">Не берите слишком много назначений — рискуете потерять очки</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border border-border flex items-start gap-3">
                    <span className="text-lg">👀</span>
                    <p className="text-sm text-foreground/90">Следите за вагонами противников — могут занять ваш маршрут</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border border-border flex items-start gap-3">
                    <span className="text-lg">🚂</span>
                    <p className="text-sm text-foreground/90">Локомотивы ценны — не тратьте их попусту</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border border-border flex items-start gap-3 md:col-span-2">
                    <span className="text-lg">📈</span>
                    <p className="text-sm text-foreground/90">Длинные маршруты приносят больше очков за каждый вагон — старайтесь строить маршруты по 5-6 вагонов</p>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </ScrollArea>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t-2 border-gold/30 bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground">
            Удачи в строительстве вашей железнодорожной империи! 🚂
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
