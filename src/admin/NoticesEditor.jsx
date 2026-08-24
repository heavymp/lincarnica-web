import { useEffect, useMemo, useState } from 'react';
import {
  joinHappensAt,
  mapNotice,
  splitHappensAt
} from '../lib/obavijesti.js';
import { NOTICE_EMOJIS, NOTICE_KINDS, kindMeta } from '../lib/noticeKinds.js';
import { supabase } from '../lib/supabase.js';

const emptyForm = () => ({
  id: null,
  title: '',
  body: '',
  kind: 'obavijest',
  emoji: kindMeta('obavijest').emoji,
  important: false,
  draft: true,
  date: '',
  time: ''
});

const toForm = (notice) => {
  const { date, time } = splitHappensAt(notice.happensAt);
  return {
    id: notice.id,
    title: notice.title,
    body: notice.body,
    kind: notice.kind,
    emoji: notice.emoji,
    important: notice.important,
    draft: notice.draft,
    date,
    time
  };
};

const NoticesEditor = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState('loading');
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState('');

  useEffect(() => {
    let ignore = false;
    supabase
      .from('obavijesti')
      .select('id, title, body, happens_at, important, emoji, kind, draft, created_at')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (ignore) return;
        if (error) {
          setStatus('error');
          return;
        }
        setItems((data ?? []).map(mapNotice));
        setStatus('ready');
      });
    return () => {
      ignore = true;
    };
  }, []);

  const selected = useMemo(
    () => items.find((item) => item.id === form.id) ?? null,
    [items, form.id]
  );

  const setField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const chooseKind = (kind) => {
    setForm((current) => {
      const previousDefault = kindMeta(current.kind).emoji;
      const nextDefault = kindMeta(kind).emoji;
      const emoji =
        !current.emoji || current.emoji === previousDefault ? nextDefault : current.emoji;
      return { ...current, kind, emoji };
    });
  };

  const save = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      setFlash('Naslov i tekst su obavezni.');
      return;
    }
    setSaving(true);
    setFlash('');
    const payload = {
      title: form.title.trim(),
      body: form.body.trim(),
      kind: form.kind,
      emoji: form.emoji,
      important: form.important,
      draft: form.draft,
      happens_at: joinHappensAt(form.date, form.time)
    };
    const query = form.id
      ? supabase.from('obavijesti').update(payload).eq('id', form.id)
      : supabase.from('obavijesti').insert(payload).select('id').single();
    const { data, error } = await query;
    setSaving(false);
    if (error) {
      setFlash('Spremanje nije uspjelo. Pokušajte ponovno.');
      return;
    }
    if (!form.id && data?.id) {
      setForm((current) => ({ ...current, id: data.id }));
    }
    setFlash('Spremljeno.');
    const { data: rows } = await supabase
      .from('obavijesti')
      .select('id, title, body, happens_at, important, emoji, kind, draft, created_at')
      .order('created_at', { ascending: false });
    if (rows) setItems(rows.map(mapNotice));
  };

  const remove = async () => {
    if (!form.id) return;
    if (!window.confirm('Obrisati ovu obavijest?')) return;
    const { error } = await supabase.from('obavijesti').delete().eq('id', form.id);
    if (error) {
      setFlash('Brisanje nije uspjelo.');
      return;
    }
    setForm(emptyForm());
    setFlash('Obrisano.');
    const { data: rows } = await supabase
      .from('obavijesti')
      .select('id, title, body, happens_at, important, emoji, kind, draft, created_at')
      .order('created_at', { ascending: false });
    if (rows) setItems(rows.map(mapNotice));
  };

  return (
    <div className="admin-split">
      <aside className="admin-list">
        <div className="admin-list-head">
          <h2>Obavijesti</h2>
          <button type="button" className="admin-ghost" onClick={() => setForm(emptyForm())}>
            Nova
          </button>
        </div>
        {status === 'loading' ? <p className="admin-muted">Učitavanje…</p> : null}
        {status === 'error' ? <p className="admin-error">Lista nije dostupna.</p> : null}
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={item.id === form.id ? 'admin-row is-active' : 'admin-row'}
                onClick={() => setForm(toForm(item))}
              >
                <span className="admin-row-emoji">{item.emoji}</span>
                <span>
                  <strong>{item.title}</strong>
                  <small>
                    {kindMeta(item.kind).label}
                    {item.draft ? ' · Skica' : ' · Objavljeno'}
                    {item.important ? ' · Važno' : ''}
                  </small>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <form className="admin-editor" onSubmit={save}>
        <h2>{form.id ? 'Uredi' : 'Nova obavijest'}</h2>

        <fieldset className="admin-fieldset">
          <legend>Vrsta</legend>
          <div className="admin-kinds">
            {NOTICE_KINDS.map((kind) => (
              <button
                key={kind.id}
                type="button"
                className={form.kind === kind.id ? 'admin-chip is-active' : 'admin-chip'}
                onClick={() => chooseKind(kind.id)}
              >
                <span>{kind.emoji}</span>
                {kind.label}
              </button>
            ))}
          </div>
          <p className="admin-hint">{kindMeta(form.kind).hint}</p>
        </fieldset>

        <fieldset className="admin-fieldset">
          <legend>Ikona</legend>
          <div className="admin-emojis" role="listbox" aria-label="Ikona">
            {NOTICE_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className={form.emoji === emoji ? 'admin-emoji is-active' : 'admin-emoji'}
                onClick={() => setField('emoji', emoji)}
                aria-label={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        </fieldset>

        <label>
          Naslov
          <input
            value={form.title}
            onChange={(event) => setField('title', event.target.value)}
            maxLength={160}
            required
          />
        </label>
        <label>
          Tekst
          <textarea
            value={form.body}
            onChange={(event) => setField('body', event.target.value)}
            rows={5}
            maxLength={4000}
            required
          />
        </label>

        <div className="admin-date-row">
          <label>
            Datum
            <input
              type="date"
              value={form.date}
              onChange={(event) => setField('date', event.target.value)}
            />
          </label>
          <label>
            Vrijeme
            <input
              type="time"
              value={form.time}
              onChange={(event) => setField('time', event.target.value)}
              disabled={!form.date}
            />
          </label>
        </div>
        <p className="admin-hint">
          Datum je opcionalan. Vrijeme je također opcionalno — na stranici se prikazuje samo ako ga unesete.
        </p>

        <div className="admin-toggles">
          <label className="admin-switch">
            <input
              type="checkbox"
              checked={form.important}
              onChange={(event) => setField('important', event.target.checked)}
            />
            <span />
            Istakni kao važno
          </label>
          <label className="admin-switch">
            <input
              type="checkbox"
              checked={!form.draft}
              onChange={(event) => setField('draft', !event.target.checked)}
            />
            <span />
            Objavi na stranici
          </label>
        </div>

        <div className="admin-actions">
          <button type="submit" className="admin-primary" disabled={saving}>
            {saving ? 'Spremam…' : 'Spremi'}
          </button>
          {form.id ? (
            <button type="button" className="admin-danger" onClick={() => void remove()}>
              Obriši
            </button>
          ) : null}
        </div>
        {flash ? <p className="admin-flash">{flash}</p> : null}
        {selected?.draft ? <p className="admin-hint">Ova obavijest još nije vidljiva na stranici.</p> : null}
      </form>
    </div>
  );
};

export default NoticesEditor;
