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