// Wire Brutalist type system: monospace everywhere. JetBrains Mono carries body
// and UI; Space Mono adds character to the big display moments. Self-hosted by
// next/font (no Google <link>).
import { JetBrains_Mono, Space_Mono } from 'next/font/google';

export const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-mono-jb',
  display: 'swap',
});

export const display = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display-sm',
  display: 'swap',
});
