import { kindMeta } from './noticeKinds.js';

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

const timeFmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Zagreb',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
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
  const kind = row.kind || 'obavijest';
  const emoji = (row.emoji || '').trim() || kindMeta(kind).emoji;
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    happensAt: row.happens_at,
    important: Boolean(row.important),
    draft: Boolean(row.draft),
    emoji,
    kind,
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

export function splitHappensAt(value) {
  if (!value) return { date: '', time: '' };
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return { date: '', time: '' };
  return {
    date: todayKeyFmt.format(parsed),
    time: timeFmt.format(parsed)
  };
}

export function joinHappensAt(date, time) {
  if (!date) return null;
  const clock = time && time.length >= 4 ? time : '12:00';
  const parsed = new Date(`${date}T${clock}:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function sortStamp(record) {
  if (record.happensAt) return new Date(record.happensAt).getTime();
  return new Date(record.created).getTime();
}

/** Oldest → newest so past items sit above the current event. */
export function sortNotices(records) {
  return [...records].sort((a, b) => sortStamp(a) - sortStamp(b));
}
