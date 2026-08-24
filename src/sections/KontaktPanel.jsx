import { useState } from 'react';
import PrivacyNotice from '../components/PrivacyNotice.jsx';
import { useSiteContent } from '../lib/SiteContent.jsx';
import { supabase } from '../lib/supabase.js';

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  message: '',
  website: ''
};

const KontaktPanel = () => {
  const { kontakt } = useSiteContent();
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState('idle');

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!supabase || status === 'sending') return;

    setStatus('sending');
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      message: form.message.trim(),
      website: form.website
    };

    try {
      const { error } = await supabase.functions.invoke('kontakt', { body: payload });
      if (error) {
        const { error: insertError } = await supabase.from('kontakt_poruke').insert({
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          message: payload.message
        });
        if (insertError) throw insertError;
      }
      setForm(emptyForm);
      setStatus('ok');
    } catch {
      setStatus('error');
    }
  };

  const details = [kontakt.email, kontakt.phone, kontakt.address].filter(Boolean);

  return (
    <div className="kontakt">
      <h3 className="kontakt-heading">{kontakt.heading}</h3>
      {kontakt.intro ? <p className="kontakt-intro">{kontakt.intro}</p> : null}

      {details.length > 0 ? (
        <ul className="kontakt-details">
          {kontakt.email ? (
            <li>
              <a href={`mailto:${kontakt.email}`}>{kontakt.email}</a>
            </li>
          ) : null}
          {kontakt.phone ? (
            <li>
              <a href={`tel:${kontakt.phone.replace(/\s+/g, '')}`}>{kontakt.phone}</a>
            </li>
          ) : null}
          {kontakt.address ? <li>{kontakt.address}</li> : null}
        </ul>
      ) : null}

      <form className="kontakt-form" onSubmit={onSubmit}>
        <label className="hp" htmlFor="kontakt-website">
          Website
          <input
            id="kontakt-website"
            name="website"
            value={form.website}
            onChange={onChange}
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
        <label htmlFor="kontakt-name">
          {kontakt.name_label}
          <input
            id="kontakt-name"
            name="name"
            value={form.name}
            onChange={onChange}
            required
            maxLength={120}
            autoComplete="name"
          />
        </label>
        <label htmlFor="kontakt-email">
          {kontakt.email_label}
          <input
            id="kontakt-email"
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            required
            maxLength={160}
            autoComplete="email"
          />
        </label>
        <label htmlFor="kontakt-phone">
          {kontakt.phone_label}
          <input
            id="kontakt-phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={onChange}
            maxLength={40}
            autoComplete="tel"
          />
        </label>
        <label htmlFor="kontakt-message">
          {kontakt.message_label}
          <textarea
            id="kontakt-message"
            name="message"
            value={form.message}
            onChange={onChange}
            required
            rows={4}
            maxLength={4000}
          />
        </label>
        <PrivacyNotice context="kontakt" />
        <button type="submit" className="kontakt-submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Šaljem…' : kontakt.submit_label}
        </button>
        {status === 'ok' ? <p className="kontakt-flash">{kontakt.success_message}</p> : null}
        {status === 'error' ? (
          <p className="kontakt-flash kontakt-flash-error">{kontakt.error_message}</p>
        ) : null}
      </form>
    </div>
  );
};

export default KontaktPanel;
