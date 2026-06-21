-- Habilitar RLS en la tabla novel_chapters
alter table novel_chapters enable row level security;

-- Crear política que permite todas las operaciones (permitir todo)
create policy "allow all" on novel_chapters
  for all using (true) with check (true);
