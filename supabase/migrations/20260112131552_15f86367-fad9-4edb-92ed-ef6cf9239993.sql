-- Исправляем RLS политики для profiles: делаем их PERMISSIVE вместо RESTRICTIVE

-- Удаляем старые restrictive политики
DROP POLICY IF EXISTS "Пользователь видит только свой пр" ON public.profiles;
DROP POLICY IF EXISTS "Пользователь видит только свой профиль" ON public.profiles;
DROP POLICY IF EXISTS "Пользователь может обновлять свой" ON public.profiles;
DROP POLICY IF EXISTS "Пользователь может создать свой п" ON public.profiles;

-- Создаём PERMISSIVE политики (по умолчанию)
CREATE POLICY "Пользователь видит свой профиль"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Пользователь обновляет свой профиль"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Пользователь создаёт свой профиль"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);