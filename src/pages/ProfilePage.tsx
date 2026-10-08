import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Mail,
  Building,
  Phone,
  Bell,
  Lock,
  Save,
  CheckCircle2,
  LogOut,
  Laptop,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PageContainer } from '../components/ui/PageContainer';
import { profileService } from '../services/profileService';
import { UserProfile, UserPreferences } from '../types/profile';
import { useAuth } from '../hooks/useAuth';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security'>('profile');

  // Edit Profile Form State
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');

  // Preferences Form State
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'light',
    emailNotifications: true,
    scamAlerts: true,
    weeklyDigest: false,
    language: 'English (India)'
  });

  // Password Change Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Status & Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    profileService.getProfile().then((data) => {
      setProfile(data);
      setName(data.name);
      setPhone(data.phone || '');
      setOrganization(data.organization || '');
      setPreferences(data.preferences);
    });
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name cannot be empty');
      return;
    }

    setIsSaving(true);
    const updated = await profileService.updateProfile({
      name: name.trim(),
      phone: phone.trim() || undefined,
      organization: organization.trim() || undefined
    });

    setProfile(updated);
    setIsSaving(false);
    setIsEditing(false);
    showToast('Profile information saved successfully!');
  };

  const handleCancelEdit = () => {
    if (profile) {
      setName(profile.name);
      setPhone(profile.phone || '');
      setOrganization(profile.organization || '');
    }
    setIsEditing(false);
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    const updated = await profileService.updatePreferences(preferences);
    setPreferences(updated);
    setIsSaving(false);
    showToast('Preferences updated successfully!');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError('Please provide your current password');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setIsSaving(true);
    await profileService.changePassword(currentPassword, newPassword);
    setIsSaving(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('Password updated successfully (frontend simulation)');
  };

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  if (!profile) {
    return (
      <PageContainer style={{ paddingTop: 'var(--space-12)', textAlign: 'center' }}>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Loading citizen profile...</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-20)' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: 'var(--color-brand-navy)',
            color: 'var(--text-inverse)',
            padding: '12px 24px',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            zIndex: 'var(--z-modal)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            fontSize: 'var(--text-sm)',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <CheckCircle2 size={16} color="var(--color-verified)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
        <Link to="/dashboard" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>
          Dashboard
        </Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Profile & Settings</span>
      </div>

      {/* Page Heading */}
      <div style={{ maxWidth: '840px', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', padding: '4px 12px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', fontSize: 'var(--text-xs)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
          <UserIcon size={14} />
          <span>ACCOUNT & CIVIC CREDENTIALS</span>
        </div>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: '0 0 var(--space-1) 0' }}>
          Citizen Profile & Preferences
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: 0 }}>
          Manage your verification credentials, fraud alert preferences, and account security.
        </p>
      </div>

      <div style={{ maxWidth: '880px', display: 'grid', gridTemplateColumns: 'minmax(220px, 1fr) minmax(0, 2.5fr)', gap: 'var(--space-8)', alignItems: 'start' }}>
        {/* Left Column: Profile Card + Navigation Tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Summary Mini Card */}
          <Card variant="default" padding="md" style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--text-2xl)',
                fontWeight: 800,
                margin: '0 auto var(--space-3)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              {profile.name ? profile.name.slice(0, 2).toUpperCase() : 'AS'}
            </div>

            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px 0' }}>
              {profile.name}
            </h2>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-3)' }}>
              {profile.email}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
              <Badge variant="verified" size="sm" hasDot>
                {profile.role === 'VERIFIER' ? 'Verifier' : 'Citizen'}
              </Badge>
              <span className="badge" style={{ fontSize: '10px', backgroundColor: 'var(--bg-app)' }}>
                {profile.verificationsCount} Scans
              </span>
            </div>

            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 'var(--space-3)', fontSize: '11px', color: 'var(--text-tertiary)' }}>
              Member since {profile.accountCreatedDate}
            </div>
          </Card>

          {/* Settings Tabs Sidebar */}
          <Card variant="glass" padding="sm">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {[
                { id: 'profile', label: 'Profile Information', icon: <UserIcon size={16} /> },
                { id: 'preferences', label: 'Preferences & Alerts', icon: <Bell size={16} /> },
                { id: 'security', label: 'Security & Password', icon: <Lock size={16} /> }
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: 'none',
                      backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent',
                      color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: 'var(--text-xs)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}

              <div style={{ height: '1px', backgroundColor: 'var(--border-light)', margin: '4px 0' }} />

              <button
                type="button"
                onClick={handleSignOut}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--color-fake)',
                  fontWeight: 600,
                  fontSize: 'var(--text-xs)',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </Card>
        </div>

        {/* Right Column: Settings Content Panels */}
        <div>
          {/* TAB 1: Profile Information */}
          {activeTab === 'profile' && (
            <Card variant="default" padding="lg">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--border-light)' }}>
                <div>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px 0' }}>
                    Profile Information
                  </h3>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 0 }}>
                    Personal details and civic affiliations registered on SchemeShield AI.
                  </p>
                </div>

                {!isEditing && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                )}
              </div>

              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <Input
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                  leftIcon={<UserIcon size={16} />}
                  required
                />

                <Input
                  label="Email Address"
                  value={profile.email}
                  disabled
                  leftIcon={<Mail size={16} />}
                  hint="Official email used for authentication and security bulletins"
                />

                <Input
                  label="Phone Number (Optional)"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!isEditing}
                  leftIcon={<Phone size={16} />}
                  hint="Used for critical SMS scam advisories"
                />

                <Input
                  label="Civic Organization / Affiliation"
                  placeholder="e.g. Gram Panchayat, Social Worker, Independent Citizen"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  disabled={!isEditing}
                  leftIcon={<Building size={16} />}
                  hint="Optional civic body or department representation"
                />

                {/* Account Stats Section */}
                <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>
                    Account Statistics
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-3)' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Total Schemes Analyzed</div>
                      <div style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--color-primary)' }}>{profile.verificationsCount}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Verification Status</div>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-verified)' }}>Active Verifier</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Account Created</div>
                      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>{profile.accountCreatedDate}</div>
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)', borderTop: '1px solid var(--border-light)', paddingTop: 'var(--space-4)' }}>
                    <Button variant="outline" size="sm" type="button" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                    <Button variant="primary" size="sm" type="submit" isLoading={isSaving} leftIcon={<Save size={14} />}>
                      Save Changes
                    </Button>
                  </div>
                )}
              </form>
            </Card>
          )}

          {/* TAB 2: Preferences & Alerts */}
          {activeTab === 'preferences' && (
            <Card variant="default" padding="lg">
              <div style={{ marginBottom: 'var(--space-6)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--border-light)' }}>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px 0' }}>
                  Preferences & Notification Controls
                </h3>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 0 }}>
                  Customize alert delivery, display appearance, and preferred regional language.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                {/* Theme Selector */}
                <div>
                  <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: 'var(--space-2)' }}>
                    Display Theme
                  </label>
                  <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    {[
                      { id: 'light', label: 'Light First (Default)' },
                      { id: 'system', label: 'System Sync' },
                      { id: 'contrast', label: 'High Contrast' }
                    ].map((themeOpt) => (
                      <button
                        key={themeOpt.id}
                        type="button"
                        onClick={() => setPreferences({ ...preferences, theme: themeOpt.id as any })}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: 'var(--radius-md)',
                          border: `1px solid ${preferences.theme === themeOpt.id ? 'var(--color-primary)' : 'var(--border-medium)'}`,
                          backgroundColor: preferences.theme === themeOpt.id ? 'var(--color-primary-light)' : 'var(--bg-surface)',
                          color: preferences.theme === themeOpt.id ? 'var(--color-primary)' : 'var(--text-secondary)',
                          fontSize: 'var(--text-xs)',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {themeOpt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language Selector */}
                <div>
                  <label htmlFor="pref-language" style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: 'var(--space-2)' }}>
                    Preferred Language
                  </label>
                  <select
                    id="pref-language"
                    value={preferences.language}
                    onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                    style={{
                      width: '100%',
                      height: '40px',
                      padding: '0 var(--space-3)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-medium)',
                      backgroundColor: 'var(--bg-surface)',
                      color: 'var(--text-primary)',
                      fontSize: 'var(--text-sm)',
                      outline: 'none'
                    }}
                  >
                    <option value="English (India)">English (India)</option>
                    <option value="Hindi (हिंदी)">Hindi (हिंदी)</option>
                    <option value="Marathi (मराठी)">Marathi (मराठी)</option>
                    <option value="Tamil (தமிழ்)">Tamil (தமிழ்)</option>
                    <option value="Telugu (తెలుగు)">Telugu (తెలుగు)</option>
                  </select>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px', display: 'block' }}>
                    Regional language packs are currently in prototype preview mode.
                  </span>
                </div>

                {/* Notifications Checkboxes */}
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>
                    Notification Subscriptions
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={preferences.scamAlerts}
                        onChange={(e) => setPreferences({ ...preferences, scamAlerts: e.target.checked })}
                        style={{ accentColor: 'var(--color-primary)', marginTop: '3px' }}
                      />
                      <div>
                        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
                          Critical Fraud & Scam Alerts
                        </div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                          Receive high-priority advisories when viral phishing schemes target your district or state.
                        </div>
                      </div>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={preferences.emailNotifications}
                        onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                        style={{ accentColor: 'var(--color-primary)', marginTop: '3px' }}
                      />
                      <div>
                        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
                          Verification Completion Emails
                        </div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                          Send a full copy of the AI analysis report to your email when an assessment finishes.
                        </div>
                      </div>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={preferences.weeklyDigest}
                        onChange={(e) => setPreferences({ ...preferences, weeklyDigest: e.target.checked })}
                        style={{ accentColor: 'var(--color-primary)', marginTop: '3px' }}
                      />
                      <div>
                        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
                          Weekly Welfare Gazette Digest
                        </div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                          A weekly recap of newly announced central schemes and verified subsidy rules.
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-4)', borderTop: '1px solid var(--border-light)', paddingTop: 'var(--space-4)' }}>
                  <Button variant="primary" size="sm" onClick={handleSavePreferences} isLoading={isSaving} leftIcon={<Save size={14} />}>
                    Save Preferences
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* TAB 3: Security & Password */}
          {activeTab === 'security' && (
            <Card variant="default" padding="lg">
              <div style={{ marginBottom: 'var(--space-6)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--border-light)' }}>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px 0' }}>
                  Security & Authentication Settings
                </h3>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 0 }}>
                  Manage account password, two-factor authentication, and active browser sessions.
                </p>
              </div>

              {/* Active Session Device */}
              <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-light)', marginBottom: 'var(--space-6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <Laptop size={20} color="var(--color-primary)" />
                    <div>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {profile.security.activeSessionDevice}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        Last authenticated: {profile.security.lastLogin}
                      </div>
                    </div>
                  </div>
                  <span className="badge badge-verified" style={{ fontSize: '10px' }}>
                    Current Device
                  </span>
                </div>
              </div>

              {/* Change Password Form */}
              <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Change Password
                </div>

                {passwordError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-fake-bg)', border: '1px solid var(--color-fake-border)', color: 'var(--color-fake-text)', fontSize: 'var(--text-xs)' }}>
                    <AlertCircle size={14} />
                    <span>{passwordError}</span>
                  </div>
                )}

                <Input
                  label="Current Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  leftIcon={<Lock size={16} />}
                />

                <Input
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  leftIcon={<Lock size={16} />}
                />

                <Input
                  label="Confirm New Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  leftIcon={<Lock size={16} />}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--color-primary)', fontSize: 'var(--text-xs)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    <span>{showPassword ? 'Hide Passwords' : 'Show Passwords'}</span>
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-4)', borderTop: '1px solid var(--border-light)', paddingTop: 'var(--space-4)' }}>
                  <Button variant="primary" size="sm" type="submit" isLoading={isSaving} leftIcon={<Save size={14} />}>
                    Update Password
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      </div>
    </PageContainer>
  );
};
