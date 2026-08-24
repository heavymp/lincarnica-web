import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { brevoApiKey, loadBrevo } from '../_shared/brevo.ts';
import { jsonResponse, preflight } from '../_shared/cors.ts';

function json(status: number, body: unknown) {
  return jsonResponse(status, body);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return preflight();
  }

  if (req.method !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    return json(400, { error: 'Invalid JSON' });
  }

  if (payload.website) {
    return json(200, { ok: true });
  }

  const name = String(payload.name || '').trim();
  const email = String(payload.email || '').trim();
  const phone = String(payload.phone || '').trim();
  const message = String(payload.message || '').trim();

  if (!name || !email || !message) {
    return json(400, { error: 'Missing fields' });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const supabase = createClient(supabaseUrl, serviceKey);

  const { error: insertError } = await supabase.from('kontakt_poruke').insert({
    name,
    email,
    phone,
    message
  });

  if (insertError) {
    return json(500, { error: 'Save failed' });
  }

  const settings = await loadBrevo(supabase);
  const brevoKey = brevoApiKey(settings);

  if (brevoKey) {
    const listId = Number(settings.list_id_kontakt);
    const contactBody = {
      email,
      attributes: { IME: name, SMS: phone, PORUKA: message.slice(0, 500) },
      updateEnabled: true
    };
    if (Number.isFinite(listId) && listId > 0) {
      contactBody.listIds = [listId];
    }

    await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': brevoKey
      },
      body: JSON.stringify(contactBody)
    });

    const sender = (settings.sender_kontakt || settings.recipient_kontakt || '').trim();
    const recipient = (settings.recipient_kontakt || settings.sender_kontakt || '').trim();
    if (sender && recipient) {
      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'api-key': brevoKey
        },
        body: JSON.stringify({
          sender: { email: sender, name: 'Linčarnica' },
          to: [{ email: recipient }],
          replyTo: { email, name },
          subject: `Kontakt: ${name}`,
          textContent: `${name} <${email}>\n${phone}\n\n${message}`
        })
      });
    }
  }

  return json(200, { ok: true });
});
