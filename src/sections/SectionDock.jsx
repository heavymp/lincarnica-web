import { useId, useState } from 'react';
import { useSiteContent } from '../lib/SiteContent.jsx';
import { sections } from './registry.js';

const SectionDock = () => {
  const panelId = useId();
  const { content } = useSiteContent();
  const [openId, setOpenId] = useState(sections[0]?.id ?? null);
  const [shownId, setShownId] = useState(sections[0]?.id ?? null);
  const single = sections.length === 1;
  const active = sections.find((section) => section.id === openId);
  const shown = sections.find((section) => section.id === shownId) ?? sections[0];
  const Panel = shown?.Panel;
  const expanded = Boolean(active);

  const toggle = (id) => {
    const next = openId === id ? null : id;
    setOpenId(next);
    if (next) setShownId(next);
  };

  if (sections.length === 0) return null;

  return (
    <div className="dock">
      <div
        className="dock-bar"
        role={single ? undefined : 'tablist'}
        aria-label="Sadržaj"
      >
        {sections.map((section) => {
          const isActive = openId === section.id;
          const label = content[section.labelKey] || section.fallbackLabel;
          return (
            <button
              key={section.id}
              type="button"
              className={isActive ? 'dock-tab is-active' : 'dock-tab'}
              onClick={() => toggle(section.id)}
              aria-expanded={isActive}
              aria-controls={panelId}
              role={single ? undefined : 'tab'}
              aria-selected={single ? undefined : isActive}
            >
              <span>{label}</span>
              {single ? (
                <svg
                  className={isActive ? 'dock-chevron is-open' : 'dock-chevron'}
                  viewBox="0 0 12 8"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M1.5 1.75 6 6.25 10.5 1.75"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : null}
            </button>
          );
        })}
      </div>

      <div
        id={panelId}
        className={expanded ? 'dock-panel is-open' : 'dock-panel'}
        role="region"
        aria-label={shown ? content[shown.labelKey] || shown.fallbackLabel : 'Sadržaj'}
        aria-hidden={!expanded}
        inert={expanded ? undefined : true}
      >
        <div className="dock-panel-inner">{Panel ? <Panel /> : null}</div>
      </div>
    </div>
  );
};

export default SectionDock;
