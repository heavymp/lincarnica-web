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

function preview(text) {
  const clean = String(text || '').replace(/\s+/gu, ' ').trim();
  if (clean.length <= 220) return clean;
  return `${clean.slice(0, 220).trimEnd()}…`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const supabase = createClient(supabaseUrl, serviceKey);

  const authHeader = req.headers.get('Authorization') || '';
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } }
  });
  const { data: userData } = await userClient.auth.getUser();
  if (!userData?.user) {
    return json(401, { error: 'Unauthorized' });
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    return json(400, { error: 'Invalid JSON' });
  }

  const noticeId = String(payload.id || '').trim();
  if (!noticeId) return json(400, { error: 'Missing id' });

  const { data: notice, error: noticeError } = await supabase
    .from('obavijesti')
    .select('id, title, body, happens_at, emoji, kind, draft')
    .eq('id', noticeId)
    .maybeSingle();

  if (noticeError || !notice || notice.draft) {
    return json(400, { error: 'Notice not published' });
  }

  const { data: subscribers, error: subError } = await supabase
    .from('obavijesti_pretplatnici')
    .select('email, token')
    .eq('active', true);

  if (subError) return json(500, { error: 'Subscribers failed' });
  if (!subscribers?.length) return json(200, { ok: true, sent: 0 });

  const { data: settings } = await supabase
    .from('kontakt_settings')
    .select('notify_email')
    .eq('id', 1)
    .maybeSingle();

  const brevoKey = Deno.env.get('BREVO_API_KEY') ?? '';
  const from = (settings?.notify_email || '').trim();
  if (!brevoKey || !from) {
    return json(200, { ok: true, sent: 0, skipped: 'brevo_not_configured' });
  }

  const base = siteUrl(req);
  const pageLink = base || '';
  let sent = 0;

  for (const sub of subscribers) {
    const unsub = base && sub.token ? `${base}/odjava?t=${sub.token}` : '';
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': brevoKey
      },
      body: JSON.stringify({
        sender: { email: from, name: 'Linčarnica' },
        to: [{ email: sub.email }],
        subject: `${notice.emoji || '📢'} ${notice.title}`,
        textContent: [
          'Nova obavijest — Linčarnica',
          '',
          notice.title,
          '',
          preview(notice.body),
          pageLink ? `\nPogledajte: ${pageLink}` : '',
          unsub ? `\nOdjava s obavijesti: ${unsub}` : ''
        ].join('\n')
      })
    });
    if (res.ok) sent += 1;
  }

  return json(200, { ok: true, sent });
});
