-- Admin editor: notice kinds + authenticated write policies.

alter table public.obavijesti
  add column if not exists kind text not null default 'obavijest';

alter table public.obavijesti drop constraint if exists obavijesti_kind_check;
alter table public.obavijesti
  add constraint obavijesti_kind_check
  check (kind in ('obavijest', 'sastanak', 'dogadaj', 'festa'));

create index if not exists idx_obavijesti_kind on public.obavijesti (kind);

drop policy if exists "Public read published obavijesti" on public.obavijesti;
drop policy if exists "Anon read published obavijesti" on public.obavijesti;
drop policy if exists "Auth read all obavijesti" on public.obavijesti;
drop policy if exists "Auth insert obavijesti" on public.obavijesti;
drop policy if exists "Auth update obavijesti" on public.obavijesti;
drop policy if exists "Auth delete obavijesti" on public.obavijesti;

create policy "Anon read published obavijesti"
  on public.obavijesti for select to anon
  using (draft = false);

create policy "Auth read all obavijesti"
  on public.obavijesti for select to authenticated
  using (true);

create policy "Auth insert obavijesti"
  on public.obavijesti for insert to authenticated
  with check (true);

create policy "Auth update obavijesti"
  on public.obavijesti for update to authenticated
  using (true)
  with check (true);

create policy "Auth delete obavijesti"
  on public.obavijesti for delete to authenticated
  using (true);

drop policy if exists "Auth upsert site_content" on public.site_content;
drop policy if exists "Auth insert site_content" on public.site_content;
drop policy if exists "Auth update site_content" on public.site_content;

create policy "Auth insert site_content"
  on public.site_content for insert to authenticated
  with check (true);

create policy "Auth update site_content"
  on public.site_content for update to authenticated
  using (true)
  with check (true);

drop policy if exists "Auth update kontakt_settings" on public.kontakt_settings;
create policy "Auth update kontakt_settings"
  on public.kontakt_settings for update to authenticated
  using (true)
  with check (true);

drop policy if exists "Auth read kontakt_poruke" on public.kontakt_poruke;
drop policy if exists "Auth delete kontakt_poruke" on public.kontakt_poruke;

create policy "Auth read kontakt_poruke"
  on public.kontakt_poruke for select to authenticated
  using (true);

create policy "Auth delete kontakt_poruke"
  on public.kontakt_poruke for delete to authenticated
  using (true);
