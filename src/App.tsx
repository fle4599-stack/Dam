/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LEVELS } from './data/levels';
import { LevelConfig, ToolType, GameStatus } from './types';
import { StatusBar } from './components/StatusBar';
import { ControlPanel } from './components/ControlPanel';
import { LevelSelector } from './components/LevelSelector';
import { GameCanvas } from './components/GameCanvas';
import { TutorialModal } from './components/TutorialModal';
import { HintModal } from './components/HintModal';
import { sound } from './utils/audio';
import { Maximize, Minimize } from 'lucide-react';

export default function App() {
  const [currentLevel, setCurrentLevel] = useState<LevelConfig>(LEVELS[0]);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [activeTool, setActiveTool] = useState<ToolType>('DAM');
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1);
  const [gameStatus, setGameStatus] = useState<GameStatus>('IDLE');
  const [tickCount, setTickCount] = useState<number>(0);
  const [reservoirWater, setReservoirWater] = useState<number>(0);
  const [damsCount, setDamsCount] = useState<number>(0);
  const [gatesCount, setGatesCount] = useState<number>(0);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Modals & Visual toggles
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showScanlines, setShowScanlines] = useState<boolean>(false);
  const [showGridLines, setShowGridLines] = useState<boolean>(true);

  // Trigger counters for canvas events
  const [triggerReset, setTriggerReset] = useState<number>(0);
  const [triggerFullRestart, setTriggerFullRestart] = useState<number>(0);
  const [triggerStep, setTriggerStep] = useState<number>(0);

  // Fullscreen event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isDocFull = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
      setIsFullscreen(isDocFull);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleToggleFullscreen = () => {
    sound.playUiClick();
    if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
      const root = document.documentElement;
      if (root.requestFullscreen) {
        root.requestFullscreen().catch(() => {});
      } else if ((root as any).webkitRequestFullscreen) {
        (root as any).webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    }
  };

  // Load saved progress
  useEffect(() => {
    try {
      const saved = localStorage.getItem('dam_architect_completed');
      if (saved) {
        setCompletedLevels(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const handleLevelComplete = React.useCallback((lvlId: number) => {
    setCompletedLevels(prev => {
      if (!prev.includes(lvlId)) {
        const updated = [...prev, lvlId];
        try {
          localStorage.setItem('dam_architect_completed', JSON.stringify(updated));
        } catch {}
        return updated;
      }
      return prev;
    });
  }, []);

  const handleSelectLevel = React.useCallback((lvl: LevelConfig) => {
    setCurrentLevel(lvl);
    setIsRunning(true);
    setTickCount(0);
    setReservoirWater(0);
    setGameStatus('IDLE');
  }, []);

  const handleNextLevel = React.useCallback(() => {
    const currentIndex = LEVELS.findIndex(l => l.id === currentLevel.id);
    if (currentIndex >= 0 && currentIndex < LEVELS.length - 1) {
      handleSelectLevel(LEVELS[currentIndex + 1]);
    }
  }, [currentLevel.id, handleSelectLevel]);

  const handleBuildingCountChange = React.useCallback((dams: number, gates: number) => {
    setDamsCount(dams);
    setGatesCount(gates);
  }, []);

  const hasNextLevel = LEVELS.findIndex(l => l.id === currentLevel.id) < LEVELS.length - 1;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans select-none">
      
      {/* 1. Header & Live Metric Bar */}
      <div className="flex flex-col w-full">
        {/* Title Bar */}
        <div className="w-full bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-sky-500 rounded-xs animate-ping" />
            <h1 className="font-pixel text-xs md:text-sm text-sky-400 font-bold tracking-wider">
              DAM ARCHITECT
            </h1>
            <span className="text-[10px] font-pixel text-slate-400 hidden sm:inline">
              :: 16-BIT HYDRAULIC LOGIC
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Fullscreen Button */}
            <button
              onClick={handleToggleFullscreen}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-sky-950 hover:bg-sky-900 active:bg-sky-800 border border-sky-600 rounded text-sky-300 font-pixel text-[10px] cursor-pointer bevel-outset active:scale-95 transition"
              title={isFullscreen ? "Exit Fullscreen" : "Open Fullscreen (Hides browser bars on phone)"}
            >
              {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
              <span className="hidden xs:inline">{isFullscreen ? 'EXIT' : 'FULLSCREEN'}</span>
            </button>

            <div className="text-right">
              <span className="font-pixel text-[9px] text-amber-400 block sm:inline">
                {currentLevel.name}
              </span>
              <span className="text-[11px] text-slate-400 font-chakra ml-2 hidden md:inline">
                "{currentLevel.subtitle}"
              </span>
            </div>
          </div>
        </div>

        {/* Level Navigation Bar (Top, used infrequently) */}
        <LevelSelector
          levels={LEVELS}
          currentLevelId={currentLevel.id}
          onSelectLevel={handleSelectLevel}
          completedLevels={completedLevels}
        />

        {/* Real-time Status Indicator & Reservoir Goal (Directly above game canvas!) */}
        <StatusBar
          status={gameStatus}
          reservoirWater={reservoirWater}
          targetWater={currentLevel.targetReservoirWater}
          tickCount={tickCount}
          currentLevel={currentLevel}
          damsCount={damsCount}
          gatesCount={gatesCount}
          onRestart={() => setTriggerFullRestart(prev => prev + 1)}
          onNextLevel={handleNextLevel}
          hasNextLevel={hasNextLevel}
        />
      </div>

      {/* 2. Main Isometric Game Stage (Fixed 10x10 Grid View) */}
      <div className="flex-1 flex items-center justify-center p-0 relative overflow-hidden bg-slate-950 min-h-0">
        <GameCanvas
          level={currentLevel}
          activeTool={activeTool}
          isRunning={isRunning}
          speed={speed}
          showScanlines={showScanlines}
          showGridLines={showGridLines}
          onStatusChange={setGameStatus}
          onTickUpdate={setTickCount}
          onBuildingCountChange={handleBuildingCountChange}
          onReservoirWaterChange={setReservoirWater}
          onLevelComplete={handleLevelComplete}
          onNextLevel={handleNextLevel}
          hasNextLevel={hasNextLevel}
          triggerReset={triggerReset}
          triggerFullRestart={triggerFullRestart}
          triggerStep={triggerStep}
        />
      </div>

      {/* 3. Bottom Control & Tool Selector Dock */}
      <ControlPanel
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        isRunning={isRunning}
        onTogglePlay={() => setIsRunning(prev => !prev)}
        onStepTick={() => setTriggerStep(prev => prev + 1)}
        speed={speed}
        onChangeSpeed={setSpeed}
        onResetWater={() => setTriggerReset(prev => prev + 1)}
        onFullRestart={() => setTriggerFullRestart(prev => prev + 1)}
        onOpenTutorial={() => setShowTutorial(true)}
        onOpenHint={() => setShowHint(true)}
        isMuted={isMuted}
        onToggleMute={() => {
          const nextMuted = !isMuted;
          setIsMuted(nextMuted);
          sound.setMuted(nextMuted);
        }}
        showScanlines={showScanlines}
        onToggleScanlines={() => setShowScanlines(prev => !prev)}
        showGridLines={showGridLines}
        onToggleGridLines={() => setShowGridLines(prev => !prev)}
        damsAvailable={Math.max(0, currentLevel.maxDams - damsCount)}
        gatesAvailable={Math.max(0, currentLevel.maxGates - gatesCount)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {/* 4. Modals */}
      <TutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />

      <HintModal
        isOpen={showHint}
        onClose={() => setShowHint(false)}
        level={currentLevel}
      />

    </main>
  );
}
