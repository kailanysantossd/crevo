-- ============================================================================
-- Crevo — Schema inicial
-- ============================================================================
-- Cria todas as tabelas, enums, triggers e políticas de segurança (RLS)
-- para o MVP da plataforma de gestão de campanhas publicitárias.
--
-- Rodar uma vez no SQL Editor do Supabase.
-- ============================================================================


-- ===========================================================================
-- 1. ENUMS (listas fixas de valores válidos)
-- ===========================================================================

create type public.perfil_usuario as enum (
  'administrador',
  'colaborador',
  'cliente'
);

create type public.status_campanha as enum (
  'rascunho',
  'briefing_aprovado',
  'planejamento',
  'em_producao',
  'aguardando_aprovacao',
  'aprovada',
  'agendada',
  'publicada',
  'concluida',
  'pausada',
  'cancelada',
  'arquivada'
);

create type public.etapa_tarefa as enum (
  'briefing',
  'planejamento',
  'producao',
  'revisao',
  'aprovacao',
  'publicacao',
  'conclusao'
);

create type public.status_tarefa as enum (
  'pendente',
  'em_andamento',
  'concluida'
);

create type public.status_aprovacao as enum (
  'aguardando',
  'aprovada',
  'ajustes_solicitados'
);

create type public.tipo_vinculo_anexo as enum (
  'briefing',
  'campanha',
  'tarefa'
);

create type public.tipo_notificacao as enum (
  'tarefa_atribuida',
  'status_campanha',
  'aprovacao_cliente'
);


-- ===========================================================================
-- 2. TABELAS
-- ===========================================================================

-- profiles: estende auth.users do Supabase com dados do app
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  nome         text not null,
  email        text not null unique,
  perfil       public.perfil_usuario not null default 'colaborador',
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.clientes (
  id              uuid primary key default gen_random_uuid(),
  nome            text not null,
  empresa         text,
  email_contato   text,
  telefone        text,
  observacoes     text,
  arquivado       boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Join: quais usuários "cliente" enxergam quais clientes
create table public.clientes_usuarios (
  cliente_id  uuid not null references public.clientes(id) on delete cascade,
  usuario_id  uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (cliente_id, usuario_id)
);

create table public.projetos (
  id          uuid primary key default gen_random_uuid(),
  cliente_id  uuid not null references public.clientes(id) on delete cascade,
  nome        text not null,
  descricao   text,
  arquivado   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.campanhas (
  id              uuid primary key default gen_random_uuid(),
  projeto_id      uuid not null references public.projetos(id) on delete cascade,
  nome            text not null,
  status          public.status_campanha not null default 'rascunho',
  canal           text,
  responsavel_id  uuid references public.profiles(id) on delete set null,
  data_inicio     date,
  data_entrega    date,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table public.briefings (
  id                  uuid primary key default gen_random_uuid(),
  campanha_id         uuid not null unique references public.campanhas(id) on delete cascade,
  objetivo            text,
  publico_alvo        text,
  canais_divulgacao   text,
  mensagem_principal  text,
  orcamento_estimado  numeric(12, 2),
  data_inicio         date,
  data_entrega        date,
  referencias         text,
  observacoes         text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table public.tarefas (
  id              uuid primary key default gen_random_uuid(),
  campanha_id     uuid not null references public.campanhas(id) on delete cascade,
  titulo          text not null,
  etapa           public.etapa_tarefa not null default 'briefing',
  responsavel_id  uuid references public.profiles(id) on delete set null,
  prazo           date,
  status          public.status_tarefa not null default 'pendente',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table public.checklist_itens (
  id           uuid primary key default gen_random_uuid(),
  campanha_id  uuid not null references public.campanhas(id) on delete cascade,
  texto        text not null,
  concluido    boolean not null default false,
  ordem        integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.aprovacoes (
  id                  uuid primary key default gen_random_uuid(),
  campanha_id         uuid not null references public.campanhas(id) on delete cascade,
  enviado_por         uuid not null references public.profiles(id) on delete set null,
  data_envio          timestamptz not null default now(),
  status              public.status_aprovacao not null default 'aguardando',
  respondido_por      uuid references public.profiles(id) on delete set null,
  data_resposta       timestamptz,
  comentario_cliente  text
);

create table public.comentarios (
  id           uuid primary key default gen_random_uuid(),
  campanha_id  uuid not null references public.campanhas(id) on delete cascade,
  autor_id     uuid not null references public.profiles(id) on delete set null,
  texto        text not null,
  created_at   timestamptz not null default now()
);

create table public.anexos (
  id             uuid primary key default gen_random_uuid(),
  tipo_vinculo   public.tipo_vinculo_anexo not null,
  vinculo_id     uuid not null,
  nome_arquivo   text not null,
  url_storage    text not null,
  tipo_mime      text,
  tamanho_bytes  bigint,
  enviado_por    uuid not null references public.profiles(id) on delete set null,
  created_at     timestamptz not null default now()
);

create table public.notificacoes (
  id           uuid primary key default gen_random_uuid(),
  usuario_id   uuid not null references public.profiles(id) on delete cascade,
  tipo         public.tipo_notificacao not null,
  titulo       text not null,
  mensagem     text,
  link         text,
  lida         boolean not null default false,
  created_at   timestamptz not null default now()
);


-- ===========================================================================
-- 3. ÍNDICES
-- ===========================================================================

create index idx_projetos_cliente          on public.projetos(cliente_id);
create index idx_campanhas_projeto         on public.campanhas(projeto_id);
create index idx_campanhas_status          on public.campanhas(status);
create index idx_campanhas_responsavel     on public.campanhas(responsavel_id);
create index idx_tarefas_campanha          on public.tarefas(campanha_id);
create index idx_tarefas_responsavel       on public.tarefas(responsavel_id);
create index idx_tarefas_prazo             on public.tarefas(prazo);
create index idx_checklist_campanha        on public.checklist_itens(campanha_id);
create index idx_aprovacoes_campanha       on public.aprovacoes(campanha_id);
create index idx_comentarios_campanha      on public.comentarios(campanha_id);
create index idx_anexos_vinculo            on public.anexos(tipo_vinculo, vinculo_id);
create index idx_notificacoes_nao_lidas    on public.notificacoes(usuario_id, lida)
  where lida = false;


-- ===========================================================================
-- 4. TRIGGER — atualizar updated_at automaticamente
-- ===========================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger trg_clientes_updated_at
  before update on public.clientes
  for each row execute function public.set_updated_at();

create trigger trg_projetos_updated_at
  before update on public.projetos
  for each row execute function public.set_updated_at();

create trigger trg_campanhas_updated_at
  before update on public.campanhas
  for each row execute function public.set_updated_at();

create trigger trg_briefings_updated_at
  before update on public.briefings
  for each row execute function public.set_updated_at();

create trigger trg_tarefas_updated_at
  before update on public.tarefas
  for each row execute function public.set_updated_at();

create trigger trg_checklist_itens_updated_at
  before update on public.checklist_itens
  for each row execute function public.set_updated_at();


-- ===========================================================================
-- 5. TRIGGER — criar profile automático ao cadastrar usuário no Auth
-- ===========================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, nome, perfil)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    coalesce(
      nullif(new.raw_user_meta_data->>'perfil', '')::public.perfil_usuario,
      'colaborador'
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ===========================================================================
-- 6. FUNÇÕES AUXILIARES PARA RLS
-- ===========================================================================

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
  select
    public.is_staff()
    or exists(
      select 1 from public.clientes_usuarios
      where cliente_id = cid and usuario_id = auth.uid()
    )
$$;


-- ===========================================================================
-- 7. ATIVAR RLS EM TODAS AS TABELAS
-- ===========================================================================

alter table public.profiles          enable row level security;
alter table public.clientes          enable row level security;
alter table public.clientes_usuarios enable row level security;
alter table public.projetos          enable row level security;
alter table public.campanhas         enable row level security;
alter table public.briefings         enable row level security;
alter table public.tarefas           enable row level security;
alter table public.checklist_itens   enable row level security;
alter table public.aprovacoes        enable row level security;
alter table public.comentarios       enable row level security;
alter table public.anexos            enable row level security;
alter table public.notificacoes      enable row level security;


-- ===========================================================================
-- 8. POLÍTICAS DE RLS
-- ===========================================================================

-- ---- profiles -------------------------------------------------------------
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_admin_all"
  on public.profiles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---- clientes -------------------------------------------------------------
create policy "clientes_staff_all"
  on public.clientes for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "clientes_cliente_read"
  on public.clientes for select
  to authenticated
  using (
    exists(
      select 1 from public.clientes_usuarios
      where cliente_id = clientes.id and usuario_id = auth.uid()
    )
  );

-- ---- clientes_usuarios ----------------------------------------------------
create policy "clientes_usuarios_staff_all"
  on public.clientes_usuarios for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "clientes_usuarios_self_read"
  on public.clientes_usuarios for select
  to authenticated
  using (usuario_id = auth.uid());

-- ---- projetos -------------------------------------------------------------
create policy "projetos_staff_all"
  on public.projetos for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "projetos_cliente_read"
  on public.projetos for select
  to authenticated
  using (public.has_cliente_access(cliente_id));

-- ---- campanhas ------------------------------------------------------------
create policy "campanhas_staff_all"
  on public.campanhas for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

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
create policy "briefings_staff_all"
  on public.briefings for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "briefings_cliente_read"
  on public.briefings for select
  to authenticated
  using (
    exists(
      select 1 from public.campanhas c
      join public.projetos p on p.id = c.projeto_id
      where c.id = briefings.campanha_id
        and public.has_cliente_access(p.cliente_id)
    )
  );

-- ---- tarefas --------------------------------------------------------------
create policy "tarefas_staff_all"
  on public.tarefas for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- ---- checklist_itens ------------------------------------------------------
create policy "checklist_staff_all"
  on public.checklist_itens for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "checklist_cliente_read"
  on public.checklist_itens for select
  to authenticated
  using (
    exists(
      select 1 from public.campanhas c
      join public.projetos p on p.id = c.projeto_id
      where c.id = checklist_itens.campanha_id
        and public.has_cliente_access(p.cliente_id)
    )
  );

-- ---- aprovacoes -----------------------------------------------------------
create policy "aprovacoes_staff_all"
  on public.aprovacoes for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "aprovacoes_cliente_read"
  on public.aprovacoes for select
  to authenticated
  using (
    exists(
      select 1 from public.campanhas c
      join public.projetos p on p.id = c.projeto_id
      where c.id = aprovacoes.campanha_id
        and public.has_cliente_access(p.cliente_id)
    )
  );

create policy "aprovacoes_cliente_respond"
  on public.aprovacoes for update
  to authenticated
  using (
    status = 'aguardando'
    and exists(
      select 1 from public.campanhas c
      join public.projetos p on p.id = c.projeto_id
      where c.id = aprovacoes.campanha_id
        and exists(
          select 1 from public.clientes_usuarios
          where cliente_id = p.cliente_id and usuario_id = auth.uid()
        )
    )
  )
  with check (
    respondido_por = auth.uid()
    and status in ('aprovada', 'ajustes_solicitados')
  );

-- ---- comentarios ----------------------------------------------------------
create policy "comentarios_staff_all"
  on public.comentarios for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- ---- anexos ---------------------------------------------------------------
create policy "anexos_staff_all"
  on public.anexos for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "anexos_cliente_read"
  on public.anexos for select
  to authenticated
  using (
    case tipo_vinculo
      when 'briefing' then exists(
        select 1 from public.briefings b
        join public.campanhas c on c.id = b.campanha_id
        join public.projetos p   on p.id = c.projeto_id
        where b.id = anexos.vinculo_id
          and public.has_cliente_access(p.cliente_id)
      )
      when 'campanha' then exists(
        select 1 from public.campanhas c
        join public.projetos p on p.id = c.projeto_id
        where c.id = anexos.vinculo_id
          and public.has_cliente_access(p.cliente_id)
      )
      when 'tarefa' then exists(
        select 1 from public.tarefas t
        join public.campanhas c on c.id = t.campanha_id
        join public.projetos p   on p.id = c.projeto_id
        where t.id = anexos.vinculo_id
          and public.has_cliente_access(p.cliente_id)
      )
    end
  );

-- ---- notificacoes ---------------------------------------------------------
create policy "notificacoes_own_read"
  on public.notificacoes for select
  to authenticated
  using (usuario_id = auth.uid());

create policy "notificacoes_own_update"
  on public.notificacoes for update
  to authenticated
  using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid());

create policy "notificacoes_staff_insert"
  on public.notificacoes for insert
  to authenticated
  with check (public.is_staff());
