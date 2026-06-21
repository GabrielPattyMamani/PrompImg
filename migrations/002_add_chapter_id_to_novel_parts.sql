-- Agregar campo chapter_id a novel_parts
alter table novel_parts
add column if not exists chapter_id uuid references novel_chapters(id) on delete cascade;

-- Agregar campo summary a novel_parts si no existe
alter table novel_parts
add column if not exists summary text;
