import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';
import AdminLogin from './AdminLogin.jsx';
import AdminShell from './AdminShell.jsx';
import KontaktEditor from './KontaktEditor.jsx';
import MessagesInbox from './MessagesInbox.jsx';
import NoticesEditor from './NoticesEditor.jsx';
import SiteEditor from './SiteEditor.jsx';
import './admin.css';

const AdminApp = () => {
  const { ready, session } = useAuth();

  if (!supabase) {
    return (
      <main className="admin-login">
        <section className="admin-login-card">
          <h1>Uređivanje</h1>
          <p>Supabase nije spojen. Dodajte URL i publishable ključ pa ponovno izgradite stranicu.</p>
        </section>
      </main>
    );
  }

  if (!ready) {
    return (
      <main className="admin-login">
        <p className="admin-muted">Učitavanje…</p>
      </main>
    );
  }

  if (!session) {
    return <AdminLogin />;
  }

  return (
    <Routes>
      <Route element={<AdminShell />}>
        <Route index element={<Navigate to="obavijesti" replace />} />
        <Route path="obavijesti" element={<NoticesEditor />} />
        <Route path="stranica" element={<SiteEditor />} />
        <Route path="kontakt" element={<KontaktEditor />} />
        <Route path="poruke" element={<MessagesInbox />} />
      </Route>
    </Routes>
  );
};

export default AdminApp;
