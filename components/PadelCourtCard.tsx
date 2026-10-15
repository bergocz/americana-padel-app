'use client';

import React from 'react';
import { AmericanaMatch, AmericanaPlayer } from '../types/americana';
import { Trophy, Plus, Minus } from 'lucide-react';

interface PadelCourtCardProps {
  match: AmericanaMatch;
  matchIndex: number;
  onUpdateScore: (matchId: string, scoreA: number, scoreB: number) => void;
  isTimerRunning: boolean;
}

export const PadelCourtCard: React.FC<PadelCourtCardProps> = ({
  match,
  matchIndex,
  onUpdateScore,
  isTimerRunning,
}) => {
  const scoreA = match.scoreA ?? 0;
  const scoreB = match.scoreB ?? 0;

  const renderPlayerBadge = (player: AmericanaPlayer, side: 'reves' | 'derecha', isTeamA: boolean) => {
    const isReves = player.position === 'reves';
    const isDerecha = player.position === 'derecha';

    return (
      <div
        className={`flex flex-col p-2.5 rounded-xl border transition-all ${
          isTeamA
            ? 'bg-black/90 border-yellow-400/40 hover:border-yellow-400 shadow-sm shadow-yellow-400/10'
            : 'bg-zinc-900/90 border-zinc-700 hover:border-zinc-500 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="font-extrabold text-xs text-white truncate max-w-[110px] sm:max-w-[130px]">
            {player.name}
          </span>
          <span
            className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded-md ${
              isReves
                ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/40'
                : isDerecha
                ? 'bg-zinc-800 text-zinc-300 border border-zinc-600'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}
          >
            {side === 'reves' ? 'Revés' : 'Derecha'}
          </span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-zinc-400">
          <span>{player.pointsWon} pts acum.</span>
          {player.position === 'indiferente' && (
            <span className="text-[9px] text-yellow-400 font-mono font-bold">Poliv.</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-xl transition-all duration-300 hover:border-yellow-400/40 flex flex-col">
      {/* Court Header */}
      <div className="px-4 py-3 bg-black border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse" />
          <h3 className="text-sm font-black text-white tracking-wide">
            {match.courtName}
          </h3>
        </div>

        {/* Quick Score Counter */}
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-2xl px-2.5 py-1">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Juegos:</span>
          <div className="flex items-center gap-1.5 font-mono font-black text-xs text-white">
            <span className="text-yellow-400">{scoreA}</span>
            <span className="text-zinc-600">-</span>
            <span className="text-zinc-200">{scoreB}</span>
          </div>
        </div>
      </div>

      {/* Realistic Stylized Padel Court graphic in Black & Yellow */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div className="relative rounded-2xl bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 border-2 border-zinc-800 p-2 sm:p-3 overflow-hidden shadow-inner">
          {/* Glass wall effect top */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-yellow-400/30 via-white/30 to-yellow-400/30 pointer-events-none" />

          {/* Court lines in electric yellow */}
          <div className="absolute inset-2 border border-yellow-400/25 rounded-lg pointer-events-none" />
          <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-0.5 bg-yellow-400/40 pointer-events-none shadow-[0_0_8px_rgba(250,204,21,0.3)]" />
          {/* Service line top */}
          <div className="absolute inset-x-4 top-[28%] h-px bg-yellow-400/20 pointer-events-none" />
          {/* Service line bottom */}
          <div className="absolute inset-x-4 bottom-[28%] h-px bg-yellow-400/20 pointer-events-none" />
          {/* Center line */}
          <div className="absolute inset-y-4 left-1/2 -translate-x-1/2 w-px bg-yellow-400/20 pointer-events-none" />

          {/* TEAM A (Top half of court) */}
          <div className="relative z-10 mb-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-yellow-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block shadow-[0_0_6px_#facc15]" /> Pareja A
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onUpdateScore(match.id, Math.max(0, scoreA - 1), scoreB)}
                  className="w-5 h-5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition"
                  title="Restar juego a Pareja A"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-6 text-center font-mono font-bold text-xs text-yellow-400">{scoreA}</span>
                <button
                  type="button"
                  onClick={() => onUpdateScore(match.id, scoreA + 1, scoreB)}
                  className="w-5 h-5 rounded-md bg-yellow-400 hover:bg-yellow-300 text-black font-black flex items-center justify-center transition shadow-sm"
                  title="Sumar juego a Pareja A"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Revés on Left side of court */}
              {renderPlayerBadge(match.teamA.playerReves, 'reves', true)}
              {/* Derecha on Right side of court */}
              {renderPlayerBadge(match.teamA.playerDerecha, 'derecha', true)}
            </div>
          </div>

          {/* NET / RED CENTRAL */}
          <div className="relative z-10 my-2 flex items-center justify-center">
            <div className="w-full flex items-center gap-2 px-1">
              <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent" />
              <div className="px-2.5 py-0.5 rounded-full bg-black border border-yellow-400/30 text-[9px] font-mono uppercase tracking-widest text-yellow-400 shadow">
                RED DE PÁDEL
              </div>
              <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent" />
            </div>
          </div>

          {/* TEAM B (Bottom half of court) */}
          <div className="relative z-10 mt-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-zinc-500 inline-block" /> Pareja B
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onUpdateScore(match.id, scoreA, Math.max(0, scoreB - 1))}
                  className="w-5 h-5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition"
                  title="Restar juego a Pareja B"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-6 text-center font-mono font-bold text-xs text-zinc-200">{scoreB}</span>
                <button
                  type="button"
                  onClick={() => onUpdateScore(match.id, scoreA, scoreB + 1)}
                  className="w-5 h-5 rounded-md bg-zinc-700 hover:bg-zinc-600 text-white flex items-center justify-center transition shadow-sm"
                  title="Sumar juego a Pareja B"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {renderPlayerBadge(match.teamB.playerReves, 'reves', false)}
              {renderPlayerBadge(match.teamB.playerDerecha, 'derecha', false)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
