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

type RoastData = { roast_text: string; audio_available: boolean; voiceId?: string; persona?: string };
type ThinkStep = { id: number; label: string; status: 'pending' | 'running' | 'done' };

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

/* Loading indicator is now inline using ultra-slow-spin classes from globals.css */

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

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN CHAT PAGE
   ═══════════════════════════════════════════════════════════════════════════ */

export default function ChatPage() {
  const [prompt, setPrompt]             = useState('');
  const [isLoading, setIsLoading]       = useState(false);
  const [roastData, setRoastData]       = useState<RoastData | null>(null);
  const [error, setError]               = useState<string | null>(null);
  const [isPlaying, setIsPlaying]       = useState(false);
  const [audioUrl, setAudioUrl]         = useState<string | null>(null);
  const audioRef                        = useRef<HTMLAudioElement | null>(null);
  const [thinkSteps, setThinkSteps]     = useState<ThinkStep[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Thinking steps animation
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

  // Scroll to bottom on new response
  useEffect(() => {
    if (roastData && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [roastData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    setHasSubmitted(true);
    setIsLoading(true); setError(null); setRoastData(null); setAudioUrl(null);
    try {
      const res = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process request');

      let resolvedAudioUrl: string | null = null;
      if (data.audio_available) {
        const ar = await fetch('/api/roast-audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: data.roast_text, voiceId: data.voiceId }),
        });
        if (ar.ok) {
          const blob = await ar.blob();
          resolvedAudioUrl = URL.createObjectURL(blob);
        }
      }

      setRoastData(data);
      if (resolvedAudioUrl) {
        setAudioUrl(resolvedAudioUrl);
        const audio = new Audio(resolvedAudioUrl);
        audio.play().catch(() => {});
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setThinkSteps([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { return () => { if (audioUrl) URL.revokeObjectURL(audioUrl); }; }, [audioUrl]);



  /* ── Shared input bar (used in both centered + bottom positions) ──────── */
  function renderInputBar() {
    return (
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          background: '#201f1f',
          borderRadius: '1.5rem',
          border: '1px solid rgba(255,255,255,0.06)',
          transition: 'border-color 200ms',
          position: 'relative',
        }}>
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            rows={1}
            placeholder="Enter your query..."
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              color: 'var(--color-on-surface)',
              fontSize: '0.875rem',
              lineHeight: 1.6,
              padding: '0.875rem 1.25rem',
              minHeight: '44px',
              maxHeight: '200px',
              overflowY: 'auto',
              fontFamily: 'inherit',
            }}
          />

          {/* Bottom toolbar: persona switcher (left) + send button (right) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.375rem 0.5rem 0.5rem 0.75rem',
          }}>
            {/* Spacer for layout consistency when send button goes right */}
            <div />

            {/* Send button — upward arrow */}
            <button
              type="submit"
              disabled={!prompt.trim() || isLoading}
              style={{
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: (!prompt.trim() || isLoading) ? 'rgba(255,255,255,0.06)' : 'rgb(34,211,238)',
                color: (!prompt.trim() || isLoading) ? 'rgba(255,255,255,0.2)' : '#001f24',
                borderRadius: '0.625rem',
                border: 'none',
                cursor: (!prompt.trim() || isLoading) ? 'not-allowed' : 'pointer',
                transition: 'all 200ms',
                flexShrink: 0,
              }}
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </form>
    );
  }

  /* ── Render ───────────────────────────────────────────────────────────── */
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)', color: 'var(--color-on-surface)' }}>
      <audio
        ref={audioRef} src={audioUrl || undefined}
        onEnded={() => setIsPlaying(false)}
      />

      <div style={{ display: 'flex', height: '100vh' }}>
        {/* Sidebar */}
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
            position: 'absolute', right: 0, top: '5%', bottom: '5%',
            width: '1px', background: 'rgba(255,255,255,0.08)',
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

        {/* Main content */}
        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          background: '#131313',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Background */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            <NeuralCanvas opacity={0.15} nodeCount={24} />
          </div>

          {/* ─── STATE 1: Before first message — centered hero + input ─── */}
          {!hasSubmitted && (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              position: 'relative', zIndex: 10, padding: '0 2rem',
            }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '3rem' }}
              >
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    pointerEvents: 'none',
                  }}>
                    <div style={{
                      width: 500, height: 300,
                      background: 'rgba(251,191,36,0.1)', borderRadius: '50%',
                      filter: 'blur(80px)', zIndex: -1,
                    }} />
                  </div>
                  <h1 style={{
                    color: 'white', fontWeight: 800, fontSize: '4.5rem',
                    letterSpacing: '-0.02em', marginBottom: '0.75rem', position: 'relative',
                  }}>
                    OMNIVERSAL
                  </h1>
                </div>
                <p style={{
                  fontFamily: 'var(--font-mono)', fontSize: '11px',
                  color: 'rgb(34,211,238)', letterSpacing: '0.4em',
                  textTransform: 'uppercase', opacity: 0.6,
                }}>
                  Cognitive Processing Engine · OmniV-4.2 Ready
                </p>
              </motion.div>

              <div style={{ width: '100%', maxWidth: 720 }}>
                {renderInputBar()}
              </div>
            </div>
          )}

          {/* ─── STATE 2: After first message — chat area + bottom input ─── */}
          {hasSubmitted && (
            <>
              {/* Scrollable messages */}
              <div style={{
                flex: 1, overflowY: 'auto', padding: '2rem',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                position: 'relative', zIndex: 10,
              }}>
                <div style={{ width: '100%', maxWidth: 720 }}>
                  <AnimatePresence>
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem' }}>
                          <Loader2
                            size={16}
                            className="ultra-slow-spin"
                            style={{ color: 'var(--color-primary)' }}
                          />
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            color: 'rgb(163,163,163)',
                            letterSpacing: '0.05em',
                          }}>
                            Generating response
                          </span>
                          <span style={{ display: 'flex', gap: '0.25rem' }}>
                            <span className="ultra-slow-pulse-1" style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgb(82,82,82)' }} />
                            <span className="ultra-slow-pulse-2" style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgb(82,82,82)' }} />
                            <span className="ultra-slow-pulse-3" style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgb(82,82,82)' }} />
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        style={{
                          padding: '1rem', background: 'rgba(127,29,29,0.2)',
                          border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.5rem',
                          display: 'flex', alignItems: 'center', gap: '0.75rem',
                          color: 'rgb(252,165,165)', marginBottom: '1rem',
                        }}
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {roastData && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div style={{
                          background: '#201f1f',
                          border: '1px solid rgba(255,255,255,0.05)',
                          borderRadius: '1rem', padding: '1rem',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <span style={{
                              fontSize: '10px', color: 'rgb(34,211,238)',
                              fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
                              letterSpacing: '0.15em',
                            }}>Response</span>
                            <span style={{ fontSize: '10px', color: 'rgb(82,82,82)' }}>•</span>
                            <span style={{
                              fontSize: '10px', color: 'rgb(82,82,82)',
                              fontFamily: 'var(--font-mono)',
                            }}>{roastData.persona || 'OmniV-4.2'}</span>
                          </div>
                          <div style={{
                            fontSize: '0.875rem', color: 'rgb(212,212,212)',
                            lineHeight: 1.7, padding: '0.5rem',
                            fontFamily: 'var(--font-sans)',
                          }}>
                            <StreamingText text={roastData.roast_text} />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Bottom-pinned input */}
              <div style={{
                padding: '1rem 2rem 1.5rem', position: 'relative', zIndex: 10,
                display: 'flex', justifyContent: 'center',
              }}>
                <div style={{ width: '100%', maxWidth: 720 }}>
                  {renderInputBar()}
                </div>
              </div>
            </>
          )}
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
