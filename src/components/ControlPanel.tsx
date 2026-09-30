import React from 'react';
import { ToolType } from '../types';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Tv, 
  HelpCircle, 
  FastForward, 
  StepForward, 
  Info,
  Layers,
  Maximize,
  Minimize
} from 'lucide-react';
import { sound } from '../utils/audio';

interface ControlPanelProps {
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  isRunning: boolean;
  onTogglePlay: () => void;
  onStepTick: () => void;
  speed: number; // 1, 2, 4
  onChangeSpeed: (spd: number) => void;
  onResetWater: () => void;
  onFullRestart: () => void;
  onOpenTutorial: () => void;
  onOpenHint: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  showScanlines: boolean;
  onToggleScanlines: () => void;
  showGridLines: boolean;
  onToggleGridLines: () => void;
  damsAvailable: number;
  gatesAvailable?: number;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  activeTool,
  onSelectTool,
  isRunning,
  onTogglePlay,
  onStepTick,
  speed,
  onChangeSpeed,
  onResetWater,
  onFullRestart,
  onOpenTutorial,
  onOpenHint,
  isMuted,
  onToggleMute,
  showScanlines,
  onToggleScanlines,
  showGridLines,
  onToggleGridLines,
  damsAvailable,
  isFullscreen,
  onToggleFullscreen
}) => {
  const handleToolClick = (tool: ToolType) => {
    sound.playUiClick();
    onSelectTool(tool);
  };

  return (
    <div className="w-full bg-slate-900 border-t-2 border-slate-700 p-3 flex flex-wrap items-center justify-between gap-3 select-none">
      
      {/* 1. Main Tool Selector */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-pixel text-slate-400 mr-1 hidden sm:inline">TOOLS:</span>

        {/* Build Dam Button */}
        <button
          onClick={() => handleToolClick('DAM')}
          className={`flex items-center gap-2 px-3 py-2 rounded-md font-pixel text-xs transition cursor-pointer ${
            activeTool === 'DAM'
              ? 'bg-zinc-700 text-yellow-300 border-2 border-yellow-400 shadow-md ring-2 ring-yellow-400/40 bevel-inset'
              : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700 border border-zinc-600 bevel-outset'
          }`}
          title="Build Concrete Dam (Blocks all water completely)"
        >
          <div className="w-4 h-4 bg-zinc-500 rounded-xs border border-zinc-300 flex items-center justify-center text-[9px] text-zinc-900 font-bold">
            ■
          </div>
          <span>DAM</span>
          <span className="text-[10px] opacity-75">({damsAvailable})</span>
        </button>

        {/* Demolish / Delete Button */}
        <button
          onClick={() => handleToolClick('DELETE')}
          className={`flex items-center gap-2 px-3 py-2 rounded-md font-pixel text-xs transition cursor-pointer ${
            activeTool === 'DELETE'
              ? 'bg-red-800 text-red-100 border-2 border-red-400 shadow-md ring-2 ring-red-400/40 bevel-inset'
              : 'bg-red-950 text-red-300 hover:bg-red-900 border border-red-700 bevel-outset'
          }`}
          title="Delete / Demolish Dam"
        >
          <span className="text-red-400 text-sm">🗑️</span>
          <span>DEL</span>
        </button>
      </div>

      {/* 2. Simulation & Playback Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Play/Pause */}
        <button
          onClick={() => {
            sound.playUiClick();
            onTogglePlay();
          }}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-pixel text-xs font-bold transition cursor-pointer ${
            isRunning
              ? 'bg-amber-600 hover:bg-amber-500 text-white bevel-outset'
              : 'bg-green-600 hover:bg-green-500 text-white bevel-outset ring-2 ring-green-400/50'
          }`}
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>{isRunning ? 'PAUSE' : 'FLOW'}</span>
        </button>

        {/* Step Tick */}
        <button
          onClick={() => {
            sound.playUiClick();
            onStepTick();
          }}
          className="flex items-center gap-1 px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-md font-pixel text-xs bevel-outset cursor-pointer"
          title="Advance 1 Logic Tick (500ms equivalent)"
        >
          <StepForward className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">STEP</span>
        </button>

        {/* Speed Selector (1x, 2x, 4x) */}
        <div className="flex items-center bg-slate-950 p-0.5 rounded border border-slate-700">
          {[1, 2, 4].map(spd => (
            <button
              key={spd}
              onClick={() => {
                sound.playUiClick();
                onChangeSpeed(spd);
              }}
              className={`px-2 py-1 font-pixel text-[10px] rounded transition cursor-pointer ${
                speed === spd
                  ? 'bg-sky-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>

        {/* Reset Water Flow */}
        <button
          onClick={() => {
            sound.playUiClick();
            onResetWater();
          }}
          className="flex items-center gap-1 px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-600 rounded-md font-pixel text-[10px] bevel-outset cursor-pointer"
          title="Drain Water back to Source (Keeps Dams)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">DRAIN</span>
        </button>

        {/* Full Level Restart */}
        <button
          onClick={() => {
            sound.playUiClick();
            onFullRestart();
          }}
          className="flex items-center gap-1 px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-600 rounded-md font-pixel text-[10px] bevel-outset cursor-pointer"
          title="Reset Level to Initial State"
        >
          <span>🔄</span>
          <span className="hidden lg:inline">RESET</span>
        </button>
      </div>

      {/* 3. Utility & Options (Hint, Tutorial, CRT, Sound) */}
      <div className="flex items-center gap-2">
        {/* Level Hint */}
        <button
          onClick={() => {
            sound.playUiClick();
            onOpenHint();
          }}
          className="p-2 bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-700 rounded-md bevel-outset transition cursor-pointer"
          title="Level Architect Hint"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Game Rules / Tutorial */}
        <button
          onClick={() => {
            sound.playUiClick();
            onOpenTutorial();
          }}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded-md bevel-outset transition cursor-pointer"
          title="Instructions & Water Flow Rules"
        >
          <Info className="w-4 h-4" />
        </button>

        {/* Grid Lines Toggle */}
        <button
          onClick={() => {
            sound.playUiClick();
            onToggleGridLines();
          }}
          className={`p-2 rounded-md border bevel-outset transition cursor-pointer ${
            showGridLines
              ? 'bg-sky-900/60 text-sky-300 border-sky-600'
              : 'bg-slate-800 text-slate-500 border-slate-700'
          }`}
          title="Toggle Isometric Grid Lines"
        >
          <Layers className="w-4 h-4" />
        </button>

        {/* CRT Scanline Toggle */}
        <button
          onClick={() => {
            sound.playUiClick();
            onToggleScanlines();
          }}
          className={`p-2 rounded-md border bevel-outset transition cursor-pointer ${
            showScanlines
              ? 'bg-purple-900/60 text-purple-300 border-purple-600'
              : 'bg-slate-800 text-slate-500 border-slate-700'
          }`}
          title="Toggle 16-Bit CRT Scanlines Effect"
        >
          <Tv className="w-4 h-4" />
        </button>

        {/* Sound Toggle */}
        <button
          onClick={() => {
            sound.playUiClick();
            onToggleMute();
          }}
          className={`p-2 rounded-md border bevel-outset transition cursor-pointer ${
            isMuted
              ? 'bg-red-950/60 text-red-400 border-red-700'
              : 'bg-emerald-950/60 text-emerald-300 border-emerald-700'
          }`}
          title={isMuted ? 'Unmute 16-Bit FM Synthesizer' : 'Mute Sound'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Fullscreen Mode Toggle */}
        {onToggleFullscreen && (
          <button
            onClick={() => {
              sound.playUiClick();
              onToggleFullscreen();
            }}
            className={`p-2 rounded-md border bevel-outset transition cursor-pointer ${
              isFullscreen
                ? 'bg-sky-900/80 text-sky-300 border-sky-500 ring-2 ring-sky-400/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-600'
            }`}
            title={isFullscreen ? 'Exit Fullscreen' : 'Open Fullscreen (Hide browser bars on phone)'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        )}
      </div>

    </div>
  );
};
