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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
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
  const brevoKey = resolveApiKey(settings);

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
