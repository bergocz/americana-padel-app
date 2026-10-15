import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Americanas de Pádel — Gestor de Torneos',
  description: 'Gestor profesional de torneos tipo americana de pádel. Rotación aleatoria por posición (revés/derecha), control de 2 a 6 pistas, temporizador y alarma sonora de cambio.',
  keywords: ['padel', 'americana padel', 'torneo padel', 'rotacion padel', 'reves', 'derecha', 'cronometro padel'],
  authors: [{ name: 'Espadel Tournament System' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Americana Pádel',
  },
  icons: {
    icon: [
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full flex flex-col bg-[#cbd5e1] text-slate-900 selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
