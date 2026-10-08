import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Clock, ShieldAlert } from 'lucide-react';
import { VerificationStatus } from '../../types/verification';

export interface StatusIndicatorProps {
  status: VerificationStatus;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  showIcon = true,
  size = 'md',
  className = ''
}) => {
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;

  const configMap: Record<VerificationStatus, {
    label: string;
    variantClass: string;
    icon: React.ReactNode;
    description: string;
  }> = {
    SAFE: {
      label: 'Verified Authentic',
      variantClass: 'badge-verified',
      icon: <CheckCircle2 size={iconSize} />,
      description: 'Matches official government records'
    },
    SUSPICIOUS: {
      label: 'Suspicious / Discrepancy',
      variantClass: 'badge-suspicious',
      icon: <AlertTriangle size={iconSize} />,
      description: 'Contains altered terms or unverifiable claims'
    },
    FAKE: {
      label: 'Confirmed Fake / Scam',
      variantClass: 'badge-fake',
      icon: <XCircle size={iconSize} />,
      description: 'Blatant scam or fraudulent impersonation'
    },
    PENDING: {
      label: 'Pending Verification',
      variantClass: 'badge-info',
      icon: <Clock size={iconSize} />,
      description: 'Awaiting cross-referencing'
    },
    ANALYZING: {
      label: 'AI Analysis in Progress',
      variantClass: 'badge-info',
      icon: <ShieldAlert size={iconSize} className="animate-spin" />,
      description: 'Scanning official gazettes and portals'
    }
  };

  const config = configMap[status] || configMap.PENDING;

  return (
    <span
      className={`badge ${config.variantClass} ${size === 'sm' ? 'badge-sm' : ''} ${className}`}
      title={config.description}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
    </span>
  );
};
