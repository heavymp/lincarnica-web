import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App.jsx';
import AdminApp from './admin/AdminApp.jsx';
import { AuthProvider } from './lib/AuthContext.jsx';
import { SiteContentProvider } from './lib/SiteContent.jsx';
import UnsubscribePage from './pages/UnsubscribePage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';
import './styles.css';

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Missing root element');
}

createRoot(rootEl).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/"
            element={
              <SiteContentProvider>
                <App />
              </SiteContentProvider>
            }
          />
          <Route path="/odjava" element={<UnsubscribePage />} />
          <Route
            path="/privatnost"
            element={
              <SiteContentProvider>
                <PrivacyPage />
              </SiteContentProvider>
            }
          />
          <Route path="/admin/*" element={<AdminApp />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
