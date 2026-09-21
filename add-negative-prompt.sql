-- =============================================
-- Agrega soporte de prompt negativo a los prompts existentes
-- Ejecutar en: Supabase → SQL Editor
-- =============================================

alter table entries add column if not exists negative_prompt text;
