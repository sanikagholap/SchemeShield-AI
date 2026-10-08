export interface UserPreferences {
  theme: 'light' | 'system' | 'contrast';
  emailNotifications: boolean;
  scamAlerts: boolean;
  weeklyDigest: boolean;
  language: string;
}

export interface UserSecurity {
  twoFactorEnabled: boolean;
  lastLogin: string;
  activeSessionDevice: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: 'CITIZEN' | 'VERIFIER' | 'RESEARCHER';
  organization?: string;
  accountCreatedDate: string;
  verificationsCount: number;
  preferences: UserPreferences;
  security: UserSecurity;
}
