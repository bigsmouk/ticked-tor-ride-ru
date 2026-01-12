import React from 'react';
import { ConnectionStatus } from '@/hooks/useGameSync';
import { Wifi, WifiOff, Loader2, Radio, RefreshCw } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ConnectionIndicatorProps {
  status: ConnectionStatus;
  isHost: boolean;
  lastSyncTime: number | null;
  reconnectAttempt?: number;
  onReconnect?: () => void;
}

export const ConnectionIndicator: React.FC<ConnectionIndicatorProps> = ({
  status,
  isHost,
  lastSyncTime,
  reconnectAttempt = 0,
  onReconnect,
}) => {
  const getStatusInfo = () => {
    if (isHost) {
      return {
        icon: <Wifi className="h-4 w-4" />,
        color: 'text-green-500',
        bgColor: 'bg-green-500/20',
        label: 'Вы хост',
        description: 'Вы управляете состоянием игры',
        canReconnect: false,
      };
    }

    switch (status) {
      case 'connected':
        return {
          icon: <Wifi className="h-4 w-4" />,
          color: 'text-green-500',
          bgColor: 'bg-green-500/20',
          label: 'Подключено',
          description: lastSyncTime 
            ? `Последняя синхронизация: ${Math.round((Date.now() - lastSyncTime) / 1000)}с назад`
            : 'Связь с хостом установлена',
          canReconnect: false,
        };
      case 'degraded':
        return {
          icon: <Radio className="h-4 w-4" />,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/20',
          label: 'REST режим',
          description: 'WebSocket недоступен, используется HTTP. Возможны задержки.',
          canReconnect: true,
        };
      case 'connecting':
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/20',
          label: 'Подключение...',
          description: 'Устанавливаем связь с хостом',
          canReconnect: false,
        };
      case 'reconnecting':
        return {
          icon: <RefreshCw className="h-4 w-4 animate-spin" />,
          color: 'text-orange-500',
          bgColor: 'bg-orange-500/20',
          label: `Переподключение${reconnectAttempt > 0 ? ` (${reconnectAttempt})` : ''}`,
          description: 'Восстанавливаем связь с хостом...',
          canReconnect: false,
        };
      case 'disconnected':
        return {
          icon: <WifiOff className="h-4 w-4" />,
          color: 'text-red-500',
          bgColor: 'bg-red-500/20',
          label: 'Нет связи',
          description: 'Хост недоступен. Нажмите для переподключения.',
          canReconnect: true,
        };
    }
  };

  const info = getStatusInfo();

  const handleClick = () => {
    if (info.canReconnect && onReconnect) {
      onReconnect();
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${info.bgColor} transition-colors ${
              info.canReconnect ? 'cursor-pointer hover:opacity-80' : 'cursor-help'
            }`}
            onClick={handleClick}
          >
            <span className={info.color}>{info.icon}</span>
            <span className={`text-xs font-medium ${info.color}`}>{info.label}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <p className="text-sm">{info.description}</p>
          {info.canReconnect && onReconnect && (
            <p className="text-xs text-muted-foreground mt-1">Нажмите для переподключения</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};