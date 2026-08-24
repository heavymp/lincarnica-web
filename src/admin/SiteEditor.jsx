import { useEffect, useState } from 'react';
import { DEFAULT_CONTENT } from '../lib/content.js';
import { supabase } from '../lib/supabase.js';

const FIELDS = [
  { key: 'hero_title', label: 'Naslov', note: 'Veliki natpis na vrhu' },
  { key: 'hero_subtitle', label: 'Uvod', note: 'Kratki opis udruge', multiline: true },
  { key: 'footer_text', label: 'Podnožje', note: 'Tekst iznad verzije', multiline: true },
  { key: 'label_obavijesti', label: 'Natpis Obavijesti' },
  { key: 'label_kontakt', label: 'Natpis Kontakt' },
  { key: 'meta_title', label: 'Naslov kartice' },
  { key: 'meta_description', label: 'Opis za pretraživače', multiline: true }
];

const SiteEditor = () => {
  const [values, setValues] = useState(DEFAULT_CONTENT);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState('');

  useEffect(() => {
    supabase
      .from('site_content')
      .select('key, value')
      .then(({ data, error }) => {
        if (error || !data) return;
        const next = { ...DEFAULT_CONTENT };
        for (const row of data) {
          if (row.key) next[row.key] = row.value ?? '';
        }
        setValues(next);
      });
  }, []);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFlash('');
    const rows = FIELDS.map((field) => ({
      key: field.key,
      value: values[field.key] ?? '',
      note: field.note ?? ''
    }));
    const { error } = await supabase.from('site_content').upsert(rows);
    setSaving(false);
    setFlash(error ? 'Spremanje nije uspjelo.' : 'Spremljeno.');
  };

  return (
    <form className="admin-editor admin-editor-single" onSubmit={save}>
      <h2>Stranica</h2>
      <p className="admin-lead">Tekstovi na naslovnici. Promjene se vide odmah nakon spremanja.</p>
      {FIELDS.map((field) => (
        <label key={field.key}>
          {field.label}
          {field.multiline ? (
            <textarea
              rows={3}
              value={values[field.key] ?? ''}
              onChange={(event) =>
                setValues((current) => ({ ...current, [field.key]: event.target.value }))
              }
            />
          ) : (
            <input
              value={values[field.key] ?? ''}
              onChange={(event) =>
                setValues((current) => ({ ...current, [field.key]: event.target.value }))
              }
            />
          )}
          {field.note ? <span className="admin-hint">{field.note}</span> : null}
        </label>
      ))}
      <div className="admin-actions">
        <button type="submit" className="admin-primary" disabled={saving}>
          {saving ? 'Spremam…' : 'Spremi'}
        </button>
      </div>
      {flash ? <p className="admin-flash">{flash}</p> : null}
    </form>
  );
};

export default SiteEditor;
