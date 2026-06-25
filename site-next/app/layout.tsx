import type { Metadata, Viewport } from 'next';
import { mono, display } from '@/lib/fonts';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://hintertattoo.com'),
  title: 'HINTER TATTOO // Phoenix Fineline SurRealism',
  description:
    'Engravings on skin. Black and grey fineline surrealism from a private, appointment-only tattoo studio in Phoenix, Arizona.',
  openGraph: {
    title: 'HINTER TATTOO // Phoenix Fineline SurRealism',
    description:
      'Black and grey fineline surrealism. Private studio, Phoenix, Arizona. By appointment only.',
    type: 'website',
    images: ['/artist/portrait.jpeg'],
  },
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = {
  themeColor: '#e7e3d9',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${mono.variable} ${display.variable}`}>
      <body>
        <a className="skip-link" href="#work">
          Skip to the work
        </a>
        {children}
      </body>
    </html>
  );
}
