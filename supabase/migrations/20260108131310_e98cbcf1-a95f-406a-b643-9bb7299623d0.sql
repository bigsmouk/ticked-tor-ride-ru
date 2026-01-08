-- Remove password column to fix security exposure
ALTER TABLE public.rooms DROP COLUMN IF EXISTS password;