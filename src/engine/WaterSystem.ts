import { Grid } from './Grid';
import { GameStatus, LevelConfig } from '../types';
import { sound } from '../utils/audio';

export class WaterSystem {
  public grid: Grid;
  public level: LevelConfig;
  public status: GameStatus = 'IDLE';
  public tickCount: number = 0;
  public stableTicksCount: number = 0;
  public isRunning: boolean = true;
  public tickIntervalMs: number = 1000;
  public lastTickTime: number = 0;
  public onStatusChange?: (status: GameStatus) => void;
  public onTick?: (tick: number) => void;

  constructor(grid: Grid, level: LevelConfig) {
    this.grid = grid;
    this.level = level;
    this.status = 'IDLE';
  }

  public setLevel(level: LevelConfig) {
    this.level = level;
    this.status = 'IDLE';
    this.tickCount = 0;
    this.stableTicksCount = 0;
  }

  public reset() {
    this.tickCount = 0;
    this.stableTicksCount = 0;
    this.status = 'IDLE';
    this.grid.clearWater();
    this.updateStatus('IDLE');
  }

  private updateStatus(newStatus: GameStatus) {
    if (this.status !== newStatus) {
      this.status = newStatus;
      if (newStatus === 'VILLAGE_FLOODED') {
        sound.playFloodGameOver();
      } else if (newStatus === 'VICTORY') {
        sound.playVictory();
      } else if (newStatus === 'WARNING_LEAK') {
        sound.playWarning();
      }
      this.onStatusChange?.(newStatus);
    }
  }

  // Check if a neighbor tile can receive water from current tile
  private isPassable(fromX: number, fromY: number, toX: number, toY: number): boolean {
    const fromTile = this.grid.getTile(fromX, fromY);
    const toTile = this.grid.getTile(toX, toY);

    if (!fromTile || !toTile) return false;

    // Solid dam blocks all flow
    if (toTile.building === 'DAM' || fromTile.building === 'DAM') {
      return false;
    }

    // Gate: if closed, it acts as a dam
    if (toTile.building === 'GATE' && !toTile.gateOpen) {
      return false;
    }
    if (fromTile.building === 'GATE' && !fromTile.gateOpen) {
      return false;
    }

    return true;
  }

  // Core Hydraulic Cellular Automata Logic Tick (1 tick per second on 1x speed)
  public tick(): void {
    if (this.status === 'VILLAGE_FLOODED') {
      return; // Simulation stops on disaster
    }

    this.tickCount++;

    // 1. Water Source Generation: Mountain Spring pumps continuous water until 100 units is reached
    const currentResWater = this.grid.getReservoirWater();
    for (let y = 0; y < this.grid.size; y++) {
      for (let x = 0; x < this.grid.size; x++) {
        const tile = this.grid.tiles[y][x];
        if (tile.isSource) {
          if (currentResWater < 100) {
            tile.waterLevel = 4; // Source maintains full water head
            sound.playWaterTick();
          }
        }
      }
    }

    // Double buffer arrays to compute flow symmetric transfers
    const deltas: number[][] = Array.from({ length: this.grid.size }, () => 
      Array(this.grid.size).fill(0)
    );

    const velX: number[][] = Array.from({ length: this.grid.size }, () => 
      Array(this.grid.size).fill(0)
    );
    const velY: number[][] = Array.from({ length: this.grid.size }, () => 
      Array(this.grid.size).fill(0)
    );

    const dirs = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 }
    ];

    // 2. Compute flow between cells
    // Priority order:
    // 1. Downhill slope (nbr.elevation < curr.elevation) -> gravity falls downward
    // 2. Flat riverbed (nbr.elevation === curr.elevation && nbr.waterLevel < curr.waterLevel)
    // 3. Uphill overflow ONLY IF current cell is full (waterLevel === 4), overflows crest, and NO lower options exist
    for (let y = 0; y < this.grid.size; y++) {
      for (let x = 0; x < this.grid.size; x++) {
        const curr = this.grid.tiles[y][x];
        if (curr.waterLevel <= 0) continue;
        if (curr.building === 'DAM' || (curr.building === 'GATE' && !curr.gateOpen)) continue;

        const currSurface = curr.elevation + curr.waterLevel;

        interface Target {
          nx: number;
          ny: number;
          priority: number;
          isDownhill: boolean;
        }

        const downhillTargets: Target[] = [];
        const flatTargets: Target[] = [];
        const uphillTargets: Target[] = [];

        for (const { dx, dy } of dirs) {
          const nx = x + dx;
          const ny = y + dy;

          if (!this.grid.isValid(nx, ny)) continue;
          if (!this.isPassable(x, y, nx, ny)) continue;

          const nbr = this.grid.tiles[ny][nx];
          const nbrEffectiveWater = nbr.waterLevel + deltas[ny][nx];
          if (nbrEffectiveWater >= 4) continue; // Target already full

          // Case 1: Downhill (neighbor ground is lower)
          if (nbr.elevation < curr.elevation) {
            const grad = currSurface - (nbr.elevation + nbrEffectiveWater);
            if (grad > 0) {
              downhillTargets.push({
                nx,
                ny,
                priority: 1000 + (curr.elevation - nbr.elevation) * 100 + (4 - nbrEffectiveWater) * 10,
                isDownhill: true
              });
            }
          }
          // Case 2: Flat terrain (same ground elevation)
          else if (nbr.elevation === curr.elevation) {
            if (curr.waterLevel > nbrEffectiveWater || nbrEffectiveWater === 0 || curr.isSource) {
              const diff = curr.waterLevel - nbrEffectiveWater;
              flatTargets.push({
                nx,
                ny,
                priority: 500 + diff * 20 + (4 - nbrEffectiveWater) * 5,
                isDownhill: false
              });
            }
          }
          // Case 3: Uphill (neighbor ground is higher, e.g. cliff / bank)
          // STRICT PHYSICAL LAW: Water NEVER flows uphill unless current cell is completely full (depth 4)
          // AND water surface strictly exceeds neighbor ground AND no downhill/flat outlets are available.
          else if (nbr.elevation > curr.elevation) {
            if (curr.waterLevel >= 4 && currSurface > nbr.elevation + nbrEffectiveWater) {
              const spill = currSurface - (nbr.elevation + nbrEffectiveWater);
              uphillTargets.push({
                nx,
                ny,
                priority: 50 + spill * 10,
                isDownhill: false
              });
            }
          }
        }

        // Downhill targets take absolute priority over flat; flat takes absolute priority over uphill
        let chosenTargets: Target[] = [];
        if (downhillTargets.length > 0) {
          chosenTargets = downhillTargets.sort((a, b) => b.priority - a.priority);
        } else if (flatTargets.length > 0) {
          chosenTargets = flatTargets.sort((a, b) => b.priority - a.priority);
        } else if (uphillTargets.length > 0) {
          chosenTargets = uphillTargets.sort((a, b) => b.priority - a.priority);
        }

        if (chosenTargets.length > 0) {
          if (curr.isSource) {
            // Source feeds downstream branches without losing water
            let sourcePushes = Math.max(2, this.level.sourceFlowRate || 2);
            for (const target of chosenTargets) {
              if (sourcePushes <= 0) break;
              const nbr = this.grid.tiles[target.ny][target.nx];
              const maxAccept = 4 - (nbr.waterLevel + deltas[target.ny][target.nx]);
              if (maxAccept > 0) {
                const transfer = Math.min(sourcePushes, maxAccept);
                deltas[target.ny][target.nx] += transfer;
                velX[y][x] += (target.nx - x);
                velY[y][x] += (target.ny - y);
                sourcePushes -= transfer;
              }
            }
          } else {
            // Regular river cell:
            // If cell has waterLevel >= 2, it can push forward while maintaining at least 1 depth.
            // If cell has waterLevel === 1, it only transfers if it receives inflow or drains.
            let availableOutflow = (curr.waterLevel >= 2) ? 1 : (deltas[y][x] > 0 ? 1 : 0);

            for (const target of chosenTargets) {
              if (availableOutflow <= 0) break;
              const nbr = this.grid.tiles[target.ny][target.nx];
              const maxAccept = 4 - (nbr.waterLevel + deltas[target.ny][target.nx]);
              if (maxAccept <= 0) continue;

              const transfer = 1;
              deltas[y][x] -= transfer;
              deltas[target.ny][target.nx] += transfer;
              availableOutflow -= transfer;

              velX[y][x] += (target.nx - x);
              velY[y][x] += (target.ny - y);
            }
          }
        }
      }
    }

    // 3. Apply deltas and maintain continuous stream connectivity
    for (let y = 0; y < this.grid.size; y++) {
      for (let x = 0; x < this.grid.size; x++) {
        const tile = this.grid.tiles[y][x];
        
        if (tile.isSource) {
          tile.waterLevel = 4;
        } else {
          tile.waterLevel = Math.max(0, Math.min(4, tile.waterLevel + deltas[y][x]));
        }

        tile.waterVelocityX = velX[y][x];
        tile.waterVelocityY = velY[y][x];
      }
    }

    // 4. Evaluate Safety & Game Status
    this.evaluateGameStatus();
    this.onTick?.(this.tickCount);
  }

  // Check village flood, leak proximity, containment, and victory condition
  private evaluateGameStatus(): void {
    let villageFlooded = false;
    let nearVillageLeak = false;

    // Check all village tiles
    for (let y = 0; y < this.grid.size; y++) {
      for (let x = 0; x < this.grid.size; x++) {
        const tile = this.grid.tiles[y][x];
        if (tile.isVillage && tile.waterLevel > 0) {
          tile.flooded = true;
          villageFlooded = true;
        }
      }
    }

    // If any village tile is flooded -> INSTANT GAME OVER
    if (villageFlooded) {
      this.updateStatus('VILLAGE_FLOODED');
      return;
    }

    // Check leak proximity (water within 1 tile of village)
    for (let y = 0; y < this.grid.size; y++) {
      for (let x = 0; x < this.grid.size; x++) {
        const tile = this.grid.tiles[y][x];
        if (tile.waterLevel > 0 && !tile.isVillage) {
          for (let vy = 0; vy < this.grid.size; vy++) {
            for (let vx = 0; vx < this.grid.size; vx++) {
              if (this.grid.tiles[vy][vx].isVillage) {
                const dist = Math.abs(x - vx) + Math.abs(y - vy);
                if (dist <= 1 && tile.waterLevel > 0) {
                  nearVillageLeak = true;
                }
              }
            }
          }
        }
      }
    }

    const reservoirWater = this.grid.getReservoirWater();

    if (nearVillageLeak) {
      this.updateStatus('WARNING_LEAK');
      this.stableTicksCount = 0;
    } 
    // VICTORY REQUIREMENT:
    // 1. Water on screen >= targetReservoirWater (100 units)
    // 2. Village is NOT flooded
    // 3. Held stable for at least 2 consecutive ticks
    else if (reservoirWater >= this.level.targetReservoirWater) {
      this.stableTicksCount++;
      if (this.stableTicksCount >= 2) {
        this.updateStatus('VICTORY');
      } else {
        this.updateStatus('STABLE');
      }
    } else if (reservoirWater > 0) {
      this.updateStatus('FILLING');
      this.stableTicksCount = 0;
    } else {
      this.updateStatus('IDLE');
      this.stableTicksCount = 0;
    }
  }
}

