import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { brevoApiKey, brevoObavijestiSender, brevoSendEmail, loadBrevo, publicSiteUrl } from '../_shared/brevo.ts';
import { jsonResponse, preflight } from '../_shared/cors.ts';

function json(status: number, body: unknown) {
  return jsonResponse(status, body);
}

function preview(text: string) {
  const clean = String(text || '').replace(/\s+/gu, ' ').trim();
  if (clean.length <= 220) return clean;
  return `${clean.slice(0, 220).trimEnd()}…`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return preflight();
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

  const settings = await loadBrevo(supabase);
  const apiKey = brevoApiKey(settings);
  const from = brevoObavijestiSender(settings);
  if (!apiKey || !from) {
    return json(200, { ok: true, sent: 0, skipped: 'brevo_not_configured' });
  }

  const base = publicSiteUrl(settings, req.headers.get('origin'));
  let sent = 0;

  for (const sub of subscribers) {
    const unsub = base && sub.token ? `${base}/odjava?t=${sub.token}` : '';
    const ok = await brevoSendEmail(
      apiKey,
      from,
      sub.email,
      `${notice.emoji || '📢'} ${notice.title}`,
      [
        'Nova obavijest — Linčarnica',
        '',
        notice.title,
        '',
        preview(notice.body),
        base ? `\nPogledajte: ${base}` : '',
        unsub ? `\nOdjava s obavijesti: ${unsub}` : ''
      ].join('\n')
    );
    if (ok) sent += 1;
  }

  return json(200, { ok: true, sent });
});
