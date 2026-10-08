import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import {
  LandingPage,
  LoginPage,
  SignupPage,
  ForgotPasswordPage,
  DashboardPage,
  VerifyPage,
  VerificationResultPage,
  SchemesPage,
  AssistantPage,
  HistoryPage,
  ProfilePage
} from '../pages';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ShieldAlert } from 'lucide-react';

const NotFoundPage: React.FC = () => (
  <div style={{ padding: 'var(--space-16) var(--space-4)', display: 'flex', justifyContent: 'center' }}>
    <Card variant="glass" padding="lg" style={{ textAlign: 'center', maxWidth: '480px' }}>
      <ShieldAlert size={48} color="var(--color-primary)" style={{ margin: '0 auto var(--space-4)' }} />
      <h2 style={{ fontSize: 'var(--text-2xl)', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
        404 - Page Not Found
      </h2>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
        The verification route or scheme resource you are looking for does not exist.
      </p>
      <Link to="/">
        <Button variant="primary">Return to SchemeShield Home</Button>
      </Link>
    </Card>
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected Routes (Protected by Auth State) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/verification-result" element={<VerificationResultPage />} />
          <Route path="/schemes" element={<SchemesPage />} />
          <Route path="/assistant" element={<AssistantPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Catch-all */}
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  );
};
