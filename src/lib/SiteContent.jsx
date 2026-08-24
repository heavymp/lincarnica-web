import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_CONTENT,
  DEFAULT_KONTAKT,
  KONTAKT_PUBLIC_SELECT,
  mapKontakt,
  rowsToContent
} from './content.js';
import { supabase } from './supabase.js';

const SiteContentContext = createContext({
  content: DEFAULT_CONTENT,
  kontakt: DEFAULT_KONTAKT,
  ready: !supabase
});

export const SiteContentProvider = ({ children }) => {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [kontakt, setKontakt] = useState(DEFAULT_KONTAKT);
  const [ready, setReady] = useState(!supabase);

  useEffect(() => {
    if (!supabase) return undefined;

    let ignore = false;

    const load = async () => {
      const [copyRes, kontaktRes] = await Promise.all([
        supabase.from('site_content').select('key, value'),
        supabase.from('kontakt_settings').select(KONTAKT_PUBLIC_SELECT).eq('id', 1).maybeSingle()
      ]);

      if (ignore) return;

      if (!copyRes.error) {
        setContent(rowsToContent(copyRes.data));
      }
      if (!kontaktRes.error) {
        setKontakt(mapKontakt(kontaktRes.data));
      }
      setReady(true);
    };

    void load();

    const channel = supabase
      .channel('site-cms')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_content' },
        () => {
          void load();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'kontakt_settings' },
        () => {
          void load();
        }
      )
      .subscribe();

    return () => {
      ignore = true;
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (content.meta_title) document.title = content.meta_title;
    const desc = document.querySelector('meta[name="description"]');
    if (desc && content.meta_description) {
      desc.setAttribute('content', content.meta_description);
    }
  }, [content.meta_title, content.meta_description]);

  const value = useMemo(
    () => ({ content, kontakt, ready }),
    [content, kontakt, ready]
  );

  return (
    <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>
  );
};

export const useSiteContent = () => useContext(SiteContentContext);
