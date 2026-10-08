import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldCheck,
  FileSearch,
  MessageSquare,
  History,
  User,
  LogOut,
  ShieldAlert,
  X
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { useAuth } from '../../hooks/useAuth';

export interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Verify Scheme', path: '/verify', icon: <ShieldCheck size={18} /> },
    { label: 'Explore Schemes', path: '/schemes', icon: <FileSearch size={18} /> },
    { label: 'AI Assistant', path: '/assistant', icon: <MessageSquare size={18} /> },
    { label: 'Verification History', path: '/history', icon: <History size={18} /> },
    { label: 'Profile', path: '/profile', icon: <User size={18} /> }
  ];

  const handleLogout = () => {
    logout();
    if (onClose) onClose();
    navigate('/login');
  };

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-sidebar)'
      }}
      className="app-sidebar"
    >
      {/* Sidebar Header */}
      <div
        style={{
          padding: 'var(--space-4) var(--space-5)',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 'var(--navbar-height)'
        }}
      >
        <BrandLogo showTagline={false} size="sm" />
        {onClose && (
          <button
            onClick={onClose}
            className="mobile-close-btn"
            style={{ padding: '4px', color: 'var(--text-tertiary)', borderRadius: 'var(--radius-sm)' }}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav Menu Items */}
      <nav
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          padding: 'var(--space-4) var(--space-3)',
          flex: 1,
          overflowY: 'auto'
        }}
      >
        <div style={{ padding: '0 var(--space-3) var(--space-2)', fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Platform Navigation
        </div>

        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => { if (onClose) onClose(); }}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              padding: '0.625rem 0.875rem',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              fontWeight: isActive ? 600 : 500,
              backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent',
              color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
              textDecoration: 'none',
              transition: 'all var(--transition-fast)'
            })}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}

        <div style={{ height: '1px', backgroundColor: 'var(--border-light)', margin: 'var(--space-4) var(--space-2)' }} />

        {/* Quick Threat Alert widget */}
        <div
          style={{
            margin: '0 var(--space-2)',
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-fake-bg)',
            border: '1px solid var(--color-fake-border)',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-fake-text)', fontWeight: 700, fontSize: '11px' }}>
            <ShieldAlert size={14} />
            <span>Active Phishing Wave</span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--color-fake-text)', marginTop: '4px', marginBottom: 0, lineHeight: 1.4 }}>
            "PM Free Tractor Scheme" soliciting ₹499 via UPI. PIB Fact Check confirmed fraudulent.
          </p>
        </div>
      </nav>

      {/* Sidebar Footer / User Profile & Logout */}
      <div
        style={{
          padding: 'var(--space-3) var(--space-4)',
          borderTop: '1px solid var(--border-light)',
          backgroundColor: 'var(--bg-surface-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-2)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', overflow: 'hidden' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '11px',
              flexShrink: 0
            }}
          >
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AS'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user?.name || 'Citizen User'}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user?.role === 'VERIFIER' ? 'Civic Verifier' : 'Verified Citizen'}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            padding: '6px',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          title="Sign Out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};
