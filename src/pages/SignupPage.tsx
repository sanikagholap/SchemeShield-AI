import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AuthLayout } from '../components/auth/AuthLayout';
import { PasswordStrength } from '../components/auth/PasswordStrength';
import { useAuth } from '../hooks/useAuth';

export const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please provide your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }
    if (!agreeToTerms) {
      setErrorMessage('Please agree to the civic non-fraud guidelines to proceed.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signup({
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        phone: phone.trim() || undefined,
        organization: organization.trim() || undefined,
        agreeToTerms
      });

      setSuccessMessage('Account created successfully! Preparing dashboard...');
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 500);
    } catch {
      setErrorMessage('Failed to create account. Please retry.');
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <AuthLayout>
        <div>
          {/* Header */}
          <div style={{ marginBottom: 'var(--space-5)' }}>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-brand-navy)', margin: 0, letterSpacing: '-0.02em' }}>
              Create Citizen Profile
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Join SchemeShield AI to safeguard yourself and your community
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-3)' }}>
              <Input
                label="Phone (Optional)"
                type="tel"
                placeholder="+91 98000 00000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<Phone size={16} />}
              />
              <Input
                label="Civic Role / Group (Optional)"
                type="text"
                placeholder="e.g. Citizen, Panchayat Worker"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
              />
            </div>

            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum 8 characters"
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
              <PasswordStrength password={password} />
            </div>

            <Input
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock size={16} />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ color: 'var(--text-tertiary)', padding: 0 }}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined}
              required
            />

            {/* Terms checkbox */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              <input
                type="checkbox"
                id="terms"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                style={{ marginTop: '2px', accentColor: 'var(--color-primary)' }}
              />
              <label htmlFor="terms">
                I understand SchemeShield AI is an independent civic fraud detection engine and agree to use verification data responsibly.
              </label>
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
              Create Citizen Profile
            </Button>
          </form>

          {/* Link back to Login */}
          <div style={{ textAlign: 'center', marginTop: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
              Sign In
            </Link>
          </div>
        </div>
      </AuthLayout>
    </div>
  );
};
