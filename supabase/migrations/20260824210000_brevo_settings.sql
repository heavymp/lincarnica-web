-- Brevo credentials & senders (admin + Edge Functions only — never public / realtime).

create table if not exists public.brevo_settings (
  id int primary key default 1 check (id = 1),
  api_key text not null default '',
  sender_kontakt text not null default '',
  sender_obavijesti text not null default '',
  recipient_kontakt text not null default '',
  list_id_kontakt text not null default '',
  list_id_obavijesti text not null default '',
  updated_at timestamptz not null default now()
);

drop trigger if exists brevo_settings_set_updated_at on public.brevo_settings;
create trigger brevo_settings_set_updated_at
  before update on public.brevo_settings
  for each row
  execute function public.set_updated_at();

alter table public.brevo_settings enable row level security;

drop policy if exists "Auth read brevo_settings" on public.brevo_settings;
drop policy if exists "Auth update brevo_settings" on public.brevo_settings;
drop policy if exists "Auth insert brevo_settings" on public.brevo_settings;

create policy "Auth read brevo_settings"
  on public.brevo_settings for select to authenticated using (true);

create policy "Auth insert brevo_settings"
  on public.brevo_settings for insert to authenticated with check (true);

create policy "Auth update brevo_settings"
  on public.brevo_settings for update to authenticated using (true) with check (true);

insert into public.brevo_settings (id) values (1)
on conflict (id) do nothing;

-- Copy existing Kontakt Brevo fields when present.
update public.brevo_settings b
set
  sender_kontakt = coalesce(nullif(b.sender_kontakt, ''), nullif(k.notify_email, ''), ''),
  sender_obavijesti = coalesce(nullif(b.sender_obavijesti, ''), nullif(k.notify_email, ''), ''),
  recipient_kontakt = coalesce(nullif(b.recipient_kontakt, ''), nullif(k.notify_email, ''), ''),
  list_id_kontakt = coalesce(nullif(b.list_id_kontakt, ''), nullif(k.brevo_list_id, ''), ''),
  list_id_obavijesti = coalesce(nullif(b.list_id_obavijesti, ''), nullif(k.brevo_obavijesti_list_id, ''), '')
from public.kontakt_settings k
where b.id = 1 and k.id = 1;
