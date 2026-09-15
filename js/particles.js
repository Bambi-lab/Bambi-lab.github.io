(function () {
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let stars = [];
  let bursts = [];
  let width = 0;
  let height = 0;
  let dpr = 1;
  let tone = 0;

  function resizeField() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(560, Math.max(150, Math.round((width * height) / 2600)));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.05 + .12,
      a: Math.random() * .62 + .15,
      v: Math.random() * .045 + .012,
      phase: Math.random() * Math.PI * 2
    }));
  }

  function burst(x, y, palette, amount) {
    const count = amount || 46;
    const warm = palette === 'warm' || palette === 'celebration';
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (palette === 'celebration' ? 1.5 : .45) + Math.random() * (palette === 'celebration' ? 5.2 : 1.8);
      bursts.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: .008 + Math.random() * .014,
        r: .5 + Math.random() * (palette === 'celebration' ? 2.2 : 1.2),
        c: warm ? (Math.random() > .35 ? '240,213,162' : '216,135,145') : '154,181,223'
      });
    }
  }

  function setTone(next) { tone = Math.max(0, Math.min(1, next)); }

  function drawField(time) {
    ctx.clearRect(0, 0, width, height);
    for (const star of stars) {
      if (!reduceMotion) {
        star.y -= star.v;
        star.x += Math.sin(time * .00012 + star.phase) * .006;
        if (star.y < -3) star.y = height + 3;
      }
      const alpha = star.a * (.68 + Math.sin(time * .00055 + star.phase) * .32);
      const r = Math.round(202 + 25 * tone);
      const g = Math.round(218 + 2 * tone);
      const b = Math.round(244 - 70 * tone);
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    }

    bursts = bursts.filter(point => point.life > 0);
    for (const point of bursts) {
      point.x += point.vx;
      point.y += point.vy;
      point.vx *= .992;
      point.vy *= .992;
      point.life -= point.decay;
      ctx.fillStyle = `rgba(${point.c},${Math.max(0, point.life)})`;
      ctx.beginPath();
      ctx.arc(point.x, point.y, point.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(drawField);
  }

  class ParticleMorph {
    constructor(targetCanvas) {
      this.canvas = targetCanvas;
      this.ctx = targetCanvas.getContext('2d');
      this.width = 0;
      this.height = 0;
      this.dpr = 1;
      this.mode = 'scatter';
      this.count = window.innerWidth < 700 ? 820 : 1550;
      this.points = [];
      this.targets = [];
      this.beatStart = 0;
      this.lastBeat = -1;
      this.visible = false;
      this.resize = this.resize.bind(this);
      this.render = this.render.bind(this);
      window.addEventListener('resize', this.resize, { passive: true });
      this.resize();
      requestAnimationFrame(this.render);
    }

    resize() {
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = Math.round(this.width * this.dpr);
      this.canvas.height = Math.round(this.height * this.dpr);
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.shapes = {
        scatter: window.MemoryShapes.scatter(this.count, this.width, this.height),
        name: window.MemoryShapes.textPoints('肖淑媛', this.count, this.width, this.height),
        heart: window.MemoryShapes.heartPoints(this.count, this.width, this.height),
        swirl: window.MemoryShapes.swirlPoints(this.count, this.width, this.height),
        rose: window.MemoryShapes.rosePoints(this.count, this.width, this.height)
      };
      if (!this.points.length) {
        this.points = this.shapes.scatter.map(point => ({ ...point, color: [...point.color] }));
      }
      this.targets = this.shapes[this.mode];
    }

    setMode(mode) {
      if (!this.shapes[mode] || this.mode === mode) return;
      this.mode = mode;
      this.targets = this.shapes[mode];
      if (mode === 'heart') {
        this.beatStart = performance.now();
        this.lastBeat = -1;
      }
    }

    setVisible(visible) { this.visible = visible; }

    beat(now) {
      if (this.mode !== 'heart' || !this.beatStart) return 1;
      const elapsed = (now - this.beatStart) / 1000;
      const centers = [.42, 1.28, 2.14];
      let scale = 1;
      centers.forEach((center, index) => {
        const distance = (elapsed - center) / .13;
        scale += Math.exp(-distance * distance) * .11;
        if (elapsed >= center && this.lastBeat < index) {
          this.lastBeat = index;
          window.dispatchEvent(new CustomEvent('morph-heartbeat', { detail: index + 1 }));
        }
      });
      return scale;
    }

    render(now) {
      requestAnimationFrame(this.render);
      if (!this.visible) return;
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.width, this.height);
      const isDimensional = this.mode === 'heart' || this.mode === 'rose' || this.mode === 'swirl';
      const rotation = isDimensional ? now * (this.mode === 'heart' ? .00018 : .00008) : 0;
      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);
      const beat = this.beat(now);
      const centerX = this.width / 2;
      const centerY = this.height * (this.mode === 'rose' ? .44 : .49);
      const easing = reduceMotion ? 1 : this.mode === 'swirl' ? .075 : .055;

      for (let i = 0; i < this.points.length; i += 1) {
        const point = this.points[i];
        const target = this.targets[i];
        point.x += (target.x - point.x) * easing;
        point.y += (target.y - point.y) * easing;
        point.z += (target.z - point.z) * easing;
        point.color[0] += (target.color[0] - point.color[0]) * easing;
        point.color[1] += (target.color[1] - point.color[1]) * easing;
        point.color[2] += (target.color[2] - point.color[2]) * easing;

        const rotatedX = point.x * cos - point.z * sin;
        const rotatedZ = point.x * sin + point.z * cos;
        const perspective = isDimensional ? 620 / (620 + rotatedZ) : 1;
        const x = centerX + rotatedX * perspective * beat;
        const y = centerY + point.y * perspective * beat;
        const alpha = Math.max(.18, Math.min(.95, .62 + rotatedZ / 620));
        const radius = Math.max(.55, (isDimensional ? 1.2 : 1.05) * perspective * this.dpr / 1.4);
        ctx.fillStyle = `rgba(${Math.round(point.color[0])},${Math.round(point.color[1])},${Math.round(point.color[2])},${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  window.CosmicField = { burst, setTone };
  window.ParticleMorph = ParticleMorph;
  window.addEventListener('resize', resizeField, { passive: true });
  resizeField();
  requestAnimationFrame(drawField);
})();
