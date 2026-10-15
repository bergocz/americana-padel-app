'use client';

import React, { useState } from 'react';
import { AmericanaPlayer, PlayerPosition } from '../types/americana';
import { X, UserPlus, Users, Trash2, CheckCircle2, AlertCircle, UserCheck } from 'lucide-react';

interface PlayerManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: AmericanaPlayer[];
  onUpdatePlayers: (players: AmericanaPlayer[]) => void;
  activeCourtsCount: number;
}

export const PlayerManagerModal: React.FC<PlayerManagerModalProps> = ({
  isOpen,
  onClose,
  players,
  onUpdatePlayers,
  activeCourtsCount,
}) => {
  const [name, setName] = useState('');
  const [position, setPosition] = useState<PlayerPosition>('reves');
  const [quickNamesText, setQuickNamesText] = useState('');
  const [showBatchImport, setShowBatchImport] = useState(false);

  if (!isOpen) return null;

  const neededPlayers = activeCourtsCount * 4;
  const activePlayers = players.filter(p => p.active);
  const revesCount = activePlayers.filter(p => p.position === 'reves').length;
  const derechaCount = activePlayers.filter(p => p.position === 'derecha').length;
  const indiferenteCount = activePlayers.filter(p => p.position === 'indiferente').length;

  const handleAddPlayer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) return;

    const newPlayer: AmericanaPlayer = {
      id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      position,
      pointsWon: 0,
      matchesPlayed: 0,
      active: true,
      restCount: 0,
    };

    onUpdatePlayers([...players, newPlayer]);
    setName('');
  };

  const handleToggleActive = (id: string) => {
    onUpdatePlayers(
      players.map(p => (p.id === id ? { ...p, active: !p.active } : p))
    );
  };

  const handleChangePosition = (id: string, newPos: PlayerPosition) => {
    onUpdatePlayers(
      players.map(p => (p.id === id ? { ...p, position: newPos } : p))
    );
  };

  const handleDeletePlayer = (id: string) => {
    onUpdatePlayers(players.filter(p => p.id !== id));
  };

  const handleLoadPreset = (count: number) => {
    const newPlayers: AmericanaPlayer[] = [];
    for (let i = 0; i < count; i++) {
      const pName = `Jugador ${i + 1}`;
      let pos: PlayerPosition = 'indiferente';
      if (i % 2 === 0) pos = 'reves';
      else pos = 'derecha';

      newPlayers.push({
        id: `preset-${i + 1}-${Date.now()}`,
        name: pName,
        position: pos,
        pointsWon: 0,
        matchesPlayed: 0,
        active: true,
        restCount: 0,
      });
    }

    onUpdatePlayers(newPlayers);
  };

  const handleBatchImport = () => {
    const lines = quickNamesText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    const added: AmericanaPlayer[] = lines.map((line, idx) => {
      let pos: PlayerPosition = 'indiferente';
      let cleanName = line;

      if (line.toLowerCase().includes('(r)') || line.toLowerCase().includes('reves') || line.toLowerCase().includes('revés')) {
        pos = 'reves';
        cleanName = line.replace(/\(r\)/gi, '').replace(/reves/gi, '').replace(/revés/gi, '').trim();
      } else if (line.toLowerCase().includes('(d)') || line.toLowerCase().includes('derecha')) {
        pos = 'derecha';
        cleanName = line.replace(/\(d\)/gi, '').replace(/derecha/gi, '').trim();
      }

      return {
        id: `batch-${Date.now()}-${idx}`,
        name: cleanName || `Jugador ${idx + 1}`,
        position: pos,
        pointsWon: 0,
        matchesPlayed: 0,
        active: true,
        restCount: 0,
      };
    });

    onUpdatePlayers([...players, ...added]);
    setQuickNamesText('');
    setShowBatchImport(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative max-w-2xl w-full max-h-[92vh] flex flex-col bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Gestión de Jugadores de la Americana
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Configura posiciones (Revés / Derecha) y rotación
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

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Quick Balance Status */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-mono text-slate-600 font-semibold">Total Activos:</span>
              <span className="font-mono font-black text-blue-600 text-sm">
                {activePlayers.length}
                <span className="text-slate-400 font-normal"> / {neededPlayers} requeridos</span>
              </span>
            </div>

            <div className="flex items-center gap-2 font-mono">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200 font-bold">
                {revesCount} Revés
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-slate-200 text-slate-800 border border-slate-300 font-bold">
                {derechaCount} Derecha
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200 font-bold">
                {indiferenteCount} Poliv.
              </span>
            </div>

            {activePlayers.length < neededPlayers ? (
              <div className="w-full flex items-center gap-1.5 text-amber-700 text-[11px] font-medium pt-1 border-t border-slate-200">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                <span>
                  Faltan {neededPlayers - activePlayers.length} jugadores para completar las {activeCourtsCount} pistas activas ({neededPlayers} jugadores).
                </span>
              </div>
            ) : (
              <div className="w-full flex items-center gap-1.5 text-emerald-700 text-[11px] font-medium pt-1 border-t border-slate-200">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                <span>
                  Plazas cubiertas para {activeCourtsCount} pistas
                  {activePlayers.length > neededPlayers && ` (+${activePlayers.length - neededPlayers} con rotación de descanso).`}
                </span>
              </div>
            )}
          </div>

          {/* Quick Presets Bar */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold flex items-center justify-between">
              <span>Carga Rápida de Ejemplo:</span>
              <button
                type="button"
                onClick={() => setShowBatchImport(!showBatchImport)}
                className="text-blue-600 hover:underline font-bold cursor-pointer"
              >
                {showBatchImport ? 'Ocultar pegar lista' : '📋 Pegar lista de nombres'}
              </button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleLoadPreset(8)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition border border-slate-200 cursor-pointer shadow-xs"
              >
                8 Jugadores (2 pistas)
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset(12)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition border border-slate-200 cursor-pointer shadow-xs"
              >
                12 Jugadores (3 pistas)
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset(16)}
                className="px-2.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-black shadow-md shadow-blue-500/20 transition cursor-pointer"
              >
                16 Jugadores (4 pistas)
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset(20)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition border border-slate-200 cursor-pointer shadow-xs"
              >
                20 Jugadores (5 pistas)
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset(24)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition border border-slate-200 cursor-pointer shadow-xs"
              >
                24 Jugadores (6 pistas)
              </button>
              {players.length > 0 && (
                <button
                  type="button"
                  onClick={() => onUpdatePlayers([])}
                  className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition ml-auto cursor-pointer border border-red-200 shadow-xs"
                >
                  Vaciar Todo
                </button>
              )}
            </div>
          </div>

          {/* Batch Import Textarea */}
          {showBatchImport && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="text-xs text-slate-600">
                Pega un nombre por línea. Puedes añadir (R) para revés o (D) para derecha al lado del nombre:
              </div>
              <textarea
                value={quickNamesText}
                onChange={(e) => setQuickNamesText(e.target.value)}
                placeholder={"Juan Pérez (R)\nCarlos López (D)\nMarta Ruiz"}
                rows={4}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 font-mono shadow-xs"
              />
              <button
                type="button"
                onClick={handleBatchImport}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition cursor-pointer shadow-md shadow-blue-500/20"
              >
                Importar Lista
              </button>
            </div>
          )}

          {/* Add Single Player Form */}
          <form onSubmit={handleAddPlayer} className="space-y-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">
              Añadir Jugador Individual:
            </span>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre del jugador (ej. Carlos)"
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-xs"
              />

              {/* Position selector */}
              <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl border border-slate-300">
                <button
                  type="button"
                  onClick={() => setPosition('reves')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    position === 'reves'
                      ? 'bg-blue-600 text-white font-black shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Revés
                </button>
                <button
                  type="button"
                  onClick={() => setPosition('derecha')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    position === 'derecha'
                      ? 'bg-slate-700 text-white font-black shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Derecha
                </button>
                <button
                  type="button"
                  onClick={() => setPosition('indiferente')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    position === 'indiferente'
                      ? 'bg-amber-500 text-white font-black shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Ambos
                </button>
              </div>

              <button
                type="submit"
                disabled={!name.trim()}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-black text-xs transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-sm shadow-blue-500/20"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Añadir</span>
              </button>
            </div>
          </form>

          {/* Players List Table */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold flex items-center justify-between">
              <span>Lista de Jugadores Registrados ({players.length}):</span>
              <span className="text-[10px] text-slate-400">Haz clic en la posición para cambiarla</span>
            </div>

            {players.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                No hay jugadores añadidos aún. Carga un preset o añade nombres arriba.
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                {players.map((p, idx) => (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                      p.active
                        ? 'bg-white border-slate-200 shadow-xs'
                        : 'bg-slate-50 border-slate-200/60 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs text-slate-400 w-5">#{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(p.id)}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition cursor-pointer ${
                          p.active
                            ? 'bg-blue-50 text-blue-600 border border-blue-200'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                        title={p.active ? 'Jugador activo' : 'En pausa / No juega esta ronda'}
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                      </button>
                      <span className={`text-xs font-bold ${p.active ? 'text-slate-900' : 'text-slate-400 line-through'}`}>
                        {p.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Position switcher pills */}
                      <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                        <button
                          type="button"
                          onClick={() => handleChangePosition(p.id, 'reves')}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${
                            p.position === 'reves'
                              ? 'bg-blue-600 text-white font-black'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Revés
                        </button>
                        <button
                          type="button"
                          onClick={() => handleChangePosition(p.id, 'derecha')}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${
                            p.position === 'derecha'
                              ? 'bg-slate-700 text-white font-bold'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Derecha
                        </button>
                        <button
                          type="button"
                          onClick={() => handleChangePosition(p.id, 'indiferente')}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${
                            p.position === 'indiferente'
                              ? 'bg-amber-500 text-white font-black'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Ambos
                        </button>
                      </div>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeletePlayer(p.id)}
                        className="w-7 h-7 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition cursor-pointer"
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

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            {activePlayers.length} de {players.length} jugadores listos
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition cursor-pointer shadow-md shadow-blue-500/20"
          >
            Guardar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
