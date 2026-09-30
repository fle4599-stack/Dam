import { Grid } from './Grid';
import { Particle, Tile, ToolType } from '../types';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private grid: Grid;
  private particles: Particle[] = [];
  private animTime: number = 0;
  public showScanlines: boolean = false;
  public showGridLines: boolean = true;
  public hoveredTile: { x: number; y: number } | null = null;
  public activeTool: ToolType = 'DAM';

  constructor(ctx: CanvasRenderingContext2D, grid: Grid) {
    this.ctx = ctx;
    this.grid = grid;
  }

  public setGrid(grid: Grid) {
    this.grid = grid;
  }

  public addParticle(p: Particle) {
    this.particles.push(p);
  }

  // Update particles (smoke, splashes, bubbles)
  public updateParticles(deltaTime: number) {
    this.animTime += deltaTime;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * deltaTime;
      p.y += p.vy * deltaTime;
      p.life -= deltaTime;

      if (p.type === 'smoke') {
        p.vy -= 12 * deltaTime; // Smoke rises
        p.size += 1.5 * deltaTime;
      } else if (p.type === 'splash' || p.type === 'water') {
        p.vy += 80 * deltaTime; // Gravity
      }

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Periodically spawn ambient smoke from village chimneys
    if (Math.random() < 0.15) {
      for (let y = 0; y < this.grid.size; y++) {
        for (let x = 0; x < this.grid.size; x++) {
          const tile = this.grid.tiles[y][x];
          if (tile.isVillage && !tile.flooded && (tile.decor === 'house_1' || tile.decor === 'house_2' || tile.decor === 'church')) {
            const screen = this.grid.gridToScreen(x, y, tile.elevation, 0, 0, 0);
            this.particles.push({
              x: screen.x + (Math.random() * 4 - 2),
              y: screen.y - 28,
              vx: (Math.random() * 6 - 3),
              vy: -15 - Math.random() * 10,
              life: 1.2,
              maxLife: 1.2,
              color: 'rgba(226, 232, 240, 0.7)',
              size: 2.5 + Math.random() * 1.5,
              type: 'smoke'
            });
          }
        }
      }
    }

    // Spawn bubbles/froth at source
    if (Math.random() < 0.3) {
      for (let y = 0; y < this.grid.size; y++) {
        for (let x = 0; x < this.grid.size; x++) {
          const tile = this.grid.tiles[y][x];
          if (tile.isSource) {
            const screen = this.grid.gridToScreen(x, y, tile.elevation, tile.waterLevel, 0, 0);
            this.particles.push({
              x: screen.x + (Math.random() * 20 - 10),
              y: screen.y + (Math.random() * 10 - 5),
              vx: (Math.random() * 10 - 5),
              vy: -10 - Math.random() * 15,
              life: 0.6,
              maxLife: 0.6,
              color: 'rgba(186, 230, 253, 0.9)',
              size: 2 + Math.random() * 2,
              type: 'foam'
            });
          }
        }
      }
    }
  }

  // Master Render Loop
  public render(canvasWidth: number, canvasHeight: number) {
    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = false;

    // 1. Draw 16-Bit Sega Genesis Background Atmosphere
    this.drawBackground(canvasWidth, canvasHeight);

    // Compute origin to center the 10x10 isometric grid
    const originX = canvasWidth / 2;
    // Offset vertically to balance visual weight
    const originY = canvasHeight / 2 - (this.grid.size * this.grid.tileHeight) / 3;

    // 2. Render Terrain & Water Tiles (Painter's Algorithm from back to front: (x+y))
    const tilesToRender: Tile[] = [];
    for (let y = 0; y < this.grid.size; y++) {
      for (let x = 0; x < this.grid.size; x++) {
        tilesToRender.push(this.grid.tiles[y][x]);
      }
    }

    // Sort by depth (x + y), ties broken by x
    tilesToRender.sort((a, b) => {
      const depthA = a.x + a.y;
      const depthB = b.x + b.y;
      if (depthA !== depthB) return depthA - depthB;
      return a.x - b.x;
    });

    // Render each tile: Base Ground -> Water Volume -> Structures / Buildings / Decor
    for (const tile of tilesToRender) {
      this.drawTile(tile, originX, originY);
    }

    // 3. Draw Hover Cursor / Placement Preview
    if (this.hoveredTile && this.grid.isValid(this.hoveredTile.x, this.hoveredTile.y)) {
      this.drawHoverCursor(this.hoveredTile.x, this.hoveredTile.y, originX, originY);
    }

    // 4. Render Active Particles
    this.drawParticles(originX, originY);

    // 5. Draw 16-bit UI Overlays (Compass, Coordinates)
    this.drawCompass(canvasWidth, canvasHeight);
  }

  // Retro Backdrop Gradient & Grid Boundary Shadow
  private drawBackground(w: number, h: number) {
    const ctx = this.ctx;

    // Rich 16-bit Genesis night/dusk valley gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#090d16');
    bgGrad.addColorStop(0.5, '#0f172a');
    bgGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle pixel starfield/ambient backdrop grid
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let i = 0; i < 30; i++) {
      const sx = ((i * 73 + 19) % w);
      const sy = ((i * 47 + 11) % (h * 0.4));
      ctx.fillRect(sx, sy, 2, 2);
    }

    // Distant mountain silhouette
    ctx.fillStyle = '#0b1329';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.35);
    ctx.lineTo(w * 0.2, h * 0.2);
    ctx.lineTo(w * 0.45, h * 0.32);
    ctx.lineTo(w * 0.7, h * 0.18);
    ctx.lineTo(w, h * 0.3);
    ctx.lineTo(w, h * 0.5);
    ctx.lineTo(0, h * 0.5);
    ctx.closePath();
    ctx.fill();
  }

  // Draw an individual Isometric Tile
  private drawTile(tile: Tile, originX: number, originY: number) {
    const ctx = this.ctx;
    const { tileWidth, tileHeight, elevationHeight, waterStepHeight } = this.grid;
    const halfW = tileWidth / 2;
    const halfH = tileHeight / 2;

    const baseElevation = tile.elevation;
    const screen = this.grid.gridToScreen(tile.x, tile.y, baseElevation, 0, originX, originY);
    const cx = screen.x;
    const cy = screen.y;

    // 1. Draw Base Terrain Block (Ground Prism)
    const blockHeight = (baseElevation + 1) * elevationHeight;
    this.drawTerrainPrism(tile, cx, cy, halfW, halfH, blockHeight);

    // 2. Draw Water Volume if waterLevel > 0
    if (tile.waterLevel > 0) {
      this.drawWaterVolume(tile, cx, cy, halfW, halfH, waterStepHeight);
    }

    // 3. Draw Buildings / Structures
    if (tile.building === 'DAM') {
      this.drawSolidDam(tile, cx, cy, halfW, halfH);
    } else if (tile.building === 'GATE') {
      this.drawSluiceGate(tile, cx, cy, halfW, halfH);
    }

    // 4. Draw Specific Tile Decorations (Source spring, Village cottages, Trees, Rocks)
    if (tile.isSource) {
      this.drawSourceSpring(tile, cx, cy, halfW, halfH);
    } else if (tile.isVillage) {
      this.drawVillageBuildings(tile, cx, cy, halfW, halfH);
    } else if (tile.decor) {
      this.drawDecor(tile, cx, cy);
    }
  }

  // Draw Ground Isometric Prism
  private drawTerrainPrism(tile: Tile, cx: number, cy: number, halfW: number, halfH: number, blockHeight: number) {
    const ctx = this.ctx;

    // Palette selection by terrain type
    let topColor = '#3ca32e';   // Grass Green
    let topHighlight = '#56c244';
    let leftFaceColor = '#1a4e14';
    let rightFaceColor = '#246e1c';
    let strokeColor = '#14380f';

    if (tile.type === 'RIVER_BED') {
      topColor = '#87582d';     // Mud / Clay
      topHighlight = '#a4713e';
      leftFaceColor = '#4e3218';
      rightFaceColor = '#684422';
      strokeColor = '#331f0d';
    } else if (tile.type === 'CLIFF') {
      topColor = '#64748b';     // Stone Slate
      topHighlight = '#94a3b8';
      leftFaceColor = '#334155';
      rightFaceColor = '#475569';
      strokeColor = '#1e293b';
    } else if (tile.isVillage) {
      topColor = tile.flooded ? '#334155' : '#4a7c36'; // Village cobblestone/lawn
      topHighlight = '#689d50';
      leftFaceColor = '#223c16';
      rightFaceColor = '#315520';
      strokeColor = '#172c0e';
    }

    // Left Side Face (Shadow)
    ctx.fillStyle = leftFaceColor;
    ctx.beginPath();
    ctx.moveTo(cx - halfW, cy);
    ctx.lineTo(cx, cy + halfH);
    ctx.lineTo(cx, cy + halfH + blockHeight);
    ctx.lineTo(cx - halfW, cy + blockHeight);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Right Side Face (Illuminated)
    ctx.fillStyle = rightFaceColor;
    ctx.beginPath();
    ctx.moveTo(cx, cy + halfH);
    ctx.lineTo(cx + halfW, cy);
    ctx.lineTo(cx + halfW, cy + blockHeight);
    ctx.lineTo(cx, cy + halfH + blockHeight);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Top Diamond Face
    ctx.fillStyle = topColor;
    ctx.beginPath();
    ctx.moveTo(cx, cy - halfH);
    ctx.lineTo(cx + halfW, cy);
    ctx.lineTo(cx, cy + halfH);
    ctx.lineTo(cx - halfW, cy);
    ctx.closePath();
    ctx.fill();

    // Subtle 16-bit texture / pixel dithering on top face
    ctx.fillStyle = topHighlight;
    ctx.fillRect(cx - 8, cy - 2, 3, 2);
    ctx.fillRect(cx + 4, cy - 6, 2, 2);
    ctx.fillRect(cx - 2, cy + 3, 3, 2);

    if (this.showGridLines) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // Draw Dynamic Water Volume (Slab with rising height)
  private drawWaterVolume(tile: Tile, cx: number, cy: number, halfW: number, halfH: number, waterStepHeight: number) {
    const ctx = this.ctx;
    const waterDepthH = tile.waterLevel * waterStepHeight;
    const waterTopY = cy - waterDepthH;

    // Animated gentle water shimmer offset (halved amplitude for natural fluid look)
    const waveShift = Math.sin(this.animTime * 2 + (tile.x + tile.y) * 0.8) * 0.75;

    // Water Left Face (Translucent deep blue shadow)
    ctx.fillStyle = 'rgba(15, 56, 129, 0.85)';
    ctx.beginPath();
    ctx.moveTo(cx - halfW, waterTopY + waveShift);
    ctx.lineTo(cx, waterTopY + halfH + waveShift);
    ctx.lineTo(cx, cy + halfH);
    ctx.lineTo(cx - halfW, cy);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(29, 78, 216, 0.6)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Water Right Face (Translucent bright ocean blue)
    ctx.fillStyle = 'rgba(29, 78, 216, 0.85)';
    ctx.beginPath();
    ctx.moveTo(cx, waterTopY + halfH + waveShift);
    ctx.lineTo(cx + halfW, waterTopY + waveShift);
    ctx.lineTo(cx + halfW, cy);
    ctx.lineTo(cx, cy + halfH);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Water Top Diamond (Reflective bright cyan with waves)
    const waterTopGrad = ctx.createLinearGradient(cx - halfW, waterTopY - halfH, cx + halfW, waterTopY + halfH);
    waterTopGrad.addColorStop(0, 'rgba(56, 189, 248, 0.9)');
    waterTopGrad.addColorStop(0.5, 'rgba(29, 78, 216, 0.85)');
    waterTopGrad.addColorStop(1, 'rgba(14, 165, 233, 0.9)');

    ctx.fillStyle = waterTopGrad;
    ctx.beginPath();
    ctx.moveTo(cx, waterTopY - halfH + waveShift);
    ctx.lineTo(cx + halfW, waterTopY + waveShift);
    ctx.lineTo(cx, waterTopY + halfH + waveShift);
    ctx.lineTo(cx - halfW, waterTopY + waveShift);
    ctx.closePath();
    ctx.fill();

    // Sparkling foam wave ripples on surface
    ctx.fillStyle = 'rgba(224, 242, 254, 0.85)';
    const ripX = cx + Math.sin(this.animTime * 3 + tile.x) * 6;
    const ripY = waterTopY + waveShift + Math.cos(this.animTime * 3 + tile.y) * 2;
    ctx.fillRect(ripX - 6, ripY - 1, 12, 2);
    ctx.fillRect(ripX - 2, ripY - 4, 6, 2);

    // Water level depth indicator bar on side if waterLevel >= 1
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(cx - 2, waterTopY + halfH + waveShift - 4, 4, 3);
  }

  // Draw Solid Concrete Dam with Hazard Stripes & Steel Bracing
  private drawSolidDam(tile: Tile, cx: number, cy: number, halfW: number, halfH: number) {
    const ctx = this.ctx;
    const damHeight = 32;
    const topY = cy - damHeight;

    // Concrete Dam Left Face
    ctx.fillStyle = '#52525b';
    ctx.beginPath();
    ctx.moveTo(cx - halfW, topY);
    ctx.lineTo(cx, topY + halfH);
    ctx.lineTo(cx, cy + halfH);
    ctx.lineTo(cx - halfW, cy);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Concrete Dam Right Face
    ctx.fillStyle = '#71717a';
    ctx.beginPath();
    ctx.moveTo(cx, topY + halfH);
    ctx.lineTo(cx + halfW, topY);
    ctx.lineTo(cx + halfW, cy);
    ctx.lineTo(cx, cy + halfH);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Concrete Dam Top Diamond
    ctx.fillStyle = '#a1a1aa';
    ctx.beginPath();
    ctx.moveTo(cx, topY - halfH);
    ctx.lineTo(cx + halfW, topY);
    ctx.lineTo(cx, topY + halfH);
    ctx.lineTo(cx - halfW, topY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Steel Crest Railing on Top
    ctx.strokeStyle = '#3f3f46';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - halfW + 6, topY - 4);
    ctx.lineTo(cx, topY + halfH - 4);
    ctx.lineTo(cx + halfW - 6, topY - 4);
    ctx.stroke();
  }

  // Draw Sluice Gate (Open or Closed with visual state & lights)
  private drawSluiceGate(tile: Tile, cx: number, cy: number, halfW: number, halfH: number) {
    const ctx = this.ctx;
    const frameHeight = 36;
    const topY = cy - frameHeight;

    // Twin Steel Pillars
    ctx.fillStyle = '#334155';
    // Left Pillar
    ctx.fillRect(cx - halfW + 4, topY - 2, 6, frameHeight + halfH);
    // Right Pillar
    ctx.fillRect(cx + halfW - 10, topY - 2, 6, frameHeight + halfH);
    // Center Beam
    ctx.fillStyle = '#475569';
    ctx.fillRect(cx - halfW + 4, topY - 6, tileWidthW(halfW), 7);

    // Sluice Gate Blade (Raised if OPEN, Lowered if CLOSED)
    const isOpen = tile.gateOpen;
    const bladeOffset = isOpen ? -18 : 2; // Lifted up when open
    const bladeY = cy - 20 + bladeOffset;

    // Sluice Blade
    ctx.fillStyle = isOpen ? '#22c55e' : '#ef4444';
    ctx.beginPath();
    ctx.moveTo(cx - halfW + 10, bladeY);
    ctx.lineTo(cx + halfW - 10, bladeY);
    ctx.lineTo(cx + halfW - 10, bladeY + 16);
    ctx.lineTo(cx - halfW + 10, bladeY + 16);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Sluice Blade Grips / Grate
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(cx - 8, bladeY + 4, 16, 2);
    ctx.fillRect(cx - 8, bladeY + 9, 16, 2);

    // Gate Status Indicator LED at top beam
    const ledColor = isOpen ? '#4ade80' : '#f87171';
    ctx.fillStyle = ledColor;
    ctx.beginPath();
    ctx.arc(cx, topY - 2, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Glow aura for LED
    ctx.fillStyle = isOpen ? 'rgba(74, 222, 128, 0.4)' : 'rgba(248, 113, 113, 0.4)';
    ctx.beginPath();
    ctx.arc(cx, topY - 2, 7, 0, Math.PI * 2);
    ctx.fill();

    // Text Label "OPEN" / "LOCK"
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(isOpen ? 'OPEN' : 'GATE', cx, topY - 10);
  }

  // Draw Mountain Water Source at (0,0)
  private drawSourceSpring(tile: Tile, cx: number, cy: number, halfW: number, halfH: number) {
    const ctx = this.ctx;
    // Rocky cave/grotto with water spring
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(cx, cy - 8, 14, Math.PI, 0);
    ctx.lineTo(cx + 14, cy + 4);
    ctx.lineTo(cx - 14, cy + 4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Dark cave mouth
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.ellipse(cx, cy - 2, 9, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pulsing Crystal Surge / Water Gush
    const surge = Math.sin(this.animTime * 6) * 3;
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 2, 7 + surge * 0.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Source Label
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'center';
    ctx.fillText('SOURCE', cx, cy - 22);
  }

  // Draw 16-bit Isometric Village Cottages, Cathedral, & Flashing Hazard Beacons if flooded
  private drawVillageBuildings(tile: Tile, cx: number, cy: number, halfW: number, halfH: number) {
    const ctx = this.ctx;

    if (tile.decor === 'church') {
      // 3D Isometric Cathedral / Church with Bell Tower & Spire
      const bY = cy - 2;

      // 1. Church Nave - Left Face (Stone Masonry)
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(cx - 18, bY - 2);
      ctx.lineTo(cx, bY + 7);
      ctx.lineTo(cx, bY - 14);
      ctx.lineTo(cx - 18, bY - 23);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Buttresses on left face
      ctx.fillStyle = '#334155';
      ctx.fillRect(cx - 14, bY - 10, 3, 12);
      ctx.fillRect(cx - 6, bY - 5, 3, 12);

      // 2. Church Nave - Right Face (Sunlit Stone)
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.moveTo(cx, bY + 7);
      ctx.lineTo(cx + 18, bY - 2);
      ctx.lineTo(cx + 18, bY - 23);
      ctx.lineTo(cx, bY - 14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Main Arched Portal on Right Face
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(cx + 8, bY - 2, 4, Math.PI, 0);
      ctx.lineTo(cx + 12, bY + 5);
      ctx.lineTo(cx + 4, bY + 5);
      ctx.closePath();
      ctx.fill();

      // Wooden Arch Door
      ctx.fillStyle = '#78350f';
      ctx.fillRect(cx + 5, bY - 1, 6, 6);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(cx + 6, bY + 2, 1, 1); // brass knob

      // Stained Glass Rose Window on Nave Gable
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(cx + 8, bY - 12, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(cx + 6, bY - 14, 2, 2);
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(cx + 8, bY - 14, 2, 2);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(cx + 7, bY - 12, 2, 2);

      // 3. Nave Roof Slopes
      // Left Roof
      ctx.fillStyle = '#7f1d1d';
      ctx.beginPath();
      ctx.moveTo(cx - 20, bY - 21);
      ctx.lineTo(cx - 2, bY - 32);
      ctx.lineTo(cx - 2, bY - 16);
      ctx.lineTo(cx - 20, bY - 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Right Roof
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.moveTo(cx - 2, bY - 32);
      ctx.lineTo(cx + 20, bY - 21);
      ctx.lineTo(cx + 20, bY - 5);
      ctx.lineTo(cx - 2, bY - 16);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 4. Tall Square Bell Tower (Left Rear)
      const tX = cx - 12;
      const tY = bY - 22;

      // Tower Left Face
      ctx.fillStyle = '#334155';
      ctx.fillRect(tX - 6, tY - 18, 6, 20);
      ctx.strokeRect(tX - 6, tY - 18, 6, 20);

      // Tower Right Face
      ctx.fillStyle = '#475569';
      ctx.fillRect(tX, tY - 18, 6, 20);
      ctx.strokeRect(tX, tY - 18, 6, 20);

      // Belfry Arches & Bell
      ctx.fillStyle = '#090d16';
      ctx.fillRect(tX - 4, tY - 14, 3, 6);
      ctx.fillRect(tX + 2, tY - 14, 3, 6);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(tX + 3, tY - 12, 2, 3); // Gold bell

      // Steep Pyramid Spire on Bell Tower
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(tX - 7, tY - 18);
      ctx.lineTo(tX, tY - 34);
      ctx.lineTo(tX, tY - 18);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(tX, tY - 34);
      ctx.lineTo(tX + 7, tY - 18);
      ctx.lineTo(tX, tY - 18);
      ctx.closePath();
      ctx.fill();

      // Golden Cathedral Cross
      ctx.fillStyle = '#facc15';
      ctx.fillRect(tX - 1, tY - 41, 2, 8);
      ctx.fillRect(tX - 4, tY - 38, 8, 2);

    } else if (tile.decor === 'mill') {
      // 3D Isometric Windmill / Watermill
      const mY = cy;

      // Mill Base (Stone Cylinder / Octagon)
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(cx - 10, mY - 2);
      ctx.lineTo(cx, mY + 5);
      ctx.lineTo(cx, mY - 18);
      ctx.lineTo(cx - 8, mY - 22);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.moveTo(cx, mY + 5);
      ctx.lineTo(cx + 10, mY - 2);
      ctx.lineTo(cx + 8, mY - 22);
      ctx.lineTo(cx, mY - 18);
      ctx.closePath();
      ctx.fill();

      // Mill Conical Cap
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.moveTo(cx - 10, mY - 22);
      ctx.lineTo(cx, mY - 32);
      ctx.lineTo(cx + 10, mY - 22);
      ctx.closePath();
      ctx.fill();

      // Rotating 4-Blade Sails
      const hubX = cx;
      const hubY = mY - 24;
      const angle = this.animTime * 2.5;

      ctx.save();
      ctx.translate(hubX, hubY);
      ctx.rotate(angle);

      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2;
      ctx.fillStyle = 'rgba(254, 240, 138, 0.9)';

      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(16, 0);
        ctx.stroke();

        ctx.fillRect(4, 1, 11, 4);
        ctx.rotate(Math.PI / 2);
      }

      // Hub pin
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

    } else {
      // 3D Isometric Village Cottage (house_1 or house_2)
      const bY = cy + 2;
      const isHouse1 = (tile.decor === 'house_1');

      const wallColorLeft = isHouse1 ? '#d97706' : '#c2410c'; // Shaded timber
      const wallColorRight = isHouse1 ? '#fef08a' : '#fed7aa'; // Lit plaster
      const roofLeft = isHouse1 ? '#991b1b' : '#7f1d1d'; // Shaded terracotta
      const roofRight = isHouse1 ? '#dc2626' : '#ea580c'; // Lit terracotta

      // 1. Stone Foundation
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(cx - 16, bY - 2);
      ctx.lineTo(cx, bY + 6);
      ctx.lineTo(cx + 16, bY - 2);
      ctx.lineTo(cx + 16, bY - 5);
      ctx.lineTo(cx, bY + 3);
      ctx.lineTo(cx - 16, bY - 5);
      ctx.closePath();
      ctx.fill();

      // 2. Left Wall Face (Timber frame with door)
      ctx.fillStyle = wallColorLeft;
      ctx.beginPath();
      ctx.moveTo(cx - 16, bY - 5);
      ctx.lineTo(cx, bY + 3);
      ctx.lineTo(cx, bY - 12);
      ctx.lineTo(cx - 16, bY - 20);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Timber beams on left wall
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - 16, bY - 5);
      ctx.lineTo(cx - 16, bY - 20);
      ctx.moveTo(cx - 8, bY - 1);
      ctx.lineTo(cx - 8, bY - 16);
      ctx.stroke();

      // Wooden Cottage Door
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.moveTo(cx - 13, bY - 4);
      ctx.lineTo(cx - 7, bY - 1);
      ctx.lineTo(cx - 7, bY - 10);
      ctx.lineTo(cx - 13, bY - 13);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#facc15'; // Brass doorknob
      ctx.fillRect(cx - 9, bY - 6, 1.5, 1.5);

      // Cobblestone Doorstep
      ctx.fillStyle = '#64748b';
      ctx.fillRect(cx - 12, bY - 3, 5, 2);

      // 3. Right Wall Face (Sunny plaster with window)
      ctx.fillStyle = wallColorRight;
      ctx.beginPath();
      ctx.moveTo(cx, bY + 3);
      ctx.lineTo(cx + 16, bY - 5);
      ctx.lineTo(cx + 16, bY - 20);
      ctx.lineTo(cx, bY - 12);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Cross-timber diagonal beam
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx + 16, bY - 5);
      ctx.lineTo(cx, bY - 12);
      ctx.stroke();

      // Cozy Glowing Leaded Window
      ctx.fillStyle = '#854d0e';
      ctx.fillRect(cx + 5, bY - 10, 7, 7);
      ctx.fillStyle = '#fef08a'; // Warm amber glass
      ctx.fillRect(cx + 6, bY - 9, 5, 5);
      ctx.fillStyle = '#92400e'; // Window frame cross
      ctx.fillRect(cx + 8, bY - 9, 1, 5);
      ctx.fillRect(cx + 6, bY - 7, 5, 1);

      // Window Flower Box (Red/Pink flowers)
      ctx.fillStyle = '#78350f';
      ctx.fillRect(cx + 4, bY - 3, 9, 2);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(cx + 5, bY - 4, 2, 2);
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(cx + 8, bY - 4, 2, 2);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(cx + 10, bY - 4, 2, 2);

      // 4. Isometric Pitched Roof
      // Shaded Left Roof Slope
      ctx.fillStyle = roofLeft;
      ctx.beginPath();
      ctx.moveTo(cx - 18, bY - 18);
      ctx.lineTo(cx, bY - 28);
      ctx.lineTo(cx, bY - 12);
      ctx.lineTo(cx - 18, bY - 2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Tile texture ridges on left roof
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.beginPath();
      ctx.moveTo(cx - 12, bY - 15);
      ctx.lineTo(cx - 12, bY - 5);
      ctx.moveTo(cx - 6, bY - 21);
      ctx.lineTo(cx - 6, bY - 9);
      ctx.stroke();

      // Lit Right Roof Slope
      ctx.fillStyle = roofRight;
      ctx.beginPath();
      ctx.moveTo(cx, bY - 28);
      ctx.lineTo(cx + 18, bY - 18);
      ctx.lineTo(cx + 18, bY - 2);
      ctx.lineTo(cx, bY - 12);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#7f1d1d';
      ctx.stroke();

      // Roof Ridge Cresting
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, bY - 28);
      ctx.lineTo(cx, bY - 12);
      ctx.stroke();

      // 5. Red Brick Chimney & Animated Smoke (Only 1 designated cottage produces cozy smoke)
      const chimX = cx - 8;
      const chimY = bY - 26;

      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(chimX, chimY, 5, 8);
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(chimX + 1, chimY + 1, 3, 2);
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(chimX, chimY, 5, 8);

      // Rising Pixel Smoke Puffs only from house_1
      if (tile.decor === 'house_1') {
        const smokeOffset = (this.animTime * 1.5) % 3;
        for (let s = 0; s < 3; s++) {
          const pAge = (smokeOffset + s) % 3;
          const pY = chimY - 3 - pAge * 6;
          const pX = chimX + 2 + Math.sin(this.animTime * 2 + s) * 2;
          const pR = 1.2 + pAge * 0.7;
          const alpha = Math.max(0, 0.6 - pAge * 0.18);

          ctx.fillStyle = `rgba(241, 245, 249, ${alpha})`;
          ctx.beginPath();
          ctx.arc(pX, pY, pR, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // If Flooded: Draw Flashing Warning Alarm & Flood Water Effect
    if (tile.flooded) {
      const flash = Math.sin(this.animTime * 8) > 0;
      ctx.fillStyle = flash ? 'rgba(239, 68, 68, 0.6)' : 'rgba(239, 68, 68, 0.2)';
      ctx.beginPath();
      ctx.arc(cx, cy - 10, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillStyle = '#ef4444';
      ctx.textAlign = 'center';
      ctx.fillText('FLOOD!', cx, cy - 38);
    }
  }

  // Draw Environmental Decorations (Lush Trees, Boulders, Wildflower Patches)
  private drawDecor(tile: Tile, cx: number, cy: number) {
    const ctx = this.ctx;

    if (tile.decor === 'tree') {
      // 16-bit Lush Multi-Layer Pine / Evergreen
      const treeY = cy + 2;

      // Tree Trunk
      ctx.fillStyle = '#451a03';
      ctx.fillRect(cx - 2, treeY - 8, 4, 10);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(cx - 1, treeY - 8, 2, 10);

      // Bottom Foliage Layer
      ctx.fillStyle = '#14532d'; // Shadow green
      ctx.beginPath();
      ctx.moveTo(cx - 11, treeY - 6);
      ctx.lineTo(cx, treeY - 18);
      ctx.lineTo(cx + 11, treeY - 6);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#16a34a'; // Sunny green highlight
      ctx.beginPath();
      ctx.moveTo(cx - 1, treeY - 18);
      ctx.lineTo(cx + 11, treeY - 6);
      ctx.lineTo(cx, treeY - 6);
      ctx.closePath();
      ctx.fill();

      // Middle Foliage Layer
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.moveTo(cx - 8, treeY - 14);
      ctx.lineTo(cx, treeY - 25);
      ctx.lineTo(cx + 8, treeY - 14);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.moveTo(cx - 1, treeY - 25);
      ctx.lineTo(cx + 8, treeY - 14);
      ctx.lineTo(cx, treeY - 14);
      ctx.closePath();
      ctx.fill();

      // Top Crown Layer
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.moveTo(cx - 5, treeY - 22);
      ctx.lineTo(cx, treeY - 32);
      ctx.lineTo(cx + 5, treeY - 22);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.moveTo(cx, treeY - 32);
      ctx.lineTo(cx + 5, treeY - 22);
      ctx.lineTo(cx, treeY - 22);
      ctx.closePath();
      ctx.fill();

    } else if (tile.decor === 'rock') {
      // Natural Granite Boulder
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 1, 9, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.ellipse(cx - 1, cy - 2, 7, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(cx - 4, cy - 4, 4, 2);
      ctx.fillRect(cx - 1, cy - 5, 3, 2);

    } else if (tile.decor === 'flowers') {
      // Wildflower Meadow
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(cx - 6, cy - 2, 2, 2);
      ctx.fillRect(cx - 5, cy - 3, 2, 2);

      ctx.fillStyle = '#facc15';
      ctx.fillRect(cx + 3, cy - 4, 2, 2);
      ctx.fillRect(cx + 4, cy - 5, 2, 2);

      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(cx - 1, cy + 2, 2, 2);

      ctx.fillStyle = '#ec4899';
      ctx.fillRect(cx + 5, cy + 1, 2, 2);
    }
  }

  // Draw Hover Cursor Highlight and Ghost Placement Preview
  private drawHoverCursor(x: number, y: number, originX: number, originY: number) {
    const ctx = this.ctx;
    const tile = this.grid.getTile(x, y);
    if (!tile) return;

    const { tileWidth, tileHeight } = this.grid;
    const halfW = tileWidth / 2;
    const halfH = tileHeight / 2;
    const screen = this.grid.gridToScreen(x, y, tile.elevation, tile.waterLevel, originX, originY);
    const cx = screen.x;
    const cy = screen.y;

    // Hover Diamond Indicator
    let strokeColor = '#38bdf8';
    let fillColor = 'rgba(56, 189, 248, 0.25)';

    if (this.activeTool === 'DELETE') {
      strokeColor = '#ef4444';
      fillColor = 'rgba(239, 68, 68, 0.3)';
    } else if (tile.isSource || tile.isVillage) {
      strokeColor = '#eab308'; // Protected
      fillColor = 'rgba(234, 179, 8, 0.2)';
    }

    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = fillColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 2]);

    ctx.beginPath();
    ctx.moveTo(cx, cy - halfH);
    ctx.lineTo(cx + halfW, cy);
    ctx.lineTo(cx, cy + halfH);
    ctx.lineTo(cx - halfW, cy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash

    // Ghost Placement Preview
    if (this.activeTool === 'DAM' && tile.building === 'NONE' && !tile.isSource && !tile.isVillage) {
      ctx.globalAlpha = 0.5;
      this.drawSolidDam(tile, cx, cy, halfW, halfH);
      ctx.globalAlpha = 1.0;
    } else if (this.activeTool === 'GATE' && tile.building === 'NONE' && !tile.isSource && !tile.isVillage) {
      ctx.globalAlpha = 0.5;
      this.drawSluiceGate({ ...tile, gateOpen: false }, cx, cy, halfW, halfH);
      ctx.globalAlpha = 1.0;
    }
  }

  // Draw Animated Particles
  private drawParticles(originX: number, originY: number) {
    const ctx = this.ctx;
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = alpha;

      ctx.beginPath();
      ctx.arc(originX + p.x, originY + p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
  }

  // Draw 16-Bit Compass & Coordinate Guide
  private drawCompass(w: number, h: number) {
    const ctx = this.ctx;
    // Top-left 16-bit Compass Badge
    ctx.save();
    ctx.translate(24, 24);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(0, 0, 80, 48, 6);
    ctx.fill();
    ctx.stroke();

    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'left';
    ctx.fillText('SEGA-16', 8, 16);

    ctx.fillStyle = '#38bdf8';
    ctx.fillText('GRID 10x10', 8, 30);

    ctx.fillStyle = '#22c55e';
    ctx.fillText('ISOMETRIC', 8, 42);

    ctx.restore();
  }
}

function tileWidthW(halfW: number) {
  return (halfW - 4) * 2;
}
