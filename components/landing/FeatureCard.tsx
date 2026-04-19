import React from 'react';

export function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div
      style={{
        background: 'var(--color-surface-highest)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.75rem',
        transition: 'background 200ms ease-out',
        cursor: 'default',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-container-high)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-surface-highest)')}
    >
      <div style={{
        width: 36, height: 36,
        background: 'var(--color-surface-container)',
        borderRadius: 'var(--radius-DEFAULT)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '1.25rem',
        color: 'var(--color-primary)',
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: 'var(--text-body-lg)', fontWeight: 700, color: 'var(--color-on-surface)', margin: '0 0 0.6rem', letterSpacing: '-0.01em' }}>{title}</h3>
      <p className="body-md" style={{ margin: 0 }}>{description}</p>
    </div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="label-sm">{children}</div>;
}
