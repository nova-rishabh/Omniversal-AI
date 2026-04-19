'use client';

import { useState, useEffect } from 'react';

export function StreamingText({ text }: { text: string }) {
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
