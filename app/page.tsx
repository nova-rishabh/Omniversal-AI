'use client';

import { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  Zap, Shield, ChevronRight,
  Activity, Cpu, Clock, Sparkles, Brain, MessageSquare
} from 'lucide-react';

function OmniLogo({ size = 40 }: { size?: number }) {
  return (
    <Image
      src="/logo.jpg"
      alt="Omniversal AI Logo"
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

function NeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef  = useRef(0);
  const nodesRef  = useRef<{ x: number; y: number; vx: number; vy: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    nodesRef.current = Array.from({ length: 42 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
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
          if (dist < 160) {
            ctx.strokeStyle = `rgba(0,218,243,${(1 - dist / 160) * 0.12})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
          }
        }
      }
      nodes.forEach(n => {
        ctx.beginPath(); ctx.arc(n.x, n.y, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,218,243,0.35)'; ctx.fill();
      });
      frameRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(frameRef.current); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="label-sm">{children}</div>;
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

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
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

function PrimaryButton({ children, onClick, type = 'button' }: {
  children: React.ReactNode; onClick?: () => void; type?: 'button' | 'submit';
}) {
  return (
    <button type={type} onClick={onClick}
      style={{
        background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-container))',
        color: 'var(--color-on-primary)',
        border: 'none', borderRadius: 'var(--radius-DEFAULT)',
        padding: '0.65rem 1.5rem',
        fontSize: 'var(--text-label-md)', fontWeight: 700, letterSpacing: '0.04em',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 7,
        transition: 'opacity 200ms ease-out',
        fontFamily: 'inherit',
      }}
      onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
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

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem('auth') === 'true') {
      router.push('/chat');
    }
  }, [router]);

  const handleFreeChat = () => {
    localStorage.setItem('auth', 'true');
    localStorage.setItem('onboardingData', JSON.stringify({ 
      name: 'Guest Explorer', 
      userEmail: 'guest@omniversal.ai',
      fatherEmail: 'guest_parent@omniversal.ai',
      profession: 'Guest',
      about: 'Trialing the cognitive engine.' 
    }));
    router.push('/chat');
  };
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)', color: 'var(--color-on-surface)', position: 'relative', overflow: 'hidden' }}>

      <div style={{ position: 'absolute', inset: 0, height: '100vh', zIndex: 0 }}>
        <NeuralCanvas />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, background: 'linear-gradient(to bottom, transparent, var(--color-surface))' }} />
      </div>

      <header style={{
        position: 'relative', zIndex: 10,
        background: 'rgba(14,14,14,0.72)', backdropFilter: 'blur(12px)',
        padding: '0 2.5rem', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <OmniWordmark logoSize={38} />

        <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          {[['Features', '/features'], ['Pricing', '/pricing'], ['Login', '/login']].map(([label, href]) => (
            <a key={label} href={href} style={{
              fontSize: 'var(--text-body-md)', color: 'var(--color-on-surface-variant)',
              textDecoration: 'none', letterSpacing: '0.04em', transition: 'color 200ms ease-out',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-on-surface)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-on-surface-variant)')}
            >{label}</a>
          ))}
        </nav>
      </header>

      <section style={{ position: 'relative', zIndex: 5, padding: '7rem 2.5rem 6rem', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '5rem', alignItems: 'center' }}>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="status-chip" style={{ marginBottom: '2rem' }}>
              <Zap size={11} />Enterprise-Grade Neural Workflows
            </div>

            <div style={{ marginBottom: '1.75rem' }}>
              <OmniLogo size={80} />
            </div>

            <h1 className="display-lg" style={{ margin: 0, lineHeight: 1.05 }}>
              The Future of<br />
              <span className="gradient-primary-text">Intelligent<br />Automation</span>
            </h1>
            <p className="label-sm" style={{ marginTop: '0.75rem' }}>
              Neural Architecture v4.2 · Global Edge Network · SOC 2 Compliant
            </p>

            <p className="body-lg" style={{ color: 'var(--color-on-surface-variant)', margin: '2rem 0 2.5rem', maxWidth: 500 }}>
              Leveraging advanced neural architectures to deliver unparalleled productivity solutions.
              Real-time processing at the edge, with enterprise-grade precision.
            </p>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link href="/login">
                <PrimaryButton onClick={() => {}}>Get Started <ChevronRight size={15} /></PrimaryButton>
              </Link>
              <SecondaryButton onClick={handleFreeChat}>Chat for Free <MessageSquare size={15} /></SecondaryButton>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="label-sm">Live System Metrics</span>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'var(--color-secondary)', boxShadow: '0 0 8px var(--color-secondary)',
                  animation: 'pulse 2s ease-in-out infinite',
                }} />
              </div>

              {[
                { label: 'Neural Load',      value: '73%',  bar: 73, icon: <Cpu   size={12} /> },
                { label: 'Token Efficiency', value: '91%',  bar: 91, icon: <Zap   size={12} /> },
                { label: 'Edge Latency',     value: '18ms', bar: 20, icon: <Clock size={12} /> },
              ].map((m, i) => (
                <div key={m.label} style={{ marginBottom: i < 2 ? '1.25rem' : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span className="label-sm" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ color: 'var(--color-on-surface-variant)' }}>{m.icon}</span>
                      {m.label}
                    </span>
                    <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--color-primary)', fontWeight: 600 }}>{m.value}</span>
                  </div>
                  <div style={{ height: 3, background: 'var(--color-surface-container-high)', borderRadius: 2 }}>
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${m.bar}%` }}
                      transition={{ duration: 1, delay: 0.5 + i * 0.15 }}
                      style={{ height: '100%', background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-container))', borderRadius: 2 }}
                    />
                  </div>
                </div>
              ))}

              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(72,72,72,0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  {[['Requests/s', '4.2K'], ['Uptime', '99.99%'], ['Nodes', '847']].map(([label, val]) => (
                    <div key={label} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-on-surface)', lineHeight: 1.2 }}>{val}</div>
                      <div className="label-sm" style={{ marginTop: 4 }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section style={{ position: 'relative', zIndex: 5, padding: '5rem 2.5rem', background: 'var(--color-surface-container-low)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: '3rem' }}>
            <SectionLabel>Core Capabilities</SectionLabel>
            <h2 className="display-sm" style={{ marginTop: '0.75rem' }}>Built for precision.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            <FeatureCard icon={<Brain  size={18} />} title="Advanced Reasoning"  description="State-of-the-art neural processing for complex problem solving with context-aware analysis." />
            <FeatureCard icon={<Zap   size={18} />} title="Edge-Native Speed"   description="Deployed globally at the edge for sub-millisecond latency. Your workflows, accelerated." />
            <FeatureCard icon={<Shield size={18} />} title="Enterprise Security" description="SOC 2 compliant architecture with end-to-end encryption and comprehensive audit logging." />
          </div>
        </div>
      </section>

      <section style={{ padding: '4rem 2.5rem', position: 'relative', zIndex: 5 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <SectionLabel>Trusted by industry leaders</SectionLabel>
          <div style={{ display: 'flex', gap: '3rem', opacity: 0.3, filter: 'grayscale(1)' }}>
            {['GOOGLE', 'MICROSOFT', 'AMAZON', 'META'].map(name => (
              <span key={name} style={{ fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.12em', color: 'var(--color-on-surface)' }}>{name}</span>
            ))}
          </div>
        </div>
      </section>

      <footer style={{
        background: 'var(--color-surface-container-low)',
        padding: '1.5rem 2.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'relative', zIndex: 5,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <OmniLogo size={24} />
          <span className="label-sm">© 2026 Omniversal AI · All rights reserved</span>
        </div>
        <span className="label-sm">System Status: Operational</span>
      </footer>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
      `}</style>
    </div>
  );
}
