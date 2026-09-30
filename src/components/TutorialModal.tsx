import React from 'react';
import { X, Droplets, Shield, GitFork, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border-4 border-slate-700 rounded-lg max-w-xl w-full p-5 shadow-2xl bevel-outset text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-700 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-sky-400" />
            <h2 className="font-pixel text-xs md:text-sm text-sky-300 uppercase">
              Hydro-Architect Field Manual
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

        {/* Content */}
        <div className="space-y-4 font-chakra text-sm leading-relaxed max-h-[70vh] overflow-y-auto pr-1">
          
          <div className="bg-slate-950 p-3 rounded border border-slate-800">
            <h3 className="font-pixel text-[11px] text-yellow-400 mb-1">1. PRIMARY MISSION OBJECTIVE</h3>
            <p className="text-slate-300 text-xs">
              Water originates continuously from the mountain spring at <strong>(0,0)</strong>. Your goal is to accumulate water into a safe <strong>Reservoir</strong> without letting a single drop enter the downstream <strong>Village at (9,9)</strong>!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Solid Dam */}
            <div className="bg-slate-950 p-3 rounded border border-zinc-700">
              <div className="flex items-center gap-2 mb-1.5">
                <Shield className="w-4 h-4 text-yellow-400" />
                <span className="font-pixel text-[10px] text-zinc-200">SOLID DAM</span>
              </div>
              <p className="text-slate-400 text-xs">
                A fortified concrete wall. <strong>Completely blocks all water flow</strong>. Ideal for blocking canyon choke-points to build deep reservoirs.
              </p>
            </div>

            {/* Sluice Gate */}
            <div className="bg-slate-950 p-3 rounded border border-emerald-800">
              <div className="flex items-center gap-2 mb-1.5">
                <GitFork className="w-4 h-4 text-emerald-400" />
                <span className="font-pixel text-[10px] text-emerald-300">SLUICE GATE</span>
              </div>
              <p className="text-slate-400 text-xs">
                A motorized barrier. When <strong>CLOSED</strong> (Red LED), it blocks water like a dam. When <strong>OPEN</strong> (Green LED), water flows through like a canal! Click a placed gate anytime to toggle it.
              </p>
            </div>

          </div>

          <div className="bg-slate-950 p-3 rounded border border-slate-800">
            <h3 className="font-pixel text-[11px] text-sky-400 mb-1">2. CELLULAR WATER MECHANICS</h3>
            <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
              <li>Water flows every <strong>500ms Logic Tick</strong>.</li>
              <li>Water flows <strong>downhill first</strong> from higher terrain elevations to lower riverbeds.</li>
              <li>Water levels range from <strong>1 to 4</strong> depth. When water depth is &gt; 1, it equalizes pressure horizontally.</li>
              <li>Water will naturally pool behind sealed dams, creating sparkling reservoirs.</li>
            </ul>
          </div>

          <div className="bg-emerald-950/60 p-3 rounded border border-emerald-700/80 flex items-start gap-2.5">
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-pixel text-[10px] text-emerald-300">STAGE CLEAR VICTORY</h4>
              <p className="text-emerald-200/90 text-xs mt-0.5">
                Reach the required Reservoir Water units and maintain a stable dry village perimeter for 4 consecutive ticks to claim victory!
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              sound.playUiClick();
              onClose();
            }}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-pixel text-xs rounded bevel-outset uppercase transition cursor-pointer"
          >
            Acknowledge Orders
          </button>
        </div>

      </div>
    </div>
  );
};
