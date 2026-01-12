-- Таблица для хранения состояния игры
CREATE TABLE public.game_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  game_state JSONB NOT NULL,
  turn_number INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by TEXT, -- player_id кто последний обновил
  
  -- Уникальный constraint - одно состояние на комнату
  CONSTRAINT unique_room_state UNIQUE (room_id)
);

-- Индекс для быстрого поиска по room_id
CREATE INDEX idx_game_states_room_id ON public.game_states(room_id);

-- Включаем RLS
ALTER TABLE public.game_states ENABLE ROW LEVEL SECURITY;

-- Политики: только участники комнаты могут читать/писать
CREATE POLICY "Участники комнаты могут читать состояние"
ON public.game_states
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.room_players rp
    WHERE rp.room_id = game_states.room_id
    AND rp.owner_auth_id = auth.uid()
  )
);

CREATE POLICY "Участники комнаты могут создавать состояние"
ON public.game_states
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.room_players rp
    WHERE rp.room_id = game_states.room_id
    AND rp.owner_auth_id = auth.uid()
  )
);

CREATE POLICY "Участники комнаты могут обновлять состояние"
ON public.game_states
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.room_players rp
    WHERE rp.room_id = game_states.room_id
    AND rp.owner_auth_id = auth.uid()
  )
);

-- Триггер для автообновления updated_at
CREATE TRIGGER update_game_states_updated_at
BEFORE UPDATE ON public.game_states
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Включаем realtime для таблицы
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_states;