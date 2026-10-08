import { UserProfile } from '../types/profile';

export const MOCK_USER_PROFILE: UserProfile = {
  id: 'usr-101',
  name: 'Aarav Sharma',
  email: 'aarav.sharma@example.org',
  phone: '+91 98765 43210',
  avatarUrl: '',
  role: 'CITIZEN',
  organization: 'Digital Civic Watch Forum',
  accountCreatedDate: 'January 14, 2026',
  verificationsCount: 24,
  preferences: {
    theme: 'light',
    emailNotifications: true,
    scamAlerts: true,
    weeklyDigest: false,
    language: 'English (India)'
  },
  security: {
    twoFactorEnabled: true,
    lastLogin: 'Today, 14:35 IST',
    activeSessionDevice: 'Chrome on Windows 11 (Current Session)'
  }
};
