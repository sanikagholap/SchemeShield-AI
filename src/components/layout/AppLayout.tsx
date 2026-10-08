import React from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';

export const AppLayout: React.FC = () => {
  const location = useLocation();

  const isDashboardRoot = location.pathname === '/dashboard';
  const isWorkbenchSection = ['/history', '/profile'].includes(location.pathname);
  const isAuthPage = ['/login', '/signup', '/forgot-password'].includes(location.pathname);

  // Dashboard has its own dedicated full-height sidebar and header
  if (isDashboardRoot) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-app)' }}>
        <Outlet />
      </div>
    );
  }

  // Auth pages (login, signup, forgot password)
  if (isAuthPage) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-app)' }}>
        <Navbar />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-8) var(--space-4)' }}>
          <Outlet />
        </main>
        <Footer />
      </div>
    );
  }

  // Workbench areas like /history and /profile
  if (isWorkbenchSection) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'var(--bg-app)' }}>
        <div className="hidden-mobile" style={{ display: 'none' }}>
          <Sidebar />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Navbar />
          <main style={{ flex: 1, padding: 'var(--space-6) 0' }}>
            <Outlet />
          </main>
          <Footer />
        </div>
        <style>{`
          @media (min-width: 1024px) {
            .hidden-mobile { display: block !important; }
          }
        `}</style>
      </div>
    );
  }

  // Public / Standard Pages (Landing, Verify, Schemes, Assistant)
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-app)' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
