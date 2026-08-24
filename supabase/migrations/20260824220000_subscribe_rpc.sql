-- Public subscribe / unsubscribe via RPC (no Edge Function required for saving emails).

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

create or replace function public.unsubscribe_obavijesti(p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.obavijesti_pretplatnici%rowtype;
begin
  if p_token is null then
    return jsonb_build_object('ok', false, 'unsubscribed', false);
  end if;

  update public.obavijesti_pretplatnici
  set active = false, updated_at = now()
  where token = p_token and active = true
  returning * into v_row;

  return jsonb_build_object('ok', true, 'unsubscribed', found);
end;
$$;

revoke all on function public.subscribe_obavijesti(text) from public;
revoke all on function public.unsubscribe_obavijesti(uuid) from public;
grant execute on function public.subscribe_obavijesti(text) to anon, authenticated;
grant execute on function public.unsubscribe_obavijesti(uuid) to anon, authenticated;
