-- ============================================================================
-- Crevo — Storage bucket para anexos
-- ============================================================================
-- Cria o bucket privado "anexos" e políticas para usuários autenticados.
-- Roda uma vez no SQL Editor do Supabase.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('anexos', 'anexos', false)
on conflict (id) do nothing;

-- Permite que qualquer usuário autenticado leia arquivos do bucket.
-- A real proteção dos metadados (quem vê o que) está na tabela public.anexos via RLS.
create policy "anexos_read_authenticated"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'anexos');

create policy "anexos_insert_authenticated"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'anexos');

create policy "anexos_delete_authenticated"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'anexos');
