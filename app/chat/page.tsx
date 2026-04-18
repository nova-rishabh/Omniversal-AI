'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

import { OmniWordmark } from '@/components/ui/OmniLogo';
import { ThinkingPanel, type ThinkStep } from '@/components/chat/ThinkingPanel';
import { StreamingText } from '@/components/chat/StreamingText';

type RoastData = { output: string; roast_text: string; audio_available: boolean };

const THINK_STEPS_TEMPLATE: Omit<ThinkStep, 'status'>[] = [
  { id: 1, label: 'Tokenising input' },
  { id: 2, label: 'Embedding context vectors' },
  { id: 3, label: 'Attention pass — 32 heads' },
  { id: 4, label: 'Sampling output distribution' },
  { id: 5, label: 'Post-processing & alignment' },
];

export default function ChatPage() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [roastData, setRoastData] = useState<RoastData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [thinkSteps, setThinkSteps] = useState<ThinkStep[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isLoading) {
      if (!roastData) setThinkSteps([]);
      return;
    }
    const initial: ThinkStep[] = THINK_STEPS_TEMPLATE.map(s => ({ ...s, status: 'pending' }));
    setThinkSteps(initial);
    let idx = 0;
    const advance = () => {
      setThinkSteps(prev => prev.map((s, i) =>
        i === idx ? { ...s, status: 'running' } : i < idx ? { ...s, status: 'done' } : s,
      ));
      idx++;
      if (idx < THINK_STEPS_TEMPLATE.length) setTimeout(advance, 600 + Math.random() * 500);
    };
    setTimeout(advance, 300);
  }, [isLoading, roastData]);

  useEffect(() => {
    if (roastData) setThinkSteps(prev => prev.map(s => ({ ...s, status: 'done' })));
  }, [roastData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    setRoastData(null);
    try {
      const res = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process request');
      setRoastData(data);

      if (data.audio_available) {
        const ar = await fetch('/api/roast-audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: data.roast_text }),
        });
        if (ar.ok) {
          const blob = await ar.blob();
          setAudioUrl(URL.createObjectURL(blob));
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setThinkSteps([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)', color: 'var(--color-on-surface)' }}>
      <audio
        ref={audioRef}
        src={audioUrl || undefined}
        onEnded={() => setIsPlaying(false)}
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

        <main className="w-full min-h-screen bg-[#131313] flex flex-col items-center justify-center relative px-8 py-12">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-900/5 rounded-full blur-[120px]"></div>
          </div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="w-full max-w-[800px] flex flex-col gap-10 relative z-10">
            <div className="mb-40 flex flex-col items-center relative">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[500px] h-[300px] bg-amber-400/10 rounded-full blur-[80px] -z-10"></div>
              </div>
              
              <h1 className="text-white font-headline font-extrabold text-7xl tracking-tight mb-3 relative">
                OMNIVERSAL
              </h1>
              <p className="font-['Geist_Mono'] text-[11px] text-cyan-400 tracking-[0.4em] uppercase opacity-60">Cognitive Processing Engine · Session 4F2A · OmniV-4.2 Ready</p>
            </div>

            <form onSubmit={handleSubmit} className="w-full mt-16 relative mx-2">
              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={(e) => {
                      setPrompt(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                    }}
                    rows={1}
                    className="w-full bg-[#201f1f] rounded-3xl px-6 py-3 pr-16 text-white placeholder:text-neutral-600 text-sm resize-none overflow-hidden transition-colors focus:outline-none focus:bg-[#2a2929]"
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

              <div className="mt-6 flex justify-center">
                <ThinkingPanel steps={thinkSteps} />
              </div>
            </form>

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

            <AnimatePresence>
              {roastData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8"
                >
                  <div className="bg-[#201f1f] border border-white/5 rounded-2xl p-6">
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
    </div>
  );
}