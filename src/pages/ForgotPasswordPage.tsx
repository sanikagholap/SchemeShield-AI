import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, KeyRound, Lock, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AuthLayout } from '../components/auth/AuthLayout';
import { authService } from '../services/authService';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetCompleted, setResetCompleted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleRequestLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid registered email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.forgotPassword(email.trim());
      setIsSubmitting(false);
      setIsSubmitted(true);
    } catch {
      setErrorMessage('Unable to dispatch reset instructions. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleCompleteReset = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setResetCompleted(true);
    setTimeout(() => {
      navigate('/login');
    }, 1500);
  };

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <AuthLayout>
        <div>
          {/* Header */}
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-brand-navy)', margin: 0, letterSpacing: '-0.02em' }}>
              {isResetting ? 'Set New Password' : 'Reset Password'}
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {isResetting
                ? 'Create a secure new password for your citizen account'
                : 'Enter your email to receive recovery instructions'}
            </p>
          </div>

          {/* State 1: Reset Form completed successfully */}
          {resetCompleted ? (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-4) 0' }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-verified-bg)',
                  color: 'var(--color-verified)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CheckCircle2 size={28} />
              </div>
              <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--text-primary)', margin: 0 }}>
                Password Updated!
              </h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 0 }}>
                Your password has been changed. Redirecting to sign in...
              </p>
            </div>
          ) : isResetting ? (
            /* State 2: Simulated setting of new password */
            <form onSubmit={handleCompleteReset} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <Input
                label="New Password"
                type="password"
                placeholder="Minimum 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                leftIcon={<Lock size={16} />}
                required
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Re-enter new password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                leftIcon={<Lock size={16} />}
                required
              />

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

              <Button type="submit" variant="primary" size="lg" fullWidth rightIcon={<ArrowRight size={16} />}>
                Update Password & Sign In
              </Button>
            </form>
          ) : isSubmitted ? (
            /* State 3: Instructions Dispatched Confirmation */
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-2) 0' }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-verified-bg)',
                  color: 'var(--color-verified)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CheckCircle2 size={28} />
              </div>

              <div>
                <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--text-primary)', margin: 0 }}>
                  Reset Link Dispatched
                </h3>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
                  We sent recovery instructions to <strong>{email}</strong>. (Simulated mock flow).
                </p>
              </div>

              <div
                style={{
                  padding: 'var(--space-3)',
                  backgroundColor: 'var(--bg-surface-secondary)',
                  borderRadius: 'var(--radius-md)',
                  width: '100%',
                  fontSize: '11px',
                  color: 'var(--text-tertiary)'
                }}
              >
                Tip: In this frontend preview, you can test setting your new password immediately:
              </div>

              <Button
                variant="outline"
                size="md"
                fullWidth
                onClick={() => setIsResetting(true)}
                leftIcon={<KeyRound size={16} />}
              >
                Simulate Entering New Password
              </Button>

              <Link to="/login" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: 'var(--space-2)' }}>
                <ArrowLeft size={13} />
                <span>Return to Sign In</span>
              </Link>
            </div>
          ) : (
            /* State 4: Initial Email input */
            <form onSubmit={handleRequestLink} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <Input
                label="Registered Email Address"
                type="email"
                placeholder="citizen@example.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail size={16} />}
                hint="We'll send password recovery instructions to this address."
                required
              />

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

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isSubmitting}
                rightIcon={<ArrowRight size={16} />}
              >
                Send Recovery Link
              </Button>

              <div style={{ textAlign: 'center', marginTop: 'var(--space-2)' }}>
                <Link
                  to="/login"
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-tertiary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <ArrowLeft size={13} />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </AuthLayout>
    </div>
  );
};
