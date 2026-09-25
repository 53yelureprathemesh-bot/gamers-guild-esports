import type { Metadata } from 'next';
import { Orbitron, Rajdhani, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  weight: ['400', '600', '700', '800', '900'],
  display: 'swap',
});

const rajdhani = Rajdhani({
  subsets: ['latin'],
  variable: '--font-rajdhani',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://gamersguild.gg'),
  title: 'Gamers Guild Esports — Enter the Arena. Build Your Legacy.',
  description: 'Gamers Guild Esports is India’s premier competitive gaming organization. Register for BGMI, Free Fire, and Valorant tournaments, track live points tables, and forge your competitive legacy.',
  keywords: ['Gamers Guild Esports', 'BGMI Tournament', 'Free Fire Tournament', 'Valorant LAN', 'Esports India', 'Registration Form', 'Gaming Community'],
  authors: [{ name: 'Gamers Guild Esports' }],
  openGraph: {
    title: 'Gamers Guild Esports — Official Platform',
    description: 'Enter the arena. Build your legacy. Register now for premier national tournaments.',
    url: 'https://gamersguild.gg',
    siteName: 'Gamers Guild Esports',
    images: [
      {
        url: '/images/logo.png',
        width: 800,
        height: 800,
        alt: 'Gamers Guild Esports Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  icons: {
    icon: '/images/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${orbitron.variable} ${rajdhani.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen flex flex-col bg-cyber-black text-foreground antialiased font-rajdhani selection:bg-neon-emerald selection:text-black">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
