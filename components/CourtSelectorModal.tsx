'use client';

import React from 'react';
import { ClubCourt } from '../types/americana';
import { X, Check, Building2 } from 'lucide-react';

interface CourtSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  courts: ClubCourt[];
  onUpdateCourts: (courts: ClubCourt[]) => void;
}

export const CourtSelectorModal: React.FC<CourtSelectorModalProps> = ({
  isOpen,
  onClose,
  courts,
  onUpdateCourts,
}) => {
  if (!isOpen) return null;

  const activeCount = courts.filter(c => c.active).length;
  const playersRequired = activeCount * 4;

  const handleToggleCourt = (id: number) => {
    onUpdateCourts(
      courts.map(c => (c.id === id ? { ...c, active: !c.active } : c))
    );
  };

  const handleUpdateName = (id: number, newName: string) => {
    onUpdateCourts(
      courts.map(c => (c.id === id ? { ...c, name: newName } : c))
    );
  };

  const handleSelectCount = (count: number) => {
    onUpdateCourts(
      courts.map((c, idx) => ({ ...c, active: idx < count }))
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative max-w-xl w-full bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Pistas del Club para la Americana
              </h2>
              <p className="text-xs text-slate-500">
                Selecciona qué pistas de las 6 disponibles vais a utilizar hoy
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

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Quick Select Buttons */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">
              Selección Rápida:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[2, 3, 4, 5, 6].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleSelectCount(num)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs ${
                    activeCount === num
                      ? 'bg-blue-600 text-white font-black shadow-md shadow-blue-500/20 ring-1 ring-blue-300'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  {num} pistas ({num * 4} jug.)
                </button>
              ))}
            </div>
          </div>

          {/* Courts Grid (The 6 club courts) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {courts.map((court) => (
              <div
                key={court.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  court.active
                    ? 'bg-blue-50/50 border-blue-200 shadow-xs'
                    : 'bg-slate-50 border-slate-200/80 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        court.active ? 'bg-blue-600 animate-pulse' : 'bg-slate-400'
                      }`}
                    />
                    <span className="font-mono text-xs font-bold text-slate-600">
                      Pista #{court.id}
                    </span>
                  </div>

                  {/* Toggle switch */}
                  <button
                    type="button"
                    onClick={() => handleToggleCourt(court.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                      court.active
                        ? 'bg-blue-600 text-white font-black shadow-sm'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {court.active && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    <span>{court.active ? 'Activa' : 'Inactiva'}</span>
                  </button>
                </div>

                {/* Editable court name */}
                <input
                  type="text"
                  value={court.name}
                  onChange={(e) => handleUpdateName(court.id, e.target.value)}
                  placeholder={`Nombre de Pista ${court.id}`}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 font-semibold shadow-xs"
                />
              </div>
            ))}
          </div>

          {/* Capacity pill */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Capacidad requerida:</span>
            <span className="font-mono font-black text-blue-700">
              {activeCount} pistas activas = {playersRequired} jugadores por ronda
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition cursor-pointer shadow-md shadow-blue-500/20"
          >
            Guardar y Aplicar
          </button>
        </div>
      </div>
    </div>
  );
};
