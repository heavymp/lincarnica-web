import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';

const UnsubscribePage = () => {
  const [params] = useSearchParams();
  const token = params.get('t') || '';
  const [status, setStatus] = useState(() => {
    if (!token) return 'missing';
    if (!supabase) return 'error';
    return 'loading';
  });

  useEffect(() => {
    if (!token || !supabase) return undefined;

    let ignore = false;
    supabase.functions
      .invoke('pretplata', { body: { action: 'unsubscribe', token } })
      .then(({ error }) => {
        if (ignore) return;
        setStatus(error ? 'error' : 'ok');
      })
      .catch(() => {
        if (!ignore) setStatus('error');
      });

    return () => {
      ignore = true;
    };
  }, [token]);

  return (
    <main className="page">
      <section className="hero unsubscribe-hero">
        <img src="/favicon.svg" width="96" height="96" alt="" className="logo" />
        <h1>Odjava</h1>
        {status === 'loading' ? <p className="subtitle">Odjavljujemo vas…</p> : null}
        {status === 'ok' ? (
          <p className="subtitle">
            Više nećete primati e-mail obavijesti. Možete se opet pretplatiti na stranici.
          </p>
        ) : null}
        {status === 'missing' ? (
          <p className="subtitle">Nedostaje poveznica za odjavu.</p>
        ) : null}
        {status === 'error' ? (
          <p className="subtitle">Odjava nije uspjela. Pokušajte ponovno ili nam pišite.</p>
        ) : null}
        <p className="fineprint">
          <a className="version-link" href="/">
            Natrag na početnu
          </a>
        </p>
      </section>
    </main>
  );
};

export default UnsubscribePage;
