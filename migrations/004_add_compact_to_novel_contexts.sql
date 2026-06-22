-- Agregar campo compact a novel_contexts para versión compacta del contexto
alter table novel_contexts
add column if not exists compact text;
