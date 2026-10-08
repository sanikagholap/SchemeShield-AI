import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Building, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { BrandLogo } from '../components/common/BrandLogo';
import { authService } from '../services/authService';

export const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please provide all required fields.');
      return;
    }

    if (!agreeToTerms) {
      setError('You must agree to the civic non-fraud guidelines to proceed.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.signup({ name, email, password, organization, agreeToTerms });
      setIsLoading(false);
      navigate('/dashboard');
    } catch {
      setIsLoading(false);
      setError('Registration could not be completed. Please retry.');
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
        <BrandLogo showTagline size="md" />
      </div>

      <Card variant="glass" padding="lg">
        <CardHeader>
          <CardTitle style={{ textAlign: 'center', fontSize: 'var(--text-2xl)' }}>
            Join SchemeShield AI
          </CardTitle>
          <CardDescription style={{ textAlign: 'center' }}>
            Empower yourself and your local community against predatory welfare schemes
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g. Aarav Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<User size={16} />}
              required
            />

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
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={16} />}
              required
            />

            <Input
              label="Organization or Community Group (Optional)"
              type="text"
              placeholder="e.g. Panchayat Representative, NGO, Citizen"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              leftIcon={<Building size={16} />}
            />

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                id="agree"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                style={{ marginTop: '2px', accentColor: 'var(--color-primary)' }}
              />
              <label htmlFor="agree">
                I understand SchemeShield AI is an independent civic fraud detection engine and agree to use verification data responsibly.
              </label>
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
              Create Free Account
            </Button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-light)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
