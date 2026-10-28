import React, { useEffect, useRef, useState } from 'react';
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
  const [previewOpen, setPreviewOpen] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearHoverTimer = () => { if (hoverTimer.current) clearTimeout(hoverTimer.current); hoverTimer.current = null; };
  const schedulePreview = (ticket: DestinationTicket) => {
    clearHoverTimer();
    hoverTimer.current = setTimeout(() => {
      setPreviewTicket(ticket);
      setPreviewOpen(true);
      onTicketPreview?.(ticket);
    }, 5000);
  };
  const closePreview = () => {
    clearHoverTimer();
    setPreviewOpen(false);
    setPreviewTicket(null);
    onTicketPreview?.(null);
  };
  useEffect(() => () => { if (hoverTimer.current) clearTimeout(hoverTimer.current); onTicketPreview?.(null); }, []);
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
    <div className={`fixed inset-0 z-50 ${previewOpen ? "pointer-events-none" : "bg-black/60 flex items-center justify-center"}`}>
      {!previewOpen && <div className="parchment rounded-xl border-4 border-ornament p-6 shadow-2xl max-w-2xl w-full mx-4">
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
                onMouseEnter={() => schedulePreview(ticket)}
                onMouseLeave={clearHoverTimer}
                onFocus={() => schedulePreview(ticket)}
                onBlur={clearHoverTimer}
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
        
        <p className="text-center text-xs text-muted-foreground mb-4">Наведите курсор на билет на 5 секунд, чтобы посмотреть его города на карте.</p>
        <div className="flex justify-center">
          <button
            onClick={handleConfirm}
            disabled={selectedIds.length < minKeep}
            className="btn-gold px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Подтвердить ({selectedIds.length} выбрано)
          </button>
        </div>
      </div>}
      {previewOpen && previewTicket && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-auto flex items-center gap-3 rounded-xl bg-amber-50 border-2 border-amber-600 px-4 py-3 text-amber-950 shadow-xl">
          <span className="font-bold">📍 {previewTicket.cities.join(" → ")} · {previewTicket.points} очков</span>
          <button type="button" onClick={closePreview} className="rounded-lg bg-amber-800 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700">Вернуться к билетам</button>
        </div>
      )}
    </div>
  );
};