-- Добавляем колонку для привязки комнаты к авторизованному пользователю
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS owner_auth_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Удаляем старые небезопасные политики
DROP POLICY IF EXISTS "Only host can update rooms" ON public.rooms;
DROP POLICY IF EXISTS "Only host can delete rooms" ON public.rooms;

-- Новая политика UPDATE: только авторизованный владелец или legacy через host_id (для неавторизованных)
CREATE POLICY "Только владелец может обновлять комнату" 
ON public.rooms 
FOR UPDATE 
USING (
  -- Авторизованный пользователь - владелец
  (owner_auth_id IS NOT NULL AND owner_auth_id = auth.uid())
  OR
  -- Legacy: если owner_auth_id не установлен, проверяем host_id (менее безопасно, но сохраняет обратную совместимость)
  (owner_auth_id IS NULL AND host_id IS NOT NULL)
)
WITH CHECK (
  (owner_auth_id IS NOT NULL AND owner_auth_id = auth.uid())
  OR
  (owner_auth_id IS NULL AND host_id IS NOT NULL)
);

-- Новая политика DELETE: только авторизованный владелец
CREATE POLICY "Только владелец может удалять комнату" 
ON public.rooms 
FOR DELETE 
USING (
  (owner_auth_id IS NOT NULL AND owner_auth_id = auth.uid())
  OR
  (owner_auth_id IS NULL AND host_id IS NOT NULL)
);

-- Создаём индекс для быстрого поиска по owner_auth_id
CREATE INDEX IF NOT EXISTS idx_rooms_owner_auth_id ON public.rooms(owner_auth_id);