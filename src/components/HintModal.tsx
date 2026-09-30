import React from 'react';
import { X, Lightbulb } from 'lucide-react';
import { sound } from '../utils/audio';
import { LevelConfig } from '../types';

interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: LevelConfig;
}

export const HintModal: React.FC<HintModalProps> = ({ isOpen, onClose, level }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border-4 border-amber-600 rounded-lg max-w-md w-full p-5 shadow-2xl bevel-outset text-slate-200">
        
        <div className="flex items-center justify-between border-b-2 border-amber-600/50 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <h2 className="font-pixel text-xs text-amber-300 uppercase">
              Architect Advice: {level.name}
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playUiClick();
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-slate-950 p-4 rounded border border-amber-500/30 text-amber-100 font-chakra text-sm leading-relaxed mb-4">
          <p className="italic">"{level.hint}"</p>
        </div>

        <div className="flex justify-between items-center text-xs font-pixel text-slate-400">
          <span>Target Reservoir: <span className="text-sky-400">{level.targetReservoirWater} units</span></span>
          <button
            onClick={() => {
              sound.playUiClick();
              onClose();
            }}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-pixel text-[10px] rounded bevel-outset uppercase transition cursor-pointer"
          >
            Got It
          </button>
        </div>

      </div>
    </div>
  );
};
