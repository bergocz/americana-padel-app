'use client';

import React, { useState, useMemo } from 'react';
import { AmericanaPlayer, PlayerPosition, ScoringCriteria } from '../types/americana';
import {
  Building2,
  Users,
  Clock,
  Trophy,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ClipboardPaste,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Flame,
  X
} from 'lucide-react';

interface NewAmericanaWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTournament: (config: {
    courtsCount: number;
    players: AmericanaPlayer[];
    durationMinutes: number;
    scoringCriteria: ScoringCriteria;
  }) => void;
  hasActiveTournament?: boolean;
}

export const NewAmericanaWizard: React.FC<NewAmericanaWizardProps> = ({
  isOpen,
  onClose,
  onStartTournament,
  hasActiveTournament = false,
}) => {
  // Step: 1 = Pistas, 2 = Jugadores & Posiciones, 3 = Duración & Criterio
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Configuration state
  const [selectedCourtsCount, setSelectedCourtsCount] = useState<number>(4);
  const [players, setPlayers] = useState<AmericanaPlayer[]>([]);
  const [newPlayerName, setNewPlayerName] = useState<string>('');
  const [newPlayerPosition, setNewPlayerPosition] = useState<PlayerPosition>('reves');
  const [batchText, setBatchText] = useState<string>('');
  const [showBatchModal, setShowBatchModal] = useState<boolean>(false);
  const [durationMinutes, setDurationMinutes] = useState<number>(12);
  const [scoringCriteria, setScoringCriteria] = useState<ScoringCriteria>('matches');

  // When court count changes, adjust recommended players
  const handleSelectCourts = (count: number) => {
    setSelectedCourtsCount(count);
  };

  const neededPlayers = selectedCourtsCount * 4;
  const neededPairs = selectedCourtsCount * 2; // needed on left and needed on right

  // Balance calculation
  const activePlayers = useMemo(() => players.filter(p => p.active), [players]);
  const leftCount = useMemo(() => activePlayers.filter(p => p.position === 'reves').length, [activePlayers]);
  const rightCount = useMemo(() => activePlayers.filter(p => p.position === 'derecha').length, [activePlayers]);
  const bothCount = useMemo(() => activePlayers.filter(p => p.position === 'indiferente').length, [activePlayers]);

  // Balance validation message
  const balanceAnalysis = useMemo(() => {
    const total = activePlayers.length;
    const diffNeeded = total - neededPlayers;

    // Check balance between left and right taking into account polivalents
    const minLeft = leftCount;
    const maxLeft = leftCount + bothCount;
    const minRight = rightCount;
    const maxRight = rightCount + bothCount;

    let balanceStatus: 'perfect' | 'warning' | 'error' = 'perfect';
    let balanceMessage = '';

    if (total < neededPlayers) {
      balanceStatus = 'error';
      balanceMessage = `Faltan ${neededPlayers - total} jugadores para completar las ${selectedCourtsCount} pistas (${total}/${neededPlayers}).`;
    } else if (leftCount > neededPairs && bothCount === 0) {
      balanceStatus = 'warning';
      balanceMessage = `Tienes ${leftCount} jugadores en Izquierda (Revés) y solo necesitas ${neededPairs}. Se recomienda cambiar a alguno a la Derecha.`;
    } else if (rightCount > neededPairs && bothCount === 0) {
      balanceStatus = 'warning';
      balanceMessage = `Tienes ${rightCount} jugadores en Derecha y solo necesitas ${neededPairs}. Se recomienda cambiar a alguno a la Izquierda (Revés).`;
    } else if (leftCount > rightCount + bothCount + 1) {
      balanceStatus = 'warning';
      balanceMessage = `Hay más jugadores en la Izquierda (${leftCount}) que en la Derecha (${rightCount}). Pasa a alguien a la Derecha para un balance perfecto.`;
    } else if (rightCount > leftCount + bothCount + 1) {
      balanceStatus = 'warning';
      balanceMessage = `Hay más jugadores en la Derecha (${rightCount}) que en la Izquierda (${leftCount}). Pasa a alguien a la Izquierda para un balance perfecto.`;
    } else {
      balanceStatus = 'perfect';
      balanceMessage = `¡Balance perfecto! Tienes suficientes jugadores para cubrir las posiciones de izquierda y derecha.`;
    }

    return { total, balanceStatus, balanceMessage };
  }, [activePlayers, leftCount, rightCount, bothCount, neededPlayers, neededPairs, selectedCourtsCount]);

  // Preset loader
  const loadPresetPlayers = (count: number) => {
    const defaultNames = [
      'Ale Galán', 'Juan Lebrón', 'Arturo Coello', 'Agustín Tapia',
      'Fede Chingotto', 'Paquito Navarro', 'Martín Di Nenno', 'Franco Stupaczuk',
      'Mike Yanguas', 'Javi Garrido', 'Coki Nieto', 'Jon Sanz',
      'Momo González', 'Álex Ruiz', 'Sanyo Gutiérrez', 'Fernando Belasteguín',
      'Pablo Cardona', 'Leo Augsburger', 'Tino Libaak', 'Edu Alonso',
      'Lucas Bergamini', 'Jairo Bautista', 'Chipi Muñoz', 'Gonzalo Rubio'
    ];

    const generated: AmericanaPlayer[] = [];
    for (let i = 0; i < count; i++) {
      generated.push({
        id: `wiz-p-${Date.now()}-${i}`,
        name: defaultNames[i] || `Jugador ${i + 1}`,
        position: i % 2 === 0 ? 'reves' : 'derecha',
        pointsWon: 0,
        matchesPlayed: 0,
        active: true,
        restCount: 0,
      });
    }
    setPlayers(generated);
  };

  // Add individual player
  const handleAddPlayer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newPlayerName.trim()) return;

    const newP: AmericanaPlayer = {
      id: `wiz-p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: newPlayerName.trim(),
      position: newPlayerPosition,
      pointsWon: 0,
      matchesPlayed: 0,
      active: true,
      restCount: 0,
    };

    setPlayers([...players, newP]);
    setNewPlayerName('');
  };

  // Change player position
  const handleChangePosition = (id: string, newPos: PlayerPosition) => {
    setPlayers(players.map(p => (p.id === id ? { ...p, position: newPos } : p)));
  };

  // Delete player
  const handleDeletePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  // Batch import parser
  const handleImportBatch = () => {
    const lines = batchText
      .split(/[\n,;]+/)
      .map(l => l.trim())
      .filter(Boolean);

    if (lines.length === 0) return;

    const parsed: AmericanaPlayer[] = lines.map((rawLine, idx) => {
      let pos: PlayerPosition = 'indiferente';
      let clean = rawLine.replace(/^[0-9]+[.\-)]\s*/, '').trim();

      const lower = clean.toLowerCase();
      if (lower.includes('(izq)') || lower.includes('(rev)') || lower.includes('izq') || lower.includes('reves') || lower.includes('revés')) {
        pos = 'reves';
        clean = clean.replace(/\(izq\)/gi, '').replace(/\(rev\)/gi, '').replace(/izq/gi, '').replace(/reves/gi, '').replace(/revés/gi, '').trim();
      } else if (lower.includes('(der)') || lower.includes('derecha') || lower.includes('der')) {
        pos = 'derecha';
        clean = clean.replace(/\(der\)/gi, '').replace(/derecha/gi, '').replace(/der/gi, '').trim();
      } else if (lower.includes('(amb)') || lower.includes('ambos') || lower.includes('polivalente')) {
        pos = 'indiferente';
        clean = clean.replace(/\(amb\)/gi, '').replace(/ambos/gi, '').replace(/polivalente/gi, '').trim();
      }

      return {
        id: `imp-${Date.now()}-${idx}`,
        name: clean || `Jugador ${idx + 1}`,
        position: pos,
        pointsWon: 0,
        matchesPlayed: 0,
        active: true,
        restCount: 0,
      };
    });

    setPlayers([...players, ...parsed]);
    setBatchText('');
    setShowBatchModal(false);
  };

  // Final start tournament
  const handleFinishWizard = () => {
    if (activePlayers.length < 4) {
      alert('Se necesitan al menos 4 jugadores para iniciar una americana.');
      return;
    }

    onStartTournament({
      courtsCount: selectedCourtsCount,
      players: activePlayers,
      durationMinutes,
      scoringCriteria,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative max-w-3xl w-full max-h-[94vh] flex flex-col bg-white border border-slate-300 rounded-3xl shadow-2xl overflow-hidden">
        {/* Wizard Header with Steps */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                🎾
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Empezar Nueva Americana de Pádel
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Paso {currentStep} de 3 —{' '}
              {currentStep === 1 && 'Elige cuántas pistas se van a jugar'}
              {currentStep === 2 && 'Configura los jugadores y el balance de Izquierda / Derecha'}
              {currentStep === 3 && 'Tiempo de partido y criterio de clasificación'}
            </p>
          </div>

          {/* Stepper pills */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                currentStep === 1
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-200/80 text-slate-600 hover:bg-slate-200'
              }`}
            >
              1. Pistas
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                currentStep === 2
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-200/80 text-slate-600 hover:bg-slate-200'
              }`}
            >
              2. Jugadores
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                currentStep === 3
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-200/80 text-slate-600 hover:bg-slate-200'
              }`}
            >
              3. Duración
            </button>

            {hasActiveTournament && (
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center cursor-pointer ml-1"
                title="Volver a la americana actual"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Wizard Step Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* ========================================================== */}
          {/* STEP 1: ELEGIR CUÁNTAS PISTAS SON                          */}
          {/* ========================================================== */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="text-center max-w-md mx-auto space-y-1">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  ¿Cuántas pistas se van a jugar en el club?
                </h3>
                <p className="text-xs text-slate-500">
                  Selecciona el número de pistas disponibles para la americana. El sistema calculará el número exacto de parejas.
                </p>
              </div>

              {/* Court Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-w-2xl mx-auto">
                {[
                  { count: 2, players: 8, label: '2 Pistas', desc: '8 jugadores • 4 parejas' },
                  { count: 3, players: 12, label: '3 Pistas', desc: '12 jugadores • 6 parejas' },
                  { count: 4, players: 16, label: '4 Pistas', desc: '16 jugadores • 8 parejas (Recomendado)' },
                  { count: 5, players: 20, label: '5 Pistas', desc: '20 jugadores • 10 parejas' },
                  { count: 6, players: 24, label: '6 Pistas', desc: '24 jugadores • 12 parejas (Club completo)' },
                ].map(opt => {
                  const isSelected = selectedCourtsCount === opt.count;
                  return (
                    <button
                      key={opt.count}
                      type="button"
                      onClick={() => handleSelectCourts(opt.count)}
                      className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/90 border-2 border-blue-600 shadow-md shadow-blue-500/15 ring-2 ring-blue-300'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${
                              isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            <Building2 className="w-5 h-5" />
                          </div>
                          <span className="font-black text-sm sm:text-base text-slate-900">
                            {opt.label}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                            ✓
                          </div>
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-blue-700 font-mono">
                          {opt.players} Jugadores necesarios
                        </div>
                        <div className="text-[11px] text-slate-500">{opt.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Informative helper bar */}
              <div className="max-w-2xl mx-auto p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center justify-between text-xs text-blue-900">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    Has seleccionado <strong>{selectedCourtsCount} pistas</strong>. Necesitarás{' '}
                    <strong>{selectedCourtsCount * 4} jugadores</strong> en pista. Si sobran, habrá rotación justa de descanso.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* STEP 2: JUGADORES, POSICIONES E IMPORTAR LISTA             */}
          {/* ========================================================== */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* TOP LIVE COUNTER BAR (Requested explicitly by user) */}
              <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl border-2 border-slate-300 shadow-md space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
                      Recuento en Vivo de Jugadores
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-600">
                    Pistas seleccionadas: <strong>{selectedCourtsCount}</strong> (necesitas {neededPairs} de cada lado)
                  </span>
                </div>

                {/* Counter boxes */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* Total */}
                  <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Activos</span>
                    <span className="text-lg font-black text-slate-900 font-mono">
                      {activePlayers.length}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {activePlayers.length >= neededPlayers ? 'Cupo listo' : `Faltan ${neededPlayers - activePlayers.length}`}
                    </span>
                  </div>

                  {/* Left / Revés */}
                  <div
                    className={`p-2.5 rounded-xl border text-center transition ${
                      leftCount > neededPairs
                        ? 'bg-amber-50 border-amber-300'
                        : leftCount === neededPairs
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-blue-50/60 border-blue-200'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-black text-blue-800 block">
                      🔵 Izquierda (Revés)
                    </span>
                    <span className="text-lg font-black text-blue-700 font-mono">{leftCount}</span>
                    <span className="text-[10px] text-blue-600 block font-mono">
                      {leftCount === neededPairs
                        ? 'Exacto (8/8)'
                        : leftCount > neededPairs
                        ? `Sobran ${leftCount - neededPairs}`
                        : `Faltan ${neededPairs - leftCount}`}
                    </span>
                  </div>

                  {/* Right / Derecha */}
                  <div
                    className={`p-2.5 rounded-xl border text-center transition ${
                      rightCount > neededPairs
                        ? 'bg-amber-50 border-amber-300'
                        : rightCount === neededPairs
                        ? 'bg-slate-100 border-slate-400'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-black text-slate-800 block">
                      🟢 Derecha
                    </span>
                    <span className="text-lg font-black text-slate-800 font-mono">{rightCount}</span>
                    <span className="text-[10px] text-slate-600 block font-mono">
                      {rightCount === neededPairs
                        ? 'Exacto (8/8)'
                        : rightCount > neededPairs
                        ? `Sobran ${rightCount - neededPairs}`
                        : `Faltan ${neededPairs - rightCount}`}
                    </span>
                  </div>

                  {/* Both / Polivalentes */}
                  <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-center">
                    <span className="text-[10px] uppercase font-black text-amber-800 block">
                      🟡 Ambos Lados
                    </span>
                    <span className="text-lg font-black text-amber-700 font-mono">{bothCount}</span>
                    <span className="text-[10px] text-amber-600 block font-mono">Polivalentes</span>
                  </div>
                </div>

                {/* Live balance alert message */}
                <div
                  className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                    balanceAnalysis.balanceStatus === 'perfect'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : balanceAnalysis.balanceStatus === 'warning'
                      ? 'bg-amber-50 border border-amber-300 text-amber-900 font-medium'
                      : 'bg-rose-50 border border-rose-200 text-rose-800'
                  }`}
                >
                  {balanceAnalysis.balanceStatus === 'perfect' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                  <span>{balanceAnalysis.balanceMessage}</span>
                </div>
              </div>

              {/* Actions row: Quick Presets & Import List Button */}
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setShowBatchModal(true)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                  >
                    <ClipboardPaste className="w-4 h-4" />
                    <span>📋 Copiar e Importar Lista</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => loadPresetPlayers(neededPlayers)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Cargar {neededPlayers} Pro</span>
                  </button>
                </div>

                {/* Quick presets by count */}
                <div className="flex items-center gap-1 flex-wrap text-xs">
                  <span className="text-slate-400 font-mono mr-1">Rellenar:</span>
                  {[8, 12, 16, 20, 24].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => loadPresetPlayers(n)}
                      className={`px-2 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                        n === neededPlayers
                          ? 'bg-blue-100 border-blue-300 text-blue-800'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Single Player Input */}
              <form
                onSubmit={handleAddPlayer}
                className="flex flex-col sm:flex-row items-stretch gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-300"
              >
                <input
                  type="text"
                  placeholder="Nombre del nuevo jugador..."
                  value={newPlayerName}
                  onChange={e => setNewPlayerName(e.target.value)}
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium"
                />

                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-300">
                  <button
                    type="button"
                    onClick={() => setNewPlayerPosition('reves')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                      newPlayerPosition === 'reves'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Izquierda
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPlayerPosition('derecha')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                      newPlayerPosition === 'derecha'
                        ? 'bg-slate-700 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Derecha
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPlayerPosition('indiferente')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                      newPlayerPosition === 'indiferente'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Ambos
                  </button>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl transition flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Añadir</span>
                </button>
              </form>

              {/* Player List with 1-Click Position Switcher */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                  <span>Lista de Jugadores Registrados ({players.length})</span>
                  <span>Pulsa para cambiar de lado al instante:</span>
                </div>

                {players.length === 0 ? (
                  <div className="py-10 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <div className="text-xs font-black text-slate-700">Pestaña de jugadores vacía</div>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                      Añade los nombres de los jugadores en el formulario superior o usa <strong>«📋 Copiar e Importar Lista»</strong> para pegar los nombres directamente desde WhatsApp.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto p-1">
                    {players.map((p, idx) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition"
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <span className="text-[11px] font-mono text-slate-400 w-5 shrink-0">
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-xs text-slate-900 truncate">
                            {p.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleChangePosition(p.id, 'reves')}
                            title="Juega en la Izquierda (Revés)"
                            className={`px-2 py-1 rounded text-[10px] font-bold transition cursor-pointer ${
                              p.position === 'reves'
                                ? 'bg-blue-600 text-white font-black shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Izq
                          </button>

                          <button
                            type="button"
                            onClick={() => handleChangePosition(p.id, 'derecha')}
                            title="Juega en la Derecha"
                            className={`px-2 py-1 rounded text-[10px] font-bold transition cursor-pointer ${
                              p.position === 'derecha'
                                ? 'bg-slate-800 text-white font-black shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Der
                          </button>

                          <button
                            type="button"
                            onClick={() => handleChangePosition(p.id, 'indiferente')}
                            title="Juega en Ambos Lados (Polivalente)"
                            className={`px-2 py-1 rounded text-[10px] font-bold transition cursor-pointer ${
                              p.position === 'indiferente'
                                ? 'bg-amber-500 text-white font-black shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Ambos
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeletePlayer(p.id)}
                            className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 ml-1 transition cursor-pointer"
                            title="Eliminar jugador"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* STEP 3: DURACIÓN DEL PARTIDO Y CRITERIO DE VICTORIA        */}
          {/* ========================================================== */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="text-center max-w-md mx-auto space-y-1">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Duración y Sistema de Puntuación
                </h3>
                <p className="text-xs text-slate-500">
                  Configura los minutos por turno y el criterio para decidir el ganador de la americana.
                </p>
              </div>

              {/* Match Duration Selector */}
              <div className="bg-slate-50 border border-slate-300 p-4 sm:p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
                      Duración de cada Partido
                    </span>
                  </div>
                  <span className="font-mono font-black text-base text-blue-700 bg-blue-100 px-3 py-0.5 rounded-lg">
                    {durationMinutes} min
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[8, 10, 12, 15, 20, 25].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setDurationMinutes(m)}
                      className={`py-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        durationMinutes === m
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md font-black ring-2 ring-blue-300'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {m} min
                    </button>
                  ))}
                </div>

                <p className="text-[11px] text-slate-500">
                  🔔 Al finalizar el tiempo sonará la <strong>alarma del móvil con volumen fuerte</strong> para avisar a todos los jugadores del cambio de pista.
                </p>
              </div>

              {/* Scoring Criteria Selector */}
              <div className="bg-slate-50 border border-slate-300 p-4 sm:p-5 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-blue-600" />
                  <span className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
                    Criterio de Clasificación y Victoria
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: Matches won */}
                  <button
                    type="button"
                    onClick={() => setScoringCriteria('matches')}
                    className={`p-4 rounded-2xl border text-left transition flex items-start justify-between gap-3 cursor-pointer ${
                      scoringCriteria === 'matches'
                        ? 'bg-blue-50/90 border-2 border-blue-600 shadow-sm ring-2 ring-blue-200'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-black shrink-0 ${
                          scoringCriteria === 'matches'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Trophy className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-black text-slate-900">Más Partidos Ganados</span>
                          <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded font-mono">
                            Desempate Juegos
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          Gana quien consiga más victorias. Si hay empate, se desempata por los juegos conseguidos.
                        </p>
                      </div>
                    </div>
                    {scoringCriteria === 'matches' && (
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                        ✓
                      </span>
                    )}
                  </button>

                  {/* Option 2: Total games */}
                  <button
                    type="button"
                    onClick={() => setScoringCriteria('games')}
                    className={`p-4 rounded-2xl border text-left transition flex items-start justify-between gap-3 cursor-pointer ${
                      scoringCriteria === 'games'
                        ? 'bg-blue-50/90 border-2 border-blue-600 shadow-sm ring-2 ring-blue-200'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-black shrink-0 ${
                          scoringCriteria === 'games'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Flame className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-900">Más Juegos Totales</span>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          Gana quien sume más juegos en todas las pistas, sin importar el número de victorias.
                        </p>
                      </div>
                    </div>
                    {scoringCriteria === 'games' && (
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                        ✓
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Tournament Summary Card */}
              <div className="p-4 rounded-2xl bg-white border border-slate-300 shadow-xs space-y-2">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                  Resumen de tu Americana:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-mono">Pistas:</span>
                    <strong className="text-slate-900">{selectedCourtsCount} Pistas en juego</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-mono">Jugadores:</span>
                    <strong className="text-slate-900">{activePlayers.length} Jugadores</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-mono">Por Partido:</span>
                    <strong className="text-slate-900">{durationMinutes} minutos</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-mono">Criterio:</span>
                    <strong className="text-slate-900">
                      {scoringCriteria === 'matches' ? 'Partidos' : 'Juegos'}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Navigation */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((currentStep - 1) as any)}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((currentStep + 1) as any)}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition flex items-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
              >
                <span>Siguiente Paso</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinishWizard}
                className="px-7 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm transition flex items-center gap-2 shadow-xl shadow-blue-600/30 active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 fill-current" />
                <span>¡Comenzar Americana y Sortear Pistas!</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: IMPORTAR LISTA DE JUGADORES */}
      {showBatchModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="max-w-lg w-full bg-white border border-slate-300 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ClipboardPaste className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-slate-900">
                  Importar Lista de Jugadores
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBatchModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Copia y pega la lista de nombres desde WhatsApp o notas. Puedes indicar la posición con <strong>(izq)</strong>, <strong>(der)</strong> o <strong>(ambos)</strong>.
            </p>

            <textarea
              rows={8}
              value={batchText}
              onChange={e => setBatchText(e.target.value)}
              placeholder="Ejemplo:&#10;1. Carlos (izq)&#10;2. Juan (der)&#10;3. Pedro (izq)&#10;4. Antonio (der)&#10;5. Miguel (ambos)..."
              className="w-full p-3 rounded-xl border border-slate-300 bg-slate-50 text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
            />

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowBatchModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleImportBatch}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                <span>Importar Jugadores</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
