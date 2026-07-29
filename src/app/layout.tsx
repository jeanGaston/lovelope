import type { Metadata, Viewport } from 'next';
import { Inter, Poppins } from 'next/font/google';
import Footer from '@/components/Footer';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-poppins',
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
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-sans bg-background text-foreground min-h-screen flex flex-col">
        <div className="flex-1">{children}</div>
        <Footer />
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
