import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldCheck,
  FileSearch,
  MessageSquare,
  History,
  User,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

export interface SidebarProps {
  isCollapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const menuItems = [
    { label: 'Overview', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Verify Scheme', path: '/verify', icon: <ShieldCheck size={18} /> },
    { label: 'Explore Schemes', path: '/schemes', icon: <FileSearch size={18} /> },
    { label: 'AI Assistant', path: '/assistant', icon: <MessageSquare size={18} /> },
    { label: 'Verification History', path: '/history', icon: <History size={18} /> },
    { label: 'Citizen Profile', path: '/profile', icon: <User size={18} /> }
  ];

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
          padding: 'var(--space-5) var(--space-6)',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <BrandLogo showTagline={false} size="sm" />
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
          Verification Hub
        </div>

        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-fake-text)', fontWeight: 700, fontSize: 'var(--text-xs)' }}>
            <ShieldAlert size={14} />
            <span>Active Scam Wave</span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--color-fake-text)', marginTop: '4px', marginBottom: 0, lineHeight: 1.4 }}>
            PM Free Tractor Scheme 2026 phishing links circulating on WhatsApp.
          </p>
        </div>
      </nav>

      {/* Sidebar Footer / User Profile preview */}
      <div
        style={{
          padding: 'var(--space-4) var(--space-5)',
          borderTop: '1px solid var(--border-light)',
          backgroundColor: 'var(--bg-surface-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)'
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 'var(--text-xs)'
          }}
        >
          AS
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            Aarav Sharma
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            Citizen Verifier
          </div>
        </div>
      </div>
    </aside>
  );
};
