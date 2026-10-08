import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, Sparkles, UserCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AuthLayout } from '../components/auth/AuthLayout';
import { useAuth } from '../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect destination if routed from a protected page
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password, rememberMe });
      setSuccessMessage('Signed in successfully! Redirecting...');
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 500);
    } catch {
      setErrorMessage('Authentication could not complete. Please retry.');
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = (role: 'CITIZEN' | 'VERIFIER') => {
    loginAsDemo(role);
    setSuccessMessage(`Signed in as Demo ${role === 'VERIFIER' ? 'Verifier' : 'Citizen'}! Redirecting...`);
    setTimeout(() => {
      navigate(from, { replace: true });
    }, 400);
  };

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <AuthLayout>
        <div>
          {/* Header */}
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-brand-navy)', margin: 0, letterSpacing: '-0.02em' }}>
              Citizen Sign In
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Access your personal verification dashboard and alert feeds
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. citizen@example.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail size={16} />}
              required
            />

            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock size={16} />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ color: 'var(--text-tertiary)', padding: 0 }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                required
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: 'var(--color-primary)' }}
                />
                <span>Remember this device</span>
              </label>

              <Link to="/forgot-password" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                Forgot Password?
              </Link>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  backgroundColor: 'var(--color-fake-bg)',
                  border: '1px solid var(--color-fake-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-fake-text)',
                  fontSize: 'var(--text-xs)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <AlertCircle size={15} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  backgroundColor: 'var(--color-verified-bg)',
                  border: '1px solid var(--color-verified-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-verified-text)',
                  fontSize: 'var(--text-xs)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <CheckCircle2 size={15} />
                <span>{successMessage}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isSubmitting}
              rightIcon={<ArrowRight size={16} />}
            >
              Sign In to SchemeShield
            </Button>
          </form>

          {/* Quick Demo Login Option for evaluators */}
          <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-5)', borderTop: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: 'var(--space-3)' }}>
              <Sparkles size={12} color="var(--color-brand-accent)" />
              <span>Or test with zero setup via instant demo profile:</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
              <button
                type="button"
                onClick={() => handleDemoLogin('CITIZEN')}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface-secondary)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s'
                }}
              >
                <UserCheck size={14} color="var(--color-primary)" />
                <span>Demo Citizen</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('VERIFIER')}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface-secondary)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s'
                }}
              >
                <UserCheck size={14} color="#7c3aed" />
                <span>Demo Verifier</span>
              </button>
            </div>
          </div>

          {/* Footer Link to Signup */}
          <div style={{ textAlign: 'center', marginTop: 'var(--space-5)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
              Create citizen account
            </Link>
          </div>
        </div>
      </AuthLayout>
    </div>
  );
};
