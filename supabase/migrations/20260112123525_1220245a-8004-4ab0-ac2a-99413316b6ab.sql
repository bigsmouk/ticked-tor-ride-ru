-- Удаляем небезопасную политику INSERT
DROP POLICY IF EXISTS "Система может создавать записи" ON public.match_history;

-- Новая политика: только владелец комнаты (авторизованный) может создавать записи истории матчей
CREATE POLICY "Только владелец комнаты может создавать записи матчей"
ON public.match_history
FOR INSERT
WITH CHECK (
  -- Проверяем что room_id указан и пользователь является владельцем этой комнаты
  (room_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.rooms 
    WHERE id = room_id 
    AND owner_auth_id = auth.uid()
  ))
  OR
  -- Или это запись без привязки к комнате от авторизованного пользователя
  (room_id IS NULL AND auth.uid() IS NOT NULL)
);