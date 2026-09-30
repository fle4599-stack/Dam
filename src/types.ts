export type TileType = 'RIVER_BED' | 'BANK' | 'CLIFF' | 'VILLAGE' | 'SOURCE';

export type BuildingType = 'NONE' | 'DAM' | 'GATE';

export interface Tile {
  x: number;
  y: number;
  elevation: number;       // Base terrain height: 0 (riverbed), 1 (low bank), 2 (mid bank), 3 (high cliff)
  waterLevel: number;      // Water depth: 0 to 4
  waterVelocityX?: number; // Flow direction for visual particle streams
  waterVelocityY?: number;
  building: BuildingType;
  gateOpen: boolean;       // If building === 'GATE', true = open, false = closed
  isSource: boolean;       // Emits water
  isVillage: boolean;      // Fail zone - must be kept dry!
  flooded: boolean;        // True if water entered village
  type: TileType;
  decor?: 'tree' | 'rock' | 'house_1' | 'house_2' | 'church' | 'mill' | 'flowers' | null;
  targetWater?: number;    // Goal zone for specific scenarios
}

export type GameStatus = 
  | 'IDLE' 
  | 'FILLING' 
  | 'STABLE' 
  | 'WARNING_LEAK' 
  | 'VILLAGE_FLOODED' 
  | 'VICTORY';

export type ToolType = 'DAM' | 'GATE' | 'DELETE' | 'INSPECT' | 'WATER';

export interface LevelConfig {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  targetReservoirWater: number;
  maxDams: number;
  maxGates: number;
  sourceFlowRate: number; // Water units per pulse
  flowPulseInterval: number; // in ticks (e.g. every 1 or 2 ticks)
  gridSize: number;
  initialTerrain: {
    x: number;
    y: number;
    elevation: number;
    type: TileType;
    decor?: 'tree' | 'rock' | 'house_1' | 'house_2' | 'church' | 'mill' | 'flowers' | null;
    isSource?: boolean;
    isVillage?: boolean;
    building?: BuildingType;
    gateOpen?: boolean;
    waterLevel?: number;
  }[];
  hint: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'water' | 'foam' | 'smoke' | 'spark' | 'splash';
}
