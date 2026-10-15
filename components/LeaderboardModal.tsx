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
          colors: ['#facc15', '#ffffff', '#eab308', '#000000'],
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative max-w-xl w-full bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-black">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Clasificación de la Americana
              </h2>
              <p className="text-xs text-zinc-400">
                {rounds.length} {rounds.length === 1 ? 'ronda disputada' : 'rondas disputadas'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scoring Criteria Toggle Card */}
        <div className="px-6 py-3 bg-zinc-900/60 border-b border-zinc-800">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              Criterio para determinar al ganador
            </span>
            <span className="text-[10px] font-mono text-yellow-400 font-bold bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20">
              {scoringCriteria === 'matches' ? 'Desempate: Juegos' : 'Diferencial'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 p-1 bg-black/80 rounded-2xl border border-zinc-800">
            <button
              type="button"
              onClick={() => onSelectCriteria('matches')}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition text-center cursor-pointer ${
                scoringCriteria === 'matches'
                  ? 'bg-yellow-400 text-black font-black shadow-lg shadow-yellow-400/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 font-semibold'
              }`}
            >
              <span className="text-xs flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" />
                Más Partidos Ganados
              </span>
              <span
                className={`text-[9px] mt-0.5 ${
                  scoringCriteria === 'matches' ? 'text-black/80' : 'text-zinc-500'
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
                  ? 'bg-yellow-400 text-black font-black shadow-lg shadow-yellow-400/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 font-semibold'
              }`}
            >
              <span className="text-xs flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" />
                Más Juegos Totales
              </span>
              <span
                className={`text-[9px] mt-0.5 ${
                  scoringCriteria === 'games' ? 'text-black/80' : 'text-zinc-500'
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
            <div className="grid grid-cols-3 gap-2 pt-2 pb-4 border-b border-zinc-800">
              {/* 2nd place */}
              <div className="flex flex-col items-center justify-end p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center">
                <span className="text-2xl mb-1">🥈</span>
                <span className="text-xs font-bold text-white truncate max-w-[85px]">
                  {entries[1].player.name}
                </span>
                <span className="font-mono text-xs font-black text-zinc-300 mt-1">
                  {scoringCriteria === 'matches'
                    ? `${entries[1].matchesWon} vic`
                    : `${entries[1].gamesWon} jgs`}
                </span>
                <span className="text-[9px] text-zinc-500 uppercase font-mono mt-0.5">
                  {scoringCriteria === 'matches'
                    ? `${entries[1].gamesWon} jgs (Dif ${entries[1].gamesDiff >= 0 ? '+' : ''}${entries[1].gamesDiff})`
                    : `${entries[1].matchesWon} vic`}
                </span>
              </div>

              {/* 1st place */}
              <div className="flex flex-col items-center justify-end p-3.5 rounded-2xl bg-gradient-to-b from-yellow-400/20 to-zinc-950 border-2 border-yellow-400 text-center shadow-lg shadow-yellow-400/15 -translate-y-2">
                <span className="text-3xl mb-1">🥇</span>
                <span className="text-xs font-black text-yellow-400 truncate max-w-[95px]">
                  {entries[0].player.name}
                </span>
                <span className="font-mono text-sm font-black text-yellow-400 mt-1">
                  {scoringCriteria === 'matches'
                    ? `${entries[0].matchesWon} victorias`
                    : `${entries[0].gamesWon} juegos`}
                </span>
                <span className="text-[10px] text-yellow-300/80 font-bold font-mono mt-0.5">
                  {scoringCriteria === 'matches'
                    ? `${entries[0].gamesWon} juegos (Dif ${entries[0].gamesDiff >= 0 ? '+' : ''}${entries[0].gamesDiff})`
                    : `${entries[0].matchesWon} vic (Dif ${entries[0].gamesDiff >= 0 ? '+' : ''}${entries[0].gamesDiff})`}
                </span>
              </div>

              {/* 3rd place */}
              <div className="flex flex-col items-center justify-end p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center">
                <span className="text-2xl mb-1">🥉</span>
                <span className="text-xs font-bold text-white truncate max-w-[85px]">
                  {entries[2].player.name}
                </span>
                <span className="font-mono text-xs font-black text-zinc-300 mt-1">
                  {scoringCriteria === 'matches'
                    ? `${entries[2].matchesWon} vic`
                    : `${entries[2].gamesWon} jgs`}
                </span>
                <span className="text-[9px] text-zinc-500 uppercase font-mono mt-0.5">
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
                      ? 'bg-yellow-400/10 border-yellow-400/40'
                      : index === 1
                      ? 'bg-zinc-900 border-zinc-700'
                      : index === 2
                      ? 'bg-zinc-900/60 border-zinc-800'
                      : 'bg-black/50 border-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 text-center font-mono font-black text-xs ${
                        isFirst
                          ? 'text-yellow-400'
                          : index === 1
                          ? 'text-zinc-300'
                          : index === 2
                          ? 'text-zinc-400'
                          : 'text-zinc-600'
                      }`}
                    >
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{player.name}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase ${
                            player.position === 'reves'
                              ? 'bg-yellow-400/20 text-yellow-300'
                              : player.position === 'derecha'
                              ? 'bg-zinc-800 text-zinc-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {player.position}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-400 flex items-center gap-2 mt-0.5 font-mono">
                        <span>PJ: {matchesPlayed}</span>
                        <span>•</span>
                        <span>PG: {matchesWon}</span>
                        <span>•</span>
                        <span>Juegos: {gamesWon}</span>
                        <span>•</span>
                        <span className={gamesDiff > 0 ? 'text-yellow-400' : gamesDiff < 0 ? 'text-zinc-500' : 'text-zinc-400'}>
                          Dif: {gamesDiff >= 0 ? `+${gamesDiff}` : gamesDiff}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    {scoringCriteria === 'matches' ? (
                      <>
                        <span className="font-mono text-sm font-black text-yellow-400">
                          {matchesWon}
                        </span>
                        <span className="text-[10px] text-zinc-400 ml-1 font-mono">vic</span>
                        <div className="text-[9px] text-zinc-500 font-mono">
                          {gamesWon} jgs
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="font-mono text-sm font-black text-yellow-400">
                          {gamesWon}
                        </span>
                        <span className="text-[10px] text-zinc-400 ml-1 font-mono">jgs</span>
                        <div className="text-[9px] text-zinc-500 font-mono">
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
        <div className="px-6 py-4 border-t border-zinc-800 bg-black flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={generateWhatsAppShare}
            className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white font-bold text-xs transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-yellow-400" /> : <Share2 className="w-4 h-4 text-yellow-400" />}
            <span>{copied ? '¡Copiado para WhatsApp!' : 'Copiar Clasificación WhatsApp'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs transition active:scale-95 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
