import { motion } from 'framer-motion';
import React from 'react';

export function MetricCard({ label, value, bar, icon }: { label: string; value: string; bar: number; icon: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--color-surface-container-high)',
      borderRadius: 'var(--radius-DEFAULT)',
      padding: '0.875rem 1rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {icon}
          <span className="label-sm">{label}</span>
        </div>
        <span style={{ fontSize: 'var(--text-label-md)', fontWeight: 700, color: 'var(--color-on-surface)', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
      </div>
      <div style={{ height: 2, background: 'var(--color-surface-highest)', borderRadius: 1 }}>
        <motion.div
          animate={{ width: `${bar}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ height: '100%', background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-container))', borderRadius: 1 }}
        />
      </div>
    </div>
  );
}
