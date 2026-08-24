-- Server-side Brevo sync on subscribe (pg_net). Browser Edge Function calls were fire-and-forget and often never ran.

create extension if not exists pg_net with schema extensions;

alter table public.brevo_settings
  add column if not exists site_url text not null default '';

create or replace function public.brevo_parse_list_id(p_value text)
returns int
language sql
immutable
as $$
  select case
    when coalesce(trim(p_value), '') ~ '^\d+$' then trim(p_value)::int
    else null
  end;
$$;

create or replace function public.brevo_sync_subscriber(p_email text, p_token uuid)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_settings public.brevo_settings%rowtype;
  v_list_id int;
  v_sender text;
  v_base text;
  v_unsub text;
  v_body jsonb;
  v_text text;
begin
  select * into v_settings from public.brevo_settings where id = 1;
  if coalesce(trim(v_settings.api_key), '') = '' then
    return;
  end if;

  v_list_id := public.brevo_parse_list_id(v_settings.list_id_obavijesti);
  if v_list_id is null then
    v_list_id := public.brevo_parse_list_id(v_settings.list_id_kontakt);
  end if;

  v_body := jsonb_build_object('email', p_email, 'updateEnabled', true);
  if v_list_id is not null then
    v_body := v_body || jsonb_build_object('listIds', jsonb_build_array(v_list_id));
  end if;

  perform net.http_post(
    url := 'https://api.brevo.com/v3/contacts',
    headers := jsonb_build_object(
      'accept', 'application/json',
      'content-type', 'application/json',
      'api-key', trim(v_settings.api_key)
    ),
    body := v_body
  );

  v_sender := coalesce(nullif(trim(v_settings.sender_obavijesti), ''), nullif(trim(v_settings.sender_kontakt), ''));
  if v_sender is null then
    return;
  end if;

  v_base := coalesce(nullif(trim(v_settings.site_url), ''), 'https://lincarnica.hr');
  v_base := regexp_replace(v_base, '/+$', '');
  v_unsub := case when p_token is not null then v_base || '/odjava?t=' || p_token::text else null end;

  v_text := 'Hvala! Prijavljeni ste na obavijesti Udruge mještana Ugljan – Sušica „Linčarnica”.';
  if v_unsub is not null then
    v_text := v_text || E'\n\nOdjava: ' || v_unsub;
  end if;

  perform net.http_post(
    url := 'https://api.brevo.com/v3/smtp/email',
    headers := jsonb_build_object(
      'accept', 'application/json',
      'content-type', 'application/json',
      'api-key', trim(v_settings.api_key)
    ),
    body := jsonb_build_object(
      'sender', jsonb_build_object('email', v_sender, 'name', 'Linčarnica'),
      'to', jsonb_build_array(jsonb_build_object('email', p_email)),
      'subject', 'Pretplata na obavijesti — Linčarnica',
      'textContent', v_text
    )
  );
end;
$$;

create or replace function public.subscribe_obavijesti(p_email text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
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

  begin
    perform public.brevo_sync_subscriber(v_row.email, v_row.token);
  exception
    when others then
      null;
  end;

  return jsonb_build_object('ok', true, 'email', v_row.email);
end;
$$;

revoke all on function public.brevo_parse_list_id(text) from public;
revoke all on function public.brevo_sync_subscriber(text, uuid) from public;
