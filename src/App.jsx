const App = () => {
  return (
    <main className="page">
      <section className="hero" aria-labelledby="main-title">
        <img
          src="/favicon.svg"
          width="230"
          height="230"
          className="logo"
          alt="Linčarnica logo"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />

        <h1 id="main-title">Uskoro stižemo</h1>

        <p className="subtitle">
          Web stranica Udruge mještana Ugljan - Sušica “Linčarnica” uskoro će biti dostupna
        </p>

        <div className="divider" aria-hidden="true" />
        <p className="fineprint">
          Hvala na strpljenju
          <span className="version-tag" title={`Verzija ${__APP_VERSION__}`}>
            {' '}
            · v{__APP_VERSION__}
          </span>
        </p>
      </section>
    </main>
  );
};

export default App;
