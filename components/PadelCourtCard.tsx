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
            ? 'bg-white/95 backdrop-blur-sm border-blue-100 shadow-sm hover:border-blue-300'
            : 'bg-white/95 backdrop-blur-sm border-slate-100 shadow-sm hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="font-extrabold text-xs text-slate-900 truncate max-w-[110px] sm:max-w-[130px]">
            {player.name}
          </span>
          <span
            className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded-md ${
              isReves
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : isDerecha
                ? 'bg-slate-100 text-slate-700 border border-slate-200'
                : 'bg-amber-100 text-amber-800 border border-amber-200'
            }`}
          >
            {side === 'reves' ? 'Revés' : 'Derecha'}
          </span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
          <span>{player.pointsWon} pts acum.</span>
          {player.position === 'indiferente' && (
            <span className="text-[9px] text-blue-600 font-mono font-bold">Poliv.</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative rounded-3xl overflow-hidden bg-white border border-slate-200/90 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-300 flex flex-col">
      {/* Court Header */}
      <div className="px-4 py-3 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="text-sm font-black text-slate-900 tracking-wide">
            {match.courtName}
          </h3>
        </div>

        {/* Quick Score Counter */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-3 py-1 shadow-xs">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Juegos:</span>
          <div className="flex items-center gap-1.5 font-mono font-black text-xs text-slate-800">
            <span className="text-blue-600 text-sm">{scoreA}</span>
            <span className="text-slate-400">-</span>
            <span className="text-slate-800 text-sm">{scoreB}</span>
          </div>
        </div>
      </div>

      {/* Official Premier Padel Blue Turf Court Graphic */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div className="relative rounded-2xl bg-gradient-to-b from-sky-600 via-blue-600 to-sky-700 border-2 border-slate-300/80 p-2 sm:p-3 overflow-hidden shadow-inner">
          {/* Glass wall effect top */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-300/40 via-white/60 to-sky-300/40 pointer-events-none" />

          {/* Official white court regulation lines */}
          <div className="absolute inset-2 border-2 border-white/70 rounded-lg pointer-events-none" />
          <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-0.5 bg-white/80 pointer-events-none shadow-xs" />
          {/* Service line top */}
          <div className="absolute inset-x-4 top-[28%] h-0.5 bg-white/60 pointer-events-none" />
          {/* Service line bottom */}
          <div className="absolute inset-x-4 bottom-[28%] h-0.5 bg-white/60 pointer-events-none" />
          {/* Center line */}
          <div className="absolute inset-y-4 left-1/2 -translate-x-1/2 w-0.5 bg-white/60 pointer-events-none" />

          {/* TEAM A (Top half of court) */}
          <div className="relative z-10 mb-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-white drop-shadow-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white inline-block shadow-xs" /> Pareja A
              </span>
              <div className="flex items-center gap-1 bg-black/20 backdrop-blur-xs rounded-lg p-0.5 border border-white/30">
                <button
                  type="button"
                  onClick={() => onUpdateScore(match.id, Math.max(0, scoreA - 1), scoreB)}
                  className="w-5 h-5 rounded-md bg-white hover:bg-slate-100 text-slate-800 flex items-center justify-center transition shadow-xs cursor-pointer"
                  title="Restar juego a Pareja A"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-6 text-center font-mono font-black text-xs text-white drop-shadow-xs">{scoreA}</span>
                <button
                  type="button"
                  onClick={() => onUpdateScore(match.id, scoreA + 1, scoreB)}
                  className="w-5 h-5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-black flex items-center justify-center transition shadow-xs cursor-pointer"
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
              <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-white/70 to-transparent" />
              <div className="px-3 py-0.5 rounded-full bg-white text-blue-900 border border-slate-200 text-[9px] font-mono font-black uppercase tracking-widest shadow-md">
                RED DE PÁDEL
              </div>
              <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-white/70 to-transparent" />
            </div>
          </div>

          {/* TEAM B (Bottom half of court) */}
          <div className="relative z-10 mt-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-sky-100 drop-shadow-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-300 inline-block" /> Pareja B
              </span>
              <div className="flex items-center gap-1 bg-black/20 backdrop-blur-xs rounded-lg p-0.5 border border-white/30">
                <button
                  type="button"
                  onClick={() => onUpdateScore(match.id, scoreA, Math.max(0, scoreB - 1))}
                  className="w-5 h-5 rounded-md bg-white hover:bg-slate-100 text-slate-800 flex items-center justify-center transition shadow-xs cursor-pointer"
                  title="Restar juego a Pareja B"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-6 text-center font-mono font-black text-xs text-white drop-shadow-xs">{scoreB}</span>
                <button
                  type="button"
                  onClick={() => onUpdateScore(match.id, scoreA, scoreB + 1)}
                  className="w-5 h-5 rounded-md bg-sky-500 hover:bg-sky-600 text-white font-black flex items-center justify-center transition shadow-xs cursor-pointer"
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
