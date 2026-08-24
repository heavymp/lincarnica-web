import { Link } from 'react-router-dom';

const PrivacyNotice = ({ context = 'default' }) => {
  if (context === 'subscribe') {
    return (
      <p className="privacy-notice">
        Prijavom prihvaćate primanje e-mail obavijesti Udruge. Odjava je u svakom mailu.{' '}
        <Link to="/privatnost">Politika privatnosti</Link>
      </p>
    );
  }

  if (context === 'kontakt') {
    return (
      <p className="privacy-notice">
        Slanjem poruke Udruzi dopuštate obradu unesenih podataka radi odgovora na upit.{' '}
        <Link to="/privatnost">Politika privatnosti</Link>
      </p>
    );
  }

  return (
    <p className="privacy-notice">
      <Link to="/privatnost">Politika privatnosti</Link>
    </p>
  );
};

export default PrivacyNotice;
