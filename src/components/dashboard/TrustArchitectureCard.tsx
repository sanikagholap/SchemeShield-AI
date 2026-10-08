import React from 'react';
import { ShieldCheck, Brain, Copy, ScanLine, Database, BarChart2 } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../ui/Card';

export const TrustArchitectureCard: React.FC = () => {
  const capabilities = [
    {
      icon: <Brain size={18} color="var(--color-primary)" />,
      title: 'NLP-Based Comparison',
      text: 'SchemeShield AI is designed to analyze semantic phrasing, monetary demands, and urgency patterns.'
    },
    {
      icon: <Copy size={18} color="var(--color-brand-accent)" />,
      title: 'Duplicate & Similarity Detection',
      text: 'Identifies clone schemes and modified criteria derived from genuine central welfare programs.'
    },
    {
      icon: <ScanLine size={18} color="#7c3aed" />,
      title: 'OCR Document Analysis',
      text: 'Extracts embedded text from WhatsApp posters and PDFs to check for forged signatures and seals.'
    },
    {
      icon: <Database size={18} color="var(--color-verified)" />,
      title: 'Official Source Verification',
      text: 'Cross-references claims against authentic .gov.in and .nic.in gazette notifications and PIB alerts.'
    },
    {
      icon: <BarChart2 size={18} color="#ea580c" />,
      title: 'Risk & Confidence Scoring',
      text: 'Calculates an explainable 0–100 threat index alongside algorithmic confidence ratings.'
    }
  ];

  return (
    <Card variant="default" padding="lg">
      <CardHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)'
            }}
          >
            <ShieldCheck size={18} />
          </div>
          <div>
            <CardTitle style={{ fontSize: 'var(--text-base)' }}>
              Verification Architecture & Methodology
            </CardTitle>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
              How SchemeShield AI is architected to protect citizens
            </p>
          </div>
        </div>
      </CardHeader>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-4)',
          marginTop: 'var(--space-2)'
        }}
      >
        {capabilities.map((cap) => (
          <div
            key={cap.title}
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--bg-surface-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              {cap.icon}
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-primary)' }}>
                {cap.title}
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              {cap.text}
            </p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-light)', fontSize: '11px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
        * Note: Architecture methodology overview. Backend neural inference pipelines are integrated via the centralized service layer.
      </div>
    </Card>
  );
};
