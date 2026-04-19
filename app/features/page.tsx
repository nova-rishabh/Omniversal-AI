'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  Zap, Shield, ChevronRight, Brain, Cpu, Clock, Globe, 
  Lock, Gauge, Layers, Database, Network, MessageSquare, HardDrive,
} from 'lucide-react';

function OmniLogo({ size = 40 }: { size?: number }) {
  return (
    <Image
      src="/logo.png"
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

function NeuralCanvas({ opacity = 0.12, nodeCount = 36 }: { opacity?: number; nodeCount?: number }) {
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
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
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
          if (dist < 150) {
            ctx.strokeStyle = `rgba(0,218,243,${(1 - dist / 150) * opacity})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
          }
        }
      }
      nodes.forEach(n => {
        ctx.beginPath(); ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,218,243,${opacity * 0.9})`; ctx.fill();
      });
      frameRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(frameRef.current); window.removeEventListener('resize', resize); };
  }, [opacity, nodeCount]);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="label-sm">{children}</div>;
}

function FeatureCard({ icon, title, description, delay = 0 }: { icon: React.ReactNode; title: string; description: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    >
      <div
        style={{
          background: 'var(--color-surface-highest)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem',
          transition: 'background 200ms ease-out',
          cursor: 'default',
          height: '100%',
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
    </motion.div>
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

function CodeIcon({ size = 18, color }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

export default function FeaturesPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)', color: 'var(--color-on-surface)', position: 'relative', overflow: 'hidden' }}>

      <div style={{ position: 'absolute', inset: 0, height: '100vh', zIndex: 0 }}>
        <NeuralCanvas opacity={0.1} nodeCount={32} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, background: 'linear-gradient(to bottom, transparent, var(--color-surface))' }} />
      </div>

      <header style={{
        position: 'relative', zIndex: 10,
        background: 'rgba(14,14,14,0.72)', backdropFilter: 'blur(12px)',
        padding: '0 2.5rem', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <OmniWordmark logoSize={38} />
        </Link>

        <nav style={{ display: 'flex', gap: '2rem' }}>
          {[
            ['Home', '/'],
            ['Features', '#neural'],
            ['Pricing', '/pricing'],
            ['Login', '/login'],
          ].map(([label, href]) => (
            <Link key={label} href={href} style={{
              fontSize: 'var(--text-body-md)', color: 'var(--color-on-surface-variant)',
              textDecoration: 'none', letterSpacing: '0.04em', transition: 'color 200ms ease-out',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-on-surface)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-on-surface-variant)')}
            >{label}</Link>
          ))}
        </nav>
      </header>

      <section style={{ position: 'relative', zIndex: 5, padding: '7rem 2.5rem 5rem', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '5rem', alignItems: 'center' }}>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="status-chip" style={{ marginBottom: '2rem' }}>
              <Zap size={11} />Neural Architecture v4.2
            </div>

            <h1 className="display-lg" style={{ margin: 0, lineHeight: 1.05 }}>
              Advanced AI<br />
              <span className="gradient-primary-text">Capabilities</span>
            </h1>
            <p className="body-lg" style={{ color: 'var(--color-on-surface-variant)', margin: '2rem 0 2.5rem', maxWidth: 500 }}>
              Omniversal AI delivers enterprise-grade neural processing with unprecedented speed, security, and scalability. Built for the most demanding workloads.
            </p>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link href="/chat">
                <PrimaryButton onClick={() => {}}>Try Demo <ChevronRight size={15} /></PrimaryButton>
              </Link>

            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="label-sm">Platform Metrics</span>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'var(--color-secondary)', boxShadow: '0 0 8px var(--color-secondary)',
                  animation: 'pulse 2s ease-in-out infinite',
                }} />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span className="label-sm" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Cpu size={12} color="var(--color-on-surface-variant)" />
                    Neural Processing
                  </span>
                  <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--color-primary)', fontWeight: 600 }}>4.2 TFLOPS</span>
                </div>
                <div style={{ height: 3, background: 'var(--color-surface-container-high)', borderRadius: 2 }}>
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: '94%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                    style={{ height: '100%', background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-container))', borderRadius: 2 }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span className="label-sm" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Clock size={12} color="var(--color-on-surface-variant)" />
                    Edge Latency
                  </span>
                  <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--color-primary)', fontWeight: 600 }}>12ms</span>
                </div>
                <div style={{ height: 3, background: 'var(--color-surface-container-high)', borderRadius: 2 }}>
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: '18%' }}
                    transition={{ duration: 1, delay: 0.7 }}
                    style={{ height: '100%', background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-container))', borderRadius: 2 }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(72,72,72,0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  {[['Global Nodes', '2,400+'], ['Uptime', '99.99%'], ['API Calls', '18.7M']].map(([label, val]) => (
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

      <section id="neural" style={{ position: 'relative', zIndex: 5, padding: '5rem 2.5rem', background: 'var(--color-surface-container-low)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: '3rem' }}>
            <SectionLabel>Neural Capabilities</SectionLabel>
            <h2 className="display-sm" style={{ marginTop: '0.75rem' }}>Intelligence at scale.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            <FeatureCard icon={<Brain size={18} />} title="Neural Context Engine" description="Deep understanding across 128K token context windows with adaptive attention mechanisms." delay={0} />
            <FeatureCard icon={<Layers size={18} />} title="Multi-Modal Reasoning" description="Unified processing for text, images, audio, and video in a single pass." delay={0.1} />
            <FeatureCard icon={<Cpu size={18} />} title="Edge-Native Processing" description="Sub-millisecond inference at 2,400+ global edge nodes worldwide." delay={0.2} />
            <FeatureCard icon={<Shield size={18} />} title="Enterprise Security" description="SOC 2 Type II certified with end-to-end encryption and zero-knowledge architecture." delay={0.3} />
            <FeatureCard icon={<Gauge size={18} />} title="Adaptive Scaling" description="Auto-scales from 100 to 100M requests/second with consistent latency." delay={0.4} />
            <FeatureCard icon={<Network size={18} />} title="Real-Time Collaboration" description="Multi-user sessions with live sync and sub-20ms state propagation." delay={0.5} />
          </div>
        </div>
      </section>

      <section id="developer" style={{ position: 'relative', zIndex: 5, padding: '5rem 2.5rem', background: 'var(--color-surface)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: '3rem' }}>
            <SectionLabel>Developer Experience</SectionLabel>
            <h2 className="display-sm" style={{ marginTop: '0.75rem' }}>Built for developers.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            <FeatureCard icon={<Database size={18} />} title="API-First Design" description="REST and gRPC APIs with OpenAPI 3.1 spec and generated SDKs in 12 languages." delay={0} />
            <FeatureCard icon={<CodeIcon size={18} />} title="Streaming Responses" description="Server-sent events and WebSocket support for real-time output generation." delay={0.1} />
            <FeatureCard icon={<Lock size={18} />} title="Fine-Grained Access" description="RBAC with JWT, OAuth 2.0, and org-scoped API keys for team management." delay={0.2} />
            <FeatureCard icon={<HardDrive size={18} />} title="Custom Model Tuning" description="Upload your data to fine-tune private models with differential privacy guarantees." delay={0.3} />
            <FeatureCard icon={<Globe size={18} />} title="Global Edge Network" description="Automated multi-region deployment with intelligent traffic routing." delay={0.4} />
            <FeatureCard icon={<MessageSquare size={18} />} title="Webhooks & Events" description="Real-time event notifications for integration with existing workflows." delay={0.5} />
          </div>
        </div>
      </section>

      <section style={{ position: 'relative', zIndex: 5, padding: '4rem 2.5rem', background: 'var(--color-surface-container-low)' }}>
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
