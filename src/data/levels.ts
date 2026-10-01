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
    description: "A high-flow alpine surge threatens two village outposts. Manage dual spillways to maintain 100 reservoir water units in equilibrium without a single drop entering the villages.",
    targetReservoirWater: 100,
    maxDams: 16,
    maxGates: 0,
    sourceFlowRate: 2,
    flowPulseInterval: 1,
    gridSize: 10,
    hint: "Two outposts to protect! Build dams along the canyon choke-points to hold 100 water units in the side retention basins.",
    initialTerrain: generateLevel5()
  },
  {
    id: 6,
    name: "Level 6: Twin Oases",
    subtitle: "Y-Fork Hydrodynamics",
    description: "Water flows from a high spring into a central basin, threatening two separate desert settlements. With only 8 dam blocks, seal both outflow channels to safely accumulate 100 water units.",
    targetReservoirWater: 100,
    maxDams: 8,
    maxGates: 0,
    sourceFlowRate: 2,
    flowPulseInterval: 1,
    gridSize: 10,
    hint: "Both settlements need protection! Locate the two narrow exit channels leaving the central basin and seal them with your 8 dams.",
    initialTerrain: generateLevel6()
  },
  {
    id: 7,
    name: "Level 7: The Cross Gorge",
    subtitle: "Crossroads Diversion",
    description: "The river hits a crossroads toward a north-east port and a southern village. You only have 7 dams: close the village gullies and redirect the deluge into the deep western quarry lake.",
    targetReservoirWater: 100,
    maxDams: 7,
    maxGates: 0,
    sourceFlowRate: 2,
    flowPulseInterval: 1,
    gridSize: 10,
    hint: "Block both outflow gullies using your dams, guiding the flood into the western quarry to store 100 water units.",
    initialTerrain: generateLevel7()
  },
  {
    id: 8,
    name: "Level 8: Delta Archipelago",
    subtitle: "Chokepoint Discovery",
    description: "An archipelago delta threatens two far-flung settlements. Near the villages the river is too wide, but higher up between the rocky cliffs, the passes are narrow. Use 6 dams to hold 100 water units.",
    targetReservoirWater: 100,
    maxDams: 6,
    maxGates: 0,
    sourceFlowRate: 2,
    flowPulseInterval: 1,
    gridSize: 10,
    hint: "Don't build near the villages — find the narrow 2-tile passes between the high cliff ridges near the upper lake.",
    initialTerrain: generateLevel8()
  },
  {
    id: 9,
    name: "Level 9: Alpine Terraces",
    subtitle: "Highland Rim Containment",
    description: "Steep terraces drop down into two peaceful mountain hamlets. A natural bowl on the middle plateau can hold the entire flood of 100 units. Construct a 5-dam barrier along the cliff rim.",
    targetReservoirWater: 100,
    maxDams: 5,
    maxGates: 0,
    sourceFlowRate: 2,
    flowPulseInterval: 1,
    gridSize: 10,
    hint: "Build a 5-block dam wall across the rim of the middle terrace before the water drops into the lower chutes.",
    initialTerrain: generateLevel9()
  },
  {
    id: 10,
    name: "Level 10: Grand Hydro-Citadel",
    subtitle: "The Master Canyon Pass",
    description: "The ultimate hydro-engineering challenge! Two fortified citadels lie in the lowlands. You have only 4 dam blocks. Locate the single critical choke-point in the upper canyon to store 100 water units.",
    targetReservoirWater: 100,
    maxDams: 4,
    maxGates: 0,
    sourceFlowRate: 2,
    flowPulseInterval: 1,
    gridSize: 10,
    hint: "Analyze the terrain: far downstream is too wide to defend. Seal the narrow 2-tile throat of the canyon high up to flood the mountain fjord.",
    initialTerrain: generateLevel10()
  },
  {
    id: 11,
    name: "Sandbox: Free Builder",
    subtitle: "Infinite Hydro-Simulation",
    description: "Create your own rivers, mountains, villages, and dams. Experiment with cellular automata water mechanics freely with no budget restrictions.",
    targetReservoirWater: 100,
    maxDams: 99,
    maxGates: 0,
    sourceFlowRate: 2,
    flowPulseInterval: 1,
    gridSize: 10,
    hint: "Use DAM and DEL tools to experiment with cellular water flow anywhere on the map.",
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

function generateLevel6() {
  const terrain: LevelConfig['initialTerrain'] = [];
  // Twin Oases: Village 1 at (0-1, 8-9), Village 2 at (8-9, 8-9)
  // Source at (4, 0), elevation 2
  // Central basin at (3-6, 2-5), elevation 0
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const isSource = (x === 4 && y === 0);
      const isVillage1 = (x <= 1 && y >= 8);
      const isVillage2 = (x >= 8 && y >= 8);
      const isVillage = isVillage1 || isVillage2;

      const inBasin = (x >= 3 && x <= 6 && y >= 2 && y <= 5);
      const inSourceChute = (x === 4 && (y === 0 || y === 1));
      const inWestChannel = (x === 2 && y >= 5 && y <= 7) || (x === 1 && y === 7);
      const inEastChannel = (x === 7 && y >= 5 && y <= 7) || (x === 8 && y === 7);
      const isRiver = inBasin || inSourceChute || inWestChannel || inEastChannel;

      const isCliff = ((x === 0 || x === 9) && y < 7) || ((x === 1 || x === 8) && y <= 3);

      let elevation = 1;
      let type: TileType = 'BANK';
      let decor: LevelConfig['initialTerrain'][0]['decor'] = null;

      if (isSource) {
        elevation = 2;
        type = 'SOURCE';
      } else if (isVillage) {
        elevation = 0;
        type = 'VILLAGE';
        if ((x === 0 && y === 9) || (x === 9 && y === 9)) decor = 'church';
        else if ((x === 1 && y === 9) || (x === 8 && y === 9)) decor = 'house_1';
        else decor = 'house_2';
      } else if (isRiver) {
        elevation = 0;
        type = 'RIVER_BED';
      } else if (isCliff) {
        elevation = 2;
        type = 'CLIFF';
        decor = (x + y) % 2 === 0 ? 'rock' : null;
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

function generateLevel7() {
  const terrain: LevelConfig['initialTerrain'] = [];
  // Crossroads: Port at (8-9, 1-2), South Town at (4-5, 8-9)
  // Source at (0, 0), elevation 2
  // Western Quarry basin at (1-3, 5-8)
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const isSource = (x === 0 && y === 0);
      const isVillage1 = (x >= 8 && y >= 1 && y <= 2);
      const isVillage2 = (x >= 4 && x <= 5 && y >= 8);
      const isVillage = isVillage1 || isVillage2;

      // River channels
      const isMainCross = (Math.abs(x - y) <= 1 && x <= 4 && y <= 4);
      const isBranchEast = (y === 3 && x >= 4 && x <= 7) || (x === 7 && y === 2);
      const isBranchSouth = (x === 4 && y >= 4 && y <= 7);
      const isQuarry = (x >= 1 && x <= 3 && y >= 5 && y <= 8);
      const isQuarryInlet = (y === 4 && x >= 1 && x <= 3);

      const isRiver = isMainCross || isBranchEast || isBranchSouth || isQuarry || isQuarryInlet;
      const isCliff = (x >= 6 && y >= 5) || (x <= 1 && y >= 1 && y <= 3) || (x >= 6 && y === 0);

      let elevation = 1;
      let type: TileType = 'BANK';
      let decor: LevelConfig['initialTerrain'][0]['decor'] = null;

      if (isSource) {
        elevation = 2;
        type = 'SOURCE';
      } else if (isVillage) {
        elevation = 0;
        type = 'VILLAGE';
        if ((x === 9 && y === 1) || (x === 5 && y === 9)) decor = 'church';
        else if ((x === 8 && y === 1) || (x === 4 && y === 9)) decor = 'house_1';
        else decor = 'house_2';
      } else if (isRiver) {
        elevation = 0;
        type = 'RIVER_BED';
      } else if (isCliff) {
        elevation = 2;
        type = 'CLIFF';
        decor = 'rock';
      } else {
        elevation = 1;
        type = 'BANK';
        if ((x * 2 + y) % 3 === 0) decor = 'tree';
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

function generateLevel8() {
  const terrain: LevelConfig['initialTerrain'] = [];
  // Delta Archipelago: Village 1 at (0-1, 8-9), Village 2 at (8-9, 7-8)
  // Source at (0, 0), elevation 3
  // Rocky ridges separating delta channels
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const isSource = (x === 0 && y === 0);
      const isVillage1 = (x <= 1 && y >= 8);
      const isVillage2 = (x >= 8 && y >= 7 && y <= 8);
      const isVillage = isVillage1 || isVillage2;

      // Upper lake basin
      const inUpperLake = (x >= 1 && x <= 4 && y >= 0 && y <= 3);
      // Chokepoint pass 1 (West)
      const inPassWest = (y === 4 && (x === 1 || x === 2)) || (x === 1 && y >= 5 && y <= 7);
      // Chokepoint pass 2 (East)
      const inPassEast = (x === 4 && (y === 4 || y === 5)) || (y === 6 && x >= 5 && x <= 8);

      const isRiver = inUpperLake || inPassWest || inPassEast;
      // High crags
      const isCliff = (x === 0 && y >= 2 && y <= 6) || 
                      (x === 3 && y >= 3 && y <= 7) || 
                      (x >= 6 && x <= 7 && y <= 4) ||
                      (x === 9 && y <= 5);

      let elevation = 1;
      let type: TileType = 'BANK';
      let decor: LevelConfig['initialTerrain'][0]['decor'] = null;

      if (isSource) {
        elevation = 3;
        type = 'SOURCE';
      } else if (isVillage) {
        elevation = 0;
        type = 'VILLAGE';
        if ((x === 0 && y === 9) || (x === 9 && y === 8)) decor = 'church';
        else if ((x === 1 && y === 9) || (x === 8 && y === 8)) decor = 'house_1';
        else decor = 'house_2';
      } else if (isRiver) {
        elevation = 0;
        type = 'RIVER_BED';
      } else if (isCliff) {
        elevation = 3;
        type = 'CLIFF';
        decor = 'rock';
      } else {
        elevation = 1;
        type = 'BANK';
        if ((x + y * 3) % 4 === 0) decor = 'tree';
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

function generateLevel9() {
  const terrain: LevelConfig['initialTerrain'] = [];
  // Alpine Terraces: Village 1 at (0-1, 7-8), Village 2 at (8-9, 7-8)
  // Source at (4, 0), elevation 3
  // Large plateau bowl at y: 2-4
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const isSource = (x === 4 && y === 0);
      const isVillage1 = (x <= 1 && y >= 7 && y <= 8);
      const isVillage2 = (x >= 8 && y >= 7 && y <= 8);
      const isVillage = isVillage1 || isVillage2;

      // Middle plateau bowl
      const inBowl = (x >= 2 && x <= 7 && y >= 2 && y <= 4);
      const inSourceStream = (x === 4 && (y === 0 || y === 1));
      // Two drop chutes off the terrace
      const inLeftChute = (y === 5 && (x === 2 || x === 3)) || (x === 1 && y === 6);
      const inRightChute = (y === 5 && (x === 6 || x === 7)) || (x === 8 && y === 6);

      const isRiver = inBowl || inSourceStream || inLeftChute || inRightChute;

      let elevation = 1;
      let type: TileType = 'BANK';
      let decor: LevelConfig['initialTerrain'][0]['decor'] = null;

      if (isSource) {
        elevation = 3;
        type = 'SOURCE';
      } else if (isVillage) {
        elevation = 0;
        type = 'VILLAGE';
        if ((x === 0 && y === 8) || (x === 9 && y === 8)) decor = 'church';
        else if ((x === 1 && y === 8) || (x === 8 && y === 8)) decor = 'house_1';
        else decor = 'house_2';
      } else if (isRiver) {
        elevation = (y >= 5) ? 0 : 1;
        type = 'RIVER_BED';
      } else if (y <= 1 || ((x <= 1 || x >= 8) && y <= 4)) {
        elevation = 3;
        type = 'CLIFF';
        decor = 'rock';
      } else if (y >= 6) {
        elevation = 0;
        type = 'BANK';
        if ((x + y) % 3 === 0) decor = 'tree';
      } else {
        elevation = 2;
        type = 'BANK';
        if ((x + y) % 2 === 0) decor = 'tree';
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

function generateLevel10() {
  const terrain: LevelConfig['initialTerrain'] = [];
  // Grand Hydro-Citadel: Citadel West (0-1, 8-9), Citadel East (8-9, 8-9)
  // Source at (0, 0), elevation 3
  // Mountain Fjord Canyon (0-3, 0-3), Chokepoint at (3,3)-(3,4)
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const isSource = (x === 0 && y === 0);
      const isVillage1 = (x <= 1 && y >= 8);
      const isVillage2 = (x >= 8 && y >= 8);
      const isVillage = isVillage1 || isVillage2;

      // Fjord Lake
      const inFjordLake = (x <= 3 && y <= 3 && !(x === 0 && y === 3) && !(x === 3 && y === 0));
      // Exact Canyon Throat bottleneck
      const inThroat = (x === 3 && y === 4);
      // Downstream open spread
      const inDeltaWest = (x >= 1 && x <= 3 && y >= 5 && y <= 7);
      const inDeltaEast = (x >= 4 && x <= 7 && y >= 5 && y <= 7);

      const isRiver = inFjordLake || inThroat || inDeltaWest || inDeltaEast;
      // High mountain cliffs flanking the fjord
      const isCliff = ((x === 0 || x === 1) && y >= 4 && y <= 6) ||
                      (x >= 4 && y <= 4) ||
                      (x >= 8 && y <= 6);

      let elevation = 1;
      let type: TileType = 'BANK';
      let decor: LevelConfig['initialTerrain'][0]['decor'] = null;

      if (isSource) {
        elevation = 3;
        type = 'SOURCE';
      } else if (isVillage) {
        elevation = 0;
        type = 'VILLAGE';
        if ((x === 0 && y === 9) || (x === 9 && y === 9)) decor = 'church';
        else if ((x === 1 && y === 9) || (x === 8 && y === 9)) decor = 'house_1';
        else decor = 'house_2';
      } else if (isRiver) {
        elevation = (y >= 5) ? 0 : 1;
        type = 'RIVER_BED';
      } else if (isCliff) {
        elevation = 3;
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
