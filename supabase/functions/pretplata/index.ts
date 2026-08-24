import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { jsonResponse, preflight } from '../_shared/cors.ts';

function json(status: number, body: unknown) {
  return jsonResponse(status, body);
}

function siteUrl(req, settings) {
  const fromSettings = (settings?.site_url || '').replace(/\/$/u, '');
  if (fromSettings) return fromSettings;
  const fromEnv = (Deno.env.get('SITE_URL') || '').replace(/\/$/u, '');
  if (fromEnv) return fromEnv;
  return (req.headers.get('origin') || '').replace(/\/$/u, '');
}

async function loadBrevo(supabase) {
  const { data } = await supabase.from('brevo_settings').select('*').eq('id', 1).maybeSingle();
  if (data) return data;

  const { data: legacy } = await supabase
    .from('kontakt_settings')
    .select('brevo_list_id, brevo_obavijesti_list_id, notify_email')
    .eq('id', 1)
    .maybeSingle();

  return {
    api_key: '',
    sender_kontakt: legacy?.notify_email || '',
    sender_obavijesti: legacy?.notify_email || '',
    recipient_kontakt: legacy?.notify_email || '',
    list_id_kontakt: legacy?.brevo_list_id || '',
    list_id_obavijesti: legacy?.brevo_obavijesti_list_id || ''
  };
}

function resolveApiKey(settings) {
  return (settings?.api_key || Deno.env.get('BREVO_API_KEY') || '').trim();
}

async function brevoUpsertContact(brevoKey, email, listId) {
  if (!brevoKey) return;
  const body = { email, updateEnabled: true };
  const id = Number(listId);
  if (Number.isFinite(id) && id > 0) body.listIds = [id];
  await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': brevoKey
    },
    body: JSON.stringify(body)
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return preflight();
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  let payload = {};
  if (req.method !== 'GET') {
    try {
      payload = await req.json();
    } catch {
      payload = {};
    }
  }

  const url = new URL(req.url);
  const action = String(payload.action || url.searchParams.get('action') || 'subscribe');

  if (action === 'unsubscribe') {
    const token = String(payload.token || url.searchParams.get('t') || '').trim();
    if (!token) return json(400, { error: 'Missing token' });

    const { data, error } = await supabase.rpc('unsubscribe_obavijesti', {
      p_token: token
    });

    if (error) return json(500, { error: 'Unsubscribe failed' });
    return json(200, data ?? { ok: true, unsubscribed: false });
  }

  if (req.method !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  if (payload.website) return json(200, { ok: true });

  const email = String(payload.email || '').trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email)) {
    return json(400, { error: 'Invalid email' });
  }

  const { error: saveError } = await supabase.rpc('subscribe_obavijesti', {
    p_email: email
  });

  if (saveError) return json(500, { error: 'Save failed' });

  const { data: subscriber } = await supabase
    .from('obavijesti_pretplatnici')
    .select('token')
    .ilike('email', email)
    .maybeSingle();

  const settings = await loadBrevo(supabase);
  const brevoKey = resolveApiKey(settings);
  const listId = settings.list_id_obavijesti || settings.list_id_kontakt || '';
  await brevoUpsertContact(brevoKey, email, listId);

  const token = subscriber?.token;
  const base = siteUrl(req, settings);
  const unsub = token && base ? `${base}/odjava?t=${token}` : '';
  const sender = (settings.sender_obavijesti || settings.sender_kontakt || '').trim();

  if (brevoKey && sender) {
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': brevoKey
      },
      body: JSON.stringify({
        sender: { email: sender, name: 'Linčarnica' },
        to: [{ email }],
        subject: 'Pretplata na obavijesti — Linčarnica',
        textContent: [
          'Hvala! Prijavljeni ste na obavijesti Udruge mještana Ugljan – Sušica „Linčarnica”.',
          '',
          unsub ? `Odjava: ${unsub}` : ''
        ]
          .filter(Boolean)
          .join('\n')
      })
    });
  }

  return json(200, { ok: true });
});
