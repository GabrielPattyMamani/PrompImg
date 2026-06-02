-- ================================================
-- PASO 1 — Tablas de Prompts (si no las tienes aún)
-- ================================================
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

create table if not exists entry_images (
  id          uuid primary key default gen_random_uuid(),
  entry_id    uuid references entries(id) on delete cascade not null,
  image_data  text not null,
  created_at  timestamptz default now()
);

-- ================================================
-- PASO 2 — Tablas de Novelas
-- ================================================
create table if not exists novels (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  created_at  timestamptz default now()
);

create table if not exists novel_contexts (
  id        uuid primary key default gen_random_uuid(),
  novel_id  uuid references novels(id) on delete cascade not null,
  title     text,
  content   text not null,
  order_num int default 0,
  created_at timestamptz default now()
);

create table if not exists novel_parts (
  id        uuid primary key default gen_random_uuid(),
  novel_id  uuid references novels(id) on delete cascade not null,
  title     text not null,
  content   text not null,
  order_num int default 0,
  created_at timestamptz default now()
);

-- ================================================
-- PASO 3 — Tablas de Galería de Imágenes
-- ================================================
create table if not exists image_albums (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  created_at  timestamptz default now()
);

create table if not exists album_images (
  id          uuid primary key default gen_random_uuid(),
  album_id    uuid references image_albums(id) on delete cascade not null,
  image_data  text not null,
  name        text,
  created_at  timestamptz default now()
);

-- ================================================
-- PASO 4 — Permisos (RLS)
-- ================================================
alter table collections   enable row level security;
alter table entries        enable row level security;
alter table entry_images   enable row level security;
alter table novels         enable row level security;
alter table novel_contexts enable row level security;
alter table novel_parts    enable row level security;
alter table image_albums   enable row level security;
alter table album_images   enable row level security;

create policy "allow all" on collections   for all using (true) with check (true);
create policy "allow all" on entries       for all using (true) with check (true);
create policy "allow all" on entry_images  for all using (true) with check (true);
create policy "allow all" on novels        for all using (true) with check (true);
create policy "allow all" on novel_contexts for all using (true) with check (true);
create policy "allow all" on novel_parts   for all using (true) with check (true);
create policy "allow all" on image_albums  for all using (true) with check (true);
create policy "allow all" on album_images  for all using (true) with check (true);
