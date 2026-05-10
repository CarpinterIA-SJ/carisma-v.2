-- ============================================================
-- SCHEMA — RCC Barreiras
-- Execute no Supabase: Dashboard > SQL Editor > New query
-- ============================================================

-- PROFILES (estende auth.users)
create table if not exists public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  nome        text not null,
  role        text not null default 'coordenador'
                check (role in ('admin','coordenador','tesoureiro','secretario')),
  grupo_id    text,
  avatar      text,
  status      text not null default 'aprovado'
                check (status in ('pendente','aprovado','rejeitado')),
  created_at  timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Autenticados podem ver perfis"
  on public.profiles for select
  to authenticated using (true);

create policy "Usuário edita próprio perfil"
  on public.profiles for update
  to authenticated using (auth.uid() = id);

create policy "Admins gerenciam perfis"
  on public.profiles for all
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Trigger: cria profile automaticamente no signup.
-- Lê role/grupoId/status do raw_user_meta_data (passados via signUp ou Edge Function).
-- Auto-cadastro entra como 'pendente'; criação pelo admin entra como 'aprovado'.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  admin_emails text[] := array[
    'fabricio.christian@hotmail.com',
    'carpinteria.ia.sj@gmail.com'
  ];
  meta_role text   := new.raw_user_meta_data->>'role';
  meta_grupo text  := new.raw_user_meta_data->>'grupoId';
  meta_status text := new.raw_user_meta_data->>'status';
  user_role text;
  user_status text;
begin
  if new.email = any(admin_emails) then
    user_role := 'admin';
    user_status := 'aprovado';
  else
    user_role := coalesce(meta_role, 'coordenador');
    if user_role not in ('coordenador','tesoureiro','secretario') then
      user_role := 'coordenador';
    end if;
    user_status := coalesce(meta_status, 'pendente');
    if user_status not in ('pendente','aprovado','rejeitado') then
      user_status := 'pendente';
    end if;
  end if;

  insert into public.profiles (id, nome, role, grupo_id, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    user_role,
    meta_grupo,
    user_status
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- GRUPOS
create table if not exists public.grupos (
  id              text primary key,
  nome            text not null,
  descricao       text,
  dia_semana      text,
  horario         text,
  endereco        jsonb,
  coordenador_id  text,
  secretario_id   text,
  tesoureiro_id   text,
  status          text not null default 'pendente'
                    check (status in ('aprovado','pendente','rejeitado')),
  fundado_em      text,
  total_servos    integer default 0,
  paroquia        text,
  created_at      timestamptz default now()
);

alter table public.grupos enable row level security;
create policy "Autenticados podem ver grupos"
  on public.grupos for select to authenticated using (true);
create policy "Anon vê grupos aprovados"
  on public.grupos for select to anon using (status = 'aprovado');
create policy "Admins gerenciam grupos"
  on public.grupos for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- SERVOS
create table if not exists public.servos (
  id                text primary key,
  grupo_id          text references public.grupos(id) on delete cascade,
  nome              text not null,
  email             text,
  telefone          text,
  data_nascimento   text,
  endereco          jsonb,
  funcao            text,
  etapas_formativas text[],
  ministerios       text[],
  avatar            text,
  ingresso_em       text,
  created_at        timestamptz default now()
);

alter table public.servos enable row level security;
create policy "Autenticados podem ver servos"
  on public.servos for select to authenticated using (true);
create policy "Admins gerenciam servos"
  on public.servos for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- MENSALIDADES
create table if not exists public.mensalidades (
  id              text primary key,
  grupo_id        text references public.grupos(id) on delete cascade,
  mes             integer not null,
  ano             integer not null,
  valor           numeric(10,2) not null,
  vencimento      text,
  status          text not null default 'pendente'
                    check (status in ('pago','pendente','atrasado','validacao')),
  tipo            varchar(50) not null default 'mensalidade'
                    check (tipo in ('mensalidade','taxa_evento','contribuicao_especial','taxa_formacao','outro')),
  descricao       varchar(255),
  data_pagamento  text,
  comprovante_url text,
  created_at      timestamptz default now()
);

alter table public.mensalidades enable row level security;
create policy "Autenticados podem ver mensalidades"
  on public.mensalidades for select to authenticated using (true);
create policy "Admins gerenciam mensalidades"
  on public.mensalidades for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- RECIBOS
create table if not exists public.recibos (
  id          text primary key,
  codigo      text not null,
  servo_id    text,
  grupo_id    text references public.grupos(id) on delete cascade,
  valor       numeric(10,2) not null,
  descricao   text,
  emitido_em  text,
  created_at  timestamptz default now()
);

alter table public.recibos enable row level security;
create policy "Autenticados podem ver recibos"
  on public.recibos for select to authenticated using (true);
create policy "Admins gerenciam recibos"
  on public.recibos for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- EVENTOS
create table if not exists public.eventos (
  id          text primary key,
  titulo      text not null,
  descricao   text,
  tipo        text,
  status      text not null default 'agendado'
                check (status in ('agendado','em_andamento','concluido','cancelado')),
  data        text,
  hora_inicio text,
  hora_fim    text,
  local       text,
  cidade      text,
  vagas       integer,
  inscritos   text[],
  organizador text,
  created_at  timestamptz default now()
);

alter table public.eventos enable row level security;
create policy "Autenticados podem ver eventos"
  on public.eventos for select to authenticated using (true);
create policy "Admins gerenciam eventos"
  on public.eventos for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
