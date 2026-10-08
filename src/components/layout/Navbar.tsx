import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Bell,
  User as UserIcon,
  LogOut,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { MOCK_NOTIFICATIONS_LIST } from '../../data/mockNotifications';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS_LIST);
  const location = useLocation();

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowNotifications(false);
    setShowUserMenu(false);
  }, [location.pathname]);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = user
    ? [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Verify Scheme', path: '/verify' },
        { label: 'Explore Schemes', path: '/schemes' },
        { label: 'AI Assistant', path: '/assistant' },
        { label: 'History', path: '/history' }
      ]
    : [
        { label: 'Home', path: '/' },
        { label: 'Verify Scheme', path: '/verify' },
        { label: 'Explore Schemes', path: '/schemes' },
        { label: 'AI Assistant', path: '/assistant' }
      ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-header)',
        backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: isScrolled ? '1px solid var(--border-medium)' : '1px solid var(--border-subtle)',
        boxShadow: isScrolled ? 'var(--shadow-sm)' : 'none',
        height: 'var(--navbar-height)',
        display: 'flex',
        alignItems: 'center',
        transition: 'background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease'
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%'
        }}
      >
        {/* Brand Logo */}
        <BrandLogo showTagline size="md" />

        {/* Desktop Navigation */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: 'var(--space-6)'
          }}
          className="desktop-nav"
          aria-label="Main Navigation"
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              style={({ isActive }) => ({
                fontSize: 'var(--text-sm)',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
                position: 'relative',
                padding: 'var(--space-2) 0',
                transition: 'color var(--transition-fast)'
              })}
            >
              {({ isActive }) => (
                <>
                  <span>{link.label}</span>
                  {isActive && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '-2px',
                        left: 0,
                        right: 0,
                        height: '2px',
                        backgroundColor: 'var(--color-primary)',
                        borderRadius: 'var(--radius-full)'
                      }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Desktop Right Actions (User, Notifications, or Login) */}
        <div
          style={{
            display: 'none',
            alignItems: 'center',
            gap: 'var(--space-3)'
          }}
          className="desktop-actions"
        >
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              {/* Notification Button */}
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowUserMenu(false);
                  }}
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
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer'
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

                {/* Notifications Panel */}
                {showNotifications && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '46px',
                      right: 0,
                      width: '340px',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-xl)',
                      boxShadow: 'var(--shadow-xl)',
                      zIndex: 'var(--z-modal)',
                      overflow: 'hidden',
                      animation: 'scaleUp var(--transition-fast)'
                    }}
                  >
                    <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-app)' }}>
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                        Notifications ({unreadCount})
                      </span>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 600, background: 'transparent', border: 'none', cursor: 'pointer' }}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
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
                        style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                      >
                        <span>Verify an Announcement</span>
                        <ExternalLink size={10} />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowNotifications(false);
                  }}
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

                {showUserMenu && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '44px',
                      right: 0,
                      width: '220px',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-xl)',
                      boxShadow: 'var(--shadow-xl)',
                      zIndex: 'var(--z-modal)',
                      overflow: 'hidden',
                      animation: 'scaleUp var(--transition-fast)'
                    }}
                  >
                    <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--bg-app)' }}>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {user.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        {user.email}
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
                          color: 'var(--text-secondary)',
                          textDecoration: 'none'
                        }}
                      >
                        <UserIcon size={14} />
                        <span>Profile & Settings</span>
                      </Link>

                      <Link
                        to="/history"
                        onClick={() => setShowUserMenu(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-2)',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-md)',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--text-secondary)',
                          textDecoration: 'none'
                        }}
                      >
                        <ShieldCheck size={14} />
                        <span>Verification Audit Log</span>
                      </Link>
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
                          textAlign: 'left',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer'
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
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/signup" style={{ textDecoration: 'none' }}>
                <Button variant="primary" size="sm" rightIcon={<ArrowRight size={14} />}>
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="mobile-menu-btn"
          aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMobileMenuOpen}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-2)',
            color: 'var(--text-primary)',
            borderRadius: 'var(--radius-md)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 'var(--navbar-height)',
            left: 0,
            right: 0,
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-medium)',
            boxShadow: 'var(--shadow-xl)',
            padding: 'var(--space-6) var(--space-4)',
            zIndex: 'var(--z-header)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
            animation: 'fadeIn var(--transition-fast)'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    padding: 'var(--space-3) var(--space-4)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-base)',
                    fontWeight: isActive ? 700 : 500,
                    backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent',
                    color: isActive ? 'var(--color-primary)' : 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textDecoration: 'none'
                  }}
                >
                  <span>{link.label}</span>
                  {isActive && <ShieldCheck size={16} />}
                </Link>
              );
            })}

            {user && (
              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-base)',
                  fontWeight: location.pathname === '/profile' ? 700 : 500,
                  backgroundColor: location.pathname === '/profile' ? 'var(--color-primary-light)' : 'transparent',
                  color: location.pathname === '/profile' ? 'var(--color-primary)' : 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textDecoration: 'none'
                }}
              >
                <span>Profile & Settings</span>
                <UserIcon size={16} />
              </Link>
            )}
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: 'var(--space-2) 0' }} />

          {user ? (
            <Button
              variant="outline"
              fullWidth
              size="md"
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLogout();
              }}
              leftIcon={<LogOut size={16} />}
              style={{ color: 'var(--color-fake)', borderColor: 'var(--color-fake-border)' }}
            >
              Sign Out ({user.name})
            </Button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} style={{ textDecoration: 'none' }}>
                <Button variant="outline" fullWidth size="md">
                  Login
                </Button>
              </Link>
              <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} style={{ textDecoration: 'none' }}>
                <Button variant="primary" fullWidth size="md" leftIcon={<Sparkles size={16} />}>
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Responsive media visibility rule */}
      <style>{`
        @media (min-width: 960px) {
          .desktop-nav { display: flex !important; }
          .desktop-actions { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </header>
  );
};
