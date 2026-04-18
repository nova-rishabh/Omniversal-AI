import Image from 'next/image';

export function OmniLogo({ size = 40 }: { size?: number }) {
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

export function OmniWordmark({ logoSize = 40 }: { logoSize?: number }) {
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
