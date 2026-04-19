'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

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

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [profession, setProfession] = useState('');
  const [about, setAbout] = useState('');
  const [fatherEmail, setFatherEmail] = useState('');
  
  // Protect route
  useEffect(() => {
    if (!localStorage.getItem('auth')) {
      router.push('/login');
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !fatherEmail) return;

    const onboardingData = {
      name,
      profession,
      about,
      fatherEmail
    };

    localStorage.setItem('onboardingData', JSON.stringify(onboardingData));
    router.push('/chat');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0e0e0e',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'var(--font-sans)',
      color: 'var(--color-on-surface)',
      padding: '2rem'
    }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <NeuralCanvas opacity={0.1} nodeCount={32} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        style={{
          width: '100%',
          maxWidth: '600px',
          background: 'rgba(25, 26, 26, 0.7)',
          backdropFilter: 'blur(20px)',
          borderRadius: '1rem',
          border: '1px solid rgba(255,255,255,0.05)',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          zIndex: 10,
        }}
      >
        <div style={{ 
          padding: '2rem', 
          background: 'linear-gradient(to right, rgba(0,218,243,0.1), transparent)',
          borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>Calibration Sequence</h1>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            To personalize the neural framework, please provide context about yourself.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.2)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', color: 'white', outline: 'none',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Profession
              </label>
              <input
                type="text"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                style={{
                  width: '100%', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.2)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', color: 'white', outline: 'none',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Brief Bio (Interests / Goals)
            </label>
            <textarea
              rows={3}
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              style={{
                width: '100%', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.2)', resize: 'none',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', color: 'white', outline: 'none',
              }}
            />
          </div>

          <div style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Emergency Contact (Required)
            </label>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-on-surface-variant)', marginBottom: '1rem' }}>
              For safety compliance, please provide your father's email address.
            </p>
            <input
              type="email"
              required
              placeholder="e.g., dad@gmail.com"
              value={fatherEmail}
              onChange={(e) => setFatherEmail(e.target.value)}
              style={{
                width: '100%', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.2)',
                border: '1px solid rgba(0,218,243,0.3)', borderRadius: '0.5rem', color: 'white', outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={!name || !fatherEmail}
            style={{
              padding: '1rem',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-container))',
              color: 'black',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: 700,
              cursor: (!name || !fatherEmail) ? 'not-allowed' : 'pointer',
              marginTop: '1rem',
              opacity: (!name || !fatherEmail) ? 0.5 : 1,
              transition: 'opacity 0.2s'
            }}
          >
            ENTER WORKSPACE
          </button>
        </form>
      </motion.div>
    </div>
  );
}
