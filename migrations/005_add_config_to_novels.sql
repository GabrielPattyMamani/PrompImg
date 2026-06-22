-- Agregar campo config a novels para configuración de la novela
alter table novels
add column if not exists config text;
