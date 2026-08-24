-- Idempotent schema for Linčarnica (safe to re-run; does not overwrite edited copy).

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.site_content (
  key text primary key,
  value text not null default '',
  note text,
  updated_at timestamptz not null default now()
);

drop trigger if exists site_content_set_updated_at on public.site_content;
create trigger site_content_set_updated_at
  before update on public.site_content
  for each row
  execute function public.set_updated_at();

create table if not exists public.obavijesti (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 160),
  body text not null check (char_length(body) between 1 and 4000),
  happens_at timestamptz,
  important boolean not null default false,
  draft boolean not null default true,
  emoji text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.obavijesti add column if not exists emoji text not null default '';

create index if not exists idx_obavijesti_draft on public.obavijesti (draft);
create index if not exists idx_obavijesti_happens_at on public.obavijesti (happens_at);

drop trigger if exists obavijesti_set_updated_at on public.obavijesti;
create trigger obavijesti_set_updated_at
  before update on public.obavijesti
  for each row
  execute function public.set_updated_at();

create table if not exists public.kontakt_settings (
  id int primary key default 1 check (id = 1),
  heading text not null default 'Javite nam se',
  intro text not null default 'Pošaljite poruku udruzi. Odgovaramo čim stignemo.',
  email text not null default '',
  phone text not null default '',
  address text not null default '',
  name_label text not null default 'Ime i prezime',
  email_label text not null default 'E-mail',
  phone_label text not null default 'Telefon',
  message_label text not null default 'Poruka',
  submit_label text not null default 'Pošalji',
  success_message text not null default 'Hvala! Poruka je poslana.',
  error_message text not null default 'Slanje nije uspjelo. Pokušajte ponovno.',
  brevo_list_id text not null default '',
  notify_email text not null default '',
  updated_at timestamptz not null default now()
);

drop trigger if exists kontakt_settings_set_updated_at on public.kontakt_settings;
create trigger kontakt_settings_set_updated_at
  before update on public.kontakt_settings
  for each row
  execute function public.set_updated_at();

create table if not exists public.kontakt_poruke (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null default '',
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.site_content enable row level security;
alter table public.obavijesti enable row level security;
alter table public.kontakt_settings enable row level security;
alter table public.kontakt_poruke enable row level security;

drop policy if exists "Public read site_content" on public.site_content;
create policy "Public read site_content"
  on public.site_content for select to anon, authenticated using (true);

drop policy if exists "Public read published obavijesti" on public.obavijesti;
create policy "Public read published obavijesti"
  on public.obavijesti for select to anon, authenticated using (draft = false);

drop policy if exists "Public read kontakt_settings" on public.kontakt_settings;
create policy "Public read kontakt_settings"
  on public.kontakt_settings for select to anon, authenticated using (true);

drop policy if exists "Public insert kontakt_poruke" on public.kontakt_poruke;
create policy "Public insert kontakt_poruke"
  on public.kontakt_poruke for insert to anon, authenticated with check (true);

insert into public.site_content (key, value, note) values
  ('hero_title', 'Dobrodošli', 'Naslov na vrhu stranice'),
  ('hero_subtitle', 'Udruga mještana Ugljan – Sušica „Linčarnica” okuplja susjede, čuva mjesto i dijeli što se događa u Sušici.', 'Tekst ispod naslova'),
  ('footer_text', 'Ova se stranica stalno razvija i dopunjuje. Hvala što ste s nama', 'Tekst iznad verzije'),
  ('logo_alt', 'Linčarnica logo', 'Alt tekst logotipa'),
  ('meta_title', 'Udruga mještana Ugljan - Sušica "Linčarnica"', 'Naslov kartice preglednika'),
  ('meta_description', 'Udruga mještana Ugljan – Sušica Linčarnica. Obavijesti, događanja i život mjesta.', 'Opis za pretraživače'),
  ('label_obavijesti', 'Obavijesti', 'Natpis na prvoj piluli'),
  ('label_kontakt', 'Kontakt', 'Natpis na drugoj piluli')
on conflict (key) do nothing;

insert into public.kontakt_settings (id) values (1)
on conflict (id) do nothing;

do $$
begin
  begin
    alter publication supabase_realtime add table public.obavijesti;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.site_content;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.kontakt_settings;
  exception when duplicate_object then null;
  end;
end $$;
