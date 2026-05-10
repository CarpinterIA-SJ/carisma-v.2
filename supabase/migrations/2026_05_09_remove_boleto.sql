-- Remove suporte a boleto. Renomeia boleto_url -> comprovante_url e dropa codigo_barras.
-- Aplicar no Supabase via SQL Editor após deploy do código novo.

alter table public.mensalidades
  rename column boleto_url to comprovante_url;

alter table public.mensalidades
  drop column if exists codigo_barras;
