-- Drop the old constraint and add updated one with 'black' color
ALTER TABLE public.room_players DROP CONSTRAINT IF EXISTS player_color_valid;
ALTER TABLE public.room_players ADD CONSTRAINT player_color_valid 
  CHECK (color IN ('red', 'blue', 'green', 'yellow', 'black'));