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