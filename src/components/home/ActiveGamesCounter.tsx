import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users, Gamepad2 } from 'lucide-react';

interface ActiveGamesStats {
  activeGames: number;
  waitingRooms: number;
  totalPlayers: number;
}

const ActiveGamesCounter: React.FC = () => {
  const [stats, setStats] = useState<ActiveGamesStats>({
    activeGames: 0,
    waitingRooms: 0,
    totalPlayers: 0,
  });

  const fetchStats = async () => {
    try {
      // Fetch active games (in_progress)
      const { count: activeCount } = await supabase
        .from('rooms')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'in_progress');

      // Fetch waiting rooms
      const { count: waitingCount } = await supabase
        .from('rooms')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'waiting');

      // Fetch total players in rooms
      const { count: playersCount } = await supabase
        .from('room_players')
        .select('*', { count: 'exact', head: true });

      setStats({
        activeGames: activeCount || 0,
        waitingRooms: waitingCount || 0,
        totalPlayers: playersCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();

    // Subscribe to changes
    const channel = supabase
      .channel('stats-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_players' }, fetchStats)
      .subscribe();

    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const hasActivity = stats.activeGames > 0 || stats.waitingRooms > 0;

  if (!hasActivity && stats.totalPlayers === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-6 py-3 px-6 bg-primary/10 rounded-full border-2 border-gold/30 backdrop-blur-sm">
      {stats.activeGames > 0 && (
        <div className="flex items-center gap-2 text-foreground">
          <Gamepad2 className="h-4 w-4 text-gold animate-pulse" />
          <span className="font-display text-sm">
            <span className="font-bold text-gold">{stats.activeGames}</span>
            <span className="text-muted-foreground ml-1">
              {stats.activeGames === 1 ? 'игра идёт' : 'игр идёт'}
            </span>
          </span>
        </div>
      )}
      
      {stats.waitingRooms > 0 && (
        <div className="flex items-center gap-2 text-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="font-display text-sm">
            <span className="font-bold text-green-600">{stats.waitingRooms}</span>
            <span className="text-muted-foreground ml-1">ждут игроков</span>
          </span>
        </div>
      )}
      
      {stats.totalPlayers > 0 && (
        <div className="flex items-center gap-2 text-foreground">
          <Users className="h-4 w-4 text-primary" />
          <span className="font-display text-sm">
            <span className="font-bold text-primary">{stats.totalPlayers}</span>
            <span className="text-muted-foreground ml-1">онлайн</span>
          </span>
        </div>
      )}
    </div>
  );
};

export default ActiveGamesCounter;
