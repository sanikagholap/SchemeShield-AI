import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Verify Scheme', path: '/verify' },
    { label: 'Explore Schemes', path: '/schemes' },
    { label: 'AI Assistant', path: '/assistant' },
    { label: 'Dashboard', path: '/dashboard' }
  ];

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-header)',
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-subtle)',
        height: 'var(--navbar-height)',
        display: 'flex',
        alignItems: 'center'
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
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              style={({ isActive }) => ({
                fontSize: 'var(--text-sm)',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
                position: 'relative',
                padding: 'var(--space-2) 0',
                transition: 'color var(--transition-fast)'
              })}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop Auth Actions */}
        <div
          style={{
            display: 'none',
            alignItems: 'center',
            gap: 'var(--space-3)'
          }}
          className="desktop-actions"
        >
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Login
            </Button>
          </Link>
          <Link to="/verify">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight size={14} />}>
              Verify Now
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="mobile-menu-btn"
          aria-label="Toggle navigation menu"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-2)',
            color: 'var(--text-primary)',
            borderRadius: 'var(--radius-md)'
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
                  onClick={closeMenu}
                  style={{
                    padding: 'var(--space-3) var(--space-4)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-base)',
                    fontWeight: isActive ? 600 : 500,
                    backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent',
                    color: isActive ? 'var(--color-primary)' : 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>{link.label}</span>
                  {isActive && <ShieldCheck size={16} />}
                </Link>
              );
            })}
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: 'var(--space-2) 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <Link to="/login" onClick={closeMenu} style={{ textDecoration: 'none' }}>
              <Button variant="outline" fullWidth size="md">
                Citizen Login
              </Button>
            </Link>
            <Link to="/verify" onClick={closeMenu} style={{ textDecoration: 'none' }}>
              <Button variant="primary" fullWidth size="md" leftIcon={<Sparkles size={16} />}>
                Verify a Scheme
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Inline styles for media query visibility */}
      <style>{`
        @media (min-width: 860px) {
          .desktop-nav { display: flex !important; }
          .desktop-actions { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </header>
  );
};
