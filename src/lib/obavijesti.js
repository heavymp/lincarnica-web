const dateFmt = new Intl.DateTimeFormat('hr-HR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Europe/Zagreb'
});

const todayKeyFmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Zagreb',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});

function dateKey(value) {
  if (!value) return '';
  return todayKeyFmt.format(new Date(value));
}

export function todayKey() {
  return todayKeyFmt.format(new Date());
}

/** Map a Supabase row to the shape used by the UI. */
export function mapNotice(row) {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    happensAt: row.happens_at,
    important: Boolean(row.important),
    emoji: (row.emoji || '').trim(),
    created: row.created_at
  };
}

export function isPastNotice(record) {
  if (!record.happensAt) return false;
  return dateKey(record.happensAt) < todayKey();
}

export function formatHappensAt(value) {
  if (!value) return '';
  return dateFmt.format(new Date(value));
}

function sortStamp(record) {
  if (record.happensAt) return new Date(record.happensAt).getTime();
  return new Date(record.created).getTime();
}

/** Oldest → newest so past items sit above the current event. */
export function sortNotices(records) {
  return [...records].sort((a, b) => sortStamp(a) - sortStamp(b));
}
