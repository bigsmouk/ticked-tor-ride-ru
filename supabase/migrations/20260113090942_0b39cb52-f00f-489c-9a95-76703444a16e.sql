-- Ensure DELETE realtime payload includes full row (so kicked client can detect player_id)
ALTER TABLE public.room_players REPLICA IDENTITY FULL;