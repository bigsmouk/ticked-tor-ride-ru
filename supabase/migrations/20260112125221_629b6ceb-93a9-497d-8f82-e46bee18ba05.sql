-- Удаляем публичную политику SELECT
DROP POLICY IF EXISTS "Публичный доступ к базовым данным профиля" ON public.profiles;

-- Новая политика: только авторизованные пользователи могут видеть профили
CREATE POLICY "Авторизованные видят профили"
ON public.profiles
FOR SELECT
USING (auth.uid() IS NOT NULL);