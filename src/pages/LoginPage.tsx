import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { BrandLogo } from '../components/common/BrandLogo';
import { authService } from '../services/authService';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please provide your registered email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.login({ email, password, rememberMe });
      setIsLoading(false);
      navigate('/dashboard');
    } catch {
      setIsLoading(false);
      setError('Invalid credentials. Please retry.');
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
            Citizen Sign In
          </CardTitle>
          <CardDescription style={{ textAlign: 'center' }}>
            Access saved verification reports and regional scam alerts
          </CardDescription>
        </CardHeader>

        <CardContent>
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

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={16} />}
              required
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: 'var(--color-primary)' }}
                />
                <span>Remember me</span>
              </label>

              <Link to="/forgot-password" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                Forgot password?
              </Link>
            </div>

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
              rightIcon={<ArrowRight size={16} />}
            >
              Sign In to SchemeShield
            </Button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-light)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
              Create citizen profile
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
