import React from 'react';
import { Player, PlayerColor } from '@/types/game';
import './PlayerPanel.css';

interface PlayerPanelProps {
  player: Player;
  isCurrentPlayer: boolean;
  isLocalPlayer: boolean;
  isOnline?: boolean;
  position: 'left' | 'right';
  index: number;
  onClick?: () => void;
}

const PLAYER_COLORS: Record<PlayerColor, string> = {
  red: '#ba2633', blue: '#2774af', green: '#258a65', yellow: '#c39b2b', black: '#47424b',
};

export const PlayerPanel: React.FC<PlayerPanelProps> = ({
  player, isCurrentPlayer, isLocalPlayer, isOnline = true, onClick,
}) => {
  const accent = PLAYER_COLORS[player.color] ?? '#846e51';
  const cardCount = player.trainCards.length;
  const ticketCount = player.destinationTickets.length;
  return (
    <button
      type="button"
      className={`player-panel ttr-player-reference ${isCurrentPlayer ? 'ttr-player-active' : ''}`}
      style={{ '--player-accent': accent } as React.CSSProperties}
      onClick={onClick}
      title={`Открыть профиль: ${player.name}`}
      aria-label={`Игрок ${player.name}, ${player.score} очков, ${player.trainsRemaining} вагонов, ${cardCount} карт, ${ticketCount} билетов`}
    >
      <span className="ttr-pr-head">
        <span className="ttr-pr-avatar">
          {player.avatarUrl ? <img src={player.avatarUrl} alt="" /> : player.isBot ? '🤖' : player.name.charAt(0).toUpperCase()}
          {isLocalPlayer && <span className="ttr-pr-me" title="Вы">★</span>}
        </span>
        <span className="ttr-pr-identity">
          <span className="ttr-pr-name">{player.name}</span>
          <span className="ttr-pr-score"><span aria-hidden="true">★</span> {player.score} <small>очков</small></span>
        </span>
        <span className="ttr-pr-status" title={isOnline ? 'В сети' : 'Не в сети'} aria-label={isOnline ? 'В сети' : 'Не в сети'} data-online={isOnline} />
      </span>
      <span className="ttr-pr-stats">
        <span className="ttr-pr-wagons" title="Осталось вагонов"><span aria-hidden="true">🚃</span><strong>{player.trainsRemaining}</strong></span>
        <span className="ttr-pr-stat" title="Карты вагонов"><span aria-hidden="true">🃏</span><strong>{cardCount}</strong></span>
        <span className="ttr-pr-stat" title="Билеты маршрутов"><span aria-hidden="true">🎫</span><strong>{ticketCount}</strong></span>
        <span className="ttr-pr-stat ttr-pr-stations" title="Осталось станций"><span aria-hidden="true">🏛️</span><strong>{player.stationsRemaining}/3</strong></span>
      </span>
    </button>
  );
};
