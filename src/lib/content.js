export const DEFAULT_CONTENT = {
  hero_title: 'Dobrodošli',
  hero_subtitle:
    'Udruga mještana Ugljan – Sušica „Linčarnica” okuplja susjede, čuva mjesto i dijeli što se događa u Sušici.',
  footer_text: 'Ova se stranica stalno razvija i dopunjuje. Hvala što ste s nama',
  logo_alt: 'Linčarnica logo',
  meta_title: 'Udruga mještana Ugljan - Sušica "Linčarnica"',
  meta_description:
    'Udruga mještana Ugljan – Sušica Linčarnica. Obavijesti, događanja i život mjesta.',
  label_obavijesti: 'Obavijesti',
  label_kontakt: 'Kontakt'
};

export const DEFAULT_KONTAKT = {
  heading: 'Javite nam se',
  intro: 'Pošaljite poruku udruzi. Odgovaramo čim stignemo.',
  email: '',
  phone: '',
  address: '',
  name_label: 'Ime i prezime',
  email_label: 'E-mail',
  phone_label: 'Telefon',
  message_label: 'Poruka',
  submit_label: 'Pošalji',
  success_message: 'Hvala! Poruka je poslana.',
  error_message: 'Slanje nije uspjelo. Pokušajte ponovno.'
};

export const DEFAULT_BREVO = {
  api_key: '',
  sender_kontakt: '',
  sender_obavijesti: '',
  recipient_kontakt: '',
  list_id_kontakt: '',
  list_id_obavijesti: '',
  site_url: ''
};

/** Public-safe columns only (never includes Brevo secrets). */
export const KONTAKT_PUBLIC_SELECT =
  'heading, intro, email, phone, address, name_label, email_label, phone_label, message_label, submit_label, success_message, error_message';

export function rowsToContent(rows) {
  const next = { ...DEFAULT_CONTENT };
  for (const row of rows ?? []) {
    if (row?.key && typeof row.value === 'string' && row.value.length > 0) {
      next[row.key] = row.value;
    }
  }
  return next;
}

export function mapKontakt(row) {
  if (!row) return { ...DEFAULT_KONTAKT };
  return {
    ...DEFAULT_KONTAKT,
    heading: row.heading || DEFAULT_KONTAKT.heading,
    intro: row.intro || DEFAULT_KONTAKT.intro,
    email: row.email || '',
    phone: row.phone || '',
    address: row.address || '',
    name_label: row.name_label || DEFAULT_KONTAKT.name_label,
    email_label: row.email_label || DEFAULT_KONTAKT.email_label,
    phone_label: row.phone_label || DEFAULT_KONTAKT.phone_label,
    message_label: row.message_label || DEFAULT_KONTAKT.message_label,
    submit_label: row.submit_label || DEFAULT_KONTAKT.submit_label,
    success_message: row.success_message || DEFAULT_KONTAKT.success_message,
    error_message: row.error_message || DEFAULT_KONTAKT.error_message
  };
}

export function mapBrevo(row) {
  if (!row) return { ...DEFAULT_BREVO };
  return {
    api_key: row.api_key || '',
    sender_kontakt: row.sender_kontakt || '',
    sender_obavijesti: row.sender_obavijesti || '',
    recipient_kontakt: row.recipient_kontakt || '',
    list_id_kontakt: row.list_id_kontakt || '',
    list_id_obavijesti: row.list_id_obavijesti || '',
    site_url: row.site_url || ''
  };
}
