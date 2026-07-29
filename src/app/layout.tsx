import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import Footer from '@/components/Footer';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const sans = localFont({
  variable: '--font-sans',
  src: [
    { path: '../fonts/InstrumentSans-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../fonts/InstrumentSans-Italic.ttf', weight: '400', style: 'italic' },
    { path: '../fonts/InstrumentSans-Bold.ttf', weight: '700', style: 'normal' },
    { path: '../fonts/InstrumentSans-BoldItalic.ttf', weight: '700', style: 'italic' },
  ],
});

const display = localFont({
  variable: '--font-display',
  src: [
    { path: '../fonts/BricolageGrotesque-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../fonts/BricolageGrotesque-Bold.ttf', weight: '700', style: 'normal' },
  ],
});

export const metadata: Metadata = {
  title: { default: 'lovelope.app', template: '%s | lovelope.app' },
  description: 'The adorable way to ask someone out',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'lovelope.app',
  },
  openGraph: {
    title: 'lovelope.app',
    description: 'The adorable way to ask someone out',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#ec4899',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="font-sans bg-background text-foreground min-h-screen flex flex-col">
        <div className="flex-1">{children}</div>
        <Footer />
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
