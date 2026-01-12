-- Пересоздаём view без SECURITY DEFINER (по умолчанию SECURITY INVOKER)
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

-- Даём доступ к view
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Добавляем политику для анонимного чтения через view 
-- (view использует RLS исходной таблицы, поэтому нужна политика)
CREATE POLICY "Публичное чтение базовых полей профиля" 
ON public.profiles 
FOR SELECT 
TO anon
USING (true);

-- Но эта политика работает для всей таблицы, нам нужен другой подход
-- Удаляем её и оставляем только view с функцией
DROP POLICY IF EXISTS "Публичное чтение базовых полей профиля" ON public.profiles;