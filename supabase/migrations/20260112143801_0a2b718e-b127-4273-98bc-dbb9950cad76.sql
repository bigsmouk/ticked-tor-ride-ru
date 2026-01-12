-- Включаем RLS для view public_profiles (если ещё не включен)
ALTER VIEW public.public_profiles SET (security_invoker = on);

-- Создаём политику: только авторизованные пользователи могут видеть профили
CREATE POLICY "Только авторизованные видят публичные профили"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Альтернативно, если нужна политика именно на view, 
-- но views с security_invoker наследуют политики базовой таблицы