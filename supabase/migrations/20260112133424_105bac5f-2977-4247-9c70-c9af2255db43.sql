-- Добавляем колонку avatar_url в room_players
ALTER TABLE public.room_players 
ADD COLUMN avatar_url text;