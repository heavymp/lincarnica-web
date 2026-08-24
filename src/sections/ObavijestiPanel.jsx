import { useEffect, useRef, useState } from 'react';
import {
  formatHappensAt,
  isPastNotice,
  mapNotice,
  sortNotices
} from '../lib/obavijesti.js';
import { kindMeta } from '../lib/noticeKinds.js';
import { supabase } from '../lib/supabase.js';

async function fetchNotices() {
  const { data, error } = await supabase
    .from('obavijesti')
    .select('id, title, body, happens_at, important, emoji, kind, created_at')
    .eq('draft', false);

  if (error) throw error;

  return sortNotices((data ?? []).map(mapNotice));
}

const ObavijestiPanel = () => {
  const listRef = useRef(null);
  const currentRef = useRef(null);
  const [status, setStatus] = useState(supabase ? 'loading' : 'offline');
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!supabase) return undefined;

    let ignore = false;

    const apply = (nextStatus, nextItems) => {
      if (ignore) return;
      setStatus(nextStatus);
      setItems(nextItems);
    };

    fetchNotices()
      .then((records) => apply('ready', records))
      .catch(() => apply('error', []));

    const channel = supabase
      .channel('obavijesti-public')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'obavijesti' },
        () => {
          fetchNotices()
            .then((records) => apply('ready', records))
            .catch(() => apply('error', []));
        }
      )
      .subscribe();

    return () => {
      ignore = true;
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (status !== 'ready') return undefined;

    const frame = window.requestAnimationFrame(() => {
      const list = listRef.current;
      const current = currentRef.current;
      if (!list || !current) return;
      list.scrollTop = current.offsetTop - list.offsetTop;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [status, items]);

  if (status === 'loading') {
    return (
      <p className="panel-status" role="status">
        Učitavanje…
      </p>
    );
  }

  if (status === 'offline' || status === 'error') {
    return (
      <p className="panel-status">
        Obavijesti trenutačno nisu dostupne. Pokušajte kasnije.
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="panel-status">Trenutačno nema novih obavijesti.</p>
    );
  }

  const currentId = items.find((item) => !isPastNotice(item))?.id;

  return (
    <ul className="notice-list" ref={listRef}>
      {items.map((item) => {
        const past = isPastNotice(item);
        const classNames = ['notice'];
        if (item.important && !past) classNames.push('notice-important');
        if (past) classNames.push('notice-past');

        return (
          <li
            key={item.id}
            className={classNames.join(' ')}
            ref={item.id === currentId ? currentRef : undefined}
          >
            <div className="notice-meta">
              {item.emoji ? (
                <span className="notice-emoji" aria-hidden="true">
                  {item.emoji}
                </span>
              ) : null}
              {item.important && !past ? <span className="notice-flag">Važno</span> : null}
              {past ? <span className="notice-flag notice-flag-past">Prošlo</span> : null}
              <span>{kindMeta(item.kind).label}</span>
              {item.happensAt ? (
                <time dateTime={item.happensAt}>{formatHappensAt(item.happensAt)}</time>
              ) : null}
            </div>
            <h3 className="notice-title">
              {item.emoji ? <span className="sr-only">{item.emoji} </span> : null}
              {item.title}
            </h3>
            <p className="notice-body">{item.body}</p>
          </li>
        );
      })}
    </ul>
  );
};

export default ObavijestiPanel;
