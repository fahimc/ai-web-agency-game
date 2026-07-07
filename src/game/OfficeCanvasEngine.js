import { employeeList } from '../data/employees.js';

const WORLD = { width: 1800, height: 1340 };
const GRID = { marginX: 150, marginY: 130, cellX: 135, cellY: 145 };
const CHARACTER_SCALE = 5.2;
const DESK_SCALE = 2.35;
const DESK_SIZE = { width: 92 * DESK_SCALE, height: 101 * DESK_SCALE };
const CHARACTER_SIZE = { width: 20 * CHARACTER_SCALE, height: 32 * CHARACTER_SCALE };
const DESK_BASE_OFFSET_Y = -28;
const DESK_SURFACE_OFFSET_Y = DESK_BASE_OFFSET_Y + 42 * DESK_SCALE;
const ACTOR_HOME_OFFSET_Y = DESK_SURFACE_OFFSET_Y - CHARACTER_SIZE.height;

function gridToWorld(column, row, offsetX = 0, offsetY = 0) {
  return {
    x: GRID.marginX + column * GRID.cellX + offsetX,
    y: GRID.marginY + row * GRID.cellY + offsetY,
  };
}

export const DESK_POSITIONS = {
  reception: gridToWorld(1, 2),
  director: gridToWorld(5, 2, 8, -10),
  pm: gridToWorld(9, 2),
  design: gridToWorld(2, 5),
  dev: gridToWorld(5, 5, 8, 20),
  qa: gridToWorld(5, 7, 8, -12),
};

const OUTPUT_OWNERS = {
  Plan: 'director',
  TaskBoard: 'pm',
  DesignDirection: 'design',
  WebsiteHTML: 'dev',
  QAReport: 'qa',
  ProjectPDF: 'qa',
};

export class OfficeCanvasEngine {
  constructor(host) {
    this.host = host;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.floorTile = makeFloorTile();
    this.host.appendChild(this.canvas);
    this.camera = { x: 0, y: 0, zoom: 0.72, targetX: 0, targetY: 0, targetZoom: 0.72 };
    this.minZoom = 0.45;
    this.maxZoom = 1.35;
    this.latestState = null;
    this.activeEmployee = 'reception';
    this.previousActive = null;
    this.drag = null;
    this.pointer = { x: 0, y: 0 };
    this.actors = new Map();
    employeeList.forEach((employee) => {
      const home = DESK_POSITIONS[employee.id];
      this.actors.set(employee.id, {
        employee,
        home,
        x: home.x - CHARACTER_SIZE.width / 2,
        y: home.y + ACTOR_HOME_OFFSET_Y,
        dir: 'down',
        frame: 0,
        frameTimer: 0,
        moving: false,
        path: [],
        hold: 0,
      });
    });
    this.bindEvents();
    this.resize();
    this.focusEmployee('reception', true);
    this.running = true;
    this.lastTime = performance.now();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  destroy() {
    this.running = false;
    window.removeEventListener('resize', this._resize);
    this.canvas.removeEventListener('pointerdown', this._pointerDown);
    window.removeEventListener('pointermove', this._pointerMove);
    window.removeEventListener('pointerup', this._pointerUp);
    this.canvas.removeEventListener('wheel', this._wheel);
    this.canvas.remove();
  }

  bindEvents() {
    this._resize = () => this.resize();
    this._pointerDown = (event) => {
      this.canvas.setPointerCapture?.(event.pointerId);
      this.drag = {
        startX: event.clientX,
        startY: event.clientY,
        cameraX: this.camera.x,
        cameraY: this.camera.y,
        moved: false,
      };
    };
    this._pointerMove = (event) => {
      const rect = this.canvas.getBoundingClientRect();
      this.pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      if (!this.drag) return;
      const dx = event.clientX - this.drag.startX;
      const dy = event.clientY - this.drag.startY;
      if (Math.abs(dx) + Math.abs(dy) > 4) this.drag.moved = true;
      this.camera.x = this.clampCameraX(this.drag.cameraX - dx / this.camera.zoom);
      this.camera.y = this.clampCameraY(this.drag.cameraY - dy / this.camera.zoom);
      this.camera.targetX = this.camera.x;
      this.camera.targetY = this.camera.y;
    };
    this._pointerUp = (event) => {
      if (this.drag && !this.drag.moved) this.handleTap(event);
      this.drag = null;
    };
    this._wheel = (event) => {
      event.preventDefault();
      const next = clamp(this.camera.zoom + (event.deltaY > 0 ? -0.06 : 0.06), this.minZoom, this.maxZoom);
      this.camera.zoom = next;
      this.camera.targetZoom = next;
      this.camera.x = this.clampCameraX(this.camera.x);
      this.camera.y = this.clampCameraY(this.camera.y);
    };
    window.addEventListener('resize', this._resize);
    this.canvas.addEventListener('pointerdown', this._pointerDown);
    window.addEventListener('pointermove', this._pointerMove);
    window.addEventListener('pointerup', this._pointerUp);
    this.canvas.addEventListener('wheel', this._wheel, { passive: false });
  }

  resize(width, height) {
    const rect = this.host.getBoundingClientRect();
    this.width = Math.max(320, Math.floor(width || rect.width));
    this.height = Math.max(320, Math.floor(height || rect.height));
    const ratio = window.devicePixelRatio || 1;
    this.canvas.width = Math.floor(this.width * ratio);
    this.canvas.height = Math.floor(this.height * ratio);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const coverZoom = Math.max(this.width / WORLD.width, this.height / WORLD.height);
    const mobileBoost = this.width < 700 ? 1.35 : this.width < 1000 ? 1.15 : 1;
    this.minZoom = clamp(coverZoom * mobileBoost, 0.42, 1.05);
    this.maxZoom = Math.max(this.minZoom + 0.55, 1.35);
    const targetZoom = clamp(this.width < 700 ? 0.9 : this.width < 1000 ? 0.78 : 0.68, this.minZoom, this.maxZoom);
    this.camera.zoom = targetZoom;
    this.camera.targetZoom = targetZoom;
    this.focusEmployee(this.activeEmployee, true);
  }

  updateFromReact(state) {
    this.latestState = state;
    const nextActive = state.activeEmployee || 'reception';
    if (nextActive !== this.activeEmployee) {
      this.startHandover(this.activeEmployee, nextActive);
      this.previousActive = this.activeEmployee;
      this.activeEmployee = nextActive;
    }
    this.focusEmployee(nextActive);
  }

  startHandover(fromId, toId) {
    const from = this.actors.get(fromId);
    const to = this.actors.get(toId);
    if (!from || !to || fromId === toId) return;
    from.path = [
      { x: to.home.x - CHARACTER_SIZE.width - 22, y: to.home.y + ACTOR_HOME_OFFSET_Y, hold: 26 },
      { x: from.home.x - CHARACTER_SIZE.width / 2, y: from.home.y + ACTOR_HOME_OFFSET_Y, hold: 0 },
    ];
  }

  focusEmployee(id, instant = false) {
    const actor = this.actors.get(id) || this.actors.get('reception');
    if (!actor) return;
    const targetX = clamp(actor.home.x - (this.width / this.camera.targetZoom) / 2, 0, Math.max(0, WORLD.width - this.width / this.camera.targetZoom));
    const targetY = clamp(actor.home.y - 230 - (this.height / this.camera.targetZoom) / 2, 0, Math.max(0, WORLD.height - this.height / this.camera.targetZoom));
    this.camera.targetX = targetX;
    this.camera.targetY = targetY;
    if (instant) {
      this.camera.x = targetX;
      this.camera.y = targetY;
    }
  }

  getEmployeeScreenPosition(id) {
    const actor = this.actors.get(id) || this.actors.get('reception');
    if (!actor) return null;
    const anchorX = actor.x + CHARACTER_SIZE.width / 2;
    const anchorY = actor.y - 18;
    return this.worldToScreen(anchorX, anchorY);
  }

  handleTap(event) {
    const rect = this.canvas.getBoundingClientRect();
    const screen = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    const state = this.latestState || {};
    for (const [id, actor] of this.actors.entries()) {
      const marker = this.worldToScreen(actor.x + CHARACTER_SIZE.width + 38, actor.y - 12);
      if (state.running && id === state.activeEmployee && distance(screen, marker) < 34) {
        window.dispatchEvent(new CustomEvent('office-employee-inspect', { detail: { employeeId: id } }));
        return;
      }
    }
  }

  loop(now) {
    if (!this.running) return;
    const dt = Math.min(40, now - this.lastTime);
    this.lastTime = now;
    this.update(dt);
    this.draw();
    requestAnimationFrame(this.loop);
  }

  update(dt) {
    const ease = 0.12;
    this.camera.x += (this.camera.targetX - this.camera.x) * ease;
    this.camera.y += (this.camera.targetY - this.camera.y) * ease;
    this.camera.zoom += (this.camera.targetZoom - this.camera.zoom) * ease;
    this.actors.forEach((actor) => this.updateActor(actor, dt));
  }

  updateActor(actor, dt) {
    actor.moving = false;
    if (actor.hold > 0) {
      actor.hold -= 1;
      return;
    }
    const target = actor.path[0];
    if (!target) {
      actor.frame = 0;
      actor.frameTimer = 0;
      return;
    }
    const dx = target.x - actor.x;
    const dy = target.y - actor.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 3) {
      actor.x = target.x;
      actor.y = target.y;
      actor.path.shift();
      actor.hold = target.hold || 0;
      return;
    }
    const speed = 0.22 * dt;
    actor.x += (dx / dist) * speed;
    actor.y += (dy / dist) * speed;
    actor.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    actor.moving = true;
    actor.frameTimer += dt;
    if (actor.frameTimer > 130) {
      actor.frame = (actor.frame + 1) % 2;
      actor.frameTimer = 0;
    }
  }

  draw() {
    const ctx = this.ctx;
    this.frameCount = (this.frameCount || 0) + 1;
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.save();
    ctx.scale(this.camera.zoom, this.camera.zoom);
    ctx.translate(-this.camera.x, -this.camera.y);
    this.drawRoom(ctx);
    [...this.actors.values()].sort((a, b) => a.y - b.y).forEach((actor) => this.drawActor(ctx, actor));
    this.drawDesks(ctx);
    ctx.restore();
  }

  drawRoom(ctx) {
    const pattern = ctx.createPattern(this.floorTile, 'repeat');
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);
  }

  drawDesks(ctx) {
    const state = this.latestState || {};
    const done = new Set(Object.keys(state.outputs || {}).map((key) => OUTPUT_OWNERS[key]).filter(Boolean));
    employeeList.forEach((employee) => {
      const pos = DESK_POSITIONS[employee.id];
      const active = employee.id === state.activeEmployee;
      if (active) {
        ctx.fillStyle = 'rgba(112, 72, 255, 0.20)';
        ellipse(ctx, pos.x, pos.y + 16, 290, 210);
      }
      drawPixelDesk(ctx, pos.x - DESK_SIZE.width / 2, pos.y + DESK_BASE_OFFSET_Y, this.frameCount || 0, DESK_SCALE);
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff3d8';
      ctx.strokeStyle = '#2d1b12';
      ctx.lineWidth = 4;
      const label = `${employee.role}\n${employee.name.split(' ')[0]}`.split('\n');
      label.forEach((line, index) => {
        ctx.strokeText(line, pos.x, pos.y + 166 + index * 22);
        ctx.fillText(line, pos.x, pos.y + 166 + index * 22);
      });
      if (done.has(employee.id)) {
        ctx.fillStyle = '#33b76b';
        ctx.beginPath();
        ctx.arc(pos.x + 105, pos.y + 155, 16, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  drawActor(ctx, actor) {
    drawCharacter(ctx, actor.x, actor.y, actor.dir, actor.frame, actor.employee.shirt);
    const state = this.latestState || {};
    if (state.running && state.activeEmployee === actor.employee.id) {
      roundedRect(ctx, actor.x + CHARACTER_SIZE.width + 22, actor.y - 26, 34, 34, 10, '#7048ff');
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('?', actor.x + CHARACTER_SIZE.width + 39, actor.y - 2);
    }
  }

  worldToScreen(x, y) {
    return {
      x: (x - this.camera.x) * this.camera.zoom,
      y: (y - this.camera.y) * this.camera.zoom,
    };
  }

  clampCameraX(value) {
    return clamp(value, 0, Math.max(0, WORLD.width - this.width / this.camera.zoom));
  }

  clampCameraY(value) {
    return clamp(value, 0, Math.max(0, WORLD.height - this.height / this.camera.zoom));
  }
}

function drawCharacter(ctx, x, y, dir, frame, shirtColor = '#e93320') {
  const skin = '#f2c19b';
  const skinDark = '#d28c62';
  const hair = '#4a2a1c';
  const shirt = shirtColor;
  const shirtDark = shade(shirtColor, -35);
  const trousers = '#1495c8';
  const shoe = '#5b2f1d';
  const black = '#050505';
  const bob = frame === 1 ? 1 : 0;
  x = Math.round(x);
  y = Math.round(y + bob);

  pixelRect(ctx, x, y, 5, 29, 10, 2, 'rgba(0,0,0,0.18)', CHARACTER_SCALE);
  if (dir === 'right') {
    ctx.save();
    ctx.translate(x + 20 * CHARACTER_SCALE, y);
    ctx.scale(-1, 1);
    drawCharacter(ctx, 0, 0, 'left', frame, shirtColor);
    ctx.restore();
    return;
  }
  if (dir === 'up') {
    pixelRect(ctx, x, y, 5, 1, 10, 2, black, CHARACTER_SCALE);
    pixelRect(ctx, x, y, 3, 3, 14, 2, black, CHARACTER_SCALE);
    pixelRect(ctx, x, y, 2, 5, 16, 9, black, CHARACTER_SCALE);
    pixelRect(ctx, x, y, 4, 14, 12, 2, black, CHARACTER_SCALE);
    pixelRect(ctx, x, y, 5, 2, 10, 3, hair, CHARACTER_SCALE);
    pixelRect(ctx, x, y, 4, 5, 12, 9, hair, CHARACTER_SCALE);
    pixelRect(ctx, x, y, 3, 7, 14, 5, hair, CHARACTER_SCALE);
    pixelRect(ctx, x, y, 5, 12, 10, 3, skinDark, CHARACTER_SCALE);
    drawBody(ctx, x, y, skin, shirt, shirtDark, trousers, shoe, black, frame);
    return;
  }
  if (dir === 'left') {
    pixelRect(ctx, x, y, 5, 2, 10, 2, black, CHARACTER_SCALE);
    pixelRect(ctx, x, y, 3, 4, 13, 3, black, CHARACTER_SCALE);
    pixelRect(ctx, x, y, 2, 7, 15, 8, black, CHARACTER_SCALE);
    pixelRect(ctx, x, y, 5, 3, 9, 4, hair, CHARACTER_SCALE);
    pixelRect(ctx, x, y, 4, 6, 10, 6, hair, CHARACTER_SCALE);
    pixelRect(ctx, x, y, 10, 8, 6, 4, hair, CHARACTER_SCALE);
    pixelRect(ctx, x, y, 3, 8, 8, 7, skin, CHARACTER_SCALE);
    pixelRect(ctx, x, y, 4, 14, 6, 2, skin, CHARACTER_SCALE);
    pixelRect(ctx, x, y, 2, 10, 2, 3, skin, CHARACTER_SCALE);
    pixelRect(ctx, x, y, 4, 10, 1, 2, black, CHARACTER_SCALE);
    pixelRect(ctx, x, y, 6, 16, 9, 2, black, CHARACTER_SCALE);
    pixelRect(ctx, x, y, 5, 18, 10, 8, black, CHARACTER_SCALE);
    pixelRect(ctx, x, y, 7, 17, 7, 8, shirt, CHARACTER_SCALE);
    pixelRect(ctx, x, y, 10, 19, 4, 5, shirtDark, CHARACTER_SCALE);
    pixelRect(ctx, x, y, 3, 18, 3, 7, skin, CHARACTER_SCALE);
    pixelRect(ctx, x, y, 2, 20, 2, 4, black, CHARACTER_SCALE);
    pixelRect(ctx, x, y, 6, 25, 8, 4, trousers, CHARACTER_SCALE);
    pixelRect(ctx, x, y, frame === 0 ? 5 : 4, frame === 0 ? 29 : 28, 4, 3, shoe, CHARACTER_SCALE);
    pixelRect(ctx, x, y, frame === 0 ? 11 : 12, 29, 4, 3, shoe, CHARACTER_SCALE);
    return;
  }
  pixelRect(ctx, x, y, 5, 1, 10, 2, black, CHARACTER_SCALE);
  pixelRect(ctx, x, y, 3, 3, 14, 2, black, CHARACTER_SCALE);
  pixelRect(ctx, x, y, 2, 5, 16, 8, black, CHARACTER_SCALE);
  pixelRect(ctx, x, y, 3, 13, 14, 3, black, CHARACTER_SCALE);
  pixelRect(ctx, x, y, 5, 2, 10, 3, hair, CHARACTER_SCALE);
  pixelRect(ctx, x, y, 4, 5, 12, 4, hair, CHARACTER_SCALE);
  pixelRect(ctx, x, y, 3, 8, 3, 5, hair, CHARACTER_SCALE);
  pixelRect(ctx, x, y, 14, 8, 3, 5, hair, CHARACTER_SCALE);
  pixelRect(ctx, x, y, 6, 6, 8, 8, skin, CHARACTER_SCALE);
  pixelRect(ctx, x, y, 5, 10, 2, 4, skin, CHARACTER_SCALE);
  pixelRect(ctx, x, y, 13, 10, 2, 4, skin, CHARACTER_SCALE);
  pixelRect(ctx, x, y, 7, 13, 6, 2, skin, CHARACTER_SCALE);
  pixelRect(ctx, x, y, 1, 8, 3, 5, skin, CHARACTER_SCALE);
  pixelRect(ctx, x, y, 16, 8, 3, 5, skin, CHARACTER_SCALE);
  pixelRect(ctx, x, y, 6, 10, 1, 2, black, CHARACTER_SCALE);
  pixelRect(ctx, x, y, 13, 10, 1, 2, black, CHARACTER_SCALE);
  drawBody(ctx, x, y, skin, shirt, shirtDark, trousers, shoe, black, frame);
}

function drawPixelDesk(ctx, baseX, baseY, frame, scale = DESK_SCALE) {
  const black = '#050505';
  const woodDark = '#5b3030';
  const wood = '#8a4f4b';
  const woodLight = '#b47a66';
  const metal = '#9aa3ac';
  const metalLight = '#d5dce3';
  const screen = '#1b2440';
  const paper = '#eef1f4';
  const red = '#d93a32';
  const green = '#43c96b';
  const yellow = '#e4c742';
  const glow = frame % 60 < 30 ? '#6e7fac' : '#9daee0';
  const bookBob = frame % 80 < 40 ? 0 : -1;
  const deskSurfaceY = 42;

  const p = (x, y, w, h, color) => scaledPixelRect(ctx, baseX, baseY, x, y, w, h, color, scale);

  p(2, 41, 88, 2, black);
  p(0, 43, 92, 3, black);
  p(3, 43, 86, 2, woodLight);
  p(1, 46, 90, 3, woodDark);
  p(4, 47, 84, 1, wood);
  p(5, 49, 82, 2, black);
  p(8, 51, 74, 2, metalLight);

  p(7, 52, 2, 45, black);
  p(9, 52, 2, 45, metalLight);
  p(11, 52, 1, 45, black);
  p(56, 52, 2, 45, black);
  p(58, 52, 2, 45, metalLight);
  p(60, 52, 1, 45, black);
  p(11, 56, 47, 1, black);

  p(63, 51, 27, 46, black);
  p(65, 53, 23, 42, woodDark);
  p(66, 54, 21, 40, '#80505a');
  p(66, 58, 21, 2, black);
  p(68, 61, 17, 10, black);
  p(69, 62, 15, 8, metalLight);
  p(70, 63, 13, 2, '#cbd7e4');
  p(76, 66, 3, 1, black);
  p(67, 73, 19, 2, black);
  p(68, 77, 17, 11, black);
  p(69, 78, 15, 9, metalLight);
  p(70, 79, 13, 2, '#cbd7e4');
  p(76, 83, 3, 1, black);
  p(65, 94, 23, 2, black);

  const cupBottom = deskSurfaceY;
  const cupTop = cupBottom - 10;
  p(7, cupTop + 1, 1, 8, black);
  p(8, cupTop, 7, 1, black);
  p(8, cupTop + 1, 1, 8, black);
  p(14, cupTop + 1, 1, 8, black);
  p(8, cupBottom - 1, 7, 1, black);
  p(9, cupTop + 2, 5, 7, paper);
  p(14, cupTop + 3, 3, 4, black);
  p(15, cupTop + 4, 1, 2, paper);

  const laptopBaseBottom = deskSurfaceY;
  const laptopBaseTop = laptopBaseBottom - 3;
  const screenBottom = laptopBaseTop - 1;
  const screenTop = screenBottom - 21;
  p(28, screenTop, 28, 1, black);
  p(27, screenTop + 1, 1, 21, black);
  p(56, screenTop + 1, 1, 21, black);
  p(28, screenBottom, 28, 1, black);
  p(29, screenTop + 2, 26, 19, metalLight);
  p(30, screenTop + 3, 24, 17, screen);
  p(32, screenTop + 17, 2, 2, glow);
  p(34, screenTop + 15, 2, 2, glow);
  p(36, screenTop + 13, 2, 2, glow);
  p(38, screenTop + 11, 2, 2, glow);
  p(40, screenTop + 9, 2, 2, glow);
  p(42, screenTop + 7, 2, 2, glow);
  p(44, screenTop + 5, 2, 2, glow);
  p(36, screenTop + 17, 15, 1, '#354063');
  p(25, laptopBaseTop - 1, 34, 1, black);
  p(27, laptopBaseTop, 30, 1, metalLight);
  p(23, laptopBaseBottom - 1, 38, 2, black);
  p(28, laptopBaseTop, 16, 1, metal);

  const booksBottom = deskSurfaceY + bookBob;
  p(65, booksBottom - 5, 26, 4, red);
  p(65, booksBottom - 1, 26, 1, black);
  p(67, booksBottom - 10, 22, 4, green);
  p(67, booksBottom - 6, 22, 1, black);
  p(68, booksBottom - 15, 23, 4, yellow);
  p(68, booksBottom - 11, 23, 1, black);
  p(69, booksBottom - 17, 21, 2, black);
  p(3, 99, 88, 2, 'rgba(0,0,0,0.18)');
}

function drawBody(ctx, x, y, skin, shirt, _shirtDark, trousers, shoe, black, frame) {
  pixelRect(ctx, x, y, 5, 15, 10, 2, black, CHARACTER_SCALE);
  pixelRect(ctx, x, y, 4, 17, 12, 7, black, CHARACTER_SCALE);
  pixelRect(ctx, x, y, 6, 16, 8, 7, shirt, CHARACTER_SCALE);
  pixelRect(ctx, x, y, 5, 18, 10, 4, shirt, CHARACTER_SCALE);
  pixelRect(ctx, x, y, 2, 17, 3, 7, skin, CHARACTER_SCALE);
  pixelRect(ctx, x, y, 15, 17, 3, 7, skin, CHARACTER_SCALE);
  pixelRect(ctx, x, y, 1, 19, 2, 5, black, CHARACTER_SCALE);
  pixelRect(ctx, x, y, 17, 19, 2, 5, black, CHARACTER_SCALE);
  pixelRect(ctx, x, y, 5, 23, 10, 5, trousers, CHARACTER_SCALE);
  pixelRect(ctx, x, y, frame === 0 ? 5 : 4, 28, 4, 3, shoe, CHARACTER_SCALE);
  pixelRect(ctx, x, y, frame === 0 ? 11 : 12, 28, 4, 3, shoe, CHARACTER_SCALE);
}

function scaledPixelRect(ctx, baseX, baseY, x, y, w, h, color, scale) {
  ctx.fillStyle = color;
  ctx.fillRect(
    Math.round(baseX + x * scale),
    Math.round(baseY + y * scale),
    Math.round(w * scale),
    Math.round(h * scale),
  );
}

function pixelRect(ctx, baseX, baseY, x, y, w, h, color, scale = CHARACTER_SCALE) {
  ctx.fillStyle = color;
  ctx.fillRect(baseX + x * scale, baseY + y * scale, w * scale, h * scale);
}

function roundedRect(ctx, x, y, w, h, radius, fill, stroke, strokeWidth = 0) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke && strokeWidth) {
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
}

function ellipse(ctx, x, y, w, h) {
  ctx.beginPath();
  ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
}

function makeFloorTile() {
  const tile = document.createElement('canvas');
  const tileSize = 64;
  tile.width = tileSize;
  tile.height = tileSize;

  const t = tile.getContext('2d');
  t.imageSmoothingEnabled = false;

  t.fillStyle = '#8b5360';
  t.fillRect(0, 0, tileSize, tileSize);

  t.fillStyle = '#965c68';
  t.fillRect(0, 0, tileSize, 28);

  t.fillStyle = '#814b58';
  t.fillRect(0, 28, tileSize, 4);

  t.fillStyle = '#8f5662';
  t.fillRect(0, 32, tileSize, 28);

  t.fillStyle = '#73424d';
  t.fillRect(0, 60, tileSize, 4);

  t.fillStyle = '#a36973';
  t.fillRect(0, 4, tileSize, 3);
  t.fillRect(0, 36, tileSize, 3);

  t.fillStyle = '#6f3f49';
  t.fillRect(0, 26, tileSize, 2);
  t.fillRect(0, 58, tileSize, 2);

  t.fillStyle = '#6b3c46';
  t.fillRect(30, 0, 3, 28);
  t.fillRect(62, 32, 2, 28);
  t.fillRect(0, 32, 2, 28);

  t.fillStyle = 'rgba(0, 0, 0, 0.12)';
  t.fillRect(10, 12, 8, 2);
  t.fillRect(42, 44, 10, 2);

  t.fillStyle = 'rgba(255, 255, 255, 0.08)';
  t.fillRect(22, 7, 12, 2);
  t.fillRect(8, 39, 14, 2);

  return tile;
}

function shade(hex, amount) {
  const value = Number.parseInt(hex.replace('#', ''), 16);
  const r = clamp((value >> 16) + amount, 0, 255);
  const g = clamp(((value >> 8) & 255) + amount, 0, 255);
  const b = clamp((value & 255) + amount, 0, 255);
  return `rgb(${r}, ${g}, ${b})`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export { WORLD };
