import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GameState {
  roomId: string;
  phase: string;
  turnNumber: number;
  players: Array<{
    id: string;
    name: string;
    color: string;
    score: number;
  }>;
  logs?: Array<{
    action: string;
    details?: string;
  }>;
  winnerId?: string;
  finalScores?: Array<{
    playerId: string;
    routePoints: number;
    ticketBonus: number;
    ticketPenalty: number;
    longestPathBonus: number;
    completedTickets: number;
    failedTickets: number;
  }>;
}

interface RequestBody {
  roomId: string;
  roomName: string;
  leavingPlayerId?: string; // ID игрока который выходит (если это выход)
  gameState: GameState;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: RequestBody = await req.json();
    const { roomId, roomName, leavingPlayerId, gameState } = body;

    console.log('[finalize-match] Called with:', { roomId, roomName, leavingPlayerId, playerCount: gameState.players.length });

    if (!roomId || !roomName || !gameState) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Проверяем, не сохранён ли уже этот матч (дедупликация)
    // Ищем записи за последние 5 минут для этой комнаты
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const { data: existingMatch } = await supabase
      .from('match_history')
      .select('id')
      .eq('room_id', roomId)
      .gte('played_at', fiveMinutesAgo)
      .limit(1)
      .maybeSingle();

    if (existingMatch) {
      console.log('[finalize-match] Match already saved, skipping:', existingMatch.id);
      return new Response(
        JSON.stringify({ success: true, matchId: existingMatch.id, deduplicated: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Определяем причину завершения
    const isPlayerLeaving = !!leavingPlayerId;
    const lastLog = gameState.logs?.[gameState.logs.length - 1];
    const isPlayerLeft = lastLog?.action === 'Игра завершена' && lastLog?.details === 'Недостаточно игроков';
    
    const endReason = isPlayerLeaving ? 'left_game' : (isPlayerLeft ? 'player_left' : 'normal');

    // Получаем маппинг player_id -> profile_id из room_players
    const { data: roomPlayers } = await supabase
      .from('room_players')
      .select('player_id, owner_auth_id')
      .eq('room_id', roomId);

    const ownerAuthIds = (roomPlayers || [])
      .map(rp => rp.owner_auth_id)
      .filter((v): v is string => !!v);

    let profilesData: Array<{ id: string; user_id: string }> = [];
    if (ownerAuthIds.length > 0) {
      const { data } = await supabase
        .from('profiles')
        .select('id, user_id')
        .in('user_id', ownerAuthIds);
      profilesData = (data || []) as Array<{ id: string; user_id: string }>;
    }

    const userIdToProfileId = new Map<string, string>();
    for (const p of profilesData) {
      userIdToProfileId.set(p.user_id, p.id);
    }

    const playerIdToProfileId = new Map<string, string>();
    for (const rp of roomPlayers || []) {
      if (!rp.owner_auth_id) continue;
      const pid = userIdToProfileId.get(rp.owner_auth_id);
      if (pid) playerIdToProfileId.set(rp.player_id, pid);
    }

    // Создаём запись матча
    const { data: matchData, error: matchError } = await supabase
      .from('match_history')
      .insert({
        room_id: roomId,
        room_name: roomName,
        player_count: gameState.players.length + (isPlayerLeaving ? 1 : 0),
        game_data: {
          turnNumber: gameState.turnNumber,
          winnerId: gameState.winnerId,
          finishedAt: new Date().toISOString(),
          endReason,
        },
      })
      .select()
      .single();

    if (matchError) {
      console.error('[finalize-match] Error creating match:', matchError);
      return new Response(
        JSON.stringify({ error: 'Failed to create match', details: matchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[finalize-match] Match created:', matchData.id);

    // Создаём записи игроков
    const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);
    
    const playerRecords = sortedPlayers.map((player, index) => {
      const finalScore = gameState.finalScores?.find(fs => fs.playerId === player.id);
      const routePoints = finalScore
        ? player.score - finalScore.ticketBonus + finalScore.ticketPenalty - finalScore.longestPathBonus
        : player.score;

      const profileId = playerIdToProfileId.get(player.id) || null;
      
      // Определяем placement
      let placement: number;
      if (isPlayerLeaving && player.id === leavingPlayerId) {
        placement = 0; // Покинул игру
      } else if (isPlayerLeaving || isPlayerLeft) {
        placement = -1; // Не засчитано
      } else {
        placement = index + 1; // Нормальное место
      }

      const isWinner = !isPlayerLeaving && !isPlayerLeft && player.id === gameState.winnerId;

      return {
        match_id: matchData.id,
        profile_id: profileId,
        player_name: player.name,
        player_color: player.color,
        final_score: player.score,
        route_points: finalScore ? routePoints : player.score,
        ticket_points: finalScore ? (finalScore.ticketBonus - finalScore.ticketPenalty) : 0,
        longest_path_bonus: finalScore?.longestPathBonus || 0,
        tickets_completed: finalScore?.completedTickets || 0,
        tickets_failed: finalScore?.failedTickets || 0,
        is_winner: isWinner,
        placement,
      };
    });

    // Если кто-то выходит, добавляем его запись отдельно (он уже удалён из gameState.players)
    if (isPlayerLeaving && leavingPlayerId) {
      const leavingPlayerInList = playerRecords.find(p => p.player_name && playerIdToProfileId.has(leavingPlayerId));
      if (!leavingPlayerInList) {
        // Ищем данные вышедшего игрока в room_players
        const { data: leavingRoomPlayer } = await supabase
          .from('room_players')
          .select('player_id, player_name, color, owner_auth_id')
          .eq('player_id', leavingPlayerId)
          .maybeSingle();

        if (leavingRoomPlayer) {
          const leavingProfileId = leavingRoomPlayer.owner_auth_id 
            ? userIdToProfileId.get(leavingRoomPlayer.owner_auth_id) || null
            : null;

          playerRecords.push({
            match_id: matchData.id,
            profile_id: leavingProfileId,
            player_name: leavingRoomPlayer.player_name,
            player_color: leavingRoomPlayer.color,
            final_score: 0,
            route_points: 0,
            ticket_points: 0,
            longest_path_bonus: 0,
            tickets_completed: 0,
            tickets_failed: 0,
            is_winner: false,
            placement: 0, // Покинул игру
          });
        }
      }
    }

    const { error: playersError } = await supabase
      .from('match_players')
      .insert(playerRecords);

    if (playersError) {
      console.error('[finalize-match] Error creating player records:', playersError);
      return new Response(
        JSON.stringify({ error: 'Failed to create player records', details: playersError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[finalize-match] Saved', playerRecords.length, 'player records');

    return new Response(
      JSON.stringify({ success: true, matchId: matchData.id, playerCount: playerRecords.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[finalize-match] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
