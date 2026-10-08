import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { BrandLogo } from '../components/common/BrandLogo';
import { authService } from '../services/authService';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please provide your registered email address.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      setIsLoading(false);
      setIsSubmitted(true);
    } catch {
      setIsLoading(false);
      setError('Unable to send reset instructions. Please try again.');
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '440px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
        <BrandLogo showTagline size="md" />
      </div>

      <Card variant="glass" padding="lg">
        <CardHeader>
          <CardTitle style={{ textAlign: 'center', fontSize: 'var(--text-2xl)' }}>
            Reset Password
          </CardTitle>
          <CardDescription style={{ textAlign: 'center' }}>
            Enter your email to receive password recovery instructions
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isSubmitted ? (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)' }}>
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
              <h4 style={{ fontSize: 'var(--text-lg)', color: 'var(--text-primary)', margin: 0 }}>
                Instructions Sent
              </h4>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                If an account exists for <strong>{email}</strong>, a recovery link has been dispatched.
              </p>
              <Link to="/login" style={{ textDecoration: 'none', width: '100%' }}>
                <Button variant="outline" fullWidth size="md">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <Input
                label="Email Address"
                type="email"
                placeholder="name@example.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail size={16} />}
                required
              />

              {error && (
                <div
                  style={{
                    padding: 'var(--space-3)',
                    backgroundColor: 'var(--color-fake-bg)',
                    border: '1px solid var(--color-fake-border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-fake-text)',
                    fontSize: 'var(--text-xs)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
              >
                Send Reset Link
              </Button>

              <div style={{ textAlign: 'center', marginTop: 'var(--space-2)' }}>
                <Link to="/login" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <ArrowLeft size={12} />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
