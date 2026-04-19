'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

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
      background: 'var(--color-surface)',
      fontFamily: 'var(--font-sans)',
      color: 'var(--color-on-surface)',
      padding: '2rem'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        style={{
          width: '100%',
          maxWidth: '600px',
          background: 'var(--color-surface-container)',
          borderRadius: '1rem',
          border: '1px solid rgba(255,255,255,0.05)',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
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
