-- Obavijesti email subscriptions (Brevo delivery + unsubscribe tokens).

create table if not exists public.obavijesti_pretplatnici (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  token uuid not null default gen_random_uuid(),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint obavijesti_pretplatnici_email_check check (email ~* '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$')
);

create unique index if not exists idx_obavijesti_pretplatnici_email
  on public.obavijesti_pretplatnici (lower(email));
create unique index if not exists idx_obavijesti_pretplatnici_token
  on public.obavijesti_pretplatnici (token);
create index if not exists idx_obavijesti_pretplatnici_active
  on public.obavijesti_pretplatnici (active);

drop trigger if exists obavijesti_pretplatnici_set_updated_at on public.obavijesti_pretplatnici;
create trigger obavijesti_pretplatnici_set_updated_at
  before update on public.obavijesti_pretplatnici
  for each row
  execute function public.set_updated_at();

alter table public.kontakt_settings
  add column if not exists brevo_obavijesti_list_id text not null default '';

alter table public.obavijesti_pretplatnici enable row level security;

drop policy if exists "Auth read pretplatnici" on public.obavijesti_pretplatnici;
drop policy if exists "Auth update pretplatnici" on public.obavijesti_pretplatnici;
drop policy if exists "Auth delete pretplatnici" on public.obavijesti_pretplatnici;

create policy "Auth read pretplatnici"
  on public.obavijesti_pretplatnici for select to authenticated using (true);

create policy "Auth update pretplatnici"
  on public.obavijesti_pretplatnici for update to authenticated using (true) with check (true);

create policy "Auth delete pretplatnici"
  on public.obavijesti_pretplatnici for delete to authenticated using (true);
