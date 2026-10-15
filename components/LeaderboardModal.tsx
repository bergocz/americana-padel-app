'use client';

import React, { useEffect, useState } from 'react';
import { AmericanaPlayer, AmericanaRound } from '../types/americana';
import { X, Trophy, Share2, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: AmericanaPlayer[];
  currentRoundNumber: number;
  rounds: AmericanaRound[];
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  players,
  currentRoundNumber,
  rounds,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#facc15', '#ffffff', '#eab308', '#000000']
        });
      } catch {
        // ignore
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Sort players by points won (descending)
  const sortedPlayers = [...players].sort((a, b) => {
    if (b.pointsWon !== a.pointsWon) {
      return b.pointsWon - a.pointsWon;
    }
    return (b.matchesPlayed || 0) - (a.matchesPlayed || 0);
  });

  const generateWhatsAppShare = () => {
    let msg = `🏆 *CLASIFICACIÓN AMERICANA DE PÁDEL* (Ronda ${currentRoundNumber})\n\n`;
    sortedPlayers.slice(0, 10).forEach((p, idx) => {
      const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`;
      msg += `${medal} *${p.name}* — ${p.pointsWon} pts (${p.position.toUpperCase()})\n`;
    });
    msg += `\n🎾 ¡Gran nivel hoy en el club!`;

    navigator.clipboard.writeText(msg).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative max-w-xl w-full bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-black">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Clasificación de la Americana
              </h2>
              <p className="text-xs text-zinc-400">
                Puntos acumulados tras {rounds.length} rondas disputadas
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

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Top 3 Podium (if >= 3 players) */}
          {sortedPlayers.length >= 3 && (
            <div className="grid grid-cols-3 gap-2 pt-2 pb-4 border-b border-zinc-800">
              {/* 2nd place */}
              <div className="flex flex-col items-center justify-end p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center">
                <span className="text-2xl mb-1">🥈</span>
                <span className="text-xs font-bold text-white truncate max-w-[85px]">
                  {sortedPlayers[1].name}
                </span>
                <span className="font-mono text-xs font-black text-zinc-300 mt-1">
                  {sortedPlayers[1].pointsWon} pts
                </span>
                <span className="text-[9px] text-zinc-500 uppercase font-mono mt-0.5">2º Puesto</span>
              </div>

              {/* 1st place */}
              <div className="flex flex-col items-center justify-end p-3.5 rounded-2xl bg-gradient-to-b from-yellow-400/20 to-zinc-950 border-2 border-yellow-400 text-center shadow-lg shadow-yellow-400/15 -translate-y-2">
                <span className="text-3xl mb-1">🥇</span>
                <span className="text-xs font-black text-yellow-400 truncate max-w-[95px]">
                  {sortedPlayers[0].name}
                </span>
                <span className="font-mono text-sm font-black text-yellow-400 mt-1">
                  {sortedPlayers[0].pointsWon} pts
                </span>
                <span className="text-[10px] text-yellow-400/90 font-black uppercase font-mono mt-0.5">Líder</span>
              </div>

              {/* 3rd place */}
              <div className="flex flex-col items-center justify-end p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center">
                <span className="text-2xl mb-1">🥉</span>
                <span className="text-xs font-bold text-white truncate max-w-[85px]">
                  {sortedPlayers[2].name}
                </span>
                <span className="font-mono text-xs font-black text-zinc-300 mt-1">
                  {sortedPlayers[2].pointsWon} pts
                </span>
                <span className="text-[9px] text-zinc-500 uppercase font-mono mt-0.5">3º Puesto</span>
              </div>
            </div>
          )}

          {/* Full Player Ranking List */}
          <div className="space-y-1.5">
            {sortedPlayers.map((player, index) => {
              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition ${
                    index === 0
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
                        index === 0 ? 'text-yellow-400' : index === 1 ? 'text-zinc-300' : index === 2 ? 'text-zinc-400' : 'text-zinc-600'
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
                      <div className="text-[10px] text-zinc-400">
                        {player.matchesPlayed} partidos jugados
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-sm font-black text-yellow-400">
                      {player.pointsWon}
                    </span>
                    <span className="text-[10px] text-zinc-500 ml-1 font-mono">pts</span>
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
