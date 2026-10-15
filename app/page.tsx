import React from 'react';
import { AmericanaManager } from '../components/AmericanaManager';
import { PwaInstallBanner } from '../components/PwaInstallBanner';
import { Trophy, Zap, ShieldCheck } from 'lucide-react';

export default function AmericanaPage() {
  return (
    <div className="min-h-screen bg-transparent text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Banner / Navbar */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-300/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/20">
              <Zap className="w-5 h-5 fill-white stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase">
                  Americana <span className="text-blue-600">Pádel</span> Pro
                </span>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  2-6 PISTAS
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium hidden sm:block">
                Sorteo aleatorio por posición (Revés & Derecha) • Temporizador y alarma sonora
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/90 border border-slate-300/90 text-xs text-slate-700 font-semibold shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Rotación Justa</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6">
        <PwaInstallBanner />
        <AmericanaManager />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-300/80 bg-white/70 backdrop-blur-xs py-6 mt-12 text-center text-xs text-slate-500 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="flex items-center justify-center gap-1.5 text-slate-600">
            <Trophy className="w-4 h-4 text-blue-600" />
            <span className="font-semibold">Gestor oficial e independiente de Americanas de Pádel</span>
          </p>
          <p className="text-slate-500">
            Algoritmo inteligente de emparejamiento con control de descansos y aviso acústico de cambio
          </p>
        </div>
      </footer>
    </div>
  );
}
