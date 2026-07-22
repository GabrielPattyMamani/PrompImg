-- Imágenes/ilustraciones asociadas a una parte de una novela
create table if not exists novel_part_images (
  id          uuid primary key default gen_random_uuid(),
  part_id     uuid references novel_parts(id) on delete cascade not null,
  image_data  text not null,
  created_at  timestamptz default now()
);

create index if not exists novel_part_images_part_id_idx on novel_part_images(part_id);

-- RLS
alter table novel_part_images enable row level security;

create policy "allow all" on novel_part_images for all using (true) with check (true);
