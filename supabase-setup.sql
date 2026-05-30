-- =============================================
-- PromptVault — Schema Setup (sin Storage)
-- Ejecutar en: Supabase → SQL Editor
-- =============================================

create table if not exists collections (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  created_at  timestamptz default now()
);

create table if not exists entries (
  id             uuid primary key default gen_random_uuid(),
  collection_id  uuid references collections(id) on delete cascade not null,
  title          text,
  prompt         text not null,
  created_at     timestamptz default now()
);

-- image_data guarda el base64 WebP generado en el cliente
create table if not exists entry_images (
  id          uuid primary key default gen_random_uuid(),
  entry_id    uuid references entries(id) on delete cascade not null,
  image_data  text not null,
  created_at  timestamptz default now()
);

create index if not exists entries_collection_id_idx on entries(collection_id);
create index if not exists entry_images_entry_id_idx on entry_images(entry_id);

-- RLS
alter table collections enable row level security;
alter table entries enable row level security;
alter table entry_images enable row level security;

create policy "allow all collections" on collections for all using (true) with check (true);
create policy "allow all entries"     on entries     for all using (true) with check (true);
create policy "allow all entry_images" on entry_images for all using (true) with check (true);
