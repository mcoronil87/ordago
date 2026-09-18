-- =========================================================
-- Órdago · esquema de base de datos
-- ---------------------------------------------------------
-- Pega todo esto en Supabase → SQL Editor → New query → Run
-- =========================================================

-- Un único almacén de documentos. Cada fila es un documento
-- identificado por su colección y su id, con el contenido en JSON.
create table if not exists public.documentos (
  coll         text        not null,
  id           text        not null,
  data         jsonb       not null,
  actualizado  timestamptz not null default now(),
  primary key (coll, id)
);

-- Índice para listar una colección rápido (clasificaciones, jugadores…)
create index if not exists documentos_coll_idx on public.documentos (coll);

-- ---------------------------------------------------------
-- Permisos
-- ---------------------------------------------------------
alter table public.documentos enable row level security;

-- El juego no tiene login: todo el mundo que llegue con la clave
-- anon puede leer y escribir. Es lo que permite jugar sin registro.
-- Para un grupo de amigos es razonable; ten en cuenta que quien
-- conozca el código de un grupo puede escribir en él.
drop policy if exists "lectura abierta" on public.documentos;
create policy "lectura abierta"
  on public.documentos for select
  using (true);

drop policy if exists "escritura abierta" on public.documentos;
create policy "escritura abierta"
  on public.documentos for insert
  with check (true);

drop policy if exists "actualizacion abierta" on public.documentos;
create policy "actualizacion abierta"
  on public.documentos for update
  using (true) with check (true);

drop policy if exists "borrado abierto" on public.documentos;
create policy "borrado abierto"
  on public.documentos for delete
  using (true);

-- ---------------------------------------------------------
-- Opcional: un freno para que nadie llene la base de datos
-- ---------------------------------------------------------
-- Descomenta si te preocupa el abuso. Limita el tamaño de cada
-- documento a 8 KB, más que de sobra para una partida.
--
-- alter table public.documentos
--   add constraint documento_no_enorme
--   check (pg_column_size(data) < 8192);

-- ---------------------------------------------------------
-- Comprobación rápida: debería devolver 0 filas y ningún error
-- ---------------------------------------------------------
select count(*) as documentos_guardados from public.documentos;
