'use client';

import React, { useEffect } from 'react';
import { VolumeX, FastForward, BellRing } from 'lucide-react';
import { americanaAudio } from '../utils/americanaAudio';

interface AlarmModalProps {
  isOpen: boolean;
  roundNumber: number;
  onStopAlarm: () => void;
  onNextRound: () => void;
}

export const AlarmModal: React.FC<AlarmModalProps> = ({
  isOpen,
  roundNumber,
  onStopAlarm,
  onNextRound,
}) => {
  useEffect(() => {
    if (isOpen) {
      americanaAudio.startLoudAlarm();
    } else {
      americanaAudio.stopAlarm();
    }
    return () => {
      americanaAudio.stopAlarm();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      {/* Flashing ambient warning light */}
      <div className="absolute inset-0 bg-blue-500/10 animate-pulse pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full bg-white border-2 border-blue-500 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
        {/* Pulsing Bell Icon */}
        <div className="relative mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border-4 border-white flex items-center justify-center animate-bounce shadow-xl shadow-blue-500/30">
          <BellRing className="w-12 h-12 text-white animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-amber-500 border-2 border-white"></span>
          </span>
        </div>

        <div>
          <div className="inline-block px-3 py-1 rounded-full bg-blue-100 border border-blue-200 text-blue-700 font-mono text-xs uppercase tracking-widest font-black mb-2 shadow-xs">
            ¡Ronda {roundNumber} Finalizada!
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">
            ¡TIEMPO! CAMBIO DE PISTA
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-md mx-auto">
            Ha sonado la bocina oficial. Anotad los juegos conseguidos en cada pista y pasad al siguiente turno de la americana.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={onStopAlarm}
            className="flex-1 py-4 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-extrabold text-sm transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer shadow-xs"
          >
            <VolumeX className="w-5 h-5 text-rose-500" />
            <span>Detener Bocina</span>
          </button>

          <button
            type="button"
            onClick={() => {
              americanaAudio.stopAlarm();
              onNextRound();
            }}
            className="flex-1 py-4 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-xl shadow-blue-600/30 transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <FastForward className="w-5 h-5 stroke-[2.5]" />
            <span>Sortear Ronda {roundNumber + 1}</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-500 font-mono">
          🔊 La alarma sonará hasta que pulses Detener o Siguiente Ronda
        </div>
      </div>
    </div>
  );
};
