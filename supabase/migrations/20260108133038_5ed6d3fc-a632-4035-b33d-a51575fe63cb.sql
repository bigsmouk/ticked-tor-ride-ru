-- Add length constraints for rooms table
ALTER TABLE public.rooms ADD CONSTRAINT room_name_length 
  CHECK (char_length(name) BETWEEN 1 AND 50);

ALTER TABLE public.rooms ADD CONSTRAINT room_code_length 
  CHECK (char_length(code) = 6);

-- Add length constraints for room_players table
ALTER TABLE public.room_players ADD CONSTRAINT player_name_length 
  CHECK (char_length(player_name) BETWEEN 1 AND 30);

ALTER TABLE public.room_players ADD CONSTRAINT player_color_valid 
  CHECK (color IN ('red', 'blue', 'green', 'yellow'));