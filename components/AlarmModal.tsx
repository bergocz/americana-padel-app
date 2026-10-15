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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Flashing ambient warning lights */}
      <div className="absolute inset-0 bg-yellow-400/10 animate-pulse pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full bg-zinc-950 border-2 border-yellow-400 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(250,204,21,0.35)] text-center space-y-6">
        {/* Pulsing Bell Icon */}
        <div className="relative mx-auto w-24 h-24 rounded-full bg-yellow-400/20 border-2 border-yellow-400 flex items-center justify-center animate-bounce shadow-lg shadow-yellow-400/30">
          <BellRing className="w-12 h-12 text-yellow-400 animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-yellow-400"></span>
          </span>
        </div>

        <div>
          <div className="inline-block px-3 py-1 rounded-full bg-yellow-400 text-black font-mono text-xs uppercase tracking-widest font-black mb-2 shadow-sm">
            ¡Ronda {roundNumber} Finalizada!
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
            ¡TIEMPO! CAMBIO DE PISTA
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 mt-2 max-w-md mx-auto">
            Ha sonado la bocina oficial. Anotad los juegos conseguidos en cada pista y pasad al siguiente turno de la americana.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={onStopAlarm}
            className="flex-1 py-4 px-5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-extrabold text-sm transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <VolumeX className="w-5 h-5 text-red-400" />
            <span>Detener Bocina</span>
          </button>

          <button
            type="button"
            onClick={() => {
              americanaAudio.stopAlarm();
              onNextRound();
            }}
            className="flex-1 py-4 px-5 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-sm shadow-xl shadow-yellow-400/30 transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <FastForward className="w-5 h-5 stroke-[2.5]" />
            <span>Sortear Ronda {roundNumber + 1}</span>
          </button>
        </div>

        <div className="text-[11px] text-zinc-400 font-mono">
          🔊 La alarma sonará hasta que pulses Detener o Siguiente Ronda
        </div>
      </div>
    </div>
  );
};
