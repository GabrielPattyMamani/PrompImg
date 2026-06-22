-- Lugares / escenarios de una novela
create table if not exists novel_places (
  id          uuid primary key default gen_random_uuid(),
  novel_id    uuid references novels(id) on delete cascade not null,
  name        text not null,
  description text,
  created_at  timestamptz default now()
);

-- Personajes de una novela
create table if not exists novel_characters (
  id          uuid primary key default gen_random_uuid(),
  novel_id    uuid references novels(id) on delete cascade not null,
  name        text not null,
  description text,
  role        text,
  appearance  text,
  created_at  timestamptz default now()
);

-- Relación muchos-a-muchos: personaje ↔ lugar
create table if not exists novel_character_places (
  id           uuid primary key default gen_random_uuid(),
  character_id uuid references novel_characters(id) on delete cascade not null,
  place_id     uuid references novel_places(id) on delete cascade not null,
  unique(character_id, place_id)
);

-- RLS
alter table novel_places           enable row level security;
alter table novel_characters       enable row level security;
alter table novel_character_places enable row level security;

create policy "allow all" on novel_places           for all using (true) with check (true);
create policy "allow all" on novel_characters       for all using (true) with check (true);
create policy "allow all" on novel_character_places  for all using (true) with check (true);
