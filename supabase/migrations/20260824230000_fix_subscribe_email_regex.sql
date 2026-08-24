-- PostgreSQL regex has no \s; the old pattern wrongly rejected any email containing "s".

alter table public.obavijesti_pretplatnici
  drop constraint if exists obavijesti_pretplatnici_email_check;

alter table public.obavijesti_pretplatnici
  add constraint obavijesti_pretplatnici_email_check
  check (email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$');

create or replace function public.subscribe_obavijesti(p_email text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
  v_row public.obavijesti_pretplatnici%rowtype;
begin
  if v_email is null or v_email !~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'invalid_email' using errcode = '22023';
  end if;

  insert into public.obavijesti_pretplatnici (email, active)
  values (v_email, true)
  on conflict ((lower(email)))
  do update set active = true, email = excluded.email, updated_at = now()
  returning * into v_row;

  return jsonb_build_object('ok', true, 'email', v_row.email);
end;
$$;
