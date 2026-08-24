import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSiteContent } from '../lib/SiteContent.jsx';

const PrivacyPage = () => {
  const { kontakt } = useSiteContent();

  useEffect(() => {
    document.title = 'Politika privatnosti — Linčarnica';
    return () => {
      document.title = 'Udruga mještana Ugljan - Sušica "Linčarnica"';
    };
  }, []);

  return (
    <main className="page legal-page">
      <article className="legal-card">
        <header className="legal-header">
          <Link className="legal-back" to="/">
            ← Početna
          </Link>
          <h1>Politika privatnosti</h1>
          <p className="legal-updated">Zadnje ažuriranje: kolovoz 2026.</p>
        </header>

        <section className="legal-section">
          <h2>1. Uvod</h2>
          <p>
            Ova politika objašnjava kako <strong>Udruga mještana Ugljan – Sušica „Linčarnica”</strong>{' '}
            (u daljnjem tekstu: <em>Udruga</em>) postupa s osobnim podacima posjetitelja web stranice{' '}
            <strong>lincarnica.hr</strong> (u daljnjem tekstu: <em>Stranica</em>).
          </p>
          <p>
            Udruga poštuje vašu privatnost i obrađuje osobne podatke u skladu s Općom uredbom o zaštiti
            podataka (GDPR) i važećim propisima Republike Hrvatske.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Voditelj obrade</h2>
          <p>
            <strong>Udruga mještana Ugljan – Sušica „Linčarnica”</strong>
          </p>
          {kontakt.address ? <p>{kontakt.address}</p> : null}
          {kontakt.email ? (
            <p>
              E-mail:{' '}
              <a href={`mailto:${kontakt.email}`}>{kontakt.email}</a>
            </p>
          ) : (
            <p>Za upite o privatnosti koristite kontakt obrazac na Stranici.</p>
          )}
          {kontakt.phone ? <p>Telefon: {kontakt.phone}</p> : null}
        </section>

        <section className="legal-section">
          <h2>3. Koje podatke prikupljamo</h2>
          <p>Stranica ne koristi analitičke alate niti profiliranje. Obradimo podatke koje sami pošaljete:</p>
          <ul>
            <li>
              <strong>Pretplata na obavijesti</strong> — e-mail adresa (dobrovoljno, putem ikone zvona).
            </li>
            <li>
              <strong>Kontakt obrazac</strong> — ime i prezime, e-mail, telefon (ako ga unesete) i tekst
              poruke.
            </li>
            <li>
              <strong>Tehnički podaci</strong> — standardni zapisi poslužitelja (npr. IP adresa, vrijeme
              pristupa) mogu nastati kod hostinga; ne koristimo ih za profiliranje.
            </li>
          </ul>
          <p>Ne prikupljamo posebne kategorije osobnih podataka (npr. zdravstvene podatke).</p>
        </section>

        <section className="legal-section">
          <h2>4. Svrha i pravna osnova obrade</h2>
          <ul>
            <li>
              <strong>Obavijesti e-mailom</strong> — slanje obavijesti o djelovanju Udruge. Pravna osnova:{' '}
              <em>vaša suglasnost</em> (pri pretplati). Suglasnost možete povući odjavom u svakom mailu
              ili na <Link to="/odjava">stranici za odjavu</Link>.
            </li>
            <li>
              <strong>Kontakt poruke</strong> — odgovor na vaš upit. Pravna osnova:{' '}
              <em>legitimni interes</em> Udruge za komunikaciju s članovima i sugrađanima, odnosno{' '}
              <em>koraci prije sklapanja ugovora</em> na vaš zahtjev.
            </li>
            <li>
              <strong>Rad Stranice</strong> — prikaz sadržaja. Pravna osnova: <em>legitimni interes</em>{' '}
              informiranja javnosti o Udrugi.
            </li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>5. Kolačići i slične tehnologije</h2>
          <p>
            Stranica <strong>ne koristi</strong> kolačiće za oglašavanje, analitiku ili praćenje ponašanja.
            Ne prikazujemo banner za kolačiće jer takve tehnologije ne koristimo.
          </p>
          <p>
            Za prikaz tipografije učitavamo fontove s Google Fonts usluge; pritom se vaš preglednik može
            spojiti na poslužitelje Googlea. U administraciji (<code>/admin</code>) prijavljeni urednici
            koriste lokalnu pohranu preglednika radi održavanja prijave — to se ne odnosi na redovite
            posjetitelje Stranice.
          </p>
        </section>

        <section className="legal-section">
          <h2>6. Primatelji i izvršitelji obrade</h2>
          <p>Podatke dijelimo samo s pružateljima usluga potrebnim za rad Stranice:</p>
          <ul>
            <li>
              <strong>Supabase</strong> — baza podataka i tehnička infrastruktura (EU / EEZ, ovisno o
              regiji projekta).
            </li>
            <li>
              <strong>Brevo</strong> — slanje e-mail obavijesti i pohrana kontakata u mailing listi (EU).
            </li>
            <li>
              <strong>Hostinger</strong> — hosting statičke web stranice.
            </li>
          </ul>
          <p>S te pružateljima sklopljeni su ugovori o obradi podataka u skladu s čl. 28. GDPR-a.</p>
          <p>Podatke ne prodajemo niti ustupamo trećim stranama u marketinške svrhe.</p>
        </section>

        <section className="legal-section">
          <h2>7. Pohrana podataka</h2>
          <ul>
            <li>
              <strong>Pretplatnici obavijesti</strong> — do odjave ili dok Udruga vodi listu obavijesti;
              neaktivne adrese povremeno brišemo.
            </li>
            <li>
              <strong>Kontakt poruke</strong> — dok je potrebno za obradu upita, najduže do nekoliko
              godina ako zakon ne zahtijeva duže čuvanje.
            </li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>8. Vaša prava</h2>
          <p>U skladu s GDPR-om imate pravo na:</p>
          <ul>
            <li>pristup svojim podacima,</li>
            <li>ispravak netočnih podataka,</li>
            <li>brisanje („pravo na zaborav”),</li>
            <li>ograničenje obrade,</li>
            <li>prenosivost podataka,</li>
            <li>prigovor na obradu,</li>
            <li>povlačenje suglasnosti (za pretplatu) bez utjecaja na zakonitost prijašnje obrade.</li>
          </ul>
          <p>
            Za ostvarivanje prava pišite Udruzi putem kontakt podataka gore. Odgovorit ćemo u roku propisanom
            zakonom (obično unutar mjesec dana).
          </p>
        </section>

        <section className="legal-section">
          <h2>9. Pritužba nadležnom tijelu</h2>
          <p>
            Ako smatrate da obrada krši propise, možete podnijeti pritužbu Agenciji za zaštitu osobnih
            podataka (AZOP):{' '}
            <a href="https://azop.hr" target="_blank" rel="noopener noreferrer">
              azop.hr
            </a>
            .
          </p>
        </section>

        <section className="legal-section">
          <h2>10. Izmjene ove politike</h2>
          <p>
            Politiku možemo ažurirati povremeno. Nova verzija bit će objavljena na ovoj adresi s datumom
            ažuriranja.
          </p>
        </section>

        <footer className="legal-footer">
          <Link to="/">Natrag na početnu</Link>
        </footer>
      </article>
    </main>
  );
};

export default PrivacyPage;
