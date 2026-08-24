import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';

const SubscribersAdmin = () => {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let ignore = false;
    supabase
      .from('obavijesti_pretplatnici')
      .select('id, email, active, created_at')
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

  const toggle = async (item) => {
    const { error } = await supabase
      .from('obavijesti_pretplatnici')
      .update({ active: !item.active })
      .eq('id', item.id);
    if (error) return;
    setItems((current) =>
      current.map((row) => (row.id === item.id ? { ...row, active: !row.active } : row))
    );
  };

  const remove = async (id) => {
    if (!window.confirm('Obrisati ovu pretplatu?')) return;
    const { error } = await supabase.from('obavijesti_pretplatnici').delete().eq('id', id);
    if (error) return;
    setItems((current) => current.filter((row) => row.id !== id));
  };

  const activeCount = items.filter((item) => item.active).length;

  return (
    <section className="admin-editor admin-editor-single">
      <h2>Pretplate</h2>
      <p className="admin-lead">
        E-adrese prijavljene na obavijesti. Aktivnih: {status === 'ready' ? activeCount : '—'}.
      </p>
      {status === 'loading' ? <p className="admin-muted">Učitavanje…</p> : null}
      {status === 'error' ? <p className="admin-error">Lista nije dostupna. Pokrenite novu SQL migraciju.</p> : null}
      {status === 'ready' && items.length === 0 ? (
        <p className="admin-muted">Još nema pretplata.</p>
      ) : null}
      <ul className="admin-messages">
        {items.map((item) => (
          <li key={item.id} className="admin-message">
            <header>
              <strong>{item.email}</strong>
              <time dateTime={item.created_at}>
                {new Date(item.created_at).toLocaleString('hr-HR')}
              </time>
            </header>
            <p>{item.active ? 'Aktivna' : 'Odjavljena'}</p>
            <div className="admin-actions">
              <button type="button" className="admin-ghost" onClick={() => void toggle(item)}>
                {item.active ? 'Deaktiviraj' : 'Aktiviraj'}
              </button>
              <button type="button" className="admin-danger" onClick={() => void remove(item.id)}>
                Obriši
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default SubscribersAdmin;
