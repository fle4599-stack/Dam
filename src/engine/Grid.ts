import { Tile, BuildingType, LevelConfig } from '../types';

export class Grid {
  public size: number = 10;
  public tiles: Tile[][] = [];
  public tileWidth: number = 64;
  public tileHeight: number = 32;
  public elevationHeight: number = 18;
  public waterStepHeight: number = 7;

  constructor(size: number = 10) {
    this.size = size;
    this.initEmptyGrid();
  }

  public initEmptyGrid() {
    this.tiles = [];
    for (let y = 0; y < this.size; y++) {
      const row: Tile[] = [];
      for (let x = 0; x < this.size; x++) {
        row.push({
          x,
          y,
          elevation: 1,
          waterLevel: 0,
          building: 'NONE',
          gateOpen: false,
          isSource: (x === 0 && y === 0),
          isVillage: (x === this.size - 1 && y === this.size - 1),
          flooded: false,
          type: (x === 0 && y === 0) ? 'SOURCE' : ((x === this.size - 1 && y === this.size - 1) ? 'VILLAGE' : 'BANK'),
          decor: null
        });
      }
      this.tiles.push(row);
    }
  }

  public loadLevel(level: LevelConfig) {
    this.size = level.gridSize;
    this.initEmptyGrid();

    level.initialTerrain.forEach(t => {
      if (this.isValid(t.x, t.y)) {
        const tile = this.tiles[t.y][t.x];
        tile.elevation = t.elevation;
        tile.type = t.type;
        tile.decor = t.decor || null;
        tile.isSource = !!t.isSource;
        tile.isVillage = !!t.isVillage;
        tile.building = t.building || 'NONE';
        tile.gateOpen = !!t.gateOpen;
        tile.waterLevel = t.waterLevel || 0;
        tile.flooded = false;
      }
    });
  }

  public getTile(x: number, y: number): Tile | null {
    if (!this.isValid(x, y)) return null;
    return this.tiles[y][x];
  }

  public isValid(x: number, y: number): boolean {
    return x >= 0 && x < this.size && y >= 0 && y < this.size;
  }

  // Count current placed buildings
  public countBuildings(): { dams: number; gates: number } {
    let dams = 0;
    let gates = 0;
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        if (this.tiles[y][x].building === 'DAM') dams++;
        if (this.tiles[y][x].building === 'GATE') gates++;
      }
    }
    return { dams, gates };
  }

  // Count total water in reservoir (excluding village)
  public getTotalWater(): number {
    let total = 0;
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        total += this.tiles[y][x].waterLevel;
      }
    }
    return total;
  }

  public getReservoirWater(): number {
    let total = 0;
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const tile = this.tiles[y][x];
        if (!tile.isVillage) {
          total += tile.waterLevel;
        }
      }
    }
    return Math.min(100, total);
  }

  // Place or remove building
  public setBuilding(x: number, y: number, building: BuildingType): boolean {
    const tile = this.getTile(x, y);
    if (!tile) return false;
    // Don't overwrite the mountain water source spring or core village landmarks
    if (tile.isSource) return false;
    if (tile.isVillage && (tile.decor === 'church' || tile.decor === 'house_1' || tile.decor === 'house_2')) {
      return false;
    }

    tile.building = building;
    if (building === 'DAM') {
      tile.waterLevel = 0; // Solid concrete displaces standing water
      // If there was a tree, rock, or flowers, remove it permanently from the tile
      if (tile.decor && tile.decor !== 'church' && tile.decor !== 'house_1' && tile.decor !== 'house_2') {
        tile.decor = null;
      }
    } else if (building === 'GATE') {
      tile.gateOpen = false; // Closed by default
      tile.waterLevel = 0;
      if (tile.decor && tile.decor !== 'church' && tile.decor !== 'house_1' && tile.decor !== 'house_2') {
        tile.decor = null;
      }
    }
    return true;
  }

  public toggleGate(x: number, y: number): boolean {
    const tile = this.getTile(x, y);
    if (!tile || tile.building !== 'GATE') return false;
    tile.gateOpen = !tile.gateOpen;
    return true;
  }

  public removeBuilding(x: number, y: number): boolean {
    const tile = this.getTile(x, y);
    if (!tile) return false;
    if (tile.building === 'NONE') return false;
    tile.building = 'NONE';
    tile.gateOpen = false;
    return true;
  }

  public addWater(x: number, y: number, amount: number = 1): boolean {
    const tile = this.getTile(x, y);
    if (!tile) return false;
    tile.waterLevel = Math.min(4, tile.waterLevel + amount);
    return true;
  }

  public clearWater() {
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        this.tiles[y][x].waterLevel = 0;
        this.tiles[y][x].flooded = false;
      }
    }
  }

  // Coordinate transforms
  public gridToScreen(
    x: number, 
    y: number, 
    elevation: number = 0, 
    waterOffset: number = 0, 
    originX: number, 
    originY: number
  ): { x: number; y: number } {
    const halfW = this.tileWidth / 2;
    const halfH = this.tileHeight / 2;
    const screenX = originX + (x - y) * halfW;
    const screenY = originY + (x + y) * halfH - (elevation * this.elevationHeight) - (waterOffset * this.waterStepHeight);
    return { x: screenX, y: screenY };
  }

  // Screen to grid inverse mapping (front-to-back raycast)
  public screenToGrid(
    screenX: number, 
    screenY: number, 
    originX: number, 
    originY: number
  ): { x: number; y: number } | null {
    const halfW = this.tileWidth / 2;
    const halfH = this.tileHeight / 2;

    const list: { x: number; y: number; elevation: number; depth: number }[] = [];
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const tile = this.tiles[y][x];
        list.push({ x, y, elevation: tile.elevation, depth: x + y });
      }
    }

    // Sort front to back (highest depth first, then highest elevation)
    list.sort((a, b) => (b.depth - a.depth) || (b.elevation - a.elevation));

    for (const c of list) {
      const tile = this.tiles[c.y][c.x];
      const center = this.gridToScreen(c.x, c.y, tile.elevation, 0, originX, originY);
      
      const dx = Math.abs(screenX - center.x);
      const dy = screenY - center.y;

      // Top rhombus test
      if ((dx / halfW) + (Math.abs(dy) / halfH) <= 1.0) {
        return { x: c.x, y: c.y };
      }

      // Vertical drop test for elevated cliffs
      if (tile.elevation > 0) {
        const drop = tile.elevation * this.elevationHeight;
        if (dx <= halfW && dy >= -halfH && dy <= drop + halfH) {
          if ((dx / halfW) + (Math.abs(dy - drop) / halfH) <= 1.0 || (dx <= halfW * 0.9 && dy >= 0 && dy <= drop)) {
            return { x: c.x, y: c.y };
          }
        }
      }
    }

    // Fallback: ground flat plane
    const relX = screenX - originX;
    const relY = screenY - originY;
    const gx = Math.round((relY / halfH + relX / halfW) / 2);
    const gy = Math.round((relY / halfH - relX / halfW) / 2);

    if (this.isValid(gx, gy)) {
      return { x: gx, y: gy };
    }

    return null;
  }
}
