'use client';


import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import Image from 'next/image';
import Link from 'next/link';
import {
  CheckCircle2, Loader2, TerminalSquare,
} from 'lucide-react';

function NeuralCanvas({ opacity = 0.15, nodeCount = 20 }: { opacity?: number; nodeCount?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const nodesRef = useRef<{ x: number; y: number; vx: number; vy: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    nodesRef.current = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
    }));

    const draw = () => {
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);
      const nodes = nodesRef.current;
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      });
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx.strokeStyle = `rgba(0,218,243,${(1 - dist / 140) * opacity})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
          }
        }
      }
      nodes.forEach(n => {
        ctx.beginPath(); ctx.arc(n.x, n.y, 1.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,218,243,${opacity * 0.8})`; ctx.fill();
      });
      frameRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(frameRef.current); window.removeEventListener('resize', resize); };
  }, [opacity, nodeCount]);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />;
}

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
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px"; // max height
  };

  const neuralLoad = useLiveMetric(73, 5);
  const tokenEff   = useLiveMetric(91, 3);
  const latency    = useLiveMetric(18, 4);
  const textareaRef = useRef(null);

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
        if (ar.ok) { 
          const blob = await ar.blob(); 
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
          const audio = new Audio(url);
          audio.play().catch(() => {});
        }
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


      <div style={{ display: 'flex', height: '100vh' }}>
        <aside style={{
          width: 275,
          background: 'var(--color-surface-container-low)',
          height: '100%',
          padding: '2rem 1.5rem',
          flexShrink: 0,
          display: 'flex', flexDirection: 'column', gap: '2rem',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            right: 0,
            top: '5%',
            bottom: '5%',
            width: '1px',
            background: 'rgba(255,255,255,0.08)',
          }} />
         <div style={{ marginLeft: '0.5rem', display: 'flex' }}>
            <OmniWordmark logoSize={60} />
          </div>
          <h2 style={{ fontWeight: 700 }}> Hello, User </h2>

          <div>
            <div className="label-sm">Recent Chats</div>
            {
              // Recent chat section
            }
            
          </div>


        <div style={{ marginTop: 'auto' }}>
          <div /> 
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

        {/* Main Content Area */}
        <main className="w-full min-h-screen bg-[#131313] flex flex-col items-center justify-center relative px-8 py-12">
  {/* Subtle Ambient Lighting */}
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <NeuralCanvas opacity={0.15} nodeCount={24} />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-900/5 rounded-full blur-[120px]"></div>
  </div>

<motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="w-full max-w-[800px] flex flex-col gap-10 relative z-10">
      {/* Centered Logo with Golden Glow */}
      <div className="mb-40 flex flex-col items-center relative">
      {/* Golden Glow Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[300px] bg-amber-400/10 rounded-full blur-[80px] -z-10"></div>
      </div>
      
      <h1 className="text-white font-headline font-extrabold text-7xl tracking-tight mb-3 relative">
        OMNIVERSAL
      </h1>
      <p className="font-['Geist_Mono'] text-[11px] text-cyan-400 tracking-[0.4em] uppercase opacity-60">Cognitive Processing Engine · Session 4F2A · OmniV-4.2 Ready</p>
    </div>

    {/* Form Section */}
<form onSubmit={handleSubmit} className="w-full mt-16 relative mx-2">
      {/* Input + Button */}
      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              handleInput(e);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
            }}
            rows={1}
            className="w-full bg-[#201f1f] rounded-3xl px-6 py-3 pr-16 text-on-surface placeholder:text-neutral-600 font-headline text-sm resize-none overflow-hidden transition-colors focus:outline-none focus:bg-[#2a2929]"
            placeholder="Enter your query..."
            style={{
              minHeight: '44px',
              maxHeight: '200px',
              overflowY: 'auto',
              paddingTop: '12px',
              paddingLeft: '20px',
              paddingRight: '20px',
              paddingBottom: '12px'
            }}
          />
          <span className="absolute bottom-2 right-4 text-[8px] text-neutral-600 tabular-nums">
            {prompt.length}/4096
          </span>
        </div>
        <button
          type="submit"
          disabled={!prompt.trim() || isLoading}
          className="h-[45px] w-[48px] flex items-center justify-center bg-cyan-400 text-[#001f24] rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-300 active:scale-95 transition-all"
          aria-label="Send message"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>

      {/* Status Indicator (centered + smooth) */}
      <div className="mt-6 flex justify-center">
        <div
          className={`px-4 py-2 rounded-full font-['Geist_Mono'] text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 transition-all duration-300 ${
            isLoading
              ? 'bg-cyan-400/20 text-cyan-400'
              : roastData
              ? 'bg-green-400/20 text-green-400'
              : 'bg-white/5 text-neutral-500'
          }`}
        >
        </div>
      </div>
    </form>

    {/* Error Message */}
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mt-8 p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-300"
        >
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
        </motion.div>
      )}
    </AnimatePresence>

    {/* Response */}
    <AnimatePresence>
      {roastData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <div className="bg-[#201f1f] border border-white/5 rounded-2xl p-6" 
            style={{
              padding: '14px'
            }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] text-cyan-400 font-['Geist_Mono'] uppercase tracking-widest">Response</span>
              <span className="text-[10px] text-neutral-600">•</span>
              <span className="text-[10px] text-neutral-600 font-['Geist_Mono']">OmniV-4.2</span>
            </div>
            <div className="text-sm text-neutral-300 leading-relaxed p-2" style={{ fontFamily: 'var(--font-sans)' }}>
              <StreamingText text={roastData.output} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
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
