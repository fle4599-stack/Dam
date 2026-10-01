import React from 'react';
import { LevelConfig } from '../types';
import { ChevronRight, Waves, Trophy } from 'lucide-react';
import { sound } from '../utils/audio';

interface LevelSelectorProps {
  levels: LevelConfig[];
  currentLevelId: number;
  onSelectLevel: (level: LevelConfig) => void;
  completedLevels: number[];
}

export const LevelSelector: React.FC<LevelSelectorProps> = ({
  levels,
  currentLevelId,
  onSelectLevel,
  completedLevels
}) => {
  return (
    <div className="w-full bg-slate-950/70 border-b border-slate-800 p-2 overflow-x-auto select-none">
      <div className="max-w-7xl mx-auto flex items-center gap-2">
        <span className="font-pixel text-[10px] text-slate-400 uppercase mr-1 whitespace-nowrap hidden sm:inline">
          MISSION:
        </span>

        <div className="flex items-center gap-2">
          {levels.map((level) => {
            const isActive = level.id === currentLevelId;
            const isCompleted = completedLevels.includes(level.id);

            return (
              <button
                key={level.id}
                onClick={() => {
                  sound.playUiClick();
                  onSelectLevel(level);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded font-pixel text-[10px] transition cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-sky-600 text-white font-bold border border-sky-300 shadow-md ring-1 ring-sky-400'
                    : isCompleted
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700 hover:bg-emerald-900'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {isCompleted ? (
                  <Trophy className="w-3 h-3 text-yellow-400" />
                ) : (
                  <Waves className="w-3 h-3 text-sky-400 opacity-60" />
                )}
                <span>
                  {level.name.toLowerCase().includes('sandbox') ? 'SANDBOX' : `STG ${level.id}`}
                </span>
                {isActive && <ChevronRight className="w-3 h-3 text-sky-200 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
