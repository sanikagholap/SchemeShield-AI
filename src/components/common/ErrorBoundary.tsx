import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Keep error logging clean and non-sensitive
    console.warn('Caught frontend rendering boundary exception:', error.message, errorInfo.componentStack);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-8)'
          }}
        >
          <div
            style={{
              maxWidth: '500px',
              width: '100%',
              textAlign: 'center',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-2xl)',
              padding: 'var(--space-8)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 'var(--radius-xl)',
                backgroundColor: 'var(--color-fake-bg)',
                color: 'var(--color-fake)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--space-4)'
              }}
            >
              <ShieldAlert size={32} />
            </div>

            <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
              Temporary Interface Issue
            </h3>

            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-6)' }}>
              We couldn't render this verification section right now. Your data has not been affected.
            </p>

            <Button variant="primary" onClick={this.handleReset} leftIcon={<RotateCcw size={16} />}>
              Refresh Application
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
