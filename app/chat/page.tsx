'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, Loader2, TerminalSquare, MessageSquarePlus, Volume2, Copy, Check } from 'lucide-react';

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

type ChatMessage = { id: string; role: 'user' | 'ai'; content: string; audioUrl?: string; persona?: string; voiceId?: string };
type ChatSession = { id: string; title: string; createdAt: number; messages: ChatMessage[] };

function OmniLogo({ size = 40 }: { size?: number }) {
  return (
    <Image
      src="/logo.jpg"
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

function StreamingText({ text, onComplete }: { text: string, onComplete?: () => void }) {
  const [visible, setVisible] = useState('');
  useEffect(() => {
    setVisible('');
    let i = 0;
    const iv = setInterval(() => {
      i += 3;
      setVisible(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(iv);
        if (onComplete) onComplete();
      }
    }, 16);
    return () => clearInterval(iv);
  }, [text]);

  return (
    <p className="body-lg" style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
      {visible}
    </p>
  );
}

export default function ChatPage() {
  const [prompt, setPrompt]             = useState('');
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState<string | null>(null);
  
  const [messages, setMessages]         = useState<ChatMessage[]>([]);
  const [sessions, setSessions]         = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [promptCount, setPromptCount]   = useState(0);
  const [fatherEmail, setFatherEmail]   = useState('');

  const [isPlaying, setIsPlaying]       = useState(false);
  const [audioUrl, setAudioUrl]         = useState<string | null>(null);
  const audioRef                        = useRef<HTMLAudioElement | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const data = localStorage.getItem('onboardingData');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (parsed.fatherEmail) setFatherEmail(parsed.fatherEmail);
      } catch (e) {}
    }

    const loadedSessions: ChatSession[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('omni_chat_')) {
        try {
          const s = JSON.parse(localStorage.getItem(key) || '');
          loadedSessions.push(s);
        } catch (e) {}
      }
    }
    loadedSessions.sort((a, b) => b.createdAt - a.createdAt);
    setSessions(loadedSessions);
  }, []);

  const saveSession = (id: string, msgs: ChatMessage[]) => {
    let title = 'New Chat';
    if (msgs.length > 0) {
      const firstUserMsg = msgs.find(m => m.role === 'user');
      if (firstUserMsg) {
        title = firstUserMsg.content.slice(0, 25) + (firstUserMsg.content.length > 25 ? '...' : '');
      }
    }
    const session: ChatSession = { id, title, createdAt: Date.now(), messages: msgs };
    localStorage.setItem('omni_chat_' + id, JSON.stringify(session));
    
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== id);
      return [session, ...filtered].sort((a, b) => b.createdAt - a.createdAt);
    });
  };

  const loadSession = (session: ChatSession) => {
    setMessages(session.messages);
    setCurrentSessionId(session.id);
    setPromptCount(session.messages.filter(m => m.role === 'user').length);
    setPrompt('');
    setError(null);
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentSessionId('');
    setPromptCount(0);
    setPrompt('');
    setError(null);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    
    const currentCount = promptCount + 1;
    setPromptCount(currentCount);

    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', content: prompt };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    const savedPrompt = prompt;
    setPrompt('');
    
    let activeSessionId = currentSessionId;
    if (!activeSessionId) {
      activeSessionId = Date.now().toString();
      setCurrentSessionId(activeSessionId);
    }
    saveSession(activeSessionId, newMessages);

    setIsLoading(true); setError(null);
    try {
      const payload: any = { 
        prompt: savedPrompt,
        history: messages.map(m => ({ role: m.role, content: m.content }))
      };

      if (currentCount % 3 === 0 && fatherEmail) {
        payload.fatherEmail = fatherEmail;
      }

      const res = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: data.roast_text,
        persona: data.persona,
        voiceId: data.voiceId,
        audioUrl: resolvedAudioUrl || undefined
      };

      const updatedMessages = [...newMessages, aiMessage];
      setMessages(updatedMessages);
      saveSession(activeSessionId, updatedMessages);
      
      if (resolvedAudioUrl) {
        setAudioUrl(resolvedAudioUrl);
        const audio = new Audio(resolvedAudioUrl);
        audio.play().catch(() => {});
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const [replayingId, setReplayingId] = useState<string | null>(null);

  const handleReplayAudio = async (msg: ChatMessage) => {
    if (replayingId) return;
    try {
      if (msg.audioUrl) {
        const res = await fetch(msg.audioUrl);
        if (res.ok) {
          setAudioUrl(msg.audioUrl);
          setIsPlaying(true);
          setTimeout(() => audioRef.current?.play().catch(()=>{}), 100);
          return;
        }
      }
    } catch(e) {}

    // Regenerate if dead
    if (!msg.voiceId) return;
    setReplayingId(msg.id);
    try {
      const ar = await fetch('/api/roast-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: msg.content, voiceId: msg.voiceId }),
      });
      if (ar.ok) {
        const blob = await ar.blob();
        const freshUrl = URL.createObjectURL(blob);
        
        // Update state to hold new url safely
        const updatedMessages = messages.map(m => m.id === msg.id ? { ...m, audioUrl: freshUrl } : m);
        setMessages(updatedMessages);
        saveSession(currentSessionId, updatedMessages);
        
        setAudioUrl(freshUrl);
        setIsPlaying(true);
        setTimeout(() => audioRef.current?.play().catch(()=>{}), 100);
      }
    } catch(e) { } finally { setReplayingId(null); }
  };

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => { return () => { if (audioUrl) URL.revokeObjectURL(audioUrl); }; }, [audioUrl]);

  function renderInputBar() {
    return (
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <div style={{
          display: 'flex', flexDirection: 'column', background: '#201f1f',
          borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.06)',
          transition: 'border-color 200ms', position: 'relative',
        }}>
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
              width: '100%', background: 'transparent', border: 'none',
              outline: 'none', resize: 'none', color: 'var(--color-on-surface)',
              fontSize: '0.875rem', lineHeight: 1.6, padding: '0.875rem 1.25rem',
              minHeight: '44px', maxHeight: '200px', overflowY: 'auto', fontFamily: 'inherit',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.375rem 0.5rem 0.5rem 0.75rem' }}>
            <div />
            <button
              type="submit" disabled={!prompt.trim() || isLoading}
              style={{
                width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: (!prompt.trim() || isLoading) ? 'rgba(255,255,255,0.06)' : 'rgb(34,211,238)',
                color: (!prompt.trim() || isLoading) ? 'rgba(255,255,255,0.2)' : '#001f24',
                borderRadius: '0.625rem', border: 'none',
                cursor: (!prompt.trim() || isLoading) ? 'not-allowed' : 'pointer',
                transition: 'all 200ms', flexShrink: 0,
              }}
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

  const hasSubmitted = messages.length > 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)', color: 'var(--color-on-surface)' }}>
      <audio ref={audioRef} src={audioUrl || undefined} onEnded={() => setIsPlaying(false)} />

      <div style={{ display: 'flex', height: '100vh' }}>
        <aside style={{
          width: 275, background: 'var(--color-surface-container-low)', height: '100%',
          padding: '2rem 1.5rem', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '2rem',
          position: 'relative', borderRight: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div style={{ marginLeft: '0.5rem', display: 'flex', cursor: 'pointer' }} onClick={startNewChat}>
            <OmniWordmark logoSize={40} />
          </div>
          
          <button 
            onClick={startNewChat}
            style={{
              padding: '0.75rem', background: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem',
              color: 'var(--color-on-surface)', display: 'flex', alignItems: 'center', gap: '8px',
              cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
              transition: 'background 200ms',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <MessageSquarePlus size={16} /> New Conversation
          </button>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            <div className="label-sm" style={{ marginBottom: '1rem', paddingLeft: '0.5rem' }}>Recent Memory</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {sessions.map(session => (
                <div 
                  key={session.id} 
                  onClick={() => loadSession(session)}
                  style={{
                    padding: '0.75rem', borderRadius: '0.5rem', cursor: 'pointer',
                    background: currentSessionId === session.id ? 'rgba(34,211,238,0.1)' : 'transparent',
                    border: currentSessionId === session.id ? '1px solid rgba(34,211,238,0.2)' : '1px solid transparent',
                    color: currentSessionId === session.id ? 'var(--color-on-surface)' : 'var(--color-on-surface-variant)',
                    fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    transition: 'all 200ms'
                  }}
                >
                  {session.title}
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 'auto' }}>
            <Link href="/" className="label-sm" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-on-surface-variant)', display: 'flex', alignItems: 'center', gap: 6, padding: 0, transition: 'color 200ms ease-out', textDecoration: 'none' }}>
              ← Return to Dashboard
            </Link>
          </div>
        </aside>

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', background: '#131313', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            <NeuralCanvas opacity={0.15} nodeCount={24} />
          </div>

          {!hasSubmitted && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 10, padding: '0 2rem' }}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '3rem' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <div style={{ width: 500, height: 300, background: 'rgba(251,191,36,0.1)', borderRadius: '50%', filter: 'blur(80px)', zIndex: -1 }} />
                  </div>
                  <h1 style={{ color: 'white', fontWeight: 800, fontSize: '4.5rem', letterSpacing: '-0.02em', marginBottom: '0.75rem', position: 'relative' }}>OMNIVERSAL</h1>
                </div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'rgb(34,211,238)', letterSpacing: '0.4em', textTransform: 'uppercase', opacity: 0.6 }}>Cognitive Processing Engine · OmniV-4.2 Ready</p>
              </motion.div>
              <div style={{ width: '100%', maxWidth: 720 }}>{renderInputBar()}</div>
            </div>
          )}

          {hasSubmitted && (
            <>
              <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 10 }}>
                <div style={{ width: '100%', maxWidth: 720, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {messages.map((msg, index) => (
                    <motion.div 
                      key={msg.id} 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }}
                      style={{ 
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '85%'
                      }}
                    >
                      {msg.role === 'user' ? (
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem 1.25rem', borderRadius: '1rem 1rem 0 1rem', fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--color-on-surface)' }}>
                          {msg.content}
                        </div>
                      ) : (
                        <div style={{ background: '#201f1f', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '0 1rem 1rem 1rem', padding: '1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '10px', color: 'rgb(34,211,238)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Response {msg.persona && `• ${msg.persona}`}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <button
                                onClick={() => handleCopy(msg.id, msg.content)}
                                style={{
                                  background: 'none', border: 'none', cursor: 'pointer',
                                  color: copiedId === msg.id ? 'rgb(34,211,238)' : 'var(--color-on-surface-variant)',
                                  display: 'flex', alignItems: 'center', gap: '4px',
                                  fontSize: '0.75rem', fontWeight: 600, padding: 0, opacity: 0.7,
                                  transition: 'all 200ms'
                                }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
                                title="Copy Text"
                              >
                                {copiedId === msg.id ? <Check size={14} /> : <Copy size={14} />}
                                {copiedId === msg.id ? 'Copied' : 'Copy'}
                              </button>

                              {msg.audioUrl && (
                                <button
                                  onClick={() => handleReplayAudio(msg)}
                                  disabled={replayingId === msg.id}
                                  style={{
                                    background: 'none', border: 'none', cursor: replayingId === msg.id ? 'wait' : 'pointer',
                                    color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px',
                                    fontSize: '0.75rem', fontWeight: 600, padding: 0, opacity: replayingId === msg.id ? 0.3 : 0.7,
                                    transition: 'opacity 200ms'
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                  onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
                                  title="Replay Audio"
                                >
                                  <Volume2 size={14} /> Replay
                                </button>
                              )}
                            </div>
                          </div>
                          <div style={{ fontSize: '0.9rem', color: 'rgb(212,212,212)', lineHeight: 1.7, fontFamily: 'var(--font-sans)' }}>
                            {index === messages.length - 1 && !isLoading ? (
                              <StreamingText text={msg.content} />
                            ) : (
                              <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {isLoading && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', padding: '1rem 0', alignSelf: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem' }}>
                        <Loader2 size={16} className="ultra-slow-spin" style={{ color: 'var(--color-primary)' }} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 500, color: 'rgb(163,163,163)', letterSpacing: '0.05em' }}>Processing</span>
                      </div>
                    </motion.div>
                  )}

                  {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '1rem', background: 'rgba(127,29,29,0.2)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.5rem', color: 'rgb(252,165,165)' }}>{error}</motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <div style={{ padding: '1rem 2rem 1.5rem', position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: 720 }}>{renderInputBar()}</div>
              </div>
            </>
          )}
        </main>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        /* scrollbar styles */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}
