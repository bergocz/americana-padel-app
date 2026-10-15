'use client';

import React, { useEffect, useState } from 'react';
import { AmericanaPlayer, AmericanaRound, ScoringCriteria } from '../types/americana';
import { calculateLeaderboard } from '../utils/americanaAlgorithm';
import { X, Trophy, Share2, Check, Sparkles, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: AmericanaPlayer[];
  currentRoundNumber: number;
  rounds: AmericanaRound[];
  scoringCriteria: ScoringCriteria;
  onSelectCriteria: (criteria: ScoringCriteria) => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  players,
  currentRoundNumber,
  rounds,
  scoringCriteria,
  onSelectCriteria,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#2563eb', '#38bdf8', '#facc15', '#10b981'],
        });
      } catch {
        // ignore
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const entries = calculateLeaderboard(players, rounds, scoringCriteria);

  const generateWhatsAppShare = () => {
    const isMatchesMode = scoringCriteria === 'matches';
    let msg = `🏆 *CLASIFICACIÓN AMERICANA DE PÁDEL* (Ronda ${currentRoundNumber})\n`;
    msg += isMatchesMode
      ? `📋 *Criterio:* Más Partidos Ganados (Desempate por juegos)\n\n`
      : `📋 *Criterio:* Más Juegos Totales\n\n`;

    entries.slice(0, 10).forEach((entry, idx) => {
      const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`;
      if (isMatchesMode) {
        msg += `${medal} *${entry.player.name}* — ${entry.matchesWon} vic | ${entry.gamesWon} juegos (Dif: ${entry.gamesDiff >= 0 ? '+' : ''}${entry.gamesDiff})\n`;
      } else {
        msg += `${medal} *${entry.player.name}* — ${entry.gamesWon} juegos | ${entry.matchesWon} vic (Dif: ${entry.gamesDiff >= 0 ? '+' : ''}${entry.gamesDiff})\n`;
      }
    });

    msg += `\n🎾 ¡Gran nivel hoy en la pista!`;

    navigator.clipboard
      .writeText(msg)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      })
      .catch(() => {});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative max-w-xl w-full bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
              <Trophy className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Clasificación de la Americana
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {rounds.length} {rounds.length === 1 ? 'ronda disputada' : 'rondas disputadas'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scoring Criteria Toggle Card */}
        <div className="px-6 py-3 bg-slate-50/70 border-b border-slate-200">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Criterio de Victoria
            </span>
            <span className="text-[10px] font-mono text-blue-700 font-bold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              {scoringCriteria === 'matches' ? 'Desempate: Juegos' : 'Diferencial'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/70 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => onSelectCriteria('matches')}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition text-center cursor-pointer ${
                scoringCriteria === 'matches'
                  ? 'bg-blue-600 text-white font-black shadow-md shadow-blue-500/25'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-semibold'
              }`}
            >
              <span className="text-xs flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" />
                Más Partidos Ganados
              </span>
              <span
                className={`text-[9px] mt-0.5 ${
                  scoringCriteria === 'matches' ? 'text-blue-100' : 'text-slate-500'
                }`}
              >
                Si hay empate, deciden los juegos
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSelectCriteria('games')}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition text-center cursor-pointer ${
                scoringCriteria === 'games'
                  ? 'bg-blue-600 text-white font-black shadow-md shadow-blue-500/25'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-semibold'
              }`}
            >
              <span className="text-xs flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" />
                Más Juegos Totales
              </span>
              <span
                className={`text-[9px] mt-0.5 ${
                  scoringCriteria === 'games' ? 'text-blue-100' : 'text-slate-500'
                }`}
              >
                Suma acumulada de todos los juegos
              </span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Top 3 Podium (if >= 3 players) */}
          {entries.length >= 3 && (
            <div className="grid grid-cols-3 gap-2 pt-2 pb-4 border-b border-slate-200">
              {/* 2nd place */}
              <div className="flex flex-col items-center justify-end p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center shadow-xs">
                <span className="text-2xl mb-1">🥈</span>
                <span className="text-xs font-bold text-slate-800 truncate max-w-[85px]">
                  {entries[1].player.name}
                </span>
                <span className="font-mono text-xs font-black text-slate-700 mt-1">
                  {scoringCriteria === 'matches'
                    ? `${entries[1].matchesWon} vic`
                    : `${entries[1].gamesWon} jgs`}
                </span>
                <span className="text-[9px] text-slate-500 uppercase font-mono mt-0.5">
                  {scoringCriteria === 'matches'
                    ? `${entries[1].gamesWon} jgs (Dif ${entries[1].gamesDiff >= 0 ? '+' : ''}${entries[1].gamesDiff})`
                    : `${entries[1].matchesWon} vic`}
                </span>
              </div>

              {/* 1st place */}
              <div className="flex flex-col items-center justify-end p-3.5 rounded-2xl bg-gradient-to-b from-amber-50 via-yellow-50 to-white border-2 border-amber-400 text-center shadow-lg shadow-amber-500/15 -translate-y-2">
                <span className="text-3xl mb-1">🥇</span>
                <span className="text-xs font-black text-amber-900 truncate max-w-[95px]">
                  {entries[0].player.name}
                </span>
                <span className="font-mono text-sm font-black text-blue-600 mt-1">
                  {scoringCriteria === 'matches'
                    ? `${entries[0].matchesWon} victorias`
                    : `${entries[0].gamesWon} juegos`}
                </span>
                <span className="text-[10px] text-amber-800 font-bold font-mono mt-0.5">
                  {scoringCriteria === 'matches'
                    ? `${entries[0].gamesWon} juegos (Dif ${entries[0].gamesDiff >= 0 ? '+' : ''}${entries[0].gamesDiff})`
                    : `${entries[0].matchesWon} vic (Dif ${entries[0].gamesDiff >= 0 ? '+' : ''}${entries[0].gamesDiff})`}
                </span>
              </div>

              {/* 3rd place */}
              <div className="flex flex-col items-center justify-end p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center shadow-xs">
                <span className="text-2xl mb-1">🥉</span>
                <span className="text-xs font-bold text-slate-800 truncate max-w-[85px]">
                  {entries[2].player.name}
                </span>
                <span className="font-mono text-xs font-black text-slate-700 mt-1">
                  {scoringCriteria === 'matches'
                    ? `${entries[2].matchesWon} vic`
                    : `${entries[2].gamesWon} jgs`}
                </span>
                <span className="text-[9px] text-slate-500 uppercase font-mono mt-0.5">
                  {scoringCriteria === 'matches'
                    ? `${entries[2].gamesWon} jgs (Dif ${entries[2].gamesDiff >= 0 ? '+' : ''}${entries[2].gamesDiff})`
                    : `${entries[2].matchesWon} vic`}
                </span>
              </div>
            </div>
          )}

          {/* Full Player Ranking List */}
          <div className="space-y-1.5">
            {entries.map((entry, index) => {
              const { player, matchesPlayed, matchesWon, gamesWon, gamesDiff } = entry;
              const isFirst = index === 0;

              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition ${
                    isFirst
                      ? 'bg-amber-50/60 border-amber-200 shadow-xs'
                      : index === 1
                      ? 'bg-slate-50/80 border-slate-200'
                      : index === 2
                      ? 'bg-slate-50/50 border-slate-200'
                      : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 text-center font-mono font-black text-xs ${
                        isFirst
                          ? 'text-amber-600'
                          : index === 1
                          ? 'text-slate-700'
                          : index === 2
                          ? 'text-amber-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <span>{player.name}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase ${
                            player.position === 'reves'
                              ? 'bg-blue-100 text-blue-800'
                              : player.position === 'derecha'
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {player.position}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5 font-mono">
                        <span>PJ: {matchesPlayed}</span>
                        <span>•</span>
                        <span>PG: {matchesWon}</span>
                        <span>•</span>
                        <span>Juegos: {gamesWon}</span>
                        <span>•</span>
                        <span className={gamesDiff > 0 ? 'text-blue-600 font-bold' : gamesDiff < 0 ? 'text-slate-400' : 'text-slate-500'}>
                          Dif: {gamesDiff >= 0 ? `+${gamesDiff}` : gamesDiff}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    {scoringCriteria === 'matches' ? (
                      <>
                        <span className="font-mono text-sm font-black text-blue-600">
                          {matchesWon}
                        </span>
                        <span className="text-[10px] text-slate-500 ml-1 font-mono">vic</span>
                        <div className="text-[9px] text-slate-400 font-mono">
                          {gamesWon} jgs
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="font-mono text-sm font-black text-blue-600">
                          {gamesWon}
                        </span>
                        <span className="text-[10px] text-slate-500 ml-1 font-mono">jgs</span>
                        <div className="text-[9px] text-slate-400 font-mono">
                          {matchesWon} vic
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={generateWhatsAppShare}
            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer shadow-sm shadow-emerald-600/20"
          >
            {copied ? <Check className="w-4 h-4 text-white" /> : <Share2 className="w-4 h-4 text-white" />}
            <span>{copied ? '¡Copiado para WhatsApp!' : 'Copiar Clasificación WhatsApp'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition active:scale-95 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
