import React from 'react';
import { AmericanaManager } from '../components/AmericanaManager';
import { Trophy, Zap, ShieldCheck } from 'lucide-react';

export default function AmericanaPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col selection:bg-yellow-400 selection:text-black">
      {/* Top Banner / Navbar */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400 text-black flex items-center justify-center font-black shadow-lg shadow-yellow-400/25">
              <Zap className="w-5 h-5 fill-black stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-tight text-white uppercase">
                  Americana <span className="text-yellow-400">Pádel</span> Pro
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-yellow-400/10 text-yellow-400 border border-yellow-400/30">
                  2-6 PISTAS
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium hidden sm:block">
                Sorteo aleatorio por posición (Revés & Derecha) • Temporizador y alarma sonora
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-yellow-400" />
              <span>Rotación Justa</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6">
        <AmericanaManager />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/60 py-6 mt-12 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="flex items-center justify-center gap-1.5">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>Aplicación oficial e independiente de Americanas de Pádel</span>
          </p>
          <p className="text-zinc-600">
            Algoritmo inteligente de emparejamiento con control de descansos y aviso acústico de cambio
          </p>
        </div>
      </footer>
    </div>
  );
}
