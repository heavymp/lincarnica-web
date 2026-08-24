import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { formatHappensAt, isPastNotice } from '../lib/obavijesti.js';
import { kindMeta } from '../lib/noticeKinds.js';

function bodyParagraphs(text) {
  return String(text || '')
    .trim()
    .split(/\n{2,}/u)
    .map((part) => part.trim())
    .filter(Boolean);
}

const NoticeDetail = ({ notice, onClose }) => {
  const titleId = useId();
  const closeRef = useRef(null);
  const past = isPastNotice(notice);
  const kind = kindMeta(notice.kind);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return createPortal(
    <div className="notice-sheet" role="presentation" onClick={onClose}>
      <div
        className="notice-sheet-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="notice-sheet-handle" aria-hidden="true" />
        <button
          ref={closeRef}
          type="button"
          className="notice-sheet-close"
          onClick={onClose}
          aria-label="Zatvori"
        >
          ✕
        </button>

        <div className="notice-sheet-hero">
          <span className="notice-sheet-emoji" aria-hidden="true">
            {notice.emoji}
          </span>
          <div className="notice-sheet-badges">
            <span className="notice-sheet-kind">{kind.label}</span>
            {notice.important && !past ? (
              <span className="notice-flag">Važno</span>
            ) : null}
            {past ? <span className="notice-flag notice-flag-past">Prošlo</span> : null}
          </div>
          {notice.happensAt ? (
            <time className="notice-sheet-when" dateTime={notice.happensAt}>
              {formatHappensAt(notice.happensAt)}
            </time>
          ) : null}
        </div>

        <h2 id={titleId} className="notice-sheet-title">
          {notice.title}
        </h2>

        <div className="notice-sheet-body">
          {bodyParagraphs(notice.body).map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default NoticeDetail;
