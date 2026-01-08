import React, { useState } from 'react';
import { DestinationTicket } from '@/types/game';
import { DestinationCard } from './DestinationCard';
import { Button } from '@/components/ui/button';

interface DestinationPickerModalProps {
  destinations: DestinationTicket[];
  minKeep: number;
  onConfirm: (ticketIds: string[]) => void;
  onCancel: () => void;
}

export const DestinationPickerModal: React.FC<DestinationPickerModalProps> = ({
  destinations,
  minKeep,
  onConfirm,
  onCancel,
}) => {
  // По умолчанию выбираем все карты при начальной загрузке
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="parchment rounded-xl border-4 border-ornament p-6 shadow-2xl max-w-2xl w-full mx-4">
        <h2 className="text-2xl font-display font-bold text-foreground mb-2 text-center">
          Выберите маршруты
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Выберите минимум {minKeep} маршрут{minKeep > 1 ? 'а' : ''} для сохранения
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {destinations.map((ticket) => (
            <DestinationCard
              key={ticket.id}
              ticket={ticket}
              size="large"
              isSelected={selectedIds.includes(ticket.id)}
              onClick={() => toggleTicket(ticket.id)}
            />
          ))}
        </div>
        
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={onCancel}
            className="btn-vintage"
          >
            Отмена
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedIds.length < minKeep}
            className="btn-gold"
          >
            Подтвердить ({selectedIds.length} выбрано)
          </Button>
        </div>
      </div>
    </div>
  );
};