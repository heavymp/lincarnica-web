import { useState } from 'react';
import { useAuth } from '../lib/AuthContext.jsx';

const AdminLogin = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    const { error: nextError } = await signIn(email.trim(), password);
    setBusy(false);
    if (nextError) {
      setError('Prijava nije uspjela. Provjerite e-mail i lozinku.');
    }
  };

  return (
    <main className="admin-login">
      <section className="admin-login-card">
        <img src="/favicon.svg" width="64" height="64" alt="" className="admin-login-logo" />
        <h1>Uređivanje</h1>
        <p>Prijavite se da uredite obavijesti i sadržaj stranice.</p>
        <form onSubmit={onSubmit} className="admin-form">
          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label>
            Lozinka
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          <button type="submit" className="admin-primary" disabled={busy}>
            {busy ? 'Prijava…' : 'Prijava'}
          </button>
          {error ? <p className="admin-error">{error}</p> : null}
        </form>
      </section>
    </main>
  );
};

export default AdminLogin;
