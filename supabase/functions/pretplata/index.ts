import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import {
  brevoAddContact,
  brevoApiKey,
  brevoObavijestiSender,
  brevoSendEmail,
  loadBrevo,
  obavijestiListId,
  publicSiteUrl
} from '../_shared/brevo.ts';
import { jsonResponse, preflight } from '../_shared/cors.ts';

function json(status: number, body: unknown) {
  return jsonResponse(status, body);
}

async function saveSubscriber(supabase, email: string) {
  const { data: existing } = await supabase
    .from('obavijesti_pretplatnici')
    .select('id, token')
    .ilike('email', email)
    .maybeSingle();

  if (existing) {
    return supabase
      .from('obavijesti_pretplatnici')
      .update({ active: true, email })
      .eq('id', existing.id)
      .select('token')
      .single();
  }

  return supabase
    .from('obavijesti_pretplatnici')
    .insert({ email, active: true })
    .select('token')
    .single();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return preflight();
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  let payload: Record<string, unknown> = {};
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

  const email = String(payload.email || '')
    .trim()
    .toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email)) {
    return json(400, { error: 'Invalid email' });
  }

  const { data: saved, error: saveError } = await saveSubscriber(supabase, email);
  if (saveError) {
    console.error('Save subscriber failed', saveError);
    return json(500, { error: 'Save failed' });
  }

  const settings = await loadBrevo(supabase);
  const apiKey = brevoApiKey(settings);
  const sender = brevoObavijestiSender(settings);
  const base = publicSiteUrl(settings, req.headers.get('origin'));
  const token = saved?.token;
  const unsub = token && base ? `${base}/odjava?t=${token}` : '';

  if (apiKey) {
    await brevoAddContact(apiKey, email, obavijestiListId(settings));
    if (sender) {
      await brevoSendEmail(
        apiKey,
        sender,
        email,
        'Pretplata na obavijesti — Linčarnica',
        [
          'Hvala! Prijavljeni ste na obavijesti Udruge mještana Ugljan – Sušica „Linčarnica”.',
          '',
          unsub ? `Odjava: ${unsub}` : ''
        ]
          .filter(Boolean)
          .join('\n')
      );
    }
  }

  return json(200, { ok: true });
});
