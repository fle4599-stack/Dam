import React from 'react';
import { GameStatus, LevelConfig } from '../types';
import { AlertTriangle, CheckCircle2, Droplets, Flame, Waves, ShieldCheck } from 'lucide-react';

interface StatusBarProps {
  status: GameStatus;
  reservoirWater: number;
  targetWater: number;
  tickCount: number;
  currentLevel: LevelConfig;
  damsCount: number;
  gatesCount: number;
  onRestart: () => void;
  onNextLevel?: () => void;
  hasNextLevel: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  status,
  reservoirWater,
  targetWater,
  tickCount,
  currentLevel,
  damsCount,
  gatesCount,
  onRestart,
  onNextLevel,
  hasNextLevel
}) => {
  const displayWater = Math.min(100, reservoirWater);
  const percent = Math.min(100, Math.round((displayWater / targetWater) * 100));

  const getStatusBadge = () => {
    switch (status) {
      case 'VILLAGE_FLOODED':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-950/80 border-2 border-red-500 rounded-md text-red-300 animate-pulse">
            <Flame className="w-5 h-5 text-red-500" />
            <span className="font-pixel text-[10px] md:text-xs text-red-400 font-bold uppercase tracking-wider">
              Game Over: Village Flooded
            </span>
          </div>
        );
      case 'WARNING_LEAK':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-950/80 border-2 border-amber-500 rounded-md text-amber-300 animate-bounce">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span className="font-pixel text-[10px] md:text-xs text-amber-300 font-bold uppercase tracking-wider">
              Warning: Water Leak Detected!
            </span>
          </div>
        );
      case 'VICTORY':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-950/90 border-2 border-emerald-400 rounded-md text-emerald-300 shadow-lg shadow-emerald-900/50">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-pixel text-[10px] md:text-xs text-emerald-300 font-bold uppercase tracking-wider">
              Reservoir Contained! Stage Clear
            </span>
          </div>
        );
      case 'STABLE':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-950/80 border-2 border-blue-400 rounded-md text-blue-300">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <span className="font-pixel text-[10px] md:text-xs text-blue-300 font-bold uppercase tracking-wider">
              Stabilizing Reservoir...
            </span>
          </div>
        );
      case 'FILLING':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-sky-950/80 border-2 border-sky-500 rounded-md text-sky-300">
            <Waves className="w-5 h-5 text-sky-400 animate-spin" />
            <span className="font-pixel text-[10px] md:text-xs text-sky-300 font-bold uppercase tracking-wider">
              Filling Reservoir
            </span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-md text-slate-400">
            <Droplets className="w-4 h-4 text-sky-400" />
            <span className="font-pixel text-[10px] md:text-xs text-slate-300 uppercase tracking-wider">
              Ready - Build Dams & Divert Flow
            </span>
          </div>
        );
    }
  };

  return (
    <header className="w-full bg-slate-900/90 border-b-2 border-slate-700/80 px-3 py-2.5 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Status Banner */}
        <div className="flex items-center gap-3">
          {getStatusBadge()}
          
          {/* Disaster / Victory Quick Action Buttons */}
          {status === 'VILLAGE_FLOODED' && (
            <button
              onClick={onRestart}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-pixel text-[10px] rounded bevel-outset uppercase transition cursor-pointer"
            >
              🔄 Retry
            </button>
          )}

          {status === 'VICTORY' && hasNextLevel && onNextLevel && (
            <button
              onClick={onNextLevel}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-pixel text-[10px] rounded bevel-outset uppercase transition cursor-pointer animate-pulse"
            >
              ⭐ Next Stage
            </button>
          )}
        </div>

        {/* Right: Hydro Metrics & Budgets */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-chakra">
          {/* Reservoir Capacity Bar */}
          <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded border border-slate-800">
            <div className="flex flex-col">
              <div className="flex items-center justify-between text-[11px] font-pixel text-slate-300 gap-3">
                <span className="text-sky-400">RESERVOIR:</span>
                <span>{displayWater} / {targetWater} <span className="text-[9px] text-slate-400">units</span></span>
              </div>
              <div className="w-32 md:w-44 h-2.5 bg-slate-800 rounded-full overflow-hidden mt-1 border border-slate-700">
                <div
                  className={`h-full transition-all duration-300 ${
                    percent >= 100 ? 'bg-emerald-500' : percent > 50 ? 'bg-sky-400' : 'bg-blue-600'
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Dam Counter */}
          <div className="hidden sm:flex items-center gap-3 bg-slate-950/80 px-3 py-1.5 rounded border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="text-zinc-400 font-pixel text-[10px]">DAM:</span>
              <span className="font-pixel text-[11px] text-zinc-100">{damsCount}/{currentLevel.maxDams}</span>
            </div>
            {gatesCount > 0 && (
              <>
                <div className="h-4 w-px bg-slate-700" />
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="text-emerald-400 font-pixel text-[10px]">GATE:</span>
                  <span className="font-pixel text-[11px] text-emerald-300">{gatesCount}/{currentLevel.maxGates}</span>
                </div>
              </>
            )}
          </div>

          {/* Logic Tick Counter */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded border border-slate-800 text-slate-400 font-pixel text-[10px]">
            <span>TICK:</span>
            <span className="text-amber-400">{tickCount}</span>
          </div>
        </div>

      </div>
    </header>
  );
};
