import { UserProfile, UserPreferences } from '../types/profile';
import { MOCK_USER_PROFILE } from '../data/mockProfile';
import { simulateLatency } from './apiClient';

let localProfileState: UserProfile = { ...MOCK_USER_PROFILE };

export const profileService = {
  /**
   * Retrieve current user profile
   */
  async getProfile(): Promise<UserProfile> {
    return simulateLatency({ ...localProfileState }, 200);
  },

  /**
   * Update profile information
   */
  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    localProfileState = {
      ...localProfileState,
      ...updates,
      preferences: updates.preferences
        ? { ...localProfileState.preferences, ...updates.preferences }
        : localProfileState.preferences
    };
    return simulateLatency({ ...localProfileState }, 400);
  },

  /**
   * Update preferences
   */
  async updatePreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    localProfileState.preferences = {
      ...localProfileState.preferences,
      ...preferences
    };
    return simulateLatency({ ...localProfileState.preferences }, 250);
  },

  /**
   * Simulate change password (frontend mock only)
   */
  async changePassword(_currentPass: string, _newPass: string): Promise<boolean> {
    return simulateLatency(true, 500);
  }
};
