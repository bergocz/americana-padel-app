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
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border-2 border-yellow-400/30 p-5 sm:p-6 shadow-2xl shadow-yellow-400/5">
      {/* Background glow when warning/danger */}
      {isDanger && (
        <div className="absolute inset-0 bg-red-600/15 animate-pulse pointer-events-none" />
      )}

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Round & Duration Controls */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1 rounded-xl bg-yellow-400 text-black font-black text-xs uppercase tracking-wider shadow-md shadow-yellow-400/20">
              Ronda {roundNumber}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-zinc-300">
              <Clock className="w-3.5 h-3.5 text-yellow-400" />
              <span className="font-medium">Duración del partido:</span>
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  durationMinutes === mins
                    ? 'bg-yellow-400 text-black shadow-md shadow-yellow-400/25 font-black ring-2 ring-yellow-300'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 disabled:opacity-50'
                }`}
              >
                {mins} min
              </button>
            ))}

            {/* Custom minute stepper */}
            <div className="flex items-center gap-1 bg-black border border-zinc-800 rounded-xl px-2 py-1">
              <button
                type="button"
                disabled={isRunning || durationMinutes <= 1}
                onClick={() => onChangeDuration(Math.max(1, durationMinutes - 1))}
                className="w-5 h-5 flex items-center justify-center text-zinc-400 hover:text-yellow-400 disabled:opacity-40 text-xs font-bold"
              >
                -
              </button>
              <span className="font-mono text-xs font-bold text-yellow-400 px-1">{durationMinutes}m</span>
              <button
                type="button"
                disabled={isRunning || durationMinutes >= 60}
                onClick={() => onChangeDuration(Math.min(60, durationMinutes + 1))}
                className="w-5 h-5 flex items-center justify-center text-zinc-400 hover:text-yellow-400 disabled:opacity-40 text-xs font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Mobile phone helper indicators */}
          <div className="flex items-center gap-3 text-[11px] text-zinc-400 pt-1">
            <span className="flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-yellow-400" />
              <span>{wakeLockActive ? '📱 Pantalla activa' : '📱 Alarma móvil lista'}</span>
            </span>
            <span>•</span>
            <button
              type="button"
              onClick={handleTestAudio}
              className={`flex items-center gap-1 font-bold transition px-2 py-0.5 rounded-lg border ${
                isAudioTesting
                  ? 'bg-yellow-400 text-black border-yellow-400 animate-pulse'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700'
              }`}
            >
              <Volume2 className="w-3 h-3 text-yellow-400" />
              <span>{isAudioTesting ? '¡Sonando...!' : 'Probar Bocina'}</span>
            </button>
          </div>
        </div>

        {/* Center: Massive Timer Display */}
        <div className="flex flex-col items-center justify-center">
          <div
            className={`font-mono text-5xl sm:text-6xl font-black tracking-tight transition-all duration-300 ${
              isDanger
                ? 'text-red-500 scale-105 animate-pulse drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]'
                : isWarning
                ? 'text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                : isRunning
                ? 'text-yellow-400 drop-shadow-[0_0_18px_rgba(250,204,21,0.45)]'
                : 'text-zinc-100'
            }`}
          >
            {formattedTime}
          </div>

          {/* Progress bar */}
          <div className="w-48 sm:w-60 h-2 bg-zinc-900 border border-zinc-800 rounded-full mt-2.5 overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                isDanger
                  ? 'bg-gradient-to-r from-red-500 to-amber-500'
                  : isWarning
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                  : 'bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>

          <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 mt-1">
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
              className="px-6 py-3.5 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-sm shadow-xl shadow-yellow-400/25 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Iniciar Tiempo</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onPause}
              className="px-6 py-3.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 border-2 border-yellow-400/50 text-yellow-400 font-black text-sm shadow-xl transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Pause className="w-5 h-5 fill-current" />
              <span>Pausar</span>
            </button>
          )}

          <button
            type="button"
            onClick={onReset}
            className="p-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-yellow-400 transition active:scale-95 border border-zinc-800"
            title="Reiniciar reloj de la ronda"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onNextRound}
            className="px-4 py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 hover:text-yellow-400 font-bold text-xs sm:text-sm transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
            title="Sortear siguiente ronda ahora"
          >
            <span>Siguiente Ronda</span>
            <FastForward className="w-4 h-4 text-yellow-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
