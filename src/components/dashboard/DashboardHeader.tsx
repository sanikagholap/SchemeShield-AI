import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  Check,
  Menu,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { MOCK_NOTIFICATIONS } from '../../data/mockData';
import { Badge } from '../ui/Badge';

export interface DashboardHeaderProps {
  onToggleSidebar?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout, loginAsDemo } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const navigate = useNavigate();

  // Dynamic greeting based on current local time
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formattedDate = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-4) var(--space-6)',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-header)'
      }}
    >
      {/* Left: Mobile hamburger & Greeting */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="mobile-sidebar-toggle"
            aria-label="Toggle sidebar menu"
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--bg-surface-secondary)'
            }}
          >
            <Menu size={20} />
          </button>
        )}

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {greeting}, {user?.name || 'Citizen'}
            </h1>
            <Badge variant="verified" size="sm" hasDot>
              {user?.role === 'VERIFIER' ? 'Verifier' : 'Citizen'}
            </Badge>
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
            Check the authenticity and credibility of government scheme information.
          </p>
        </div>
      </div>

      {/* Right: Date, Notifications, User Menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {/* Date pill (hidden on small mobile) */}
        <div
          className="header-date-pill"
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--text-tertiary)',
            backgroundColor: 'var(--bg-surface-secondary)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            fontWeight: 500
          }}
        >
          {formattedDate}
        </div>

        {/* Notifications Button & Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
            style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-md)',
              backgroundColor: showNotifications ? 'var(--color-primary-light)' : 'var(--bg-surface-secondary)',
              color: showNotifications ? 'var(--color-primary)' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              transition: 'all var(--transition-fast)'
            }}
            aria-label="View notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-fake)'
                }}
              />
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: '46px',
                right: 0,
                width: '320px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-xl)',
                zIndex: 'var(--z-modal)',
                overflow: 'hidden',
                animation: 'scaleUp var(--transition-fast)'
              }}
            >
              <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                  Notifications ({unreadCount})
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 600 }}
                  >
                    Mark read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: 'var(--space-3) var(--space-4)',
                      borderBottom: '1px solid var(--border-light)',
                      backgroundColor: n.read ? 'transparent' : 'var(--color-primary-light)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {n.title}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{n.timestamp}</span>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                      {n.message}
                    </p>
                  </div>
                ))}
              </div>

              <div style={{ padding: '8px var(--space-4)', textAlign: 'center', backgroundColor: 'var(--bg-surface-secondary)', borderTop: '1px solid var(--border-light)' }}>
                <Link
                  to="/verify"
                  onClick={() => setShowNotifications(false)}
                  style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <span>Verify an Announcement</span>
                  <ExternalLink size={10} />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown Button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: '4px 8px 4px 4px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-surface-secondary)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer'
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '12px'
              }}
            >
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AS'}
            </div>
            <ChevronDown size={14} color="var(--text-tertiary)" />
          </button>

          {/* User Menu Panel */}
          {showUserMenu && (
            <div
              style={{
                position: 'absolute',
                top: '44px',
                right: 0,
                width: '240px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-xl)',
                zIndex: 'var(--z-modal)',
                overflow: 'hidden',
                animation: 'scaleUp var(--transition-fast)'
              }}
            >
              <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {user?.name}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  {user?.email}
                </div>
              </div>

              <div style={{ padding: 'var(--space-2)' }}>
                <Link
                  to="/profile"
                  onClick={() => setShowUserMenu(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <UserIcon size={14} />
                  <span>View Citizen Profile</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    loginAsDemo(user?.role === 'CITIZEN' ? 'VERIFIER' : 'CITIZEN');
                    setShowUserMenu(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-primary)',
                    width: '100%',
                    textAlign: 'left'
                  }}
                >
                  <ShieldCheck size={14} />
                  <span>Switch Role ({user?.role === 'CITIZEN' ? 'Verifier' : 'Citizen'})</span>
                </button>
              </div>

              <div style={{ padding: 'var(--space-2)', borderTop: '1px solid var(--border-light)' }}>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-fake)',
                    width: '100%',
                    textAlign: 'left'
                  }}
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .header-date-pill { display: none !important; }
        }
        @media (min-width: 1024px) {
          .mobile-sidebar-toggle { display: none !important; }
        }
      `}</style>
    </header>
  );
};
