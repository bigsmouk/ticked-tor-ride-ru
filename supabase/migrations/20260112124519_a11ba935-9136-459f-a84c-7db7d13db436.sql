-- 1. Пересоздаём public_profiles view с RLS через security_invoker
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles 
WITH (security_invoker = true)
AS
SELECT 
  id,
  display_name,
  avatar_url,
  created_at
FROM public.profiles;

-- Комментарий для документации
COMMENT ON VIEW public.public_profiles IS 'Публичный view профилей без user_id. Доступ контролируется через RLS таблицы profiles.';

-- 2. Добавляем политику SELECT для profiles, чтобы public_profiles работал
-- Позволяем всем видеть публичные поля через view
DROP POLICY IF EXISTS "Публичный доступ к базовым данным профиля" ON public.profiles;
CREATE POLICY "Публичный доступ к базовым данным профиля"
ON public.profiles
FOR SELECT
USING (true);

-- Удаляем старую ограничительную политику (оставляем только публичную для SELECT)
DROP POLICY IF EXISTS "Пользователь видит только свой пр" ON public.profiles;

-- 3. Исправляем room_players - требуем авторизацию для UPDATE/DELETE
DROP POLICY IF EXISTS "Игрок может обновлять свою запись" ON public.room_players;
DROP POLICY IF EXISTS "Игрок может покинуть комнату" ON public.room_players;

-- UPDATE: только авторизованный владелец записи
CREATE POLICY "Авторизованный игрок обновляет свою запись"
ON public.room_players
FOR UPDATE
USING (
  auth.uid() IS NOT NULL 
  AND owner_auth_id = auth.uid()
)
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND owner_auth_id = auth.uid()
);

-- DELETE: только авторизованный владелец записи
CREATE POLICY "Авторизованный игрок покидает комнату"
ON public.room_players
FOR DELETE
USING (
  auth.uid() IS NOT NULL 
  AND owner_auth_id = auth.uid()
);