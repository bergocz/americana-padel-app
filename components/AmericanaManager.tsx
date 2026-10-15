'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  AmericanaPlayer,
  ClubCourt,
  AmericanaRound,
  AmericanaMatch,
  ScoringCriteria,
} from '../types/americana';
import {
  DEFAULT_CLUB_COURTS,
  DEFAULT_PRESET_PLAYERS,
  generateAmericanaRound,
} from '../utils/americanaAlgorithm';
import { americanaAudio } from '../utils/americanaAudio';
import { PadelCourtCard } from './PadelCourtCard';
import { AmericanaTimer } from './AmericanaTimer';
import { AlarmModal } from './AlarmModal';
import { PlayerManagerModal } from './PlayerManagerModal';
import { CourtSelectorModal } from './CourtSelectorModal';
import { LeaderboardModal } from './LeaderboardModal';
import { NewAmericanaWizard } from './NewAmericanaWizard';
import {
  Shuffle,
  Users,
  Building2,
  Trophy,
  Share2,
  Check,
  Maximize2,
  Sparkles,
  Volume2,
  RefreshCw,
  Coffee,
  AlertTriangle,
  Flame,
  PlusCircle,
} from 'lucide-react';

const STORAGE_KEY = 'club_padel_americana_state_v1';

export const AmericanaManager: React.FC = () => {
  // State
  const [courts, setCourts] = useState<ClubCourt[]>(DEFAULT_CLUB_COURTS);
  const [players, setPlayers] = useState<AmericanaPlayer[]>(DEFAULT_PRESET_PLAYERS);
  const [rounds, setRounds] = useState<AmericanaRound[]>([]);
  const [currentRoundNumber, setCurrentRoundNumber] = useState(1);
  const [durationMinutes, setDurationMinutes] = useState(12);
  const [scoringCriteria, setScoringCriteria] = useState<ScoringCriteria>('matches');
  const [timeRemaining, setTimeRemaining] = useState(12 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Modals & Wizard
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [isCourtModalOpen, setIsCourtModalOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isAlarmModalOpen, setIsAlarmModalOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Timer interval ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.courts) setCourts(parsed.courts);
        if (parsed.players) setPlayers(parsed.players);
        if (parsed.rounds) setRounds(parsed.rounds);
        if (parsed.currentRoundNumber) setCurrentRoundNumber(parsed.currentRoundNumber);
        if (parsed.durationMinutes) {
          setDurationMinutes(parsed.durationMinutes);
          setTimeRemaining(parsed.durationMinutes * 60);
        }
        if (parsed.scoringCriteria) {
          setScoringCriteria(parsed.scoringCriteria);
        }
      }
    } catch (e) {
      console.warn('Could not load Americana state from localStorage', e);
    }
  }, []);

  // Save to LocalStorage on state change
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          courts,
          players,
          rounds,
          currentRoundNumber,
          durationMinutes,
          scoringCriteria,
        })
      );
    } catch (e) {
      console.warn('Could not save Americana state to localStorage', e);
    }
  }, [courts, players, rounds, currentRoundNumber, durationMinutes, scoringCriteria]);

  // Current active round
  const currentRound = rounds.find(r => r.roundNumber === currentRoundNumber) || rounds[rounds.length - 1];

  // Sound & Timer countdown logic
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Time finished!
            setIsTimerRunning(false);
            if (timerRef.current) clearInterval(timerRef.current);
            setIsAlarmModalOpen(true);
            return 0;
          }

          // Last 5 seconds audio countdown tick
          if (prev <= 5 && prev >= 2) {
            americanaAudio.playCountdownTick(false);
          } else if (prev === 2) {
            americanaAudio.playCountdownTick(true);
          }

          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  // Handle changing duration
  const handleChangeDuration = (minutes: number) => {
    setDurationMinutes(minutes);
    setTimeRemaining(minutes * 60);
    setIsTimerRunning(false);
  };

  // Generate / Roll next round
  const handleGenerateRound = useCallback(() => {
    try {
      americanaAudio.unlockAudio();
      americanaAudio.playWhistle();

      const nextNum = rounds.length === 0 ? 1 : currentRoundNumber + 1;
      const newRound = generateAmericanaRound(players, courts, rounds, nextNum);

      // Increment matchesPlayed and rest counts for players
      const updatedPlayers = players.map(p => {
        const isResting = newRound.restingPlayers.some(rp => rp.id === p.id);
        const isPlaying = newRound.matches.some(
          m =>
            m.teamA.playerReves.id === p.id ||
            m.teamA.playerDerecha.id === p.id ||
            m.teamB.playerReves.id === p.id ||
            m.teamB.playerDerecha.id === p.id
        );

        return {
          ...p,
          matchesPlayed: isPlaying ? p.matchesPlayed + 1 : p.matchesPlayed,
          restCount: isResting ? p.restCount + 1 : p.restCount,
        };
      });

      setPlayers(updatedPlayers);
      setRounds(prev => [...prev, newRound]);
      setCurrentRoundNumber(nextNum);
      setTimeRemaining(durationMinutes * 60);
      setIsTimerRunning(true);
      setIsAlarmModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Error al generar la ronda de la americana.');
    }
  }, [players, courts, rounds, currentRoundNumber, durationMinutes]);

  // Update match score in the current round
  const handleUpdateScore = (matchId: string, scoreA: number, scoreB: number) => {
    setRounds(prev =>
      prev.map(r => {
        if (r.roundNumber !== currentRoundNumber) return r;
        return {
          ...r,
          matches: r.matches.map(m => {
            if (m.id !== matchId) return m;

            // Calculate points delta for players
            const deltaA = scoreA - (m.scoreA || 0);
            const deltaB = scoreB - (m.scoreB || 0);

            // Update player points in real time
            setPlayers(currentPlayers =>
              currentPlayers.map(p => {
                if (p.id === m.teamA.playerReves.id || p.id === m.teamA.playerDerecha.id) {
                  return { ...p, pointsWon: Math.max(0, p.pointsWon + deltaA) };
                }
                if (p.id === m.teamB.playerReves.id || p.id === m.teamB.playerDerecha.id) {
                  return { ...p, pointsWon: Math.max(0, p.pointsWon + deltaB) };
                }
                return p;
              })
            );

            return {
              ...m,
              scoreA,
              scoreB,
            };
          }),
        };
      })
    );
  };

  // Share current round via WhatsApp
  const handleShareRoundWhatsApp = () => {
    if (!currentRound) return;
    let text = `🎾 *AMERICANA DE PÁDEL — RONDA ${currentRound.roundNumber}*\n`;
    text += `⏱️ Duración: ${durationMinutes} min\n\n`;

    currentRound.matches.forEach(m => {
      text += `📍 *${m.courtName}*:\n`;
      text += `🔵 ${m.teamA.playerReves.name} & ${m.teamA.playerDerecha.name}\n`;
      text += `VS\n`;
      text += `🟢 ${m.teamB.playerReves.name} & ${m.teamB.playerDerecha.name}\n\n`;
    });

    if (currentRound.restingPlayers && currentRound.restingPlayers.length > 0) {
      text += `☕ *Descansan esta ronda:* ${currentRound.restingPlayers.map(p => p.name).join(', ')}\n\n`;
    }

    text += `¡A pista y a disfrutar! 🏆`;

    navigator.clipboard.writeText(text).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    }).catch(() => {});
  };

  // Handler to start new tournament from guided wizard
  const handleStartTournamentFromWizard = (config: {
    courtsCount: number;
    players: AmericanaPlayer[];
    durationMinutes: number;
    scoringCriteria: ScoringCriteria;
  }) => {
    // 1. Activate selected courts
    const updatedCourts = DEFAULT_CLUB_COURTS.map((c, i) => ({
      ...c,
      active: i < config.courtsCount,
    }));
    setCourts(updatedCourts);

    // 2. Set players
    setPlayers(config.players);

    // 3. Set match duration & scoring criteria
    setDurationMinutes(config.durationMinutes);
    setTimeRemaining(config.durationMinutes * 60);
    setScoringCriteria(config.scoringCriteria);

    // 4. Generate first round with proper pairings
    const firstRound = generateAmericanaRound(
      config.players,
      updatedCourts,
      [],
      1
    );

    setRounds([firstRound]);
    setCurrentRoundNumber(1);
    setIsTimerRunning(false);
    setIsWizardOpen(false);

    // Audio cue
    americanaAudio.unlockAudio();
    americanaAudio.playWhistle();
  };

  // Fullscreen helper
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const activeCourts = courts.filter(c => c.active);
  const activePlayers = players.filter(p => p.active);

  return (
    <div className="space-y-6">
      {/* Top Controls & Navigation Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xs">
        {/* Left: Americana Identity & Status */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/20">
            <Shuffle className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Americana de Pádel
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-mono text-[10px] font-bold">
                EN VIVO
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span>{activeCourts.length} pistas seleccionadas</span>
              <span>•</span>
              <span>{activePlayers.length} jugadores</span>
              <span>•</span>
              <span className="font-mono text-blue-600 font-bold">Ronda {currentRoundNumber}</span>
            </p>
          </div>
        </div>

        {/* Right: Quick Settings Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsWizardOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs transition flex items-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>Nueva Americana</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCourtModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 hover:text-blue-600 font-bold text-xs transition flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-xs"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Pistas ({activeCourts.length}/6)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPlayerModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 hover:text-blue-600 font-bold text-xs transition flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-xs"
          >
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>Jugadores ({activePlayers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setIsLeaderboardOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold text-xs transition flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-xs"
          >
            <Trophy className="w-3.5 h-3.5 text-blue-600" />
            <span>Ranking ({scoringCriteria === 'matches' ? 'Partidos' : 'Juegos'})</span>
          </button>

          {currentRound && (
            <button
              type="button"
              onClick={handleShareRoundWhatsApp}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-xs transition flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-xs"
              title="Copiar cruces para WhatsApp"
            >
              {shareCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-emerald-600" />}
              <span>{shareCopied ? '¡Copiado!' : 'Compartir Cruces'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-blue-600 transition hidden sm:flex cursor-pointer shadow-xs"
            title="Pantalla Completa"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scoring Criteria Selector Bar */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
              Criterio de Clasificación y Victoria
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono font-bold">
              {scoringCriteria === 'matches' ? 'Partidos Ganados' : 'Más Juegos'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            Elige el sistema de puntuación antes de empezar el partido
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Option 1: Partidos Ganados */}
          <button
            type="button"
            onClick={() => setScoringCriteria('matches')}
            className={`p-3.5 sm:p-4 rounded-2xl border text-left transition flex items-start justify-between gap-3 cursor-pointer ${
              scoringCriteria === 'matches'
                ? 'bg-gradient-to-r from-blue-50/90 via-sky-50/50 to-white border-2 border-blue-600 shadow-sm'
                : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-slate-100/70 text-slate-600'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-black ${
                  scoringCriteria === 'matches'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-xs sm:text-sm font-black ${
                      scoringCriteria === 'matches' ? 'text-blue-700' : 'text-slate-800'
                    }`}
                  >
                    Más Partidos Ganados
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-bold">
                    Desempate por Juegos
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Gana el jugador que haya vencido en más partidos. Si hay un empate en victorias, se desempata por el total de juegos conseguidos.
                </p>
              </div>
            </div>
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                scoringCriteria === 'matches'
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-300 bg-white'
              }`}
            >
              {scoringCriteria === 'matches' && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
          </button>

          {/* Option 2: Más Juegos Totales */}
          <button
            type="button"
            onClick={() => setScoringCriteria('games')}
            className={`p-3.5 sm:p-4 rounded-2xl border text-left transition flex items-start justify-between gap-3 cursor-pointer ${
              scoringCriteria === 'games'
                ? 'bg-gradient-to-r from-blue-50/90 via-sky-50/50 to-white border-2 border-blue-600 shadow-sm'
                : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-slate-100/70 text-slate-600'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-black ${
                  scoringCriteria === 'games'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs sm:text-sm font-black ${
                      scoringCriteria === 'games' ? 'text-blue-700' : 'text-slate-800'
                    }`}
                  >
                    Más Juegos Totales
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Gana quien acumule más juegos sumados en todas las pistas disputadas, sin importar cuántos partidos haya ganado.
                </p>
              </div>
            </div>
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                scoringCriteria === 'games'
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-300 bg-white'
              }`}
            >
              {scoringCriteria === 'games' && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
          </button>
        </div>
      </div>

      {/* Main Timer Display Widget */}
      <AmericanaTimer
        durationMinutes={durationMinutes}
        onChangeDuration={handleChangeDuration}
        isRunning={isTimerRunning}
        timeRemaining={timeRemaining}
        onStart={() => setIsTimerRunning(true)}
        onPause={() => setIsTimerRunning(false)}
        onReset={() => {
          setIsTimerRunning(false);
          setTimeRemaining(durationMinutes * 60);
        }}
        onNextRound={handleGenerateRound}
        onTimerFinished={() => {
          setIsTimerRunning(false);
          setIsAlarmModalOpen(true);
        }}
        roundNumber={currentRoundNumber}
      />

      {/* Resting Players Alert Bar (if any player is resting this round) */}
      {currentRound?.restingPlayers && currentRound.restingPlayers.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-between text-xs text-amber-900 shadow-xs">
          <div className="flex items-center gap-2">
            <Coffee className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong className="font-bold">Descanso en esta ronda:</strong>{' '}
              {currentRound.restingPlayers.map(p => `${p.name} (${p.position})`).join(', ')}
            </span>
          </div>
          <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-md">
            Rotación justa
          </span>
        </div>
      )}

      {/* Main Court Matches Grid */}
      {currentRound && currentRound.matches.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-900">
                Partidos en Pista — Ronda {currentRound.roundNumber}
              </span>
              <span className="text-xs font-mono text-slate-500">
                ({currentRound.matches.length} pistas disputándose)
              </span>
            </div>

            <button
              type="button"
              onClick={handleGenerateRound}
              className="px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 font-bold text-xs transition flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-xs"
            >
              <Shuffle className="w-3.5 h-3.5 text-blue-600" />
              <span>Resortear Ronda {currentRoundNumber}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {currentRound.matches.map((match, idx) => (
              <PadelCourtCard
                key={match.id}
                match={match}
                matchIndex={idx}
                onUpdateScore={handleUpdateScore}
                isTimerRunning={isTimerRunning}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Welcome Hero Screen: "Empezar nueva americana" */
        <div className="max-w-2xl mx-auto my-6 sm:my-10 p-6 sm:p-10 rounded-3xl bg-white border border-slate-300 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-500 text-white flex items-center justify-center mx-auto text-4xl shadow-lg shadow-blue-500/25">
            🎾
          </div>

          <div className="space-y-2">
            <div className="inline-block px-3 py-1 rounded-full bg-blue-100 border border-blue-200 text-blue-800 font-mono text-xs font-bold uppercase tracking-wider">
              Torneo Oficial de Pádel
            </div>
            <h3 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
              Americana <span className="text-blue-600">Pádel</span> Pro
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Configura cuántas pistas son, asigna los nombres y lados (Izquierda / Derecha) con recuento en vivo y comienza tu torneo con alarma acústica.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setIsWizardOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-base shadow-xl shadow-blue-600/30 transition active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Sparkles className="w-5 h-5 fill-current" />
              <span>Empezar Nueva Americana</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-left text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-blue-700 block mb-0.5">1. Elige Pistas</span>
              <p className="text-[11px] text-slate-500">De 2 a 6 pistas con cálculo automático de cupo.</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-blue-700 block mb-0.5">2. Izquierda y Derecha</span>
              <p className="text-[11px] text-slate-500">Recuento en vivo y opción de copiar/importar lista.</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-blue-700 block mb-0.5">3. Tiempo y Criterio</span>
              <p className="text-[11px] text-slate-500">Minutos por partido y alarma sonora en el móvil.</p>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      <PlayerManagerModal
        isOpen={isPlayerModalOpen}
        onClose={() => setIsPlayerModalOpen(false)}
        players={players}
        onUpdatePlayers={setPlayers}
        activeCourtsCount={activeCourts.length}
      />

      <CourtSelectorModal
        isOpen={isCourtModalOpen}
        onClose={() => setIsCourtModalOpen(false)}
        courts={courts}
        onUpdateCourts={setCourts}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        players={players}
        currentRoundNumber={currentRoundNumber}
        rounds={rounds}
        scoringCriteria={scoringCriteria}
        onSelectCriteria={setScoringCriteria}
      />

      <AlarmModal
        isOpen={isAlarmModalOpen}
        roundNumber={currentRoundNumber}
        onStopAlarm={() => setIsAlarmModalOpen(false)}
        onNextRound={handleGenerateRound}
      />

      <NewAmericanaWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onStartTournament={handleStartTournamentFromWizard}
        hasActiveTournament={rounds.length > 0}
      />
    </div>
  );
};
