'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, FastForward, ShieldAlert, Smartphone, Clock } from 'lucide-react';
import { americanaAudio } from '../utils/americanaAudio';

interface AmericanaTimerProps {
  durationMinutes: number;
  onChangeDuration: (minutes: number) => void;
  isRunning: boolean;
  timeRemaining: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onNextRound: () => void;
  onTimerFinished: () => void;
  roundNumber: number;
}

export const AmericanaTimer: React.FC<AmericanaTimerProps> = ({
  durationMinutes,
  onChangeDuration,
  isRunning,
  timeRemaining,
  onStart,
  onPause,
  onReset,
  onNextRound,
  onTimerFinished,
  roundNumber,
}) => {
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [isAudioTesting, setIsAudioTesting] = useState(false);
  const wakeLockRef = useRef<any>(null);

  // Screen Wake Lock API to prevent phone screen from dimming/sleeping on court
  const requestWakeLock = useCallback(async () => {
    if (typeof window !== 'undefined' && 'wakeLock' in navigator) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        setWakeLockActive(true);
        wakeLockRef.current.addEventListener('release', () => {
          setWakeLockActive(false);
        });
      } catch (err) {
        // WakeLock request can fail if battery saver is on
        console.warn('WakeLock not granted:', err);
      }
    }
  }, []);

  const releaseWakeLock = useCallback(() => {
    if (wakeLockRef.current) {
      try {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
        setWakeLockActive(false);
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    if (isRunning) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
    return () => {
      releaseWakeLock();
    };
  }, [isRunning, requestWakeLock, releaseWakeLock]);

  // Audio test trigger
  const handleTestAudio = () => {
    americanaAudio.unlockAudio();
    setIsAudioTesting(true);
    americanaAudio.startLoudAlarm();
    setTimeout(() => {
      americanaAudio.stopAlarm();
      setIsAudioTesting(false);
    }, 2400);
  };

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const totalSeconds = durationMinutes * 60;
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - timeRemaining) / totalSeconds) * 100 : 0;

  // Warning state colors
  const isDanger = timeRemaining <= 30 && timeRemaining > 0;
  const isWarning = timeRemaining <= 60 && timeRemaining > 30;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-sky-50/50 to-blue-50/60 border border-blue-200/90 p-5 sm:p-6 shadow-md shadow-blue-500/5">
      {/* Background glow when warning/danger */}
      {isDanger && (
        <div className="absolute inset-0 bg-red-600/10 animate-pulse pointer-events-none" />
      )}

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Round & Duration Controls */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1 rounded-xl bg-blue-600 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-blue-500/20">
              Ronda {roundNumber}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-700">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-semibold">Duración del partido:</span>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[10, 12, 15, 20].map((mins) => (
              <button
                key={mins}
                type="button"
                disabled={isRunning}
                onClick={() => onChangeDuration(mins)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                  durationMinutes === mins
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 font-black ring-2 ring-blue-300'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 disabled:opacity-50'
                }`}
              >
                {mins} min
              </button>
            ))}

            {/* Custom minute stepper */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-xs">
              <button
                type="button"
                disabled={isRunning || durationMinutes <= 1}
                onClick={() => onChangeDuration(Math.max(1, durationMinutes - 1))}
                className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-blue-600 disabled:opacity-40 text-xs font-bold cursor-pointer"
              >
                -
              </button>
              <span className="font-mono text-xs font-bold text-blue-600 px-1">{durationMinutes}m</span>
              <button
                type="button"
                disabled={isRunning || durationMinutes >= 60}
                onClick={() => onChangeDuration(Math.min(60, durationMinutes + 1))}
                className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-blue-600 disabled:opacity-40 text-xs font-bold cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Mobile phone helper indicators */}
          <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-blue-600" />
              <span>{wakeLockActive ? '📱 Pantalla activa' : '📱 Alarma móvil lista'}</span>
            </span>
            <span>•</span>
            <button
              type="button"
              onClick={handleTestAudio}
              className={`flex items-center gap-1 font-bold transition px-2.5 py-1 rounded-lg border shadow-xs cursor-pointer ${
                isAudioTesting
                  ? 'bg-blue-600 text-white border-blue-600 animate-pulse'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <Volume2 className="w-3 h-3 text-blue-600" />
              <span>{isAudioTesting ? '¡Sonando...!' : 'Probar Bocina'}</span>
            </button>
          </div>
        </div>

        {/* Center: Massive Timer Display */}
        <div className="flex flex-col items-center justify-center">
          <div
            className={`font-mono text-5xl sm:text-6xl font-black tracking-tight transition-all duration-300 ${
              isDanger
                ? 'text-red-500 scale-105 animate-pulse drop-shadow-md'
                : isWarning
                ? 'text-amber-500 drop-shadow-sm'
                : isRunning
                ? 'text-blue-600 drop-shadow-sm'
                : 'text-slate-800'
            }`}
          >
            {formattedTime}
          </div>

          {/* Progress bar */}
          <div className="w-48 sm:w-60 h-2.5 bg-slate-200/90 border border-slate-300/70 rounded-full mt-2.5 overflow-hidden p-0.5 shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                isDanger
                  ? 'bg-gradient-to-r from-red-500 to-amber-500'
                  : isWarning
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                  : 'bg-gradient-to-r from-blue-600 via-sky-500 to-blue-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>

          <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-semibold mt-1">
            {isRunning ? 'Partido en curso' : timeRemaining === 0 ? '¡Tiempo cumplido!' : 'En pausa'}
          </div>
        </div>

        {/* Right: Big Action Controls */}
        <div className="flex items-center gap-2.5 justify-center md:justify-end flex-wrap">
          {!isRunning ? (
            <button
              type="button"
              onClick={() => {
                americanaAudio.unlockAudio();
                americanaAudio.playWhistle();
                onStart();
              }}
              className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-xl shadow-blue-500/25 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Iniciar Tiempo</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onPause}
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border-2 border-blue-600 text-blue-600 font-black text-sm shadow-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Pause className="w-5 h-5 fill-current" />
              <span>Pausar</span>
            </button>
          )}

          <button
            type="button"
            onClick={onReset}
            className="p-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition active:scale-95 border border-slate-200 shadow-xs cursor-pointer"
            title="Reiniciar reloj de la ronda"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onNextRound}
            className="px-4 py-3.5 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-blue-600 font-bold text-xs sm:text-sm transition flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-xs"
            title="Sortear siguiente ronda ahora"
          >
            <span>Siguiente Ronda</span>
            <FastForward className="w-4 h-4 text-blue-600" />
          </button>
        </div>
      </div>
    </div>
  );
};
