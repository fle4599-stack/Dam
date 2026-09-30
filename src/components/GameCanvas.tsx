import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Grid } from '../engine/Grid';
import { WaterSystem } from '../engine/WaterSystem';
import { Renderer } from '../engine/Renderer';
import { LevelConfig, ToolType, GameStatus, Tile } from '../types';
import { sound } from '../utils/audio';
import { Shield, GitFork, Droplet, ArrowUpRight, Flame, Trophy, Play, RotateCcw } from 'lucide-react';

interface GameCanvasProps {
  level: LevelConfig;
  activeTool: ToolType;
  isRunning: boolean;
  speed: number;
  showScanlines: boolean;
  showGridLines: boolean;
  onStatusChange: (status: GameStatus) => void;
  onTickUpdate: (tick: number) => void;
  onBuildingCountChange: (dams: number, gates: number) => void;
  onReservoirWaterChange: (water: number) => void;
  onLevelComplete: (levelId: number) => void;
  onNextLevel: () => void;
  hasNextLevel: boolean;
  triggerReset: number;
  triggerFullRestart: number;
  triggerStep: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  level,
  activeTool,
  isRunning,
  speed,
  showScanlines,
  showGridLines,
  onStatusChange,
  onTickUpdate,
  onBuildingCountChange,
  onReservoirWaterChange,
  onLevelComplete,
  onNextLevel,
  hasNextLevel,
  triggerReset,
  triggerFullRestart,
  triggerStep
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const gridRef = useRef<Grid>(new Grid(level.gridSize));
  const waterSystemRef = useRef<WaterSystem>(new WaterSystem(gridRef.current, level));
  const rendererRef = useRef<Renderer | null>(null);

  const [hoveredTileData, setHoveredTileData] = useState<Tile | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>('IDLE');
  const [showGameOverModal, setShowGameOverModal] = useState<boolean>(false);
  const [showVictoryModal, setShowVictoryModal] = useState<boolean>(false);

  const onStatusChangeRef = useRef(onStatusChange);
  const onTickUpdateRef = useRef(onTickUpdate);
  const onBuildingCountChangeRef = useRef(onBuildingCountChange);
  const onReservoirWaterChangeRef = useRef(onReservoirWaterChange);
  const onLevelCompleteRef = useRef(onLevelComplete);

  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
    onTickUpdateRef.current = onTickUpdate;
    onBuildingCountChangeRef.current = onBuildingCountChange;
    onReservoirWaterChangeRef.current = onReservoirWaterChange;
    onLevelCompleteRef.current = onLevelComplete;
  });

  // Update building & water metrics
  const updateMetrics = useCallback(() => {
    const grid = gridRef.current;
    const counts = grid.countBuildings();
    onBuildingCountChangeRef.current?.(counts.dams, counts.gates);
    const resWater = Math.min(100, grid.getReservoirWater());
    onReservoirWaterChangeRef.current?.(resWater);
  }, []);

  // Restart current level helper
  const restartCurrentLevel = useCallback(() => {
    gridRef.current.loadLevel(level);
    waterSystemRef.current.setLevel(level);
    waterSystemRef.current.reset();
    setGameStatus('IDLE');
    setShowGameOverModal(false);
    setShowVictoryModal(false);
    onStatusChangeRef.current?.('IDLE');
    onTickUpdateRef.current?.(0);
    onReservoirWaterChangeRef.current?.(0);
    const counts = gridRef.current.countBuildings();
    onBuildingCountChangeRef.current?.(counts.dams, counts.gates);
  }, [level]);

  // Sync level changes (only when level.id changes!)
  useEffect(() => {
    restartCurrentLevel();
  }, [level.id, restartCurrentLevel]);

  // Handle DRAIN water reset
  useEffect(() => {
    if (triggerReset > 0) {
      waterSystemRef.current.reset();
      setShowGameOverModal(false);
      setGameStatus('IDLE');
      onStatusChangeRef.current?.('IDLE');
      onReservoirWaterChangeRef.current?.(0);
      onTickUpdateRef.current?.(0);
    }
  }, [triggerReset]);

  // Handle Full Level restart
  useEffect(() => {
    if (triggerFullRestart > 0) {
      restartCurrentLevel();
    }
  }, [triggerFullRestart, restartCurrentLevel]);

  // Handle Manual Step Tick
  useEffect(() => {
    if (triggerStep > 0) {
      waterSystemRef.current.tick();
      updateMetrics();
    }
  }, [triggerStep, updateMetrics]);

  // Set up Status Callbacks
  useEffect(() => {
    const ws = waterSystemRef.current;
    ws.onStatusChange = (status) => {
      setGameStatus(status);
      onStatusChangeRef.current?.(status);
      if (status === 'VILLAGE_FLOODED') {
        setShowGameOverModal(true);
      } else if (status === 'VICTORY') {
        setShowVictoryModal(true);
        onLevelCompleteRef.current?.(level.id);
      }
    };
    ws.onTick = (tick) => {
      onTickUpdateRef.current?.(tick);
      updateMetrics();
    };
  }, [level.id, updateMetrics]);

  // Logic Tick Interval Loop
  useEffect(() => {
    if (!isRunning || gameStatus === 'VILLAGE_FLOODED' || gameStatus === 'VICTORY') {
      return;
    }

    const intervalMs = Math.max(50, Math.floor(1000 / speed));
    const intervalId = window.setInterval(() => {
      waterSystemRef.current.tick();
      updateMetrics();
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [isRunning, speed, gameStatus, updateMetrics]);

  // Canvas Setup & Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderer = new Renderer(ctx, gridRef.current);
    rendererRef.current = renderer;

    let animId: number;
    let lastTimestamp = performance.now();

    const renderLoop = (now: number) => {
      const delta = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      // Handle high-DPI scaling
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = Math.floor(rect.width);
      const height = Math.floor(rect.height);

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
      }

      renderer.showScanlines = showScanlines;
      renderer.showGridLines = showGridLines;
      renderer.activeTool = activeTool;
      renderer.setGrid(gridRef.current);

      renderer.updateParticles(Math.min(delta, 0.1));
      renderer.render(width, height);

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [showScanlines, showGridLines, activeTool]);

  // Mouse Interactivity
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !rendererRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const width = rect.width;
    const height = rect.height;
    const originX = width / 2;
    const originY = height / 2 - (gridRef.current.size * gridRef.current.tileHeight) / 3;

    const gridCoord = gridRef.current.screenToGrid(mouseX, mouseY, originX, originY);

    if (gridCoord) {
      rendererRef.current.hoveredTile = gridCoord;
      const tile = gridRef.current.getTile(gridCoord.x, gridCoord.y);
      setHoveredTileData(tile ? { ...tile } : null);
    } else {
      rendererRef.current.hoveredTile = null;
      setHoveredTileData(null);
    }
  };

  const handleMouseLeave = () => {
    if (rendererRef.current) {
      rendererRef.current.hoveredTile = null;
    }
    setHoveredTileData(null);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const width = rect.width;
    const height = rect.height;
    const originX = width / 2;
    const originY = height / 2 - (gridRef.current.size * gridRef.current.tileHeight) / 3;

    const gridCoord = gridRef.current.screenToGrid(mouseX, mouseY, originX, originY);
    if (!gridCoord) return;

    const grid = gridRef.current;
    const tile = grid.getTile(gridCoord.x, gridCoord.y);
    if (!tile) return;

    const isProtected = tile.isSource || (tile.isVillage && (tile.decor === 'church' || tile.decor === 'house_1' || tile.decor === 'house_2'));

    // Interaction Rule 1: Clicking an already placed GATE with GATE/WATER tool toggles its Open/Closed state!
    if (tile.building === 'GATE' && activeTool !== 'DELETE' && activeTool !== 'DAM') {
      grid.toggleGate(gridCoord.x, gridCoord.y);
      sound.playToggleGate(tile.gateOpen);
      updateMetrics();
      setHoveredTileData({ ...tile });
      return;
    }

    // Interaction Rule 2: Execute selected tool
    const counts = grid.countBuildings();

    if (activeTool === 'DAM') {
      if (isProtected) {
        sound.playDenied();
        return;
      }
      if (tile.building === 'DAM') {
        return;
      }
      if (counts.dams >= level.maxDams && tile.building !== 'GATE') {
        sound.playDenied();
        return;
      }

      grid.setBuilding(gridCoord.x, gridCoord.y, 'DAM');
      sound.playPlaceDam();
      updateMetrics();
    } else if (activeTool === 'GATE') {
      if (isProtected) {
        sound.playDenied();
        return;
      }
      if (tile.building === 'GATE') {
        grid.toggleGate(gridCoord.x, gridCoord.y);
        sound.playToggleGate(tile.gateOpen);
        updateMetrics();
        setHoveredTileData({ ...tile });
        return;
      }
      if (counts.gates >= level.maxGates && tile.building !== 'DAM') {
        sound.playDenied();
        return;
      }

      grid.setBuilding(gridCoord.x, gridCoord.y, 'GATE');
      sound.playPlaceDam();
      updateMetrics();
    } else if (activeTool === 'DELETE') {
      if (tile.building !== 'NONE') {
        grid.removeBuilding(gridCoord.x, gridCoord.y);
        sound.playDemolish();
        updateMetrics();
      }
    } else if (activeTool === 'WATER') {
      grid.addWater(gridCoord.x, gridCoord.y, 1);
      sound.playWaterTick();
      updateMetrics();
    }

    setHoveredTileData({ ...tile });
  };

  return (
    <div ref={containerRef} className="relative w-full h-[62vh] min-h-[460px] bg-slate-950 overflow-hidden select-none">
      
      {/* 16-Bit HTML5 Canvas */}
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleCanvasClick}
        className="w-full h-full cursor-crosshair block"
      />

      {/* CRT Scanline Overlay Effect */}
      {showScanlines && <div className="absolute inset-0 scanlines pointer-events-none z-10 opacity-70" />}

      {/* Retro 16-Bit Corner Branding */}
      <div className="absolute bottom-3 left-3 z-20 pointer-events-none hidden sm:block">
        <div className="bg-slate-900/85 border-2 border-slate-700/80 px-2.5 py-1.5 rounded-md shadow-lg bevel-outset">
          <span className="font-pixel text-[9px] text-sky-400">DAM ARCHITECT</span>
          <span className="font-pixel text-[8px] text-slate-500 ml-2">16-BIT LOGIC</span>
        </div>
      </div>

      {/* Hover Tile Inspector HUD */}
      {hoveredTileData && (
        <div className="absolute top-3 right-3 z-20 bg-slate-900/90 border-2 border-slate-700 p-2.5 rounded-lg shadow-xl bevel-outset text-slate-200 pointer-events-none font-chakra text-xs min-w-[170px]">
          <div className="flex items-center justify-between border-b border-slate-700 pb-1 mb-1.5">
            <span className="font-pixel text-[10px] text-sky-400">
              TILE ({hoveredTileData.x}, {hoveredTileData.y})
            </span>
            <span className="text-[10px] font-pixel text-slate-400">
              {hoveredTileData.type}
            </span>
          </div>

          <div className="space-y-1 text-slate-300 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Elevation:</span>
              <span className="font-bold text-amber-300">Tier {hoveredTileData.elevation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Water Depth:</span>
              <span className="font-bold text-sky-400">{hoveredTileData.waterLevel} / 4</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Structure:</span>
              <span className={`font-bold ${hoveredTileData.building === 'DAM' ? 'text-yellow-400' : hoveredTileData.building === 'GATE' ? (hoveredTileData.gateOpen ? 'text-emerald-400' : 'text-red-400') : 'text-slate-500'}`}>
                {hoveredTileData.building === 'GATE'
                  ? `GATE (${hoveredTileData.gateOpen ? 'OPEN' : 'CLOSED'})`
                  : hoveredTileData.building}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Disaster: Village Flooded Modal */}
      {showGameOverModal && (
        <div className="absolute inset-0 z-30 bg-red-950/85 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border-4 border-red-600 rounded-xl p-6 max-w-sm w-full shadow-2xl text-center bevel-outset">
            <div className="w-14 h-14 bg-red-600/20 border-2 border-red-500 rounded-full flex items-center justify-center mx-auto mb-3 text-red-500 animate-bounce">
              <Flame className="w-8 h-8" />
            </div>

            <h2 className="font-pixel text-sm md:text-base text-red-400 uppercase tracking-wide mb-2">
              Game Over: Village Flooded
            </h2>

            <p className="font-chakra text-xs text-slate-300 mb-5 leading-relaxed">
              Water reached the village perimeter! Reinforce canyon choke-points with concrete dams or redirect spillways with sluice gates.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  sound.playUiClick();
                  setShowGameOverModal(false);
                  restartCurrentLevel();
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-pixel text-xs rounded bevel-outset uppercase transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Mission</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Victory: Stage Cleared Modal */}
      {showVictoryModal && (
        <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border-4 border-emerald-500 rounded-xl p-6 max-w-md w-full shadow-2xl text-center bevel-outset">
            <div className="w-14 h-14 bg-emerald-600/20 border-2 border-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 text-yellow-400 animate-bounce">
              <Trophy className="w-8 h-8" />
            </div>

            <h2 className="font-pixel text-sm md:text-base text-emerald-300 uppercase tracking-wide mb-1">
              Stage Cleared!
            </h2>
            <p className="font-pixel text-[10px] text-yellow-400 mb-3">
              RESERVOIR STABILIZED & VILLAGE PROTECTED
            </p>

            <p className="font-chakra text-xs text-slate-300 mb-5 leading-relaxed">
              Outstanding engineering! You successfully stored <strong>{Math.min(100, gridRef.current.getReservoirWater())}</strong> water units in the mountain reservoir while keeping all downstream settlements completely safe.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  sound.playUiClick();
                  setShowVictoryModal(false);
                }}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-pixel text-[10px] rounded bevel-outset uppercase cursor-pointer"
              >
                Inspect Layout
              </button>

              {hasNextLevel ? (
                <button
                  onClick={() => {
                    sound.playUiClick();
                    setShowVictoryModal(false);
                    onNextLevel();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-pixel text-xs rounded bevel-outset uppercase transition cursor-pointer shadow-lg shadow-emerald-900/50 animate-pulse"
                >
                  <span>Next Stage</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    sound.playUiClick();
                    setShowVictoryModal(false);
                    restartCurrentLevel();
                  }}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-pixel text-xs rounded bevel-outset uppercase cursor-pointer"
                >
                  Play Again
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
