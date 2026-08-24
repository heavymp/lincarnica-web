import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext.jsx';

const tabs = [
  { to: '/admin/obavijesti', label: 'Obavijesti' },
  { to: '/admin/stranica', label: 'Stranica' },
  { to: '/admin/kontakt', label: 'Kontakt' },
  { to: '/admin/poruke', label: 'Poruke' },
  { to: '/admin/pretplate', label: 'Pretplate' }
];

const AdminShell = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="admin-app">
      <header className="admin-top">
        <div className="admin-brand">
          <img src="/favicon.svg" width="28" height="28" alt="" />
          <span>Linčarnica</span>
        </div>
        <nav className="admin-tabs" aria-label="Uređivanje">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) => (isActive ? 'is-active' : undefined)}
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-user">
          <span>{user?.email}</span>
          <button type="button" className="admin-ghost" onClick={() => void signOut()}>
            Odjava
          </button>
        </div>
      </header>
      <Outlet />
    </div>
  );
};

export default AdminShell;
