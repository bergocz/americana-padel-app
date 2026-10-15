import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Americanas de Pádel — Gestor de Torneos',
  description: 'Gestor profesional de torneos tipo americana de pádel. Rotación aleatoria por posición (revés/derecha), control de 2 a 6 pistas, temporizador y alarma sonora de cambio.',
  keywords: ['padel', 'americana padel', 'torneo padel', 'rotacion padel', 'reves', 'derecha', 'cronometro padel'],
  authors: [{ name: 'Espadel Tournament System' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#facc15',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full dark">
      <body className="min-h-full flex flex-col bg-black text-zinc-100 selection:bg-yellow-400 selection:text-black">
        {children}
      </body>
    </html>
  );
}
