-- Converte etapa_formativa (text, valor único) em etapas_formativas (text[], multi-seleção).
-- Valores antigos não migram para o novo conjunto de opções; viram array vazio.
-- Aplicar no Supabase via SQL Editor após deploy do código novo.

alter table public.servos
  add column if not exists etapas_formativas text[] default '{}'::text[];

update public.servos
  set etapas_formativas = '{}'::text[]
  where etapas_formativas is null;

alter table public.servos
  drop column if exists etapa_formativa;
