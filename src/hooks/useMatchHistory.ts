import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MatchPlayer {
  id: string;
  player_name: string;
  player_color: string;
  final_score: number;
  route_points: number;
  ticket_points: number;
  longest_path_bonus: number;
  tickets_completed: number;
  tickets_failed: number;
  is_winner: boolean;
  placement: number;
  profile_id: string | null;
}

interface Match {
  id: string;
  room_name: string;
  played_at: string;
  player_count: number;
  match_players: MatchPlayer[];
}

interface PlayerStats {
  totalGames: number;
  wins: number;
  winRate: number;
  avgScore: number;
  bestScore: number;
  totalRoutePoints: number;
  totalTicketPoints: number;
  avgTicketsCompleted: number;
}

export const useMatchHistory = () => {
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [stats, setStats] = useState<PlayerStats | null>(null);

  // Получить историю матчей для профиля
  const fetchMatchHistory = useCallback(async (profileId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('match_players')
        .select(`
          id,
          player_name,
          player_color,
          final_score,
          route_points,
          ticket_points,
          longest_path_bonus,
          tickets_completed,
          tickets_failed,
          is_winner,
          placement,
          profile_id,
          match_history!inner (
            id,
            room_name,
            played_at,
            player_count
          )
        `)
        .eq('profile_id', profileId)
        .order('match_history(played_at)', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Группируем по матчам
      const matchMap = new Map<string, Match>();
      
      for (const row of data || []) {
        const matchData = row.match_history as any;
        const matchId = matchData.id;
        
        if (!matchMap.has(matchId)) {
          matchMap.set(matchId, {
            id: matchId,
            room_name: matchData.room_name,
            played_at: matchData.played_at,
            player_count: matchData.player_count,
            match_players: [],
          });
        }
        
        matchMap.get(matchId)!.match_players.push({
          id: row.id,
          player_name: row.player_name,
          player_color: row.player_color,
          final_score: row.final_score,
          route_points: row.route_points,
          ticket_points: row.ticket_points,
          longest_path_bonus: row.longest_path_bonus,
          tickets_completed: row.tickets_completed,
          tickets_failed: row.tickets_failed,
          is_winner: row.is_winner,
          placement: row.placement,
          profile_id: row.profile_id,
        });
      }

      setMatches(Array.from(matchMap.values()));
    } catch (error) {
      console.error('Error fetching match history:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Вычислить статистику игрока
  const fetchPlayerStats = useCallback(async (profileId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('match_players')
        .select('final_score, route_points, ticket_points, tickets_completed, is_winner')
        .eq('profile_id', profileId);

      if (error) throw error;

      if (!data || data.length === 0) {
        setStats(null);
        return;
      }

      const totalGames = data.length;
      const wins = data.filter(m => m.is_winner).length;
      const totalScore = data.reduce((sum, m) => sum + m.final_score, 0);
      const bestScore = Math.max(...data.map(m => m.final_score));
      const totalRoutePoints = data.reduce((sum, m) => sum + m.route_points, 0);
      const totalTicketPoints = data.reduce((sum, m) => sum + m.ticket_points, 0);
      const totalTicketsCompleted = data.reduce((sum, m) => sum + m.tickets_completed, 0);

      setStats({
        totalGames,
        wins,
        winRate: totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0,
        avgScore: totalGames > 0 ? Math.round(totalScore / totalGames) : 0,
        bestScore,
        totalRoutePoints,
        totalTicketPoints,
        avgTicketsCompleted: totalGames > 0 ? Math.round((totalTicketsCompleted / totalGames) * 10) / 10 : 0,
      });
    } catch (error) {
      console.error('Error fetching player stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Сбросить историю матчей
  const clearMatchHistory = useCallback(async (profileId: string) => {
    try {
      // Удаляем все записи match_players для этого профиля
      const { error } = await supabase
        .from('match_players')
        .delete()
        .eq('profile_id', profileId);

      if (error) throw error;

      setMatches([]);
      setStats(null);
      return { success: true };
    } catch (error) {
      console.error('Error clearing match history:', error);
      return { success: false, error };
    }
  }, []);

  return {
    loading,
    matches,
    stats,
    fetchMatchHistory,
    fetchPlayerStats,
    clearMatchHistory,
  };
};
