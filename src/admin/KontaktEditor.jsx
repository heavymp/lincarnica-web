import { useEffect, useState } from 'react';
import { DEFAULT_BREVO, DEFAULT_KONTAKT, mapBrevo, mapKontakt } from '../lib/content.js';
import { supabase } from '../lib/supabase.js';

const KontaktEditor = () => {
  const [form, setForm] = useState(DEFAULT_KONTAKT);
  const [brevo, setBrevo] = useState(DEFAULT_BREVO);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from('kontakt_settings').select('*').eq('id', 1).maybeSingle(),
      supabase.from('brevo_settings').select('*').eq('id', 1).maybeSingle()
    ]).then(([kontaktRes, brevoRes]) => {
      if (kontaktRes.data) setForm(mapKontakt(kontaktRes.data));
      if (brevoRes.data) setBrevo(mapBrevo(brevoRes.data));
      else if (!brevoRes.error && kontaktRes.data) {
        // Fallback if migration not applied yet: map legacy columns.
        setBrevo(
          mapBrevo({
            sender_kontakt: kontaktRes.data.notify_email,
            sender_obavijesti: kontaktRes.data.notify_email,
            recipient_kontakt: kontaktRes.data.notify_email,
            list_id_kontakt: kontaktRes.data.brevo_list_id,
            list_id_obavijesti: kontaktRes.data.brevo_obavijesti_list_id
          })
        );
      }
    });
  }, []);

  const setField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const setBrevoField = (name, value) => {
    setBrevo((current) => ({ ...current, [name]: value }));
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFlash('');

    const kontaktPayload = {
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
      error_message: form.error_message
    };

    const brevoPayload = {
      api_key: brevo.api_key,
      sender_kontakt: brevo.sender_kontakt,
      sender_obavijesti: brevo.sender_obavijesti,
      recipient_kontakt: brevo.recipient_kontakt,
      list_id_kontakt: brevo.list_id_kontakt,
      list_id_obavijesti: brevo.list_id_obavijesti,
      site_url: brevo.site_url
    };

    const kontaktRes = await supabase
      .from('kontakt_settings')
      .update(kontaktPayload)
      .eq('id', 1);

    let brevoRes = await supabase.from('brevo_settings').upsert({ id: 1, ...brevoPayload });

    // Legacy fallback: keep old columns in sync if brevo_settings table missing.
    if (brevoRes.error) {
      brevoRes = await supabase
        .from('kontakt_settings')
        .update({
          notify_email: brevo.recipient_kontakt || brevo.sender_kontakt,
          brevo_list_id: brevo.list_id_kontakt,
          brevo_obavijesti_list_id: brevo.list_id_obavijesti
        })
        .eq('id', 1);
    }

    setSaving(false);
    setFlash(kontaktRes.error || brevoRes.error ? 'Spremanje nije uspjelo.' : 'Spremljeno.');
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

      <section className="admin-brevo" aria-labelledby="brevo-heading">
        <div className="admin-brevo-head">
          <h3 id="brevo-heading">Brevo</h3>
          <p>
            Postavke za <strong>API keys</strong>, <strong>Senders</strong>,{' '}
            <strong>Transactional Email</strong> i <strong>Contacts → Lists</strong>.
          </p>
        </div>

        <div className="admin-brevo-grid">
          <label className="admin-brevo-field">
            <span className="admin-brevo-label">API key</span>
            <span className="admin-brevo-desc">
              Brevo → SMTP &amp; API → API keys. Čuva se samo za prijavljene urednike (nije javno).
            </span>
            <div className="admin-brevo-key-row">
              <input
                type={showKey ? 'text' : 'password'}
                value={brevo.api_key}
                onChange={(event) => setBrevoField('api_key', event.target.value)}
                placeholder="xkeysib-…"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                className="admin-ghost"
                onClick={() => setShowKey((value) => !value)}
              >
                {showKey ? 'Sakrij' : 'Prikaži'}
              </button>
            </div>
          </label>

          <label className="admin-brevo-field">
            <span className="admin-brevo-label">Sender — Kontakt</span>
            <span className="admin-brevo-desc">
              Potvrđeni Sender iz Brevo → Transactional → Settings → Senders. Koristi se kao From
              za e-mailove s kontakt obrasca.
            </span>
            <input
              type="email"
              value={brevo.sender_kontakt}
              onChange={(event) => setBrevoField('sender_kontakt', event.target.value)}
              placeholder="npr. kontakt@vasadomena.hr"
              autoComplete="off"
            />
          </label>

          <label className="admin-brevo-field">
            <span className="admin-brevo-label">To / recipient — Kontakt</span>
            <span className="admin-brevo-desc">
              Adresa koja prima poruke s kontakt obrasca (To). Često ista kao Sender — Kontakt.
            </span>
            <input
              type="email"
              value={brevo.recipient_kontakt}
              onChange={(event) => setBrevoField('recipient_kontakt', event.target.value)}
              placeholder="npr. ured@vasadomena.hr"
              autoComplete="off"
            />
          </label>

          <label className="admin-brevo-field">
            <span className="admin-brevo-label">Sender — Obavijesti</span>
            <span className="admin-brevo-desc">
              Sender za pretplate i obavijesti pretplatnicima (Transactional Email). Može biti drugi
              od kontakt Sendera.
            </span>
            <input
              type="email"
              value={brevo.sender_obavijesti}
              onChange={(event) => setBrevoField('sender_obavijesti', event.target.value)}
              placeholder="npr. obavijesti@vasadomena.hr"
              autoComplete="off"
            />
          </label>

          <label className="admin-brevo-field">
            <span className="admin-brevo-label">List ID — Kontakt</span>
            <span className="admin-brevo-desc">
              Brevo → Contacts → Lists. Kontakti s obrasca dodaju se u ovu listu.
            </span>
            <input
              inputMode="numeric"
              value={brevo.list_id_kontakt}
              onChange={(event) => setBrevoField('list_id_kontakt', event.target.value)}
              placeholder="npr. 12"
            />
          </label>

          <label className="admin-brevo-field">
            <span className="admin-brevo-label">List ID — Obavijesti</span>
            <span className="admin-brevo-desc">
              Lista za pretplate (zvono). Ako je prazno, koristi se List ID — Kontakt.
            </span>
            <input
              inputMode="numeric"
              value={brevo.list_id_obavijesti}
              onChange={(event) => setBrevoField('list_id_obavijesti', event.target.value)}
              placeholder="opcionalno"
            />
          </label>

          <label className="admin-brevo-field">
            <span className="admin-brevo-label">Javni URL stranice</span>
            <span className="admin-brevo-desc">
              Za poveznicu odjave u mailu dobrodošlice (npr. https://lincarnica.hr).
            </span>
            <input
              type="url"
              value={brevo.site_url}
              onChange={(event) => setBrevoField('site_url', event.target.value)}
              placeholder="https://lincarnica.hr"
              autoComplete="off"
            />
          </label>
        </div>

        <p className="admin-brevo-note">
          Sve Brevo postavke su ovdje — nema dodatnih env varijabli ni GitHub secreta. Spremite
          prije testiranja pretplate.
        </p>
      </section>

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
