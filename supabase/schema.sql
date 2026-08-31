-- =========================================================
-- Wedding_Pame — Esquema Supabase
-- Tabla de confirmaciones (RSVP) + políticas de seguridad
-- =========================================================

-- Habilitar extensión para generar UUIDs (ya viene activa por defecto en Supabase)
create extension if not exists "pgcrypto" with schema extensions;

-- Tabla de confirmaciones de invitados
-- Cualquier visitante puede insertar; solo usuarios autenticados pueden leer/modificar.
create table if not exists public.rsvp (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  attendance text not null check (attendance in ('yes', 'no')),
  dietary text,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger para mantener updated_at sincronizado automáticamente
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- Evitar error si el trigger ya existe
drop trigger if exists rsvp_updated_at on public.rsvp;
create trigger rsvp_updated_at
  before update on public.rsvp
  for each row
  execute function public.set_updated_at();

-- Políticas de seguridad por filas (RLS)
alter table public.rsvp enable row level security;

-- Permitir inserciones anónimas desde la invitación pública
create policy "Allow anonymous RSVP inserts" on public.rsvp
  for insert to anon with check (true);

-- Solo usuarios autenticados pueden ver las confirmaciones (panel admin)
create policy "Allow authenticated users to read RSVP" on public.rsvp
  for select to authenticated using (true);

-- Solo usuarios autenticados pueden actualizar/eliminar registros si fuera necesario
create policy "Allow authenticated users to update RSVP" on public.rsvp
  for update to authenticated using (true) with check (true);

create policy "Allow authenticated users to delete RSVP" on public.rsvp
  for delete to authenticated using (true);
