'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  Zap, Shield, ChevronRight, Check, X, Brain, Cpu, Clock, Globe, 
} from 'lucide-react';

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

function NeuralCanvas({ opacity = 0.08, nodeCount = 28 }: { opacity?: number; nodeCount?: number }) {
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
        ctx.fillStyle = `rgba(0,218,243,${opacity * 0.85})`; ctx.fill();
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

function CheckIcon() {
  return (
    <div style={{
      width: 20, height: 20,
      borderRadius: '50%',
      background: 'var(--color-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Check size={12} color="var(--color-on-primary)" strokeWidth={3} />
    </div>
  );
}

function XIcon() {
  return (
    <div style={{
      width: 20, height: 20,
      borderRadius: '50%',
      background: 'rgba(118,117,117,0.2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <X size={12} color="var(--color-on-surface-variant)" strokeWidth={3} />
    </div>
  );
}

function PrimaryButton({ children, onClick, type = 'button', style = {} }: {
  children: React.ReactNode; onClick?: () => void; type?: 'button' | 'submit'; style?: React.CSSProperties;
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
        ...style,
      }}
      onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick, type = 'button', style = {} }: {
  children: React.ReactNode; onClick?: () => void; type?: 'button' | 'submit'; style?: React.CSSProperties;
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
        ...style,
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(0,218,243,0.33)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(118,117,117,0.2)')}
    >
      {children}
    </button>
  );
}

const plans = [
  {
    name: 'Starter',
    price: '$29',
    period: '/mo',
    description: 'Perfect for individuals and small projects.',
    features: [
      { name: '50,000 requests/month', included: true },
      { name: 'Basic neural processing', included: true },
      { name: '5K token context', included: true },
      { name: 'Community support', included: true },
      { name: 'API access', included: true },
      { name: 'Custom fine-tuning', included: false },
      { name: 'Priority support', included: false },
      { name: 'SLA guarantee', included: false },
    ],
    highlighted: false,
    cta: 'Get Started',
  },
  {
    name: 'Professional',
    price: '$99',
    period: '/mo',
    description: 'For growing teams requiring more power.',
    features: [
      { name: '500,000 requests/month', included: true },
      { name: 'Advanced neural processing', included: true },
      { name: '128K token context', included: true },
      { name: 'Priority email support', included: true },
      { name: 'API access', included: true },
      { name: 'Custom fine-tuning', included: true },
      { name: 'Priority support', included: false },
      { name: 'SLA guarantee', included: false },
    ],
    highlighted: true,
    cta: 'Start Free Trial',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Full-scale solution for large organizations.',
    features: [
      { name: 'Unlimited requests', included: true },
      { name: 'Premium neural processing', included: true },
      { name: '256K token context', included: true },
      { name: '24/7 dedicated support', included: true },
      { name: 'API access', included: true },
      { name: 'Custom fine-tuning', included: true },
      { name: 'Priority support', included: true },
      { name: '99.99% SLA guarantee', included: true },
    ],
    highlighted: false,
    cta: 'Contact Sales',
  },
];

const faqs = [
  {
    q: 'How do I upgrade my plan?',
    a: 'You can upgrade your plan at any time from the dashboard. Changes take effect immediately and are pro-rated.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards, ACH, and wire transfers for annual plans. Enterprise customers can also pay via invoice.',
  },
  {
    q: 'Can I cancel my subscription?',
    a: 'Yes, you can cancel at any time. Your access will continue until the end of your billing period.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'We offer a 14-day money-back guarantee for all plans. Contact support within 14 days for a full refund.',
  },
  {
    q: 'What happens if I exceed my request limit?',
    a: 'We\'ll notify you as you approach your limit. Overages are charged at standard rates or you can upgrade to avoid interruption.',
  },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)', color: 'var(--color-on-surface)', position: 'relative', overflow: 'hidden' }}>

      <div style={{ position: 'absolute', inset: 0, height: '100vh', zIndex: 0 }}>
        <NeuralCanvas opacity={0.08} nodeCount={28} />
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
            ['Features', '/features'],
            ['Pricing', '#'],
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

      <section style={{ position: 'relative', zIndex: 5, padding: '7rem 2.5rem 4rem', maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <SectionLabel>Pricing</SectionLabel>
          <h1 className="display-lg" style={{ margin: '0.75rem 0 0', lineHeight: 1.05 }}>
            Simple, transparent<br />
            <span className="gradient-primary-text">pricing</span>
          </h1>
          <p className="body-lg" style={{ color: 'var(--color-on-surface-variant)', margin: '1.5rem auto 0', maxWidth: 540 }}>
            Choose the plan that fits your needs. All plans include our core neural processing engine with no hidden fees.
          </p>
        </motion.div>
      </section>

      <section style={{ position: 'relative', zIndex: 5, padding: '2rem 2.5rem 6rem', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div style={{
                background: plan.highlighted ? 'var(--color-surface-container)' : 'var(--color-surface-highest)',
                borderRadius: 'var(--radius-lg)',
                padding: '2rem',
                border: plan.highlighted ? '1px solid var(--color-primary)' : '1px solid transparent',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{
                    fontSize: 'var(--text-label-md)',
                    fontWeight: 600,
                    color: plan.highlighted ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}>
                    {plan.name}
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <span className="display-md" style={{ lineHeight: 1 }}>
                    {plan.price !== 'Custom' ? '$' : ''}{plan.price}
                  </span>
                  <span className="body-md" style={{ color: 'var(--color-on-surface-variant)' }}>
                    {plan.price === 'Custom' ? '' : plan.period}
                  </span>
                </div>

                <p className="body-md" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '2rem' }}>
                  {plan.description}
                </p>

                <div style={{ flex: 1, marginBottom: '2rem' }}>
                  {plan.features.map((f, j) => (
                    <div key={f.name} style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.5rem 0',
                      borderBottom: j < plan.features.length - 1 ? '1px solid rgba(72,72,72,0.1)' : 'none',
                    }}>
                      {f.included ? <CheckIcon /> : <XIcon />}
                      <span className="body-sm" style={{
                        color: f.included ? 'var(--color-on-surface)' : 'var(--color-on-surface-variant)',
                      }}>
                        {f.name}
                      </span>
                    </div>
                  ))}
                </div>

                {plan.highlighted ? (
                  <PrimaryButton style={{ width: '100%', justifyContent: 'center' }}>
                    {plan.cta} <ChevronRight size={15} />
                  </PrimaryButton>
                ) : (
                  <SecondaryButton style={{ width: '100%', justifyContent: 'center' }}>
                    {plan.cta}
                  </SecondaryButton>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section style={{ position: 'relative', zIndex: 5, padding: '5rem 2.5rem', background: 'var(--color-surface-container-low)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
            <SectionLabel>FAQ</SectionLabel>
            <h2 className="display-sm" style={{ marginTop: '0.75rem' }}>Frequently asked questions</h2>
          </div>

          <div>
            {faqs.map((faq, i) => (
              <div key={faq.q} style={{
                background: 'var(--color-surface-highest)',
                borderRadius: 'var(--radius-DEFAULT)',
                marginBottom: i < faqs.length - 1 ? '1rem' : 0,
                overflow: 'hidden',
              }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%',
                    padding: '1.25rem 1.5rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'transparent', border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                  }}
                >
                  <span className="body-md" style={{ fontWeight: 600, color: 'var(--color-on-surface)' }}>
                    {faq.q}
                  </span>
                  <ChevronRight
                    size={18}
                    color="var(--color-on-surface-variant)"
                    style={{
                      transform: openFaq === i ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 200ms ease-out',
                    }}
                  />
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 1.5rem 1.5rem' }}>
                    <p className="body-md" style={{ color: 'var(--color-on-surface-variant)', margin: 0 }}>
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ position: 'relative', zIndex: 5, padding: '4rem 2.5rem', background: 'var(--color-surface)' }}>
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
          <span className="label-sm">┬⌐ 2026 Omniversal AI ┬╖ All rights reserved</span>
        </div>
        <span className="label-sm">System Status: Operational</span>
      </footer>

    </div>
  );
}
