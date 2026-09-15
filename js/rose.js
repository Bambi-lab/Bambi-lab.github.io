(function () {
  let seed = 22052026;
  function random() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  function color(hex) {
    const value = hex.replace('#', '');
    return [
      parseInt(value.slice(0, 2), 16),
      parseInt(value.slice(2, 4), 16),
      parseInt(value.slice(4, 6), 16)
    ];
  }

  function scatter(count, width, height) {
    return Array.from({ length: count }, () => ({
      x: (random() - .5) * width * 1.16,
      y: (random() - .5) * height * 1.08,
      z: (random() - .5) * 520,
      color: color(random() > .86 ? '#f0d5a2' : '#9ab5df')
    }));
  }

  function textPoints(text, count, width, height) {
    const offscreen = document.createElement('canvas');
    const size = 4;
    offscreen.width = Math.max(960, Math.round(width * size));
    offscreen.height = Math.max(300, Math.round(height * .34 * size));
    const ctx = offscreen.getContext('2d', { willReadFrequently: true });
    const fontSize = Math.min(offscreen.height * .58, offscreen.width / 4.2);
    ctx.clearRect(0, 0, offscreen.width, offscreen.height);
    ctx.fillStyle = '#fff';
    ctx.font = `600 ${fontSize}px "Noto Serif SC", "Songti SC", serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, offscreen.width / 2, offscreen.height / 2);
    const pixels = ctx.getImageData(0, 0, offscreen.width, offscreen.height).data;
    const candidates = [];
    const stride = Math.max(5, Math.round(Math.sqrt((offscreen.width * offscreen.height) / count) * .48));
    for (let y = 0; y < offscreen.height; y += stride) {
      for (let x = 0; x < offscreen.width; x += stride) {
        if (pixels[(y * offscreen.width + x) * 4 + 3] > 100) candidates.push([x, y]);
      }
    }
    const scale = Math.min(width * .76 / offscreen.width, height * .25 / offscreen.height);
    return Array.from({ length: count }, (_, index) => {
      const point = candidates[Math.floor(index * candidates.length / count) % candidates.length] || [offscreen.width / 2, offscreen.height / 2];
      return {
        x: (point[0] - offscreen.width / 2) * scale + (random() - .5) * 1.6,
        y: (point[1] - offscreen.height / 2) * scale + (random() - .5) * 1.6,
        z: (random() - .5) * 28,
        color: color(random() > .18 ? '#f0d5a2' : '#fff5df')
      };
    });
  }

  function heartPoints(count, width, height) {
    const scale = Math.min(width, height) * .017;
    return Array.from({ length: count }, (_, index) => {
      const t = (index / count) * Math.PI * 2 * 7 + random() * .16;
      const layer = .5 + random() * .5;
      const x = 16 * Math.pow(Math.sin(t), 3) * scale * layer;
      const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * scale * layer;
      const depth = Math.sqrt(Math.max(0, 1 - layer * layer));
      const z = (random() > .5 ? 1 : -1) * depth * scale * 12 + (random() - .5) * 12;
      return { x, y, z, color: color(index % 9 === 0 ? '#f2c6bd' : '#d88791') };
    });
  }

  function swirlPoints(count, width, height) {
    const scale = Math.min(width, height) * .32;
    return Array.from({ length: count }, (_, index) => {
      const u = index / count;
      const angle = u * Math.PI * 15;
      const radius = scale * (.08 + u * .92);
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius * .62 + height * .06,
        z: Math.sin(angle * .44) * 180,
        color: color(index % 5 ? '#d88791' : '#f0d5a2')
      };
    });
  }

  function rosePoints(count, width, height) {
    const centers = [
      [-.2,-.31],[0,-.34],[.2,-.31],
      [-.34,-.17],[-.17,-.18],[0,-.2],[.17,-.18],[.34,-.17],
      [-.4,-.01],[-.2,-.03],[0,-.04],[.2,-.03],[.4,-.01],
      [-.34,.14],[-.17,.13],[0,.12],[.17,.13],[.34,.14],
      [-.2,.28],[0,.26],[.2,.28]
    ];
    const scale = Math.min(width, height) * .72;
    const headCount = Math.min(Math.floor(count * .68), centers.length * 50);
    const result = [];

    for (let i = 0; i < headCount; i += 1) {
      const roseIndex = i % centers.length;
      const localIndex = Math.floor(i / centers.length);
      const u = localIndex / Math.max(1, Math.floor(headCount / centers.length) - 1);
      const angle = u * Math.PI * 9 + roseIndex * .63;
      const radius = scale * .038 * (.18 + .82 * Math.sqrt(u)) * (.86 + .14 * Math.sin(angle * 5));
      const center = centers[roseIndex];
      const tint = (roseIndex + localIndex) % 8;
      result.push({
        x: center[0] * scale + Math.cos(angle) * radius,
        y: center[1] * scale + Math.sin(angle) * radius * .68 - height * .055,
        z: Math.sin(angle * 1.7) * scale * .018 + (random() - .5) * 14,
        color: color(tint === 0 ? '#f1b7b1' : tint < 3 ? '#c96f7c' : '#a94f62')
      });
    }

    for (let i = result.length; i < count; i += 1) {
      const stemIndex = i % centers.length;
      const u = random();
      const center = centers[stemIndex];
      const isWrap = i > count * .9;
      if (isWrap) {
        const side = random() > .5 ? 1 : -1;
        result.push({
          x: side * scale * (.08 + u * .27),
          y: scale * (.2 + u * .34),
          z: (random() - .5) * 28,
          color: color('#d9b77e')
        });
      } else {
        result.push({
          x: center[0] * scale * (1 - u) + (random() - .5) * 5,
          y: (center[1] * scale - height * .03) * (1 - u) + scale * .48 * u,
          z: (random() - .5) * 24,
          color: color(i % 6 === 0 ? '#8ca77a' : '#5f7c63')
        });
      }
    }
    return result;
  }

  window.MemoryShapes = { scatter, textPoints, heartPoints, swirlPoints, rosePoints };
})();
