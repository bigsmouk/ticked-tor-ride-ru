import React, { useState } from 'react';
import { DestinationTicket } from '@/types/game';
import { DestinationCard } from './DestinationCard';
import { Button } from '@/components/ui/button';

interface DestinationPickerModalProps {
  destinations: DestinationTicket[];
  minKeep: number;
  onConfirm: (ticketIds: string[]) => void;
  onCancel: () => void;
  onTicketPreview?: (ticket: DestinationTicket | null) => void;
}

export const DestinationPickerModal: React.FC<DestinationPickerModalProps> = ({
  destinations,
  minKeep,
  onConfirm,
  onCancel,
  onTicketPreview,
}) => {
  // По умолчанию выбираем все карты при начальной загрузке
  const [previewTicket, setPreviewTicket] = useState<DestinationTicket | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>(() => 
    destinations.map(d => d.id)
  );

  const toggleTicket = (ticketId: string) => {
    if (selectedIds.includes(ticketId)) {
      setSelectedIds(selectedIds.filter(id => id !== ticketId));
    } else {
      setSelectedIds([...selectedIds, ticketId]);
    }
  };

  const handleConfirm = () => {
    if (selectedIds.length >= minKeep) {
      onConfirm(selectedIds);
    }
  };

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 ${previewTicket ? "bg-black/5" : "bg-black/60"}`}>
      <div className={`parchment rounded-xl border-4 border-ornament p-6 shadow-2xl max-w-2xl w-full mx-4 transition-all duration-150 ${previewTicket ? "opacity-20 scale-95" : ""}`}>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2 text-center">
          Выберите маршруты
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Выберите минимум {minKeep} маршрут{minKeep > 1 ? 'а' : ''} для сохранения
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {destinations.map((ticket) => {
            const isTicketSelected = selectedIds.includes(ticket.id);
            return (
              <div
                tabIndex={0}
                key={ticket.id}
                onMouseEnter={() => { setPreviewTicket(ticket); onTicketPreview?.(ticket); }}
                onMouseLeave={() => { setPreviewTicket(null); onTicketPreview?.(null); }}
                onFocus={() => { setPreviewTicket(ticket); onTicketPreview?.(ticket); }}
                onBlur={() => { setPreviewTicket(null); onTicketPreview?.(null); }}
                className={`
                  relative transition-all duration-200 rounded-lg
                  ${isTicketSelected ? 'ring-4 ring-gold shadow-lg shadow-gold/30 -translate-y-1' : 'opacity-60 hover:opacity-100'}
                `}
              >
                <DestinationCard
                  ticket={ticket}
                  size="large"
                  isSelected={isTicketSelected}
                  onClick={() => toggleTicket(ticket.id)}
                />
                {isTicketSelected && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gold rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                    ✓
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={handleConfirm}
            disabled={selectedIds.length < minKeep}
            className="btn-gold px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Подтвердить ({selectedIds.length} выбрано)
          </button>
        </div>
      </div>
      {previewTicket && <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-amber-100 text-amber-950 border-2 border-amber-600 rounded-lg px-4 py-2 font-bold shadow-lg pointer-events-none text-center z-10">🗺️ {previewTicket.cities.join(" → ")} · {previewTicket.points} очков<br/><span className="text-xs font-normal">Золотая линия — рекомендуемый путь. Уведите курсор с билета, чтобы выбрать карты.</span></div>}
    </div>
  );
};