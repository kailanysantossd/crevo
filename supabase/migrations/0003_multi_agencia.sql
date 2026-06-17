-- ============================================================================
-- Crevo — Multi-agência (isolamento por workspace)
-- ============================================================================
-- Cada admin é dona da própria "agência". Colaboradores e clientes pertencem
-- a uma agência específica e só enxergam dados dela.
--
-- Mudanças principais:
--   1. profiles ganha agencia_id (auto-referência ao admin dono)
--   2. clientes ganha owner_id (que agência é dona daquele cliente)
--   3. Funções RLS reescritas usando agencia_atual()
--   4. Tabela `convites` para entrada de colaboradores e clientes
--   5. handle_new_user agora processa convite via raw_user_meta_data
-- ============================================================================


-- ===========================================================================
-- 1. ALTERAR profiles — adicionar agencia_id
-- ===========================================================================

alter table public.profiles
  add column if not exists agencia_id uuid references public.profiles(id) on delete set null;

-- Backfill: usuários existentes viram admins do próprio espaço.
update public.profiles
  set perfil = 'administrador',
      agencia_id = id
  where agencia_id is null;

alter table public.profiles
  alter column agencia_id set not null;

create index if not exists idx_profiles_agencia on public.profiles(agencia_id);


-- ===========================================================================
-- 2. ALTERAR clientes — adicionar owner_id
-- ===========================================================================

alter table public.clientes
  add column if not exists owner_id uuid references public.profiles(id) on delete cascade;

-- Backfill: associa clientes existentes ao primeiro admin disponível.
update public.clientes c
  set owner_id = (
    select id from public.profiles
    where perfil = 'administrador'
    order by created_at asc
    limit 1
  )
  where c.owner_id is null;

alter table public.clientes
  alter column owner_id set not null;

create index if not exists idx_clientes_owner on public.clientes(owner_id);


-- ===========================================================================
-- 3. FUNÇÕES AUXILIARES — refazer com isolamento por agência
-- ===========================================================================

create or replace function public.agencia_atual()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select agencia_id from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.profiles
    where id = auth.uid() and perfil = 'administrador'
  )
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.profiles
    where id = auth.uid() and perfil in ('administrador', 'colaborador')
  )
$$;

create or replace function public.has_cliente_access(cid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.clientes c
    where c.id = cid
      and c.owner_id = public.agencia_atual()
      and (
        public.is_staff()
        or exists(
          select 1 from public.clientes_usuarios cu
          where cu.cliente_id = c.id and cu.usuario_id = auth.uid()
        )
      )
  )
$$;


-- ===========================================================================
-- 4. RECRIAR POLÍTICAS RLS (com isolamento por agência)
-- ===========================================================================

-- ---- profiles -------------------------------------------------------------
drop policy if exists "profiles_select_authenticated" on public.profiles;
drop policy if exists "profiles_update_own"           on public.profiles;
drop policy if exists "profiles_admin_all"            on public.profiles;
drop policy if exists "profiles_same_agencia_read"    on public.profiles;
drop policy if exists "profiles_admin_same_agencia"   on public.profiles;

create policy "profiles_same_agencia_read"
  on public.profiles for select
  to authenticated
  using (agencia_id = public.agencia_atual());

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_admin_same_agencia"
  on public.profiles for update
  to authenticated
  using (public.is_admin() and agencia_id = public.agencia_atual())
  with check (public.is_admin() and agencia_id = public.agencia_atual());


-- ---- clientes -------------------------------------------------------------
drop policy if exists "clientes_staff_all"           on public.clientes;
drop policy if exists "clientes_cliente_read"        on public.clientes;
drop policy if exists "clientes_staff_same_agencia"  on public.clientes;

create policy "clientes_staff_same_agencia"
  on public.clientes for all
  to authenticated
  using (public.is_staff() and owner_id = public.agencia_atual())
  with check (public.is_staff() and owner_id = public.agencia_atual());

create policy "clientes_cliente_read"
  on public.clientes for select
  to authenticated
  using (
    owner_id = public.agencia_atual()
    and exists(
      select 1 from public.clientes_usuarios
      where cliente_id = clientes.id and usuario_id = auth.uid()
    )
  );


-- ---- clientes_usuarios ----------------------------------------------------
drop policy if exists "clientes_usuarios_staff_all"           on public.clientes_usuarios;
drop policy if exists "clientes_usuarios_self_read"           on public.clientes_usuarios;
drop policy if exists "clientes_usuarios_staff_same_agencia"  on public.clientes_usuarios;

create policy "clientes_usuarios_staff_same_agencia"
  on public.clientes_usuarios for all
  to authenticated
  using (
    public.is_staff()
    and exists(
      select 1 from public.clientes c
      where c.id = clientes_usuarios.cliente_id
        and c.owner_id = public.agencia_atual()
    )
  )
  with check (
    public.is_staff()
    and exists(
      select 1 from public.clientes c
      where c.id = clientes_usuarios.cliente_id
        and c.owner_id = public.agencia_atual()
    )
  );

create policy "clientes_usuarios_self_read"
  on public.clientes_usuarios for select
  to authenticated
  using (usuario_id = auth.uid());


-- ---- projetos -------------------------------------------------------------
drop policy if exists "projetos_staff_all"           on public.projetos;
drop policy if exists "projetos_cliente_read"        on public.projetos;
drop policy if exists "projetos_staff_same_agencia"  on public.projetos;

create policy "projetos_staff_same_agencia"
  on public.projetos for all
  to authenticated
  using (
    public.is_staff()
    and exists(
      select 1 from public.clientes c
      where c.id = projetos.cliente_id
        and c.owner_id = public.agencia_atual()
    )
  )
  with check (
    public.is_staff()
    and exists(
      select 1 from public.clientes c
      where c.id = projetos.cliente_id
        and c.owner_id = public.agencia_atual()
    )
  );

create policy "projetos_cliente_read"
  on public.projetos for select
  to authenticated
  using (public.has_cliente_access(cliente_id));


-- ---- campanhas ------------------------------------------------------------
drop policy if exists "campanhas_staff_all"           on public.campanhas;
drop policy if exists "campanhas_cliente_read"        on public.campanhas;
drop policy if exists "campanhas_staff_same_agencia"  on public.campanhas;

create policy "campanhas_staff_same_agencia"
  on public.campanhas for all
  to authenticated
  using (
    public.is_staff()
    and exists(
      select 1 from public.projetos p
      join public.clientes c on c.id = p.cliente_id
      where p.id = campanhas.projeto_id
        and c.owner_id = public.agencia_atual()
    )
  )
  with check (
    public.is_staff()
    and exists(
      select 1 from public.projetos p
      join public.clientes c on c.id = p.cliente_id
      where p.id = campanhas.projeto_id
        and c.owner_id = public.agencia_atual()
    )
  );

create policy "campanhas_cliente_read"
  on public.campanhas for select
  to authenticated
  using (
    exists(
      select 1 from public.projetos p
      where p.id = campanhas.projeto_id
        and public.has_cliente_access(p.cliente_id)
    )
  );


-- ---- briefings ------------------------------------------------------------
drop policy if exists "briefings_staff_all"           on public.briefings;
drop policy if exists "briefings_cliente_read"        on public.briefings;
drop policy if exists "briefings_staff_same_agencia"  on public.briefings;

create policy "briefings_staff_same_agencia"
  on public.briefings for all
  to authenticated
  using (
    public.is_staff()
    and exists(
      select 1 from public.campanhas ca
      join public.projetos p on p.id = ca.projeto_id
      join public.clientes c on c.id = p.cliente_id
      where ca.id = briefings.campanha_id
        and c.owner_id = public.agencia_atual()
    )
  )
  with check (
    public.is_staff()
    and exists(
      select 1 from public.campanhas ca
      join public.projetos p on p.id = ca.projeto_id
      join public.clientes c on c.id = p.cliente_id
      where ca.id = briefings.campanha_id
        and c.owner_id = public.agencia_atual()
    )
  );

create policy "briefings_cliente_read"
  on public.briefings for select
  to authenticated
  using (
    exists(
      select 1 from public.campanhas ca
      join public.projetos p on p.id = ca.projeto_id
      where ca.id = briefings.campanha_id
        and public.has_cliente_access(p.cliente_id)
    )
  );


-- ---- tarefas --------------------------------------------------------------
drop policy if exists "tarefas_staff_all"           on public.tarefas;
drop policy if exists "tarefas_staff_same_agencia"  on public.tarefas;

create policy "tarefas_staff_same_agencia"
  on public.tarefas for all
  to authenticated
  using (
    public.is_staff()
    and exists(
      select 1 from public.campanhas ca
      join public.projetos p on p.id = ca.projeto_id
      join public.clientes c on c.id = p.cliente_id
      where ca.id = tarefas.campanha_id
        and c.owner_id = public.agencia_atual()
    )
  )
  with check (
    public.is_staff()
    and exists(
      select 1 from public.campanhas ca
      join public.projetos p on p.id = ca.projeto_id
      join public.clientes c on c.id = p.cliente_id
      where ca.id = tarefas.campanha_id
        and c.owner_id = public.agencia_atual()
    )
  );


-- ---- checklist_itens ------------------------------------------------------
drop policy if exists "checklist_staff_all"           on public.checklist_itens;
drop policy if exists "checklist_cliente_read"        on public.checklist_itens;
drop policy if exists "checklist_staff_same_agencia"  on public.checklist_itens;

create policy "checklist_staff_same_agencia"
  on public.checklist_itens for all
  to authenticated
  using (
    public.is_staff()
    and exists(
      select 1 from public.campanhas ca
      join public.projetos p on p.id = ca.projeto_id
      join public.clientes c on c.id = p.cliente_id
      where ca.id = checklist_itens.campanha_id
        and c.owner_id = public.agencia_atual()
    )
  )
  with check (
    public.is_staff()
    and exists(
      select 1 from public.campanhas ca
      join public.projetos p on p.id = ca.projeto_id
      join public.clientes c on c.id = p.cliente_id
      where ca.id = checklist_itens.campanha_id
        and c.owner_id = public.agencia_atual()
    )
  );

create policy "checklist_cliente_read"
  on public.checklist_itens for select
  to authenticated
  using (
    exists(
      select 1 from public.campanhas ca
      join public.projetos p on p.id = ca.projeto_id
      where ca.id = checklist_itens.campanha_id
        and public.has_cliente_access(p.cliente_id)
    )
  );


-- ---- aprovacoes -----------------------------------------------------------
drop policy if exists "aprovacoes_staff_all"            on public.aprovacoes;
drop policy if exists "aprovacoes_cliente_read"         on public.aprovacoes;
drop policy if exists "aprovacoes_cliente_respond"     on public.aprovacoes;
drop policy if exists "aprovacoes_staff_same_agencia"  on public.aprovacoes;

create policy "aprovacoes_staff_same_agencia"
  on public.aprovacoes for all
  to authenticated
  using (
    public.is_staff()
    and exists(
      select 1 from public.campanhas ca
      join public.projetos p on p.id = ca.projeto_id
      join public.clientes c on c.id = p.cliente_id
      where ca.id = aprovacoes.campanha_id
        and c.owner_id = public.agencia_atual()
    )
  )
  with check (
    public.is_staff()
    and exists(
      select 1 from public.campanhas ca
      join public.projetos p on p.id = ca.projeto_id
      join public.clientes c on c.id = p.cliente_id
      where ca.id = aprovacoes.campanha_id
        and c.owner_id = public.agencia_atual()
    )
  );

create policy "aprovacoes_cliente_read"
  on public.aprovacoes for select
  to authenticated
  using (
    exists(
      select 1 from public.campanhas ca
      join public.projetos p on p.id = ca.projeto_id
      where ca.id = aprovacoes.campanha_id
        and public.has_cliente_access(p.cliente_id)
    )
  );

create policy "aprovacoes_cliente_respond"
  on public.aprovacoes for update
  to authenticated
  using (
    status = 'aguardando'
    and exists(
      select 1 from public.campanhas ca
      join public.projetos p on p.id = ca.projeto_id
      join public.clientes c on c.id = p.cliente_id
      where ca.id = aprovacoes.campanha_id
        and c.owner_id = public.agencia_atual()
        and exists(
          select 1 from public.clientes_usuarios
          where cliente_id = c.id and usuario_id = auth.uid()
        )
    )
  )
  with check (
    respondido_por = auth.uid()
    and status in ('aprovada', 'ajustes_solicitados')
  );


-- ---- comentarios ----------------------------------------------------------
drop policy if exists "comentarios_staff_all"           on public.comentarios;
drop policy if exists "comentarios_staff_same_agencia"  on public.comentarios;

create policy "comentarios_staff_same_agencia"
  on public.comentarios for all
  to authenticated
  using (
    public.is_staff()
    and exists(
      select 1 from public.campanhas ca
      join public.projetos p on p.id = ca.projeto_id
      join public.clientes c on c.id = p.cliente_id
      where ca.id = comentarios.campanha_id
        and c.owner_id = public.agencia_atual()
    )
  )
  with check (
    public.is_staff()
    and exists(
      select 1 from public.campanhas ca
      join public.projetos p on p.id = ca.projeto_id
      join public.clientes c on c.id = p.cliente_id
      where ca.id = comentarios.campanha_id
        and c.owner_id = public.agencia_atual()
    )
  );


-- ---- anexos ---------------------------------------------------------------
drop policy if exists "anexos_staff_all"           on public.anexos;
drop policy if exists "anexos_cliente_read"        on public.anexos;
drop policy if exists "anexos_staff_same_agencia"  on public.anexos;

create policy "anexos_staff_same_agencia"
  on public.anexos for all
  to authenticated
  using (
    public.is_staff()
    and case tipo_vinculo
      when 'briefing' then exists(
        select 1 from public.briefings b
        join public.campanhas ca on ca.id = b.campanha_id
        join public.projetos p   on p.id = ca.projeto_id
        join public.clientes c   on c.id = p.cliente_id
        where b.id = anexos.vinculo_id
          and c.owner_id = public.agencia_atual()
      )
      when 'campanha' then exists(
        select 1 from public.campanhas ca
        join public.projetos p on p.id = ca.projeto_id
        join public.clientes c on c.id = p.cliente_id
        where ca.id = anexos.vinculo_id
          and c.owner_id = public.agencia_atual()
      )
      when 'tarefa' then exists(
        select 1 from public.tarefas t
        join public.campanhas ca on ca.id = t.campanha_id
        join public.projetos p   on p.id = ca.projeto_id
        join public.clientes c   on c.id = p.cliente_id
        where t.id = anexos.vinculo_id
          and c.owner_id = public.agencia_atual()
      )
    end
  )
  with check (
    public.is_staff()
    and case tipo_vinculo
      when 'briefing' then exists(
        select 1 from public.briefings b
        join public.campanhas ca on ca.id = b.campanha_id
        join public.projetos p   on p.id = ca.projeto_id
        join public.clientes c   on c.id = p.cliente_id
        where b.id = anexos.vinculo_id
          and c.owner_id = public.agencia_atual()
      )
      when 'campanha' then exists(
        select 1 from public.campanhas ca
        join public.projetos p on p.id = ca.projeto_id
        join public.clientes c on c.id = p.cliente_id
        where ca.id = anexos.vinculo_id
          and c.owner_id = public.agencia_atual()
      )
      when 'tarefa' then exists(
        select 1 from public.tarefas t
        join public.campanhas ca on ca.id = t.campanha_id
        join public.projetos p   on p.id = ca.projeto_id
        join public.clientes c   on c.id = p.cliente_id
        where t.id = anexos.vinculo_id
          and c.owner_id = public.agencia_atual()
      )
    end
  );

create policy "anexos_cliente_read"
  on public.anexos for select
  to authenticated
  using (
    case tipo_vinculo
      when 'briefing' then exists(
        select 1 from public.briefings b
        join public.campanhas ca on ca.id = b.campanha_id
        join public.projetos p   on p.id = ca.projeto_id
        where b.id = anexos.vinculo_id
          and public.has_cliente_access(p.cliente_id)
      )
      when 'campanha' then exists(
        select 1 from public.campanhas ca
        join public.projetos p on p.id = ca.projeto_id
        where ca.id = anexos.vinculo_id
          and public.has_cliente_access(p.cliente_id)
      )
      when 'tarefa' then exists(
        select 1 from public.tarefas t
        join public.campanhas ca on ca.id = t.campanha_id
        join public.projetos p   on p.id = ca.projeto_id
        where t.id = anexos.vinculo_id
          and public.has_cliente_access(p.cliente_id)
      )
    end
  );


-- ===========================================================================
-- 5. TABELA DE CONVITES
-- ===========================================================================

create table if not exists public.convites (
  id           uuid primary key default gen_random_uuid(),
  token        text not null unique,
  email        text not null,
  perfil       public.perfil_usuario not null
                 check (perfil in ('colaborador', 'cliente')),
  agencia_id   uuid not null references public.profiles(id) on delete cascade,
  cliente_id   uuid references public.clientes(id) on delete cascade,
  criado_por   uuid not null references public.profiles(id) on delete cascade,
  expira_em    timestamptz not null default (now() + interval '7 days'),
  aceito_em    timestamptz,
  created_at   timestamptz not null default now()
);

create index if not exists idx_convites_agencia on public.convites(agencia_id);
create index if not exists idx_convites_token   on public.convites(token);

alter table public.convites enable row level security;

drop policy if exists "convites_admin_same_agencia" on public.convites;

-- Admin da agência pode tudo com convites dela.
create policy "convites_admin_same_agencia"
  on public.convites for all
  to authenticated
  using (public.is_admin() and agencia_id = public.agencia_atual())
  with check (public.is_admin() and agencia_id = public.agencia_atual());

-- Função pública para buscar dados básicos de um convite (sem auth).
-- Retorna apenas info necessária pra renderizar a tela de aceite.
create or replace function public.convite_publico(p_token text)
returns table (
  email text,
  perfil public.perfil_usuario,
  agencia_nome text,
  expirado boolean,
  aceito boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    co.email,
    co.perfil,
    p.nome,
    co.expira_em <= now(),
    co.aceito_em is not null
  from public.convites co
  join public.profiles p on p.id = co.agencia_id
  where co.token = p_token
  limit 1
$$;

grant execute on function public.convite_publico(text) to anon, authenticated;


-- ===========================================================================
-- 6. TRIGGER handle_new_user — processar convite ou virar admin
-- ===========================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token        text;
  v_convite      public.convites%rowtype;
  v_nome         text;
  v_perfil       public.perfil_usuario;
  v_agencia_id   uuid;
begin
  v_nome  := coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1));
  v_token := nullif(new.raw_user_meta_data->>'conviteToken', '');

  if v_token is not null then
    select * into v_convite
      from public.convites
      where token = v_token
        and aceito_em is null
        and expira_em > now()
      limit 1;

    if v_convite.id is null then
      raise exception 'Convite inválido ou expirado';
    end if;

    v_perfil     := v_convite.perfil;
    v_agencia_id := v_convite.agencia_id;
  else
    v_perfil     := 'administrador';
    v_agencia_id := new.id;
  end if;

  insert into public.profiles (id, email, nome, perfil, agencia_id)
  values (new.id, new.email, v_nome, v_perfil, v_agencia_id);

  if v_convite.id is not null then
    update public.convites
      set aceito_em = now()
      where id = v_convite.id;

    if v_convite.perfil = 'cliente' and v_convite.cliente_id is not null then
      insert into public.clientes_usuarios (cliente_id, usuario_id)
      values (v_convite.cliente_id, new.id)
      on conflict do nothing;
    end if;
  end if;

  return new;
end;
$$;
