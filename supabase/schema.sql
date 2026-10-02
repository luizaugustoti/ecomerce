-- =====================================================================
-- Lumis Star — Schema Supabase (PostgreSQL + RLS + Storage)
-- Execute no SQL Editor do Supabase. O seed.sql contém dados de demonstração legados.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Administradores (quem pode acessar o painel)
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------
-- Produtos
-- tipo_pele / beneficio: chaves separadas por vírgula (ex.: "oleosa,mista")
-- volume_tom: opções separadas por vírgula; tons podem levar a cor (ex.: "Clara #F1D3BC")
-- modo_uso: um passo por linha
-- linha / dicas: colunas extras usadas pela vitrine (filtro por linha e "Dicas do especialista")
-- ---------------------------------------------------------------------
create table if not exists public.produtos (
  id                uuid primary key default gen_random_uuid(),
  nome              text not null check (char_length(nome) between 2 and 120),
  slug              text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  preco             numeric(10,2) not null check (preco >= 0),
  preco_promocional numeric(10,2) check (preco_promocional is null or (preco_promocional >= 0 and preco_promocional < preco)),
  categoria         text not null check (categoria in ('skincare','cabelos','maquiagem','gloss','perfumes','kits','promocoes')),
  linha             text check (linha is null or linha in ('facial','corporal','capilar')),
  tipo_pele         text,
  beneficio         text,
  volume_tom        text,
  descricao         text,
  modo_uso          text,
  ingredientes      text,
  dicas             text,
  imagem_url        text,
  video_url         text,
  ativo             boolean not null default true,
  created_at        timestamptz not null default now()
);
update public.produtos
   set categoria = case
     when lower(trim(categoria)) in ('séruns','seruns','hidratantes','tônicos','tonicos') then 'skincare'
     when lower(trim(categoria)) in ('óleos','oleos') then 'cabelos'
     else categoria
   end
 where lower(trim(categoria)) in ('séruns','seruns','hidratantes','tônicos','tonicos','óleos','oleos');
alter table public.produtos drop constraint if exists produtos_categoria_check;
alter table public.produtos add constraint produtos_categoria_check
  check (categoria in ('skincare','cabelos','maquiagem','gloss','perfumes','kits','promocoes'));
create index if not exists produtos_categoria_idx on public.produtos (categoria);

-- ---------------------------------------------------------------------
-- Estoque (1 linha por produto)
-- ---------------------------------------------------------------------
create table if not exists public.estoque (
  id            uuid primary key default gen_random_uuid(),
  produto_id    uuid not null unique references public.produtos (id) on delete cascade,
  quantidade    integer not null default 0 check (quantidade >= 0),
  alerta_minimo integer not null default 5 check (alerta_minimo >= 0)
);

create or replace function public.produtos_cria_estoque()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.estoque (produto_id) values (new.id) on conflict (produto_id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_produtos_cria_estoque on public.produtos;
create trigger trg_produtos_cria_estoque
  after insert on public.produtos
  for each row execute function public.produtos_cria_estoque();

-- ---------------------------------------------------------------------
-- Pedidos
-- itens_json: [{ produto_id, slug, nome, variante, qtd, preco_unitario, subtotal }]
-- ---------------------------------------------------------------------
create table if not exists public.pedidos (
  id               uuid primary key default gen_random_uuid(),
  cliente_id       uuid references auth.users (id) on delete set null,
  cliente_nome     text not null,
  cliente_email    text not null,
  cliente_cpf      text,
  cliente_telefone text,
  endereco_json    jsonb not null,
  itens_json       jsonb not null,
  valor_subtotal   numeric(10,2) not null,
  valor_frete      numeric(10,2) not null default 0,
  cupom            text,
  valor_total      numeric(10,2) not null,
  metodo_pagamento text not null check (metodo_pagamento in ('pix','cartao','boleto')),
  status           text not null default 'pendente'
                   check (status in ('pendente','pago','em_separacao','enviado','entregue','cancelado')),
  codigo_rastreio  text,
  created_at       timestamptz not null default now()
);
alter table public.pedidos add column if not exists cliente_id uuid references auth.users (id) on delete set null;
create index if not exists pedidos_cliente_id_idx on public.pedidos (cliente_id);
create index if not exists pedidos_created_at_idx on public.pedidos (created_at desc);

-- ---------------------------------------------------------------------
-- Transações financeiras
-- ---------------------------------------------------------------------
create table if not exists public.transacoes_financeiras (
  id         uuid primary key default gen_random_uuid(),
  pedido_id  uuid not null references public.pedidos (id) on delete cascade,
  tipo       text not null default 'receita' check (tipo in ('receita')),
  valor      numeric(10,2) not null,
  status     text not null default 'pendente' check (status in ('pendente','confirmada','cancelada')),
  created_at timestamptz not null default now()
);
create index if not exists transacoes_pedido_idx on public.transacoes_financeiras (pedido_id);

-- Mantém transação e estoque coerentes quando o status do pedido muda
create or replace function public.pedidos_status_sync()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_item jsonb;
  v_sinal int := 0;
begin
  if new.status is distinct from old.status then
    if new.status = 'cancelado' and old.status in ('enviado','entregue') then
      raise exception 'Pedidos enviados ou entregues não podem ser cancelados por este fluxo.';
    end if;

    if not (
      (old.status = 'pendente' and new.status in ('pago','cancelado')) or
      (old.status = 'pago' and new.status in ('em_separacao','cancelado')) or
      (old.status = 'em_separacao' and new.status in ('enviado','cancelado')) or
      (old.status = 'enviado' and new.status = 'entregue') or
      (old.status = 'cancelado' and new.status = 'pendente')
    ) then
      raise exception 'Transição de status inválida: % para %.', old.status, new.status;
    end if;

    if new.status in ('em_separacao','enviado','entregue') and not exists (
      select 1 from public.transacoes_financeiras
       where pedido_id = new.id and status = 'confirmada'
    ) then
      raise exception 'O pagamento precisa estar confirmado antes do envio do pedido.';
    end if;

    if new.status = 'cancelado' then v_sinal := 1;          -- devolve ao estoque
    elsif old.status = 'cancelado' then v_sinal := -1;      -- reativado: abate de novo
    end if;

    if v_sinal <> 0 then
      for v_item in select * from jsonb_array_elements(old.itens_json) loop
        update public.estoque
           set quantidade = quantidade + v_sinal * (v_item->>'qtd')::int
         where produto_id = (v_item->>'produto_id')::uuid;
      end loop;
    end if;

    update public.transacoes_financeiras
       set status = case new.status when 'cancelado' then 'cancelada'
                          when 'pago' then 'confirmada'
                          when 'pendente' then 'pendente'
                          else status end
     where pedido_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_pedidos_status on public.pedidos;
create trigger trg_pedidos_status
  after update of status on public.pedidos
  for each row execute function public.pedidos_status_sync();

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.admins                 enable row level security;
alter table public.produtos               enable row level security;
alter table public.estoque                enable row level security;
alter table public.pedidos                enable row level security;
alter table public.transacoes_financeiras enable row level security;

-- admins: cada usuário só enxerga o próprio registro (usado pelo painel para checar acesso)
drop policy if exists admins_self on public.admins;
create policy admins_self on public.admins for select to authenticated using (user_id = auth.uid());

-- produtos: vitrine lê apenas ativos; admin faz tudo
drop policy if exists produtos_leitura on public.produtos;
create policy produtos_leitura on public.produtos for select using (ativo or public.is_admin());
drop policy if exists produtos_admin on public.produtos;
create policy produtos_admin on public.produtos for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- estoque: vitrine lê saldo de produtos ativos (para exibir "esgotado"); admin faz tudo
drop policy if exists estoque_leitura on public.estoque;
create policy estoque_leitura on public.estoque for select
  using (public.is_admin() or exists (select 1 from public.produtos p where p.id = produto_id and p.ativo));
drop policy if exists estoque_admin on public.estoque;
create policy estoque_admin on public.estoque for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- pedidos e transações: somente admin (clientes criam pedidos apenas via função criar_pedido)
drop policy if exists pedidos_admin on public.pedidos;
create policy pedidos_admin on public.pedidos for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists pedidos_cliente_select on public.pedidos;
create policy pedidos_cliente_select on public.pedidos for select to authenticated
  using (cliente_id = auth.uid());
drop policy if exists transacoes_admin on public.transacoes_financeiras;
create policy transacoes_admin on public.transacoes_financeiras for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
-- Funções públicas (RPC)
-- =====================================================================

-- Catálogo da vitrine: produtos ativos + saldo + total vendido (ordenado por mais vendidos)
create or replace function public.catalogo_publico()
returns jsonb
language sql stable security definer set search_path = public
as $$
  select coalesce(jsonb_agg(
           to_jsonb(p) || jsonb_build_object('estoque', coalesce(e.quantidade, 0), 'vendidos', coalesce(v.qtd, 0))
           order by coalesce(v.qtd, 0) desc, p.created_at desc), '[]'::jsonb)
    from public.produtos p
    left join public.estoque e on e.produto_id = p.id
    left join (
      select (i->>'produto_id')::uuid as produto_id, sum((i->>'qtd')::int) as qtd
        from public.pedidos, jsonb_array_elements(itens_json) i
       where status <> 'cancelado'
       group by 1
    ) v on v.produto_id = p.id
   where p.ativo;
$$;

-- Métricas agregadas do painel sem truncamento do limite de linhas da API.
create or replace function public.dashboard_financeiro()
returns jsonb
language plpgsql stable security invoker set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Acesso restrito a administradores.' using errcode = '42501';
  end if;

  return (
    select jsonb_build_object(
      'receita_confirmada', coalesce(sum(valor) filter (where status = 'confirmada'), 0),
      'receita_pendente', coalesce(sum(valor) filter (where status = 'pendente'), 0),
      'pedidos_pagos', count(distinct pedido_id) filter (where status = 'confirmada'),
      'pedidos_total', (select count(*) from public.pedidos),
      'pedidos_status', coalesce((
        select jsonb_object_agg(status, total)
          from (select status, count(*) as total from public.pedidos group by status) p
      ), '{}'::jsonb)
    )
    from public.transacoes_financeiras
  );
end;
$$;

-- Checkout: cria pedido + abate estoque + registra transação em UMA transação atômica.
-- Preços, frete e descontos são recalculados aqui; valores enviados pelo navegador são ignorados.
create or replace function public.criar_pedido(payload jsonb)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_cliente   jsonb := coalesce(payload->'cliente', '{}'::jsonb);
  v_end       jsonb := coalesce(payload->'endereco', '{}'::jsonb);
  v_metodo    text  := payload->>'metodo_pagamento';
  v_tipo_frete text := coalesce(payload->>'frete', 'economica');
  v_cupom     text  := nullif(upper(trim(payload->>'cupom')), '');
  v_cep       text  := regexp_replace(coalesce(v_end->>'cep', ''), '\D', '', 'g');
  v_item      jsonb;
  v_prod      record;
  v_qtd       int;
  v_itens     jsonb := '[]'::jsonb;
  v_subtotal  numeric(10,2) := 0;
  v_desconto  numeric(10,2) := 0;
  v_pix       numeric(10,2) := 0;
  v_frete     numeric(10,2);
  v_total     numeric(10,2);
  v_regiao    int;
  v_pedido_id uuid;
begin
  if v_metodo is null or v_metodo not in ('pix','cartao','boleto') then
    raise exception 'Forma de pagamento inválida.';
  end if;
  if length(v_cep) <> 8 then
    raise exception 'CEP inválido.';
  end if;
  if char_length(trim(coalesce(v_cliente->>'nome', ''))) < 3
     or coalesce(v_cliente->>'email', '') !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Dados do cliente incompletos.';
  end if;
  if jsonb_typeof(payload->'itens') is distinct from 'array'
     or jsonb_array_length(payload->'itens') = 0
     or jsonb_array_length(payload->'itens') > 50 then
    raise exception 'Carrinho vazio ou inválido.';
  end if;

  for v_item in select * from jsonb_array_elements(payload->'itens') loop
    v_qtd := (v_item->>'qtd')::int;
    if v_qtd is null or v_qtd < 1 or v_qtd > 99 then
      raise exception 'Quantidade inválida.';
    end if;

    select p.id, p.nome, p.slug, coalesce(p.preco_promocional, p.preco) as preco, e.quantidade
      into v_prod
      from public.produtos p
      join public.estoque e on e.produto_id = p.id
     where p.slug = v_item->>'slug' and p.ativo
       for update of e;

    if not found then
      raise exception 'Produto indisponível: %.', coalesce(v_item->>'slug', '?');
    end if;
    if v_prod.quantidade < v_qtd then
      raise exception 'Estoque insuficiente para "%" (disponível: %).', v_prod.nome, v_prod.quantidade;
    end if;

    update public.estoque set quantidade = quantidade - v_qtd where produto_id = v_prod.id;

    v_subtotal := v_subtotal + v_prod.preco * v_qtd;
    v_itens := v_itens || jsonb_build_object(
      'produto_id', v_prod.id, 'slug', v_prod.slug, 'nome', v_prod.nome,
      'variante', left(v_item->>'variante', 60), 'qtd', v_qtd,
      'preco_unitario', v_prod.preco, 'subtotal', v_prod.preco * v_qtd);
  end loop;

  -- Cupons válidos (mantenha em sincronia com BRAND.coupons em assets/js/data.js)
  if v_cupom is not null then
    if v_cupom = 'BEMVINDO10' then v_desconto := round(v_subtotal * 0.10, 2);
    else raise exception 'Cupom inválido.';
    end if;
  end if;

  -- Frete por região (1º dígito do CEP). Grátis na econômica acima de R$ 199.
  v_regiao := substr(v_cep, 1, 1)::int + 1;
  v_frete := case v_tipo_frete
    when 'economica' then case when v_subtotal >= 199 then 0
                               else (array[18.9,18.9,19.9,19.9,24.9,24.9,29.9,22.9,19.9,19.9])[v_regiao] end
    when 'expressa'  then (array[29.9,29.9,32.9,32.9,42.9,42.9,54.9,39.9,34.9,36.9])[v_regiao]
  end;
  if v_frete is null then
    raise exception 'Forma de envio inválida.';
  end if;

  if v_metodo = 'pix' then
    v_pix := round((v_subtotal - v_desconto) * 0.05, 2);
  end if;
  v_total := v_subtotal - v_desconto - v_pix + v_frete;

  insert into public.pedidos (
    cliente_id, cliente_nome, cliente_email, cliente_cpf, cliente_telefone,
    endereco_json, itens_json, valor_subtotal, valor_frete, cupom, valor_total,
    metodo_pagamento, status)
  values (
    auth.uid(),
    left(trim(v_cliente->>'nome'), 120),
    lower(left(trim(v_cliente->>'email'), 160)),
    left(regexp_replace(coalesce(v_cliente->>'cpf', ''), '\D', '', 'g'), 11),
    left(regexp_replace(coalesce(v_cliente->>'telefone', ''), '\D', '', 'g'), 13),
    jsonb_build_object(
      'cep', v_cep,
      'rua', left(v_end->>'rua', 160), 'numero', left(v_end->>'numero', 20),
      'complemento', left(v_end->>'complemento', 80), 'bairro', left(v_end->>'bairro', 80),
      'cidade', left(v_end->>'cidade', 80), 'uf', upper(left(v_end->>'uf', 2))),
    v_itens, v_subtotal, v_frete, v_cupom, v_total, v_metodo, 'pendente')
  returning id into v_pedido_id;

  insert into public.transacoes_financeiras (pedido_id, tipo, valor, status)
  values (v_pedido_id, 'receita', v_total, 'pendente');

  return jsonb_build_object('id', v_pedido_id, 'subtotal', v_subtotal,
                            'desconto', v_desconto + v_pix, 'frete', v_frete, 'total', v_total);
end;
$$;

revoke all on function public.criar_pedido(jsonb) from public;
revoke all on function public.catalogo_publico() from public;
revoke all on function public.dashboard_financeiro() from public, anon;
revoke all on function public.produtos_cria_estoque() from public, anon, authenticated;
revoke all on function public.pedidos_status_sync() from public, anon, authenticated;
grant execute on function public.criar_pedido(jsonb)  to anon, authenticated;
grant execute on function public.catalogo_publico()   to anon, authenticated;
grant execute on function public.dashboard_financeiro() to authenticated;
grant execute on function public.is_admin()           to anon, authenticated;

-- =====================================================================
-- Storage: bucket público "produtos-midia" (somente imagens, até 5 MB)
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('produtos-midia', 'produtos-midia', true, 5242880,
        array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Leitura é pública pela URL do bucket; listagem e escrita apenas para admins
drop policy if exists "produtos-midia admin select" on storage.objects;
create policy "produtos-midia admin select" on storage.objects for select to authenticated
  using (bucket_id = 'produtos-midia' and public.is_admin());
drop policy if exists "produtos-midia admin insert" on storage.objects;
create policy "produtos-midia admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'produtos-midia' and public.is_admin());
drop policy if exists "produtos-midia admin update" on storage.objects;
create policy "produtos-midia admin update" on storage.objects for update to authenticated
  using (bucket_id = 'produtos-midia' and public.is_admin());
drop policy if exists "produtos-midia admin delete" on storage.objects;
create policy "produtos-midia admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'produtos-midia' and public.is_admin());

-- =====================================================================
-- Primeiro acesso ao painel:
-- 1) Authentication → Users → "Add user" (e-mail + senha) e desative "Allow new users to sign up".
-- 2) Rode (trocando o e-mail):
--    insert into public.admins (user_id) select id from auth.users where email = 'dona@botanicabella.com.br';
-- =====================================================================
