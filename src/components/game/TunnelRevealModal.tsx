import React from 'react';
import { TrainCardType } from '@/types/game';
import { TrainCard } from './TrainCard';
import { Button } from '@/components/ui/button';

interface TunnelRevealModalProps {
  routeName: string;
  revealedCards: TrainCardType[];
  extraCardsNeeded: number;
  colorUsed: TrainCardType;
  onPayExtra: () => void;
  onCancel: () => void;
  canPayExtra: boolean;
}

export const TunnelRevealModal: React.FC<TunnelRevealModalProps> = ({
  routeName,
  revealedCards,
  extraCardsNeeded,
  colorUsed,
  onPayExtra,
  onCancel,
  canPayExtra,
}) => {
  // Определяем какие из вскрытых карт совпадают
  const matchingCards = revealedCards.filter(
    card => card === colorUsed || card === 'locomotive'
  );

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-sidebar rounded-xl border-2 border-gold p-6 max-w-md w-full shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🚇</div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Проверка туннеля
          </h2>
          <p className="text-muted-foreground text-sm">
            {routeName}
          </p>
        </div>

        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-3 text-center">
            Вскрыты 3 карты из колоды:
          </p>
          <div className="flex justify-center gap-2">
            {revealedCards.map((card, i) => {
              const isMatching = card === colorUsed || card === 'locomotive';
              return (
                <div 
                  key={i}
                  className={`relative transition-transform ${isMatching ? 'scale-110 ring-2 ring-gold ring-offset-2 ring-offset-sidebar rounded-lg' : 'opacity-60'}`}
                >
                  <TrainCard type={card} size="medium" />
                  {isMatching && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      +1
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center mb-6 p-4 rounded-lg bg-background/50">
          {extraCardsNeeded > 0 ? (
            <>
              <p className="text-lg font-semibold text-foreground mb-1">
                Совпало карт: {matchingCards.length}
              </p>
              <p className="text-muted-foreground">
                Нужно доплатить <span className="text-gold font-bold">{extraCardsNeeded}</span> {extraCardsNeeded === 1 ? 'карту' : 'карты'} 
                {' '}цвета <span className="capitalize font-semibold">{colorUsed === 'locomotive' ? '🚂' : colorUsed}</span> или локомотивов
              </p>
            </>
          ) : (
            <p className="text-lg font-semibold text-green-400">
              ✓ Карты не совпали — доплата не требуется!
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onCancel}
          >
            Отменить
          </Button>
          {extraCardsNeeded > 0 ? (
            <Button
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={onPayExtra}
              disabled={!canPayExtra}
            >
              {canPayExtra ? 'Доплатить' : 'Не хватает карт'}
            </Button>
          ) : (
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={onPayExtra}
            >
              Построить маршрут
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
