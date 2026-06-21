-- Crear tabla de capítulos de novelas
create table if not exists novel_chapters (
  id        uuid primary key default gen_random_uuid(),
  novel_id  uuid references novels(id) on delete cascade not null,
  title     text not null,
  context   text,
  summary   text,
  order_num int default 0,
  created_at timestamptz default now()
);
