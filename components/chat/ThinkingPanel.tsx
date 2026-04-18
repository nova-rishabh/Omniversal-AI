'use client';

import { motion } from 'framer-motion';
import { TerminalSquare, CheckCircle2, Loader2 } from 'lucide-react';

export type ThinkStep = { id: number; label: string; status: 'pending' | 'running' | 'done' };

export function ThinkingPanel({ steps }: { steps: ThinkStep[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      style={{ overflow: 'hidden' }}
    >
      <div style={{
        marginTop: '1.5rem',
        background: 'var(--color-surface-container)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
          <TerminalSquare size={13} color="var(--color-primary)" />
          <span className="label-sm">Inference Trace</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {steps.map(step => (
            <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: 16, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                {step.status === 'done'    && <CheckCircle2 size={13} color="var(--color-secondary)" />}
                {step.status === 'running' && <Loader2 size={13} color="var(--color-primary)" className="animate-spin" />}
                {step.status === 'pending' && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-outline-variant)', margin: 'auto' }} />}
              </div>
              <span style={{
                fontSize: 'var(--text-label-md)',
                letterSpacing: '0.03em',
                color: step.status === 'pending' ? 'var(--color-outline-variant)'
                     : step.status === 'running' ? 'var(--color-primary)'
                     : 'var(--color-on-surface-variant)',
                transition: 'color 200ms ease-out',
              }}>
                {step.label}
              </span>
              {step.status === 'done' && (
                <span style={{ marginLeft: 'auto', fontSize: 'var(--text-label-sm)', color: 'var(--color-secondary)', letterSpacing: '0.06em' }}>OK</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
