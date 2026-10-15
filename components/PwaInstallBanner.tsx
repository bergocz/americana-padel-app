'use client';

import React, { useEffect, useState } from 'react';
import { Smartphone, Download, X, Check, HelpCircle } from 'lucide-react';

export const PwaInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker for offline PWA
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('PWA Service Worker registration:', err);
      });
    }

    // 2. Check if already running in standalone mode (installed)
    if (typeof window !== 'undefined') {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
      if (isStandalone) {
        setIsInstalled(true);
        return;
      }
    }

    // 3. Capture beforeinstallprompt on Android Chrome/Edge/Samsung
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. Detect when app is successfully installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } else {
      // If prompt is not directly available, show simple 2-step guide
      setShowInstructions(true);
    }
  };

  // If already installed or dismissed, hide
  if (isInstalled) return null;

  return (
    <>
      {/* Floating or Top Install Bar for Android */}
      {!dismissed && (
        <aside 
          aria-label="Instalar aplicación móvil"
          className="mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-2xl p-3 sm:p-3.5 shadow-lg shadow-blue-500/20 flex items-center justify-between gap-3 animate-in fade-in duration-300"
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30 text-white shadow-xs">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-black text-xs sm:text-sm tracking-tight">
                  ¿Quieres instalar la App en tu Android?
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-white/20 uppercase tracking-wider">
                  Oficial PWA
                </span>
              </div>
              <p className="text-[11px] text-blue-100 truncate">
                Acceso directo desde pantalla de inicio, pantalla completa y funciona offline.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-blue-700 font-black text-xs transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Instalar en</span> Android
            </button>

            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Cerrar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      {/* Manual Instructions Modal (For browsers that require menu tap) */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-600" />
                Cómo instalar en Android
              </h3>
              <button
                type="button"
                onClick={() => setShowInstructions(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">1</span>
                <div>
                  <strong className="text-slate-900">Abre el menú de tu navegador</strong>
                  <p className="text-slate-500 mt-0.5">Pulsa en los <strong>tres puntos (⋮)</strong> en la esquina superior o inferior derecha de Google Chrome o Samsung Internet.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">2</span>
                <div>
                  <strong className="text-slate-900">Selecciona Instalar</strong>
                  <p className="text-slate-500 mt-0.5">Toca en <strong>"Instalar aplicación"</strong> o <strong>"Añadir a la pantalla de inicio"</strong>.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">¡Listo!</strong>
                  <p className="text-emerald-700 mt-0.5">Se creará el icono de la app en tu móvil y se abrirá en pantalla completa como una aplicación nativa.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowInstructions(false)}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition cursor-pointer shadow-md shadow-blue-500/20"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
