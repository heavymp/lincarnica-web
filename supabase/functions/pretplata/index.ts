import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

function siteUrl(req) {
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
    return new Response('ok', { headers: corsHeaders });
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

    const { data, error } = await supabase
      .from('obavijesti_pretplatnici')
      .update({ active: false })
      .eq('token', token)
      .eq('active', true)
      .select('email')
      .maybeSingle();

    if (error) return json(500, { error: 'Unsubscribe failed' });
    return json(200, { ok: true, unsubscribed: Boolean(data) });
  }

  if (req.method !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  if (payload.website) return json(200, { ok: true });

  const email = String(payload.email || '').trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email)) {
    return json(400, { error: 'Invalid email' });
  }

  const { data: existing } = await supabase
    .from('obavijesti_pretplatnici')
    .select('id, active, token')
    .ilike('email', email)
    .maybeSingle();

  let token = existing?.token;
  if (existing) {
    const { data, error } = await supabase
      .from('obavijesti_pretplatnici')
      .update({ active: true, email })
      .eq('id', existing.id)
      .select('token')
      .single();
    if (error) return json(500, { error: 'Save failed' });
    token = data.token;
  } else {
    const { data, error } = await supabase
      .from('obavijesti_pretplatnici')
      .insert({ email, active: true })
      .select('token')
      .single();
    if (error) return json(500, { error: 'Save failed' });
    token = data.token;
  }

  const settings = await loadBrevo(supabase);
  const brevoKey = resolveApiKey(settings);
  const listId = settings.list_id_obavijesti || settings.list_id_kontakt || '';
  await brevoUpsertContact(brevoKey, email, listId);

  const base = siteUrl(req);
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
