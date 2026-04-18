'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  Zap, ChevronRight, Play, Pause,
  Volume2, Activity, Cpu, Clock, CheckCircle2,
  XCircle, Loader2, Sparkles, Network, GitBranch,
  TerminalSquare, Waves, Brain,
} from 'lucide-react';

type RoastData  = { output: string; roast_text: string; audio_available: boolean };
type ThinkStep  = { id: number; label: string; status: 'pending' | 'running' | 'done' };

const THINK_STEPS: Omit<ThinkStep, 'status'>[] = [
  { id: 1, label: 'Tokenising input' },
  { id: 2, label: 'Embedding context vectors' },
  { id: 3, label: 'Attention pass — 32 heads' },
  { id: 4, label: 'Sampling output distribution' },
  { id: 5, label: 'Post-processing & alignment' },
];

function OmniLogo({ size = 40 }: { size?: number }) {
  return (
    <Image
      src="/Omniversal_AI_logo_idea.png"
      alt="Omniversal AI"
      width={size}
      height={size}
      style={{ objectFit: 'contain', display: 'block' }}
      priority
    />
  );
}

function OmniWordmark({ logoSize = 40 }: { logoSize?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <OmniLogo size={logoSize} />
      <span style={{
        fontWeight: 700,
        letterSpacing: '0.12em',
        fontSize: 'var(--text-label-md)',
        color: 'var(--color-on-surface)',
        textTransform: 'uppercase',
      }}>
        OMNIVERSAL
      </span>
    </div>
  );
}

function ThinkingPanel({ steps }: { steps: ThinkStep[] }) {
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
                {step.status === 'running' && <Loader2 size={13} color="var(--color-primary)" style={{ animation: 'spin 1s linear infinite' }} />}
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

function StreamingText({ text }: { text: string }) {
  const [visible, setVisible] = useState('');
  useEffect(() => {
    setVisible('');
    let i = 0;
    const iv = setInterval(() => {
      i += 3;
      setVisible(text.slice(0, i));
      if (i >= text.length) clearInterval(iv);
    }, 16);
    return () => clearInterval(iv);
  }, [text]);

  return (
    <p className="body-lg" style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
      {visible}
    </p>
  );
}

function useLiveMetric(base: number, variance = 4, ms = 2200) {
  const [val, setVal] = useState(base);
  useEffect(() => {
    const id = setInterval(
      () => setVal(base + Math.round((Math.random() - 0.5) * variance * 2)),
      ms + Math.random() * 800,
    );
    return () => clearInterval(id);
  }, [base, variance, ms]);
  return val;
}

export default function ChatPage() {
  const [prompt, setPrompt]           = useState('');
  const [isLoading, setIsLoading]     = useState(false);
  const [roastData, setRoastData]     = useState<RoastData | null>(null);
  const [error, setError]             = useState<string | null>(null);
  const [isPlaying, setIsPlaying]     = useState(false);
  const [audioUrl, setAudioUrl]       = useState<string | null>(null);
  const [audioProgress, setAudioProg] = useState(0);
  const audioRef                      = useRef<HTMLAudioElement | null>(null);
  const [audioDuration, setAudioDur]  = useState('--');
  const [thinkSteps, setThinkSteps]   = useState<ThinkStep[]>([]);

  const neuralLoad = useLiveMetric(73, 5);
  const tokenEff   = useLiveMetric(91, 3);
  const latency    = useLiveMetric(18, 4);

  useEffect(() => {
    if (!isLoading) { if (!roastData) setThinkSteps([]); return; }
    const initial: ThinkStep[] = THINK_STEPS.map(s => ({ ...s, status: 'pending' }));
    setThinkSteps(initial);
    let idx = 0;
    const advance = () => {
      setThinkSteps(prev => prev.map((s, i) =>
        i === idx ? { ...s, status: 'running' } : i < idx ? { ...s, status: 'done' } : s,
      ));
      idx++;
      if (idx < THINK_STEPS.length) setTimeout(advance, 600 + Math.random() * 500);
    };
    setTimeout(advance, 300);
  }, [isLoading]);

  useEffect(() => {
    if (roastData) setThinkSteps(prev => prev.map(s => ({ ...s, status: 'done' })));
  }, [roastData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true); setError(null); setRoastData(null);
    try {
      const res  = await fetch('/api/roast', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process request');
      setRoastData(data);
      if (data.audio_available) {
        const ar = await fetch('/api/roast-audio', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: data.roast_text }) });
        if (ar.ok) { const blob = await ar.blob(); setAudioUrl(URL.createObjectURL(blob)); }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setThinkSteps([]);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  useEffect(() => { return () => { if (audioUrl) URL.revokeObjectURL(audioUrl); }; }, [audioUrl]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)', color: 'var(--color-on-surface)' }}>
      <audio
        ref={audioRef} src={audioUrl || undefined}
        onEnded={() => setIsPlaying(false)}
        onLoadedMetadata={() => { if (audioRef.current) setAudioDur(String(Math.floor(audioRef.current.duration))); }}
        onTimeUpdate={() => { if (audioRef.current) setAudioProg((audioRef.current.currentTime / audioRef.current.duration) * 100); }}
      />

      <header style={{
        background: 'var(--color-surface-container-low)',
        padding: '0 2rem', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <OmniWordmark logoSize={38} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 'var(--text-label-sm)', color: 'var(--color-primary)' }}>
            <Activity size={12} />
            <span style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>System Online</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 'var(--text-label-sm)', color: 'var(--color-on-surface-variant)' }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--color-secondary)', display: 'inline-block',
              boxShadow: '0 0 6px var(--color-secondary)',
              animation: 'pulse 2s ease-in-out infinite',
            }} />
            <span style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>Edge Network</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 'var(--text-label-sm)', color: 'var(--color-primary-dim)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            <Waves size={11} />
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>
              {prompt.split(/\s+/).filter(Boolean).length} tokens
            </span>
          </div>
        </div>
      </header>

      <div style={{ display: 'flex' }}>
        <aside style={{
          width: 264,
          background: 'var(--color-surface-container-low)',
          minHeight: 'calc(100vh - 64px)',
          padding: '2rem 1.5rem',
          flexShrink: 0,
          display: 'flex', flexDirection: 'column', gap: '2rem',
        }}>

          <div>
            <div className="label-sm">Neural Metrics</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              <MetricCard label="NEURAL LOAD"  value={`${neuralLoad}%`} bar={neuralLoad}              icon={<Cpu   size={14} color="var(--color-primary)" />} />
              <MetricCard label="TOKEN EFF."   value={`${tokenEff}%`}  bar={tokenEff}                icon={<Zap   size={14} color="var(--color-secondary)" />} />
              <MetricCard label="EDGE LATENCY" value={`${latency}ms`}  bar={Math.min(latency * 3, 100)} icon={<Clock size={14} color="var(--color-on-secondary-container)" />} />
            </div>
          </div>

          <div>
            <div className="label-sm">Model</div>
            <div style={{
              marginTop: '1rem',
              background: 'var(--color-surface-container-high)',
              borderRadius: 'var(--radius-DEFAULT)',
              padding: '1rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.75rem' }}>
                <div style={{
                  width: 34, height: 34,
                  background: 'var(--color-surface-highest)',
                  borderRadius: 'var(--radius-DEFAULT)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Network size={16} color="var(--color-primary)" />
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-body-md)', fontWeight: 600, color: 'var(--color-on-surface)' }}>OmniV-4.2</div>
                  <div className="label-sm" style={{ marginTop: 2 }}>70B params · Active</div>
                </div>
                <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: 'var(--color-secondary)', boxShadow: '0 0 8px var(--color-secondary)' }} />
              </div>
              {[['Context', 92], ['Recall', 87], ['Align', 99]].map(([label, val]) => (
                <div key={label as string} style={{ marginBottom: '0.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span className="label-sm">{label as string}</span>
                    <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--color-primary)' }}>{val}%</span>
                  </div>
                  <div style={{ height: 2, background: 'var(--color-surface-highest)', borderRadius: 1 }}>
                    <div style={{ height: '100%', width: `${val}%`, background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-container))', borderRadius: 1 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 'auto' }}>
            <Link
              href="/"
              className="label-sm"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--color-on-surface-variant)',
                display: 'flex', alignItems: 'center', gap: 6, padding: 0,
                transition: 'color 200ms ease-out',
                textDecoration: 'none',
              }}
            >
              ← Return to Dashboard
            </Link>
          </div>
        </aside>

        <main style={{ flex: 1, padding: '3rem 3.5rem' }}>

          <div style={{ marginBottom: '2.5rem' }}>
            <h1 className="display-lg">Neural Query</h1>
            <p className="label-sm" style={{ marginTop: '0.5rem' }}>
              Cognitive Processing Engine · Session 4F2A · OmniV-4.2 Ready
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span className="label-sm">Input Prompt</span>
              <span className="label-sm" style={{ color: 'var(--color-outline-variant)', fontVariantNumeric: 'tabular-nums' }}>
                {prompt.length} / 4096
              </span>
            </div>

            <LabTextarea value={prompt} onChange={setPrompt} />

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <PrimaryButton type="submit" disabled={!prompt.trim() || isLoading}>
                {isLoading
                  ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Processing…</>
                  : <><Zap size={15} /> Execute Query</>}
              </PrimaryButton>

              <SecondaryButton type="button" onClick={() => { setPrompt(''); setRoastData(null); setError(null); setThinkSteps([]); }}>
                Clear
              </SecondaryButton>

              <div style={{
                marginLeft: 'auto',
                background: isLoading   ? 'var(--color-primary-container)'
                           : roastData  ? 'var(--color-secondary-container)'
                           : 'var(--color-surface-container-high)',
                color: isLoading        ? 'var(--color-primary)'
                       : roastData       ? 'var(--color-on-secondary-container)'
                       : 'var(--color-on-surface-variant)',
                borderRadius: 'var(--radius-full)',
                padding: '4px 14px',
                fontSize: 'var(--text-label-sm)', fontWeight: 600,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'background 300ms ease-out, color 300ms ease-out',
              }}>
                {isLoading && <Loader2 size={10} style={{ animation: 'spin 1s linear infinite' }} />}
                {isLoading ? 'Processing' : roastData ? 'Complete' : 'Idle'}
              </div>
            </div>
          </form>

          <AnimatePresence>
            {isLoading && thinkSteps.length > 0 && <ThinkingPanel steps={thinkSteps} />}
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{
                  marginTop: '1.5rem', padding: '1rem 1.25rem',
                  background: 'var(--color-error-container)',
                  borderRadius: 'var(--radius-DEFAULT)',
                  display: 'flex', alignItems: 'center', gap: 10,
                  fontSize: 'var(--text-body-md)', color: 'var(--color-error)',
                }}
              >
                <XCircle size={15} />{error}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {roastData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
              >
                {audioUrl && (
                  <div style={{
                    background: 'var(--color-surface-container)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.25rem 1.5rem',
                    display: 'flex', alignItems: 'center', gap: '1.25rem',
                  }}>
                    <button
                      onClick={togglePlayback}
                      style={{
                        width: 46, height: 46,
                        borderRadius: 'var(--radius-DEFAULT)',
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-container))',
                        border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, transition: 'opacity 200ms',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >
                      {isPlaying
                        ? <Pause size={17} color="var(--color-on-primary)" />
                        : <Play  size={17} color="var(--color-on-primary)" style={{ marginLeft: 2 }} />}
                    </button>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span className="label-sm">Neural Audio Response</span>
                        <span className="label-sm" style={{ fontVariantNumeric: 'tabular-nums' }}>{audioDuration}s</span>
                      </div>
                      <div style={{ height: 3, background: 'var(--color-surface-highest)', borderRadius: 2, overflow: 'hidden' }}>
                        <motion.div style={{
                          height: '100%',
                          background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-dim))',
                          width: `${audioProgress}%`,
                        }} />
                      </div>
                    </div>
                    <Volume2 size={15} color="var(--color-on-surface-variant)" />
                  </div>
                )}

                <div style={{
                  background: 'var(--color-surface-container)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
                    <CheckCircle2 size={14} color="var(--color-secondary)" />
                    <span className="label-sm">Verdict</span>
                    <span style={{ marginLeft: 'auto', fontSize: 'var(--text-label-sm)', color: 'var(--color-outline-variant)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <GitBranch size={10} /> OmniV-4.2
                    </span>
                  </div>
                  <StreamingText text={roastData.output} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0;} }
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
      `}</style>
    </div>
  );
}

function MetricCard({ label, value, bar, icon }: { label: string; value: string; bar: number; icon: React.ReactNode }) {
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

function LabTextarea({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: 'relative', paddingBottom: 2 }}>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="e.g., Write a Python script to merge two sorted arrays, or explain quantum entanglement to a five-year-old..."
        rows={5}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          borderBottom: focused
            ? '2px solid var(--color-primary)'
            : '2px solid var(--color-outline-variant)',
          borderRadius: 0,
          color: 'var(--color-on-surface)',
          fontSize: 'var(--text-body-lg)',
          lineHeight: 1.6,
          padding: '0.75rem 0',
          resize: 'vertical',
          outline: 'none',
          fontFamily: 'inherit',
          transition: 'border-color 200ms ease-out',
        }}
      />
    </div>
  );
}

function PrimaryButton({ children, onClick, type = 'button', disabled }: {
  children: React.ReactNode; onClick?: () => void; type?: 'button' | 'submit'; disabled?: boolean;
}) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{
        background: disabled
          ? 'var(--color-surface-container-high)'
          : 'linear-gradient(135deg, var(--color-primary), var(--color-primary-container))',
        color: disabled ? 'var(--color-on-surface-variant)' : 'var(--color-on-primary)',
        border: 'none', borderRadius: 'var(--radius-DEFAULT)',
        padding: '0.65rem 1.5rem',
        fontSize: 'var(--text-label-md)', fontWeight: 700, letterSpacing: '0.04em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', gap: 7,
        transition: 'opacity 200ms ease-out',
        fontFamily: 'inherit',
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = '0.85'; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick, type = 'button' }: {
  children: React.ReactNode; onClick?: () => void; type?: 'button' | 'submit';
}) {
  return (
    <button type={type} onClick={onClick}
      style={{
        background: 'transparent',
        color: 'var(--color-primary)',
        border: '1px solid rgba(118,117,117,0.2)',
        borderRadius: 'var(--radius-DEFAULT)',
        padding: '0.65rem 1.5rem',
        fontSize: 'var(--text-label-md)', fontWeight: 700, letterSpacing: '0.04em',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 7,
        transition: 'border-color 200ms ease-out',
        fontFamily: 'inherit',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(0,218,243,0.33)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(118,117,117,0.2)')}
    >
      {children}
    </button>
  );
}