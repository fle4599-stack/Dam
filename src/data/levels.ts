import { LevelConfig, TileType } from '../types';

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: "Level 1: Canyon Basin",
    subtitle: "Introduction to Dam Architecture",
    description: "Water flows from the high mountain source at (0,0) down the gorge toward the village at (9,9). Build solid dams at the narrow canyon choke-point to safely accumulate 100 water units in the reservoir without flooding the village.",
    targetReservoirWater: 100,
    maxDams: 10,
    maxGates: 4,
    sourceFlowRate: 2,
    flowPulseInterval: 1,
    gridSize: 10,
    hint: "Identify the narrowest part of the riverbed (around tiles (3,3) - (4,4)) and place solid dams between the green river banks to hold 100 water units.",
    initialTerrain: generateLevel1()
  },
  {
    id: 2,
    name: "Level 2: Sluice Diversion",
    subtitle: "Canal & Gate Logic",
    description: "The river splits into two branches! The east branch leads to the Village, while the west branch flows into an empty natural basin. Build a gate to divert water away from the village into the retention basin to accumulate 100 water units.",
    targetReservoirWater: 100,
    maxDams: 10,
    maxGates: 6,
    sourceFlowRate: 2,
    flowPulseInterval: 1,
    gridSize: 10,
    hint: "Block the path to the village with a closed Gate or Dam, and leave the gate towards the west basin OPEN until 100 water units are safely stored.",
    initialTerrain: generateLevel2()
  },
  {
    id: 3,
    name: "Level 3: Cascading Terraces",
    subtitle: "Multi-Elevation Pressure",
    description: "The terrain drops in stepped terraces from high cliffs to the lowlands. Higher elevation water generates overflow pressure. Build a multi-tier dam system to contain 100 water units before it cascades into the village.",
    targetReservoirWater: 100,
    maxDams: 12,
    maxGates: 6,
    sourceFlowRate: 2,
    flowPulseInterval: 1,
    gridSize: 10,
    hint: "Build a primary dam at the upper terrace and a secondary safety dam lower down to hold 100 water units.",
    initialTerrain: generateLevel3()
  },
  {
    id: 4,
    name: "Level 4: The Great Floodplain",
    subtitle: "Wide Valley Containment",
    description: "A wide riverbed runs across the center with multiple potential flood paths. Protect the expanded village district by constructing an extensive levee barrier to safely store 100 water units.",
    targetReservoirWater: 100,
    maxDams: 16,
    maxGates: 6,
    sourceFlowRate: 2,
    flowPulseInterval: 1,
    gridSize: 10,
    hint: "A wide river requires multiple adjacent dams to form an unbroken barrier between the cliffs to hold 100 water units.",
    initialTerrain: generateLevel4()
  },
  {
    id: 5,
    name: "Level 5: Master Hydro-Engineer",
    subtitle: "The Genesis Grand Canyon",
    description: "A high-flow alpine surge threatens two village outposts. Manage dual spillways with precision gates to maintain 100 reservoir water units in equilibrium without a single drop entering the villages.",
    targetReservoirWater: 100,
    maxDams: 16,
    maxGates: 8,
    sourceFlowRate: 2,
    flowPulseInterval: 1,
    gridSize: 10,
    hint: "Utilize togglable sluice gates to balance water distribution between the side retention basins to store 100 water units.",
    initialTerrain: generateLevel5()
  },
  {
    id: 6,
    name: "Sandbox: Free Builder",
    subtitle: "Infinite Hydro-Simulation",
    description: "Create your own rivers, mountains, villages, and dams. Experiment with cellular automata water mechanics freely with no budget restrictions.",
    targetReservoirWater: 100,
    maxDams: 99,
    maxGates: 99,
    sourceFlowRate: 2,
    flowPulseInterval: 1,
    gridSize: 10,
    hint: "Use the Water Dropper tool to manually inject water anywhere, or inspect cell pressures.",
    initialTerrain: generateSandbox()
  }
];

function generateLevel1() {
  const terrain: LevelConfig['initialTerrain'] = [];
  // 10x10 grid
  // River runs along the diagonal: (0,0) -> (1,1) -> (2,2) -> (3,3) -> (4,4) -> (5,5) -> (6,6) -> (7,7) -> (8,8) -> (9,9)
  // Riverbed width: 2 tiles. Riverbed elevation: 0. Bank elevation: 1. Cliff elevation: 2.
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const isSource = (x === 0 && y === 0);
      const isVillage = (x >= 8 && y >= 8);
      
      // Calculate distance to diagonal x == y
      const diff = Math.abs(x - y);
      
      let elevation = 1;
      let type: TileType = 'BANK';
      let decor: LevelConfig['initialTerrain'][0]['decor'] = null;

      if (isSource) {
        elevation = 1;
        type = 'SOURCE';
      } else if (isVillage) {
        elevation = 0;
        type = 'VILLAGE';
        if (x === 9 && y === 9) decor = 'church';
        else if (x === 8 && y === 9) decor = 'house_1';
        else if (x === 9 && y === 8) decor = 'house_2';
        else decor = 'flowers';
      } else if (diff <= 1 && !(x >= 8 && y >= 8)) {
        elevation = 0;
        type = 'RIVER_BED';
      } else if (diff >= 3) {
        elevation = 2;
        type = 'CLIFF';
        if ((x + y * 3) % 4 === 0) decor = 'rock';
        else if ((x * 2 + y) % 3 === 0) decor = 'tree';
      } else {
        elevation = 1;
        type = 'BANK';
        if ((x + y * 2) % 3 === 0) decor = 'tree';
      }

      terrain.push({
        x,
        y,
        elevation,
        type,
        decor,
        isSource,
        isVillage,
        building: 'NONE',
        gateOpen: false,
        waterLevel: 0
      });
    }
  }
  return terrain;
}

function generateLevel2() {
  const terrain: LevelConfig['initialTerrain'] = [];
  // River forks at (3,3):
  // Main stream goes to village (8,8..9,9)
  // Side stream forks left to basin at (1,6..3,8)
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const isSource = (x === 0 && y === 0);
      const isVillage = (x >= 8 && y >= 7);
      
      let elevation = 1;
      let type: TileType = 'BANK';
      let decor: LevelConfig['initialTerrain'][0]['decor'] = null;

      // Natural basin in lower-left: (x: 1-3, y: 5-8)
      const inBasin = (x >= 1 && x <= 4 && y >= 5 && y <= 8);
      // Fork channel: (x: 1-2, y: 3-4)
      const inFork = (x >= 1 && x <= 2 && y >= 3 && y <= 5);
      // Main river: diagonal from (0,0) to (9,9)
      const isMainRiver = Math.abs(x - y) <= 1;

      if (isSource) {
        elevation = 1;
        type = 'SOURCE';
      } else if (isVillage) {
        elevation = 0;
        type = 'VILLAGE';
        if (x === 9 && y === 9) decor = 'church';
        else if (x === 8 && y === 8) decor = 'house_1';
        else if (x === 9 && y === 8) decor = 'house_2';
        else decor = 'flowers';
      } else if (inBasin || inFork || (isMainRiver && !(x >= 8 && y >= 7))) {
        elevation = 0;
        type = 'RIVER_BED';
      } else if (x >= 7 && y <= 2) {
        elevation = 2;
        type = 'CLIFF';
        decor = 'rock';
      } else {
        elevation = 1;
        type = 'BANK';
        if ((x * 3 + y) % 4 === 0) decor = 'tree';
      }

      terrain.push({
        x,
        y,
        elevation,
        type,
        decor,
        isSource,
        isVillage,
        building: 'NONE',
        gateOpen: false,
        waterLevel: 0
      });
    }
  }
  return terrain;
}

function generateLevel3() {
  const terrain: LevelConfig['initialTerrain'] = [];
  // Terraces: elevation 2 (top), elevation 1 (middle), elevation 0 (lower valley + village)
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const isSource = (x === 0 && y === 0);
      const isVillage = (x >= 8 && y >= 8);
      
      let baseEle = 0;
      if (x + y < 5) baseEle = 2;
      else if (x + y < 11) baseEle = 1;
      else baseEle = 0;

      let type: TileType = 'BANK';
      let decor: LevelConfig['initialTerrain'][0]['decor'] = null;
      let elevation = baseEle;

      // River canyon carved 1 level lower than surrounding
      const isRiver = Math.abs(x - y) <= 1;

      if (isSource) {
        elevation = 2;
        type = 'SOURCE';
      } else if (isVillage) {
        elevation = 0;
        type = 'VILLAGE';
        decor = (x === 9 && y === 9) ? 'church' : (x === 8 ? 'house_1' : 'house_2');
      } else if (isRiver) {
        elevation = Math.max(0, baseEle - 1);
        type = 'RIVER_BED';
      } else {
        type = (baseEle >= 2) ? 'CLIFF' : 'BANK';
        if ((x + y) % 3 === 0) decor = 'tree';
        else if (baseEle >= 2) decor = 'rock';
      }

      terrain.push({
        x,
        y,
        elevation,
        type,
        decor,
        isSource,
        isVillage,
        building: 'NONE',
        gateOpen: false,
        waterLevel: 0
      });
    }
  }
  return terrain;
}

function generateLevel4() {
  const terrain: LevelConfig['initialTerrain'] = [];
  // Wide floodplain: river is 3 tiles wide in the center, village is spread across (7-9, 7-9)
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const isSource = (x === 0 && y === 0);
      const isVillage = (x >= 7 && y >= 7);
      
      const isWideRiver = (x >= 2 && x <= 6 && y >= 2 && y <= 6) || Math.abs(x - y) <= 1;
      let elevation = 1;
      let type: TileType = 'BANK';
      let decor: LevelConfig['initialTerrain'][0]['decor'] = null;

      if (isSource) {
        elevation = 1;
        type = 'SOURCE';
      } else if (isVillage) {
        elevation = 0;
        type = 'VILLAGE';
        if (x === 9 && y === 9) decor = 'church';
        else if (x === 8 && y === 7) decor = 'house_1';
        else if (x === 7 && y === 8) decor = 'house_2';
        else if (x === 8 && y === 9) decor = 'mill';
        else decor = 'flowers';
      } else if (isWideRiver) {
        elevation = 0;
        type = 'RIVER_BED';
      } else if ((x <= 1 && y >= 6) || (y <= 1 && x >= 6)) {
        elevation = 2;
        type = 'CLIFF';
        decor = 'rock';
      } else {
        elevation = 1;
        type = 'BANK';
        if ((x + y * 2) % 3 === 0) decor = 'tree';
      }

      terrain.push({
        x,
        y,
        elevation,
        type,
        decor,
        isSource,
        isVillage,
        building: 'NONE',
        gateOpen: false,
        waterLevel: 0
      });
    }
  }
  return terrain;
}

function generateLevel5() {
  const terrain: LevelConfig['initialTerrain'] = [];
  // Genesis Grand Canyon: two villages (8,9) and (9,2), two retention basins
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const isSource = (x === 0 && y === 0);
      const isVillage = (x >= 8 && y >= 8) || (x >= 8 && y <= 2 && !(x === 9 && y === 0));

      let elevation = 1;
      let type: TileType = 'BANK';
      let decor: LevelConfig['initialTerrain'][0]['decor'] = null;

      // Complex winding river system
      const isChannel1 = (Math.abs(x - y) <= 1);
      const isChannel2 = (x >= 4 && y >= 1 && y <= 3);
      const inBasin = (x >= 1 && x <= 3 && y >= 6 && y <= 8);

      if (isSource) {
        elevation = 2;
        type = 'SOURCE';
      } else if (isVillage) {
        elevation = 0;
        type = 'VILLAGE';
        if (x === 9 && y === 9) decor = 'church';
        else if (x === 9 && y === 1) decor = 'church';
        else if (x === 8 && y === 8) decor = 'house_1';
        else decor = 'house_2';
      } else if (isChannel1 || isChannel2 || inBasin) {
        elevation = 0;
        type = 'RIVER_BED';
      } else if ((x <= 1 && y >= 3 && y <= 5) || (y <= 1 && x >= 3 && x <= 5)) {
        elevation = 3;
        type = 'CLIFF';
        decor = 'rock';
      } else {
        elevation = 1;
        type = 'BANK';
        if ((x + y) % 3 === 0) decor = 'tree';
      }

      terrain.push({
        x,
        y,
        elevation,
        type,
        decor,
        isSource,
        isVillage,
        building: 'NONE',
        gateOpen: false,
        waterLevel: 0
      });
    }
  }
  return terrain;
}

function generateSandbox() {
  const terrain: LevelConfig['initialTerrain'] = [];
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const isSource = (x === 0 && y === 0);
      const isVillage = (x === 9 && y === 9);
      const isRiver = (x === y || x === y + 1);

      terrain.push({
        x,
        y,
        elevation: isRiver ? 0 : 1,
        type: isSource ? 'SOURCE' : (isVillage ? 'VILLAGE' : (isRiver ? 'RIVER_BED' : 'BANK')),
        decor: isVillage ? 'church' : ((!isRiver && (x + y) % 4 === 0) ? 'tree' : null),
        isSource,
        isVillage,
        building: 'NONE',
        gateOpen: false,
        waterLevel: 0
      });
    }
  }
  return terrain;
}
