-- Políticas de Storage para el bucket prompt-images
-- Ejecutar en: Supabase → SQL Editor

create policy "allow public uploads"
  on storage.objects for insert
  with check (bucket_id = 'prompt-images');

create policy "allow public reads"
  on storage.objects for select
  using (bucket_id = 'prompt-images');

create policy "allow public deletes"
  on storage.objects for delete
  using (bucket_id = 'prompt-images');
