import { useSiteContent } from './lib/SiteContent.jsx';
import SectionDock from './sections/SectionDock.jsx';

const App = () => {
  const { content } = useSiteContent();

  return (
    <main className="page">
      <section className="hero" aria-labelledby="main-title">
        <img
          src="/favicon.svg"
          width="230"
          height="230"
          className="logo"
          alt={content.logo_alt}
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />

        <h1 id="main-title">{content.hero_title}</h1>
        <p className="subtitle">{content.hero_subtitle}</p>

        <SectionDock />

        <div className="divider" aria-hidden="true" />
        <p className="fineprint">
          {content.footer_text}
          {__CHANGELOG_URL__ ? (
            <>
              {' '}
              ·{' '}
              <a
                className="version-tag version-link"
                href={__CHANGELOG_URL__}
                target="_blank"
                rel="noopener noreferrer"
                title={`Verzija ${__APP_VERSION__} — povijest izmjena na GitHubu`}
                aria-label={`CHANGELOG za verziju ${__APP_VERSION__} (otvara GitHub)`}
              >
                v{__APP_VERSION__}
              </a>
            </>
          ) : (
            <span className="version-tag" title={`Verzija ${__APP_VERSION__}`}>
              {' '}
              · v{__APP_VERSION__}
            </span>
          )}
        </p>
      </section>
    </main>
  );
};

export default App;
