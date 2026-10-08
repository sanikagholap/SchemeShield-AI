import { RiskTier } from '../types/verification';

export const formatCurrencyINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getRiskTierColor = (tier: RiskTier): string => {
  switch (tier) {
    case 'LOW':
      return 'var(--color-verified)';
    case 'MODERATE':
      return 'var(--color-suspicious)';
    case 'HIGH':
      return '#ea580c';
    case 'CRITICAL':
      return 'var(--color-fake)';
    default:
      return 'var(--text-secondary)';
  }
};
