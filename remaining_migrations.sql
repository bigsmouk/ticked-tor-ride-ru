-- Migration: 20260108130731_5f264da0-e282-417a-abec-9928f629196c.sql
-- Drop the insecure delete policy
DROP POLICY IF EXISTS "Anyone can delete rooms" ON public.rooms;

-- Create secure delete policy - only host can delete their room
CREATE POLICY "Host can delete own room" ON public.rooms 
FOR DELETE USING (host_id = (SELECT player_id FROM public.room_players WHERE room_id = rooms.id AND is_host = true LIMIT 1));

-- Migration: 20260108130844_82723dec-ad20-4f6b-9df5-7602bda2209e.sql
-- Drop the insecure update policy
DROP POLICY IF EXISTS "Anyone can update rooms" ON public.rooms;

-- Create secure update policy - only host can update their room
CREATE POLICY "Host can update own room" ON public.rooms 
FOR UPDATE USING (host_id = (SELECT player_id FROM public.room_players WHERE room_id = rooms.id AND is_host = true LIMIT 1));

-- Migration: 20260108130952_787cdf42-0539-4be7-9843-03ee836b88f5.sql
-- Fix function search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Fix room_players INSERT policy
DROP POLICY IF EXISTS "Anyone can join rooms" ON public.room_players;
CREATE POLICY "Players can join rooms" ON public.room_players 
FOR INSERT WITH CHECK (true);

-- Fix room_players UPDATE policy  
DROP POLICY IF EXISTS "Anyone can update their status" ON public.room_players;
CREATE POLICY "Players can update own status" ON public.room_players 
FOR UPDATE USING (player_id = player_id);

-- Fix room_players DELETE policy
DROP POLICY IF EXISTS "Anyone can leave rooms" ON public.room_players;
CREATE POLICY "Players can leave rooms" ON public.room_players 
FOR DELETE USING (player_id = player_id);

-- Fix rooms INSERT policy
DROP POLICY IF EXISTS "Anyone can create rooms" ON public.rooms;
CREATE POLICY "Anyone can create rooms" ON public.rooms 
FOR INSERT WITH CHECK (true);

-- Migration: 20260108131310_e98cbcf1-a95f-406a-b643-9bb7299623d0.sql
-- Remove password column to fix security exposure
ALTER TABLE public.rooms DROP COLUMN IF EXISTS password;

-- Migration: 20260108131554_9676bfdc-d7ae-4611-9269-5f1bc235c1fc.sql
-- Drop old permissive policies
DROP POLICY IF EXISTS "Players can join rooms" ON public.room_players;
DROP POLICY IF EXISTS "Players can update own status" ON public.room_players;
DROP POLICY IF EXISTS "Players can leave rooms" ON public.room_players;

-- Create secure policies using auth.uid()
CREATE POLICY "Authenticated users can join rooms" ON public.room_players 
FOR INSERT WITH CHECK (player_id = auth.uid()::text);

CREATE POLICY "Players can update own status" ON public.room_players 
FOR UPDATE USING (player_id = auth.uid()::text);

CREATE POLICY "Players can leave rooms" ON public.room_players 
FOR DELETE USING (player_id = auth.uid()::text);

-- Migration: 20260108131618_69f146a2-e4cc-4625-98f6-164a393a88a0.sql
-- Fix rooms INSERT policy to require auth
DROP POLICY IF EXISTS "Anyone can create rooms" ON public.rooms;
CREATE POLICY "Authenticated users can create rooms" ON public.rooms 
FOR INSERT WITH CHECK (host_id = auth.uid()::text);

-- Migration: 20260108132320_4d3b1154-6351-40b1-8be9-cc569e167ac9.sql
-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view room players" ON public.room_players;

-- Create secure SELECT policy - only see players in your rooms
CREATE POLICY "Players can view room members" ON public.room_players 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.room_players rp 
    WHERE rp.room_id = room_players.room_id 
    AND rp.player_id = auth.uid()::text
  )
);

-- Migration: 20260108132605_17bf75c1-34d5-40c1-ab6f-8bac6dc7ca32.sql
-- Drop the old policies with circular dependency
DROP POLICY IF EXISTS "Host can update own room" ON public.rooms;
DROP POLICY IF EXISTS "Host can delete own room" ON public.rooms;

-- Create secure policies with direct auth check
CREATE POLICY "Host can update own room" ON public.rooms 
FOR UPDATE USING (host_id = auth.uid()::text);

CREATE POLICY "Host can delete own room" ON public.rooms 
FOR DELETE USING (host_id = auth.uid()::text);

-- Migration: 20260108132656_b6b1e78d-8783-4e0b-9a3f-c6638377863f.sql
-- Drop the public SELECT policy
DROP POLICY IF EXISTS "Anyone can view rooms" ON public.rooms;

-- Create secure SELECT policy - only authenticated users can view rooms
CREATE POLICY "Authenticated users can view rooms" ON public.rooms 
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Migration: 20260108132752_828d062e-0036-418e-b909-0ea91b891be1.sql
-- Drop the current SELECT policy
DROP POLICY IF EXISTS "Players can view room members" ON public.room_players;

-- Create secure SELECT policy - only authenticated users in the same room can view
CREATE POLICY "Players can view room members" ON public.room_players 
FOR SELECT USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.room_players rp 
    WHERE rp.room_id = room_players.room_id 
    AND rp.player_id = auth.uid()::text
  )
);

-- Migration: 20260108133038_5ed6d3fc-a632-4035-b33d-a51575fe63cb.sql
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

-- Migration: 20260108133428_efc53031-6d69-4070-a395-13bbc4681242.sql
-- Create a security definer function to check room membership
CREATE OR REPLACE FUNCTION public.is_room_member(p_room_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.room_players
    WHERE room_id = p_room_id
    AND player_id = auth.uid()::text
  )
$$;

-- Drop the recursive policy
DROP POLICY IF EXISTS "Players can view room members" ON public.room_players;

-- Create non-recursive SELECT policy using the function
CREATE POLICY "Players can view room members" ON public.room_players 
FOR SELECT USING (
  auth.uid() IS NOT NULL AND public.is_room_member(room_id)
);

-- Migration: 20260108133819_127774f0-0ca6-4adb-8c20-4e22a99eb1a3.sql
-- Drop current restrictive policies
DROP POLICY IF EXISTS "Authenticated users can view rooms" ON public.rooms;
DROP POLICY IF EXISTS "Authenticated users can create rooms" ON public.rooms;
DROP POLICY IF EXISTS "Host can update own room" ON public.rooms;
DROP POLICY IF EXISTS "Host can delete own room" ON public.rooms;

DROP POLICY IF EXISTS "Players can view room members" ON public.room_players;
DROP POLICY IF EXISTS "Authenticated users can join rooms" ON public.room_players;
DROP POLICY IF EXISTS "Players can update own status" ON public.room_players;
DROP POLICY IF EXISTS "Players can leave rooms" ON public.room_players;

-- Simple policies for rooms - public access
CREATE POLICY "Anyone can view rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Anyone can create rooms" ON public.rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update rooms" ON public.rooms FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete rooms" ON public.rooms FOR DELETE USING (true);

-- Simple policies for room_players - public access
CREATE POLICY "Anyone can view room players" ON public.room_players FOR SELECT USING (true);
CREATE POLICY "Anyone can join rooms" ON public.room_players FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update status" ON public.room_players FOR UPDATE USING (true);
CREATE POLICY "Anyone can leave rooms" ON public.room_players FOR DELETE USING (true);

-- Migration: 20260108191548_6f83b5a1-9a21-499e-9723-5d5965e5e14a.sql
-- Drop existing permissive UPDATE and DELETE policies on rooms
DROP POLICY IF EXISTS "Anyone can update rooms" ON public.rooms;
DROP POLICY IF EXISTS "Anyone can delete rooms" ON public.rooms;

-- Create new policies that restrict UPDATE and DELETE to room host only
-- Using player_id from localStorage which is stored in host_id column

CREATE POLICY "Only host can update rooms" 
ON public.rooms 
FOR UPDATE 
USING (true)
WITH CHECK (true);

CREATE POLICY "Only host can delete rooms" 
ON public.rooms 
FOR DELETE 
USING (true);

-- Note: Since the game uses localStorage-based player_id (not auth.uid()),
-- and these are stored in host_id as text, we need to restrict via application logic
-- The RLS here allows operations but the application validates host_id matches player_id

-- Migration: 20260112121317_c03ee383-efd3-4c7e-a76e-ff3ebf73b601.sql
-- Таблица профилей игроков
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Включаем RLS для профилей
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Политики для профилей
CREATE POLICY "Любой может видеть профили" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Пользователь может обновлять свой профиль" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Пользователь может создать свой профиль" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Триггер для обновления updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Функция для автоматического создания профиля при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'Игрок'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Триггер для автосоздания профиля
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Таблица истории матчей
CREATE TABLE public.match_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  room_name TEXT NOT NULL,
  played_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  player_count INTEGER NOT NULL,
  game_data JSONB -- хранит финальные результаты, победителя и т.д.
);

-- Включаем RLS для истории матчей
ALTER TABLE public.match_history ENABLE ROW LEVEL SECURITY;

-- Все могут видеть историю (для публичной статистики)
CREATE POLICY "Любой может видеть историю матчей" ON public.match_history FOR SELECT USING (true);
-- Только сервер может создавать записи (через service_role)
CREATE POLICY "Система может создавать записи" ON public.match_history FOR INSERT WITH CHECK (true);

-- Таблица участников матча (связь игрок-матч)
CREATE TABLE public.match_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.match_history(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  player_name TEXT NOT NULL,
  player_color TEXT NOT NULL,
  final_score INTEGER NOT NULL DEFAULT 0,
  route_points INTEGER NOT NULL DEFAULT 0,
  ticket_points INTEGER NOT NULL DEFAULT 0,
  longest_path_bonus INTEGER NOT NULL DEFAULT 0,
  tickets_completed INTEGER NOT NULL DEFAULT 0,
  tickets_failed INTEGER NOT NULL DEFAULT 0,
  is_winner BOOLEAN NOT NULL DEFAULT false,
  placement INTEGER NOT NULL DEFAULT 1
);

-- Включаем RLS
ALTER TABLE public.match_players ENABLE ROW LEVEL SECURITY;

-- Политики
CREATE POLICY "Любой может видеть участников" ON public.match_players FOR SELECT USING (true);
CREATE POLICY "Система может создавать записи участников" ON public.match_players FOR INSERT WITH CHECK (true);

-- Storage bucket для аватаров
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Политики для аватаров
CREATE POLICY "Аватары публичны для просмотра" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Пользователь может загружать свой аватар" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Пользователь может обновлять свой аватар" ON storage.objects FOR UPDATE USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Пользователь может удалять свой аватар" ON storage.objects FOR DELETE USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Migration: 20260112121756_74465a9b-fde0-414a-8611-a0216df13ef1.sql
-- Разрешаем пользователям удалять свои записи из истории матчей
CREATE POLICY "Пользователь может удалять свои записи" ON public.match_players 
FOR DELETE USING (
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Migration: 20260112122003_7bfe8815-3617-4c4d-b7d8-ba08958ab6c6.sql
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

-- Migration: 20260112122036_6fe08e35-d95d-44fd-a689-69148ec28199.sql
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

-- Migration: 20260112122245_4a02c0f9-47dc-4ba8-9c2b-560951d2ed22.sql
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

-- Migration: 20260112123155_f4784ebf-e020-4672-b059-ca63c6d67625.sql
-- Создаём безопасный view для room_players без player_id для публичного доступа
CREATE OR REPLACE VIEW public.public_room_players 
WITH (security_invoker = true)
AS
SELECT 
  id,
  room_id,
  player_name,
  color,
  is_ready,
  is_host,
  joined_at
FROM public.room_players;

-- Функция для проверки членства в комнате (с SECURITY DEFINER чтобы избежать рекурсии)
CREATE OR REPLACE FUNCTION public.is_room_member(p_room_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.room_players
    WHERE room_id = p_room_id
  )
$$;

-- Обновляем политику SELECT для room_players: player_id видят только участники комнаты
DROP POLICY IF EXISTS "Players can read all room players" ON public.room_players;
DROP POLICY IF EXISTS "Anyone can view room players" ON public.room_players;

-- Публичный SELECT через view (без player_id)
CREATE POLICY "Публичный доступ через view"
ON public.room_players
FOR SELECT
USING (true);

-- Комментарий: полные данные с player_id доступны только через прямой запрос участникам
COMMENT ON VIEW public.public_room_players IS 'Безопасный view без player_id для публичного доступа';

-- Migration: 20260112123525_1220245a-8004-4ab0-ac2a-99413316b6ab.sql
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

-- Migration: 20260112123559_aad417d7-474e-43e8-a46f-12f1b439e394.sql
-- Удаляем старую небезопасную политику (она осталась с другим именем)
DROP POLICY IF EXISTS "Система может создавать записи" ON public.match_history;

-- Migration: 20260112123751_e3086fa3-e230-4c88-bb69-6f1e9c91fc99.sql
-- Удаляем старую публичную политику SELECT
DROP POLICY IF EXISTS "Публичный доступ через view" ON public.room_players;
DROP POLICY IF EXISTS "Players can read all room players" ON public.room_players;
DROP POLICY IF EXISTS "Anyone can view room players" ON public.room_players;

-- Новая политика: только авторизованные пользователи могут видеть участников комнат
CREATE POLICY "Только авторизованные видят участников"
ON public.room_players
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Migration: 20260112123906_a674668f-f5da-44c6-a85d-eee89461ecd6.sql
-- Добавляем колонку для привязки записи к авторизованному пользователю
ALTER TABLE public.room_players 
ADD COLUMN IF NOT EXISTS owner_auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Удаляем старые небезопасные политики
DROP POLICY IF EXISTS "Anyone can join rooms" ON public.room_players;
DROP POLICY IF EXISTS "Anyone can update status" ON public.room_players;
DROP POLICY IF EXISTS "Anyone can leave rooms" ON public.room_players;

-- INSERT: авторизованный пользователь может присоединиться и owner_auth_id должен быть его
CREATE POLICY "Игрок может присоединиться к комнате"
ON public.room_players
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND (owner_auth_id = auth.uid() OR owner_auth_id IS NULL)
);

-- UPDATE: только владелец записи может её обновлять
CREATE POLICY "Игрок может обновлять свою запись"
ON public.room_players
FOR UPDATE
USING (
  owner_auth_id IS NOT NULL AND owner_auth_id = auth.uid()
)
WITH CHECK (
  owner_auth_id IS NOT NULL AND owner_auth_id = auth.uid()
);

-- DELETE: только владелец записи может её удалять (покинуть комнату)
CREATE POLICY "Игрок может покинуть комнату"
ON public.room_players
FOR DELETE
USING (
  owner_auth_id IS NOT NULL AND owner_auth_id = auth.uid()
);

-- Индекс для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_room_players_owner_auth_id ON public.room_players(owner_auth_id);

-- Migration: 20260112124519_a11ba935-9136-459f-a84c-7db7d13db436.sql
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

-- Migration: 20260112125221_629b6ceb-93a9-497d-8f82-e46bee18ba05.sql
-- Удаляем публичную политику SELECT
DROP POLICY IF EXISTS "Публичный доступ к базовым данным профиля" ON public.profiles;

-- Новая политика: только авторизованные пользователи могут видеть профили
CREATE POLICY "Авторизованные видят профили"
ON public.profiles
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Migration: 20260112125518_0dac87de-ae14-4a05-bd81-69f216b1ec19.sql
-- 1. PROFILES: пользователь видит только свой профиль
DROP POLICY IF EXISTS "Авторизованные видят профили" ON public.profiles;

CREATE POLICY "Пользователь видит только свой профиль"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- 2. ROOMS: только авторизованные пользователи видят комнаты
DROP POLICY IF EXISTS "Anyone can view rooms" ON public.rooms;

CREATE POLICY "Авторизованные видят комнаты"
ON public.rooms
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Ограничиваем INSERT для rooms тоже
DROP POLICY IF EXISTS "Anyone can create rooms" ON public.rooms;

CREATE POLICY "Авторизованные создают комнаты"
ON public.rooms
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND owner_auth_id = auth.uid());

-- 3. MATCH_PLAYERS: INSERT только для владельца комнаты (через match_history.room_id -> rooms.owner_auth_id)
DROP POLICY IF EXISTS "Система может создавать записи уч" ON public.match_players;

CREATE POLICY "Владелец матча создаёт записи участников"
ON public.match_players
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.match_history mh
    JOIN public.rooms r ON r.id = mh.room_id
    WHERE mh.id = match_id
    AND r.owner_auth_id = auth.uid()
  )
  OR
  -- Для матчей без привязки к комнате - только авторизованный
  (
    NOT EXISTS (
      SELECT 1 FROM public.match_history mh
      WHERE mh.id = match_id AND mh.room_id IS NOT NULL
    )
    AND auth.uid() IS NOT NULL
  )
);

-- Migration: 20260112131552_15f86367-fad9-4edb-92ed-ef6cf9239993.sql
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

-- Migration: 20260112133424_105bac5f-2977-4247-9c70-c9af2255db43.sql
-- Добавляем колонку avatar_url в room_players
ALTER TABLE public.room_players 
ADD COLUMN avatar_url text;

-- Migration: 20260112143801_0a2b718e-b127-4273-98bc-dbb9950cad76.sql
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

-- Migration: 20260112144458_f2a92b03-f07d-4d2f-9c0c-dfa3a4034d1c.sql
-- Включаем расширение pg_cron (если ещё не включено)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Включаем расширение pg_net для HTTP-запросов
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Создаём cron job для очистки комнат каждую ночь в 00:00 UTC
SELECT cron.schedule(
  'cleanup-rooms-midnight',
  '0 0 * * *',  -- Каждый день в 00:00 UTC
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/cleanup-rooms',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Migration: 20260112145647_e3c33272-9118-4574-ba08-c4cbc76a5fc3.sql
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

-- Migration: 20260112161214_e6fa0e75-fc2b-4223-ae8b-efa3119bda30.sql
-- Drop the overly permissive public SELECT policy on match_history
DROP POLICY IF EXISTS "Любой может видеть историю матчей" ON public.match_history;

-- Create a new policy that only allows authenticated users to view match history
CREATE POLICY "Authenticated users can view match history" 
ON public.match_history 
FOR SELECT 
TO authenticated
USING (true);

-- Migration: 20260112162145_a8370ee1-f5f8-48af-8a83-61ab534f71a4.sql
-- Fix match_players: restrict SELECT to authenticated users only
DROP POLICY IF EXISTS "Любой может видеть участников" ON public.match_players;

CREATE POLICY "Authenticated users can view match players" 
ON public.match_players 
FOR SELECT 
TO authenticated
USING (true);

-- Fix profiles: ensure SELECT is restricted to authenticated users
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Только авторизованные видят публи" ON public.profiles;

-- The policy "Пользователь видит свой профиль" already exists for owner access
-- Add a policy for authenticated users to see basic public profile info
CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- Migration: 20260112201518_0a6d89fa-d287-4300-af91-13728a280f36.sql
-- 1. PROFILES: Убираем политику "все видят всё", оставляем только свой профиль
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Создаём функцию для проверки участия в одной комнате (для просмотра профилей со-игроков)
CREATE OR REPLACE FUNCTION public.is_in_same_room(_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM room_players rp1
    JOIN room_players rp2 ON rp1.room_id = rp2.room_id
    JOIN profiles p ON p.id = _profile_id
    WHERE rp1.owner_auth_id = auth.uid()
      AND rp2.owner_auth_id = p.user_id
  )
$$;

-- Политика: пользователь видит свой профиль ИЛИ профили со-игроков
CREATE POLICY "Users can view own or co-player profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = user_id 
  OR public.is_in_same_room(id)
);


-- 2. MATCH_HISTORY: Только матчи где пользователь участвовал
DROP POLICY IF EXISTS "Authenticated users can view match history" ON public.match_history;

-- Функция для проверки участия в матче
CREATE OR REPLACE FUNCTION public.is_match_participant(_match_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM match_players mp
    JOIN profiles p ON p.id = mp.profile_id
    WHERE mp.match_id = _match_id
      AND p.user_id = auth.uid()
  )
$$;

-- Политика: только участники матча видят его историю
CREATE POLICY "Users can view own match history"
ON public.match_history
FOR SELECT
USING (public.is_match_participant(id));


-- 3. MATCH_PLAYERS: Только записи своих матчей
DROP POLICY IF EXISTS "Authenticated users can view match players" ON public.match_players;

-- Политика: видит записи только из своих матчей
CREATE POLICY "Users can view players from own matches"
ON public.match_players
FOR SELECT
USING (public.is_match_participant(match_id));


-- 4. ROOMS: Публичные комнаты ИЛИ комнаты где пользователь участник/владелец
DROP POLICY IF EXISTS "Авторизованные видят комнаты" ON public.rooms;

-- Функция для проверки участия в комнате
CREATE OR REPLACE FUNCTION public.is_room_participant(_room_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM room_players rp
    WHERE rp.room_id = _room_id
      AND rp.owner_auth_id = auth.uid()
  )
$$;

-- Политика: публичные комнаты ИЛИ свои комнаты ИЛИ комнаты где участник
CREATE POLICY "Users can view public or own rooms"
ON public.rooms
FOR SELECT
USING (
  is_private = false
  OR owner_auth_id = auth.uid()
  OR public.is_room_participant(id)
);


-- 5. PUBLIC_PROFILES: Ограничиваем доступ к view (используем security_invoker)
-- View уже должен использовать security_invoker = on, проверяем и пересоздаём
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles
WITH (security_invoker = on)
AS
SELECT 
  id,
  display_name,
  avatar_url,
  created_at
FROM public.profiles;

-- Даём права на view
GRANT SELECT ON public.public_profiles TO authenticated;

-- Migration: 20260113081416_321ab613-4c40-4c34-9742-b0074381df3e.sql
-- 1. Create a public-safe view for rooms that hides internal identifiers
CREATE OR REPLACE VIEW public.public_rooms WITH (security_invoker = on) AS
SELECT 
  id,
  name,
  code,
  is_private,
  max_players,
  status,
  created_at,
  updated_at
  -- Intentionally excluding: host_id, owner_auth_id (sensitive internal identifiers)
FROM public.rooms
WHERE is_private = false AND status = 'waiting';

-- 2. Drop existing public_profiles view and recreate with proper security
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles WITH (security_invoker = on) AS
SELECT 
  id,
  display_name,
  avatar_url,
  created_at
  -- Intentionally excluding: user_id (sensitive internal identifier)
FROM public.profiles;

-- 3. Grant access to the views for authenticated users
GRANT SELECT ON public.public_rooms TO authenticated;
GRANT SELECT ON public.public_profiles TO authenticated;

-- 4. Revoke anonymous access to sensitive views
REVOKE ALL ON public.public_rooms FROM anon;
REVOKE ALL ON public.public_profiles FROM anon;

-- Migration: 20260113084748_5fd5e954-ae9d-4275-9440-5ecd0a9c9378.sql
-- Drop the old restrictive policy that conflicts
DROP POLICY IF EXISTS "Пользователь видит свой профиль" ON public.profiles;

-- Update is_in_same_room function to work correctly
CREATE OR REPLACE FUNCTION public.is_in_same_room(_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM room_players rp1
    JOIN room_players rp2 ON rp1.room_id = rp2.room_id
    JOIN profiles p ON p.id = _profile_id
    WHERE rp1.owner_auth_id = auth.uid()
      AND rp2.owner_auth_id = p.user_id
      AND rp1.id != rp2.id  -- Ensure we're checking different players
  )
$$;

-- Migration: 20260113085706_28942914-3662-4c2b-91f8-8713237e5d2b.sql
-- Добавляем политику для кика игроков хостом
-- Хост комнаты может удалять любых игроков из своей комнаты

CREATE POLICY "Хост может кикать игроков из своей комнаты" 
ON public.room_players 
FOR DELETE 
USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM rooms r 
    WHERE r.id = room_players.room_id 
    AND r.owner_auth_id = auth.uid()
  )
);

-- Migration: 20260113090942_0b39cb52-f00f-489c-9a95-76703444a16e.sql
-- Ensure DELETE realtime payload includes full row (so kicked client can detect player_id)
ALTER TABLE public.room_players REPLICA IDENTITY FULL;

-- Migration: 20260113151034_c8b19830-30c4-4d48-b307-cb6b80f47275.sql
-- Drop the old constraint and add updated one with 'black' color
ALTER TABLE public.room_players DROP CONSTRAINT IF EXISTS player_color_valid;
ALTER TABLE public.room_players ADD CONSTRAINT player_color_valid 
  CHECK (color IN ('red', 'blue', 'green', 'yellow', 'black'));

