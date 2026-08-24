import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';

const MessagesInbox = () => {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let ignore = false;
    supabase
      .from('kontakt_poruke')
      .select('id, name, email, phone, message, created_at')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (ignore) return;
        if (error) {
          setStatus('error');
          return;
        }
        setItems(data ?? []);
        setStatus('ready');
      });
    return () => {
      ignore = true;
    };
  }, []);

  const remove = async (id) => {
    if (!window.confirm('Obrisati ovu poruku?')) return;
    const { error } = await supabase.from('kontakt_poruke').delete().eq('id', id);
    if (error) return;
    setItems((current) => current.filter((item) => item.id !== id));
  };

  return (
    <section className="admin-editor admin-editor-single">
      <h2>Poruke</h2>
      <p className="admin-lead">Poruke s kontakt obrasca.</p>
      {status === 'loading' ? <p className="admin-muted">Učitavanje…</p> : null}
      {status === 'error' ? <p className="admin-error">Poruke nisu dostupne.</p> : null}
      {status === 'ready' && items.length === 0 ? (
        <p className="admin-muted">Još nema poruka.</p>
      ) : null}
      <ul className="admin-messages">
        {items.map((item) => (
          <li key={item.id} className="admin-message">
            <header>
              <strong>{item.name}</strong>
              <time dateTime={item.created_at}>
                {new Date(item.created_at).toLocaleString('hr-HR')}
              </time>
            </header>
            <p>
              <a href={`mailto:${item.email}`}>{item.email}</a>
              {item.phone ? ` · ${item.phone}` : ''}
            </p>
            <p className="admin-message-body">{item.message}</p>
            <button type="button" className="admin-danger" onClick={() => void remove(item.id)}>
              Obriši
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default MessagesInbox;
