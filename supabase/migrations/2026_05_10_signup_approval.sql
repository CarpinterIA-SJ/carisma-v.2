-- Auto-cadastro com aprovação pelo admin.
-- Adiciona profiles.status; reescreve trigger handle_new_user para ler role/grupo/status do raw_user_meta_data.
-- Aplicar no Supabase via SQL Editor após deploy do código novo.

alter table public.profiles
  add column if not exists status text not null default 'aprovado'
    check (status in ('pendente','aprovado','rejeitado'));

-- Marca explicitamente todos os perfis existentes como aprovados.
update public.profiles set status = 'aprovado' where status is null;

-- Política: admins podem ler todos os perfis (já existia para authenticated; reforça).
-- Política: admins podem atualizar status / role / grupo_id de qualquer perfil.
drop policy if exists "Admins gerenciam perfis" on public.profiles;
create policy "Admins gerenciam perfis"
  on public.profiles for all
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

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

-- Tela pública de cadastro precisa listar grupos aprovados sem sessão.
drop policy if exists "Anon vê grupos aprovados" on public.grupos;
create policy "Anon vê grupos aprovados"
  on public.grupos for select
  to anon
  using (status = 'aprovado');
