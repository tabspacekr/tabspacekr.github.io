/**
 * Hero Effects
 * 히어로 파티클 캔버스와 카드 3D 틸트.
 *
 * 성능 원칙 (docs/homepage-performance-strategy.md A2, RUN-13)
 *  - 히어로가 화면에 보이고 탭이 활성일 때만 그린다 (IntersectionObserver + visibilitychange)
 *  - 30fps 상한, 캔버스는 섹션 크기 x DPR(최대 1.5)
 *  - 발광은 파티클마다 shadowBlur 대신 미리 그려 둔 스프라이트로 표현
 *  - 파티클 수는 캔버스 면적에 비례(40~100개), prefers-reduced-motion 이면 정지 화면 한 장만 그린다
 *  - 데스크톱 WebGL(three.js) 배경은 제거했다 (전략 문서 §6-1 #3)
 */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var COLORS = [
    [95, 244, 255],  // Cyan
    [255, 0, 255],   // Magenta
    [0, 128, 255],   // Electric Blue
    [128, 0, 255],   // Purple
    [0, 255, 136]    // Neon Green
  ];
  var FRAME_MS = 1000 / 30;
  var LINK_DIST = 100;

  function HeroParticleEffect() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.sprites = [];
    this.mouse = { x: -9999, y: -9999 };
    this.width = 0;
    this.height = 0;
    this.dpr = 1;
    this.animationId = null;
    this.lastFrame = 0;
    this.inView = true;
  }

  HeroParticleEffect.prototype.init = function (canvasId) {
    this.canvas = document.getElementById(canvasId || 'hero-particles');
    if (!this.canvas) return false;
    this.ctx = this.canvas.getContext('2d');
    this.createSprites();
    this.resize();
    this.createParticles();

    var self = this;
    // 캔버스 기준 좌표로 변환한다 (섹션이 스크롤되어도 상호작용 위치가 맞도록)
    document.addEventListener('mousemove', function (e) {
      var rect = self.canvas.getBoundingClientRect();
      self.mouse.x = e.clientX - rect.left;
      self.mouse.y = e.clientY - rect.top;
    }, { passive: true });

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        var prevW = self.width, prevH = self.height;
        self.resize();
        // 크기가 바뀌면 위치를 비율대로 옮겨 빈 영역이 생기지 않게 한다
        if (prevW && prevH) {
          self.particles.forEach(function (p) { p.x *= self.width / prevW; p.y *= self.height / prevH; });
        }
        if (reduceMotion) self.draw();
      }, 150);
    });

    if (reduceMotion) {
      this.draw();
      return true;
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        self.inView = entries[0].isIntersecting;
        self.updateRunning();
      }).observe(this.canvas);
    }
    document.addEventListener('visibilitychange', function () { self.updateRunning(); });
    this.updateRunning();
    return true;
  };

  HeroParticleEffect.prototype.updateRunning = function () {
    var shouldRun = this.inView && !document.hidden;
    if (shouldRun && !this.animationId) {
      var self = this;
      this.animationId = requestAnimationFrame(function (t) { self.animate(t); });
    } else if (!shouldRun && this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  };

  HeroParticleEffect.prototype.createSprites = function () {
    // 반지름 1 기준 발광 스프라이트. shadowBlur 10 과 비슷한 번짐을 미리 굽는다.
    var size = 32;
    this.sprites = COLORS.map(function (c) {
      var s = document.createElement('canvas');
      s.width = s.height = size;
      var g = s.getContext('2d');
      var grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      // 가운데 30%는 원래 점(반지름 r), 바깥은 옅은 번짐
      grad.addColorStop(0, 'rgba(' + c + ',0.8)');
      grad.addColorStop(0.28, 'rgba(' + c + ',0.8)');
      grad.addColorStop(0.34, 'rgba(' + c + ',0.22)');
      grad.addColorStop(0.6, 'rgba(' + c + ',0.07)');
      grad.addColorStop(1, 'rgba(' + c + ',0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, size, size);
      return s;
    });
  };

  HeroParticleEffect.prototype.resize = function () {
    var rect = this.canvas.getBoundingClientRect();
    this.width = Math.max(1, Math.round(rect.width || window.innerWidth));
    this.height = Math.max(1, Math.round(rect.height || window.innerHeight));
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.ctx.fillStyle = 'rgb(10, 14, 39)';
    this.ctx.fillRect(0, 0, this.width, this.height);
  };

  HeroParticleEffect.prototype.createParticles = function () {
    // 화면 면적에 비례(약 1만 px² 당 1개)해 밀도를 유지하되 40~100개로 제한한다.
    // 모바일 히어로(약 412x1400)는 약 60개: 연결선 계산이 기존 100개의 1/3 수준이다.
    var count = Math.max(40, Math.min(100, Math.round(this.width * this.height / 10000)));
    this.particles = [];
    for (var i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        color: Math.floor(Math.random() * COLORS.length)
      });
    }
  };

  HeroParticleEffect.prototype.animate = function (now) {
    var self = this;
    this.animationId = requestAnimationFrame(function (t) { self.animate(t); });
    if (now - this.lastFrame < FRAME_MS) return;
    // 30fps 기준으로 움직임 속도를 보정한다 (기존 60fps 한 프레임 이동량 x2)
    this.lastFrame = now;
    this.step(2);
    this.draw();
  };

  HeroParticleEffect.prototype.step = function (speed) {
    var w = this.width, h = this.height, mx = this.mouse.x, my = this.mouse.y;
    for (var i = 0; i < this.particles.length; i++) {
      var p = this.particles[i];
      p.x += p.vx * speed;
      p.y += p.vy * speed;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;
      var dx = mx - p.x, dy = my - p.y;
      var d2 = dx * dx + dy * dy;
      if (d2 < 22500) {
        var force = (150 - Math.sqrt(d2)) / 150;
        p.x -= dx * force * 0.01 * speed;
        p.y -= dy * force * 0.01 * speed;
      }
    }
  };

  HeroParticleEffect.prototype.draw = function () {
    var ctx = this.ctx, ps = this.particles, n = ps.length;
    // 잔상 효과
    ctx.fillStyle = reduceMotion ? 'rgb(10, 14, 39)' : 'rgba(10, 14, 39, 0.18)';
    ctx.fillRect(0, 0, this.width, this.height);

    // 가까운 파티클 연결선 (투명도 구간별로 묶어 stroke 호출 수를 줄인다)
    var buckets = [[], [], [], []];
    for (var i = 0; i < n; i++) {
      var a = ps[i];
      for (var j = i + 1; j < n; j++) {
        var b = ps[j];
        var dx = a.x - b.x, dy = a.y - b.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < LINK_DIST * LINK_DIST) {
          var k = Math.min(3, Math.floor(Math.sqrt(d2) / (LINK_DIST / 4)));
          buckets[k].push(a.x, a.y, b.x, b.y);
        }
      }
    }
    ctx.lineWidth = 0.5;
    for (var bi = 0; bi < 4; bi++) {
      var seg = buckets[bi];
      if (!seg.length) continue;
      ctx.strokeStyle = 'rgba(95, 244, 255, ' + (1 - (bi + 0.5) / 4) + ')';
      ctx.beginPath();
      for (var s = 0; s < seg.length; s += 4) {
        ctx.moveTo(seg[s], seg[s + 1]);
        ctx.lineTo(seg[s + 2], seg[s + 3]);
      }
      ctx.stroke();
    }

    for (var q = 0; q < n; q++) {
      var p = ps[q];
      var r = p.radius / 0.3;
      ctx.drawImage(this.sprites[p.color], p.x - r, p.y - r, r * 2, r * 2);
    }
  };

  HeroParticleEffect.prototype.dispose = function () {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.animationId = null;
  };

  // 카드 3D 틸트: 마우스가 있는 기기에서만, rAF 로 한 프레임에 한 번만 갱신한다
  function Card3DTilt(selector) {
    this.cards = document.querySelectorAll(selector);
    if (!window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches || reduceMotion) return;
    Array.prototype.forEach.call(this.cards, function (card) {
      var rect = null, frame = null, lastEvent = null;
      card.addEventListener('mouseenter', function () { rect = card.getBoundingClientRect(); });
      card.addEventListener('mousemove', function (e) {
        lastEvent = e;
        if (frame) return;
        frame = requestAnimationFrame(function () {
          frame = null;
          if (!rect) rect = card.getBoundingClientRect();
          var x = lastEvent.clientX - rect.left, y = lastEvent.clientY - rect.top;
          var rotateX = (y - rect.height / 2) / 10;
          var rotateY = (rect.width / 2 - x) / 10;
          card.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale3d(1.05, 1.05, 1.05)';
        });
      });
      card.addEventListener('mouseleave', function () {
        if (frame) cancelAnimationFrame(frame);
        frame = null;
        rect = null;
        card.style.transform = '';
      });
    });
  }

  window.HeroParticleEffect = HeroParticleEffect;
  window.Card3DTilt = Card3DTilt;

  function init() {
    if (document.getElementById('hero-particles')) {
      var hero = new HeroParticleEffect();
      hero.init('hero-particles');
      window.heroParticlesInstance = hero;
    }
    if (document.querySelector('.cyber-3d-card')) new Card3DTilt('.cyber-3d-card');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
