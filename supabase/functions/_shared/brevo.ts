type BrevoSettings = {
  api_key: string;
  sender_kontakt: string;
  sender_obavijesti: string;
  recipient_kontakt: string;
  list_id_kontakt: string;
  list_id_obavijesti: string;
  site_url: string;
};

const EMPTY_BREVO: BrevoSettings = {
  api_key: '',
  sender_kontakt: '',
  sender_obavijesti: '',
  recipient_kontakt: '',
  list_id_kontakt: '',
  list_id_obavijesti: '',
  site_url: ''
};

export async function loadBrevo(supabase) {
  const { data } = await supabase.from('brevo_settings').select('*').eq('id', 1).maybeSingle();
  if (data) return data as BrevoSettings;

  const { data: legacy } = await supabase
    .from('kontakt_settings')
    .select('brevo_list_id, brevo_obavijesti_list_id, notify_email')
    .eq('id', 1)
    .maybeSingle();

  return {
    ...EMPTY_BREVO,
    sender_kontakt: legacy?.notify_email || '',
    sender_obavijesti: legacy?.notify_email || '',
    recipient_kontakt: legacy?.notify_email || '',
    list_id_kontakt: legacy?.brevo_list_id || '',
    list_id_obavijesti: legacy?.brevo_obavijesti_list_id || ''
  };
}

export function brevoApiKey(settings: BrevoSettings) {
  return (settings.api_key || '').trim();
}

export function brevoObavijestiSender(settings: BrevoSettings) {
  return (settings.sender_obavijesti || settings.sender_kontakt || '').trim();
}

export function publicSiteUrl(settings: BrevoSettings, origin?: string | null) {
  const fromSettings = (settings.site_url || '').replace(/\/$/u, '');
  if (fromSettings) return fromSettings;
  return (origin || '').replace(/\/$/u, '');
}

export function obavijestiListId(settings: BrevoSettings) {
  return (settings.list_id_obavijesti || settings.list_id_kontakt || '').trim();
}

export async function brevoAddContact(apiKey: string, email: string, listId: string) {
  if (!apiKey) return false;

  const body: Record<string, unknown> = { email, updateEnabled: true };
  const id = Number(listId);
  if (Number.isFinite(id) && id > 0) body.listIds = [id];

  const res = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': apiKey
    },
    body: JSON.stringify(body)
  });

  if (res.ok) return true;
  const text = await res.text();
  console.error('Brevo contact failed', res.status, text);
  return false;
}

export async function brevoSendEmail(
  apiKey: string,
  from: string,
  to: string,
  subject: string,
  textContent: string
) {
  if (!apiKey || !from) return false;

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': apiKey
    },
    body: JSON.stringify({
      sender: { email: from, name: 'Linčarnica' },
      to: [{ email: to }],
      subject,
      textContent
    })
  });

  if (res.ok) return true;
  const text = await res.text();
  console.error('Brevo email failed', res.status, text);
  return false;
}
