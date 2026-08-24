import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../lib/supabase.js';

const SubscribeButton = () => {
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const submit = async (event) => {
    event.preventDefault();
    if (!supabase || status === 'sending') return;
    setStatus('sending');
    setMessage('');
    try {
      const { error } = await supabase.functions.invoke('pretplata', {
        body: { action: 'subscribe', email: email.trim(), website: '' }
      });
      if (error) throw error;
      setStatus('ok');
      setMessage('Hvala! Bit ćete obaviješteni o novim obavijestima.');
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('Pretplata nije uspjela. Pokušajte ponovno.');
    }
  };

  return (
    <>
      <button
        type="button"
        className="subscribe-icon"
        onClick={() => {
          setOpen(true);
          setStatus('idle');
          setMessage('');
        }}
        aria-label="Pretplati se na obavijesti"
        title="Pretplati se na obavijesti"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M12 3a6 6 0 0 0-6 6v2.2c0 .5-.2 1-.5 1.4L4 15.2c-.5.7 0 1.8.9 1.8h14.2c.9 0 1.4-1.1.9-1.8l-1.5-2.6c-.3-.4-.5-.9-.5-1.4V9a6 6 0 0 0-6-6Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path
            d="M10 18.5a2 2 0 0 0 4 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open
        ? createPortal(
            <div className="notice-sheet" role="presentation" onClick={() => setOpen(false)}>
              <div
                className="notice-sheet-card subscribe-card"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="notice-sheet-handle" aria-hidden="true" />
                <button
                  type="button"
                  className="notice-sheet-close"
                  onClick={() => setOpen(false)}
                  aria-label="Zatvori"
                >
                  ✕
                </button>
                <h2 id={titleId} className="notice-sheet-title">
                  Obavijesti e-mailom
                </h2>
                <p className="subscribe-lead">
                  Primajte obavijest kad Linčarnica objavi nešto novo. Odjava je u svakom mailu.
                </p>
                <form className="subscribe-form" onSubmit={submit}>
                  <label className="hp" htmlFor="subscribe-website">
                    Website
                    <input id="subscribe-website" name="website" tabIndex={-1} autoComplete="off" />
                  </label>
                  <label htmlFor="subscribe-email">
                    E-mail
                    <input
                      id="subscribe-email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      autoComplete="email"
                      placeholder="vas@email.com"
                    />
                  </label>
                  <button type="submit" className="kontakt-submit" disabled={status === 'sending'}>
                    {status === 'sending' ? 'Šaljem…' : 'Pretplati se'}
                  </button>
                  {message ? (
                    <p className={status === 'error' ? 'kontakt-flash kontakt-flash-error' : 'kontakt-flash'}>
                      {message}
                    </p>
                  ) : null}
                </form>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
};

export default SubscribeButton;
