import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  ShieldCheck,
  Mail,
  Building,
  Bell,
  Lock,
  Save,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PageContainer } from '../components/ui/PageContainer';
import { SectionHeading } from '../components/ui/SectionHeading';
import { authService } from '../services/authService';
import { User } from '../types/auth';

export const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    authService.getCurrentUser().then((u) => {
      if (u) {
        setUser(u);
        setName(u.name);
        setOrganization(u.organization || '');
      }
    });
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <PageContainer style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-16)' }}>
      <SectionHeading
        badge="Citizen Account"
        title="Verifier Profile"
        description="Manage your civic verifier credentials, alerts, and verification records."
      />

      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <Card variant="default" padding="lg">
          {/* Avatar and Role Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', paddingBottom: 'var(--space-6)', borderBottom: '1px solid var(--border-light)', marginBottom: 'var(--space-6)' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--text-xl)',
                fontWeight: 800
              }}
            >
              {name ? name.substring(0, 2).toUpperCase() : 'AS'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <h3 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-primary)', margin: 0 }}>
                  {name || 'Citizen Verifier'}
                </h3>
                <Badge variant="verified" size="sm" hasDot>
                  Verified Citizen
                </Badge>
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                {user?.email || 'aarav.sharma@example.org'} · Joined {user?.joinedAt || 'January 2026'}
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<UserIcon size={16} />}
            />

            <Input
              label="Email Address"
              value={user?.email || 'aarav.sharma@example.org'}
              disabled
              leftIcon={<Mail size={16} />}
              hint="Email verified for security alerts"
            />

            <Input
              label="Civic Organization / Affiliation (Optional)"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              leftIcon={<Building size={16} />}
              placeholder="e.g. Gram Panchayat, Social Worker, Independent Citizen"
            />

            {/* Notification Checkbox */}
            <div style={{ marginTop: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <input type="checkbox" id="scam-alerts" defaultChecked style={{ accentColor: 'var(--color-primary)' }} />
              <label htmlFor="scam-alerts" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                Receive critical fraud alerts when a widespread welfare scam is detected in your region
              </label>
            </div>

            {isSaved && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-verified)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                <CheckCircle2 size={16} />
                <span>Profile preferences updated successfully!</span>
              </div>
            )}

            <div style={{ marginTop: 'var(--space-4)' }}>
              <Button type="submit" variant="primary" leftIcon={<Save size={16} />}>
                Save Profile
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </PageContainer>
  );
};
