-- Удаляем старую политику публичного чтения
DROP POLICY IF EXISTS "Любой может видеть профили" ON public.profiles;

-- Создаём view для публичного доступа БЕЗ user_id
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  display_name,
  avatar_url,
  created_at
FROM public.profiles;

-- Даём доступ к view
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Новая политика: пользователь видит только свой профиль
CREATE POLICY "Пользователь видит только свой профиль" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Функция для получения публичной информации о профиле по ID (без user_id)
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_id UUID)
RETURNS TABLE (
  id UUID,
  display_name TEXT,
  avatar_url TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.display_name, p.avatar_url
  FROM public.profiles p
  WHERE p.id = profile_id;
$$;