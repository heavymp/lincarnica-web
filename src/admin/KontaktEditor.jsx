import { useEffect, useState } from 'react';
import { DEFAULT_KONTAKT, mapKontakt } from '../lib/content.js';
import { supabase } from '../lib/supabase.js';

const KontaktEditor = () => {
  const [form, setForm] = useState(DEFAULT_KONTAKT);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState('');

  useEffect(() => {
    supabase
      .from('kontakt_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setForm(mapKontakt(data));
      });
  }, []);

  const setField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFlash('');
    const { error } = await supabase
      .from('kontakt_settings')
      .update({
        heading: form.heading,
        intro: form.intro,
        email: form.email,
        phone: form.phone,
        address: form.address,
        name_label: form.name_label,
        email_label: form.email_label,
        phone_label: form.phone_label,
        message_label: form.message_label,
        submit_label: form.submit_label,
        success_message: form.success_message,
        error_message: form.error_message,
        brevo_list_id: form.brevo_list_id,
        brevo_obavijesti_list_id: form.brevo_obavijesti_list_id,
        notify_email: form.notify_email
      })
      .eq('id', 1);
    setSaving(false);
    setFlash(error ? 'Spremanje nije uspjelo.' : 'Spremljeno.');
  };

  return (
    <form className="admin-editor admin-editor-single" onSubmit={save}>
      <h2>Kontakt</h2>
      <p className="admin-lead">Podaci i natpisi na kontakt obrascu.</p>

      <label>
        Naslov
        <input value={form.heading} onChange={(event) => setField('heading', event.target.value)} />
      </label>
      <label>
        Uvod
        <textarea
          rows={3}
          value={form.intro}
          onChange={(event) => setField('intro', event.target.value)}
        />
      </label>
      <label>
        E-mail
        <input
          type="email"
          value={form.email}
          onChange={(event) => setField('email', event.target.value)}
        />
      </label>
      <label>
        Telefon
        <input value={form.phone} onChange={(event) => setField('phone', event.target.value)} />
      </label>
      <label>
        Adresa
        <input value={form.address} onChange={(event) => setField('address', event.target.value)} />
      </label>

      <h3 className="admin-sub">Natpisi polja</h3>
      <label>
        Ime
        <input
          value={form.name_label}
          onChange={(event) => setField('name_label', event.target.value)}
        />
      </label>
      <label>
        E-mail polje
        <input
          value={form.email_label}
          onChange={(event) => setField('email_label', event.target.value)}
        />
      </label>
      <label>
        Telefon polje
        <input
          value={form.phone_label}
          onChange={(event) => setField('phone_label', event.target.value)}
        />
      </label>
      <label>
        Poruka
        <input
          value={form.message_label}
          onChange={(event) => setField('message_label', event.target.value)}
        />
      </label>
      <label>
        Gumb
        <input
          value={form.submit_label}
          onChange={(event) => setField('submit_label', event.target.value)}
        />
      </label>
      <label>
        Poruka uspjeha
        <input
          value={form.success_message}
          onChange={(event) => setField('success_message', event.target.value)}
        />
      </label>
      <label>
        Poruka greške
        <input
          value={form.error_message}
          onChange={(event) => setField('error_message', event.target.value)}
        />
      </label>

      <details className="admin-advanced">
        <summary>Napredno (Brevo)</summary>
        <label>
          Brevo list ID (kontakt)
          <input
            value={form.brevo_list_id}
            onChange={(event) => setField('brevo_list_id', event.target.value)}
          />
        </label>
        <label>
          Brevo list ID (obavijesti pretplate)
          <input
            value={form.brevo_obavijesti_list_id}
            onChange={(event) => setField('brevo_obavijesti_list_id', event.target.value)}
          />
        </label>
        <label>
          E-mail pošiljatelja / obavijesti
          <input
            type="email"
            value={form.notify_email}
            onChange={(event) => setField('notify_email', event.target.value)}
          />
        </label>
        <p className="admin-hint">
          `notify_email` šalje kontakt poruke i mailove pretplatnicima. Na Supabase secretima trebaju
          `BREVO_API_KEY` i `SITE_URL` (za poveznice odjave).
        </p>
      </details>

      <div className="admin-actions">
        <button type="submit" className="admin-primary" disabled={saving}>
          {saving ? 'Spremam…' : 'Spremi'}
        </button>
      </div>
      {flash ? <p className="admin-flash">{flash}</p> : null}
    </form>
  );
};

export default KontaktEditor;
