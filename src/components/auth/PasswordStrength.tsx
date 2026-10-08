import React from 'react';
import { Check, X } from 'lucide-react';

export interface PasswordStrengthProps {
  password?: string;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password = '' }) => {
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const passedCount = [hasMinLength, hasNumber, hasUppercase, hasSpecial].filter(Boolean).length;

  const strengthConfig = [
    { label: 'Very Weak', color: 'var(--color-fake)', width: '25%' },
    { label: 'Weak', color: 'var(--color-suspicious)', width: '50%' },
    { label: 'Moderate', color: '#eab308', width: '75%' },
    { label: 'Strong', color: 'var(--color-verified)', width: '100%' }
  ];

  const currentLevel = passedCount > 0 ? strengthConfig[passedCount - 1] : { label: 'Too Short', color: 'var(--border-medium)', width: '10%' };

  if (!password) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
        <span style={{ color: 'var(--text-tertiary)' }}>Password Strength:</span>
        <span style={{ fontWeight: 700, color: currentLevel.color }}>{currentLevel.label}</span>
      </div>

      <div style={{ height: '4px', width: '100%', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: currentLevel.width,
            backgroundColor: currentLevel.color,
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.3s ease, background-color 0.3s ease'
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginTop: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: hasMinLength ? 'var(--color-verified)' : 'var(--text-muted)' }}>
          {hasMinLength ? <Check size={12} /> : <X size={12} />}
          <span>8+ characters</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: hasNumber ? 'var(--color-verified)' : 'var(--text-muted)' }}>
          {hasNumber ? <Check size={12} /> : <X size={12} />}
          <span>Contains number</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: hasUppercase ? 'var(--color-verified)' : 'var(--text-muted)' }}>
          {hasUppercase ? <Check size={12} /> : <X size={12} />}
          <span>Uppercase letter</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: hasSpecial ? 'var(--color-verified)' : 'var(--text-muted)' }}>
          {hasSpecial ? <Check size={12} /> : <X size={12} />}
          <span>Special character</span>
        </div>
      </div>
    </div>
  );
};
