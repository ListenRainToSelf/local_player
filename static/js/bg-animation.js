(function () {
  'use strict';

  var canvas = document.getElementById('bg-canvas');
  var ctx = canvas.getContext('2d');

  var PARTICLE_COUNT = 50;
  var CONNECTION_MAX_DIST = 220;
  var MOUSE_RADIUS = 160;
  var ATTRACT_STRENGTH = 0.04;
  var SPRING_STRENGTH = 0.004;
  var WANDER_SPEED = 0.25;
  var DAMPING = 0.93;
  var LINE_BASE_ALPHA = 0.5;
  var MOUSE_BOOST_ALPHA = 0.7;

  var particles = [];
  var mouse = { x: -9999, y: -9999, active: false };
  var width, height;
  var tick = 0;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.homeX = Math.random() * width;
      p.homeY = Math.random() * height;
      if (p.x === undefined) {
        p.x = p.homeX;
        p.y = p.homeY;
      }
    }
  }

  function createParticles() {
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      var angle = Math.random() * Math.PI * 2;
      particles.push({
        x: 0,
        y: 0,
        homeX: 0,
        homeY: 0,
        vx: 0,
        vy: 0,
        wanderAngle: angle,
        wanderSpeed: 0.15 + Math.random() * 0.5,
        wanderRange: 20 + Math.random() * 40,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.003 + Math.random() * 0.008,
      });
    }
    resize();
  }

  function smoothstep(edge0, edge1, x) {
    var t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  function update() {
    tick++;

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];

      p.wanderAngle += (Math.random() - 0.5) * 0.08;
      if (Math.random() < 0.005) {
        p.wanderSpeed = 0.15 + Math.random() * 0.5;
      }

      var wanderX = Math.cos(p.wanderAngle) * WANDER_SPEED * p.wanderSpeed;
      var wanderY = Math.sin(p.wanderAngle) * WANDER_SPEED * p.wanderSpeed;

      var dxHome = p.homeX - p.x;
      var dyHome = p.homeY - p.y;
      var distHome = Math.sqrt(dxHome * dxHome + dyHome * dyHome);
      if (distHome > 1) {
        var springForce = Math.min(distHome * SPRING_STRENGTH, 1.5);
        p.vx += (dxHome / distHome) * springForce;
        p.vy += (dyHome / distHome) * springForce;
      }

      if (mouse.active) {
        var dxMouse = mouse.x - p.x;
        var dyMouse = mouse.y - p.y;
        var distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        if (distMouse < MOUSE_RADIUS && distMouse > 2) {
          var t = 1 - distMouse / MOUSE_RADIUS;
          var force = smoothstep(0, 1, t) * ATTRACT_STRENGTH * 4;
          p.vx += (dxMouse / distMouse) * force;
          p.vy += (dyMouse / distMouse) * force;
        }
      }

      p.vx += wanderX;
      p.vy += wanderY;

      p.vx *= DAMPING;
      p.vy *= DAMPING;

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -50) { p.x = -50; p.vx *= -0.4; }
      if (p.x > width + 50) { p.x = width + 50; p.vx *= -0.4; }
      if (p.y < -50) { p.y = -50; p.vy *= -0.4; }
      if (p.y > height + 50) { p.y = height + 50; p.vy *= -0.4; }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    var isDark = document.body.classList.contains('dark');

    for (var i = 0; i < particles.length; i++) {
      for (var j = i + 1; j < particles.length; j++) {
        var a = particles[i];
        var b = particles[j];
        var dx = a.x - b.x;
        var dy = a.y - b.y;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_MAX_DIST) {
          var baseAlpha = (1 - dist / CONNECTION_MAX_DIST) * LINE_BASE_ALPHA;

          var dMouseA = mouse.active
            ? Math.sqrt((mouse.x - (a.x + b.x) * 0.5) * (mouse.x - (a.x + b.x) * 0.5) +
                        (mouse.y - (a.y + b.y) * 0.5) * (mouse.y - (a.y + b.y) * 0.5))
            : 9999;

          var mouseBoost = 1;
          if (dMouseA < MOUSE_RADIUS * 1.5) {
            mouseBoost = 1 + (1 - dMouseA / (MOUSE_RADIUS * 1.5)) * 2.5;
          }

          var alpha = baseAlpha * mouseBoost;
          var pulse = 1 + Math.sin(tick * 0.015 + a.phase + b.phase) * 0.15;

          var r, g, bv;
          if (isDark) {
            r = Math.round(210 + Math.sin(a.phase) * 18);
            g = Math.round(215 + Math.cos(b.phase) * 15);
            bv = Math.round(225 + Math.sin((a.phase + b.phase) * 0.5) * 12);
          } else {
            r = Math.round(175 + Math.sin(a.phase) * 15);
            g = Math.round(180 + Math.cos(b.phase) * 12);
            bv = Math.round(190 + Math.sin((a.phase + b.phase) * 0.5) * 10);
          }

          ctx.strokeStyle = 'rgba(' + r + ',' + g + ',' + bv + ',' + (alpha * pulse).toFixed(3) + ')';
          ctx.lineWidth = 0.5 + (1 - dist / CONNECTION_MAX_DIST) * 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    if (mouse.active) {
      var glowR = isDark ? 230 : 200;
      var glowG = isDark ? 235 : 205;
      var glowB = isDark ? 240 : 215;
      var glow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, MOUSE_RADIUS);
      glow.addColorStop(0, 'rgba(' + glowR + ',' + glowG + ',' + glowB + ', 0.08)');
      glow.addColorStop(0.5, 'rgba(' + glowR + ',' + glowG + ',' + glowB + ', 0.03)');
      glow.addColorStop(1, 'rgba(' + glowR + ',' + glowG + ',' + glowB + ', 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(mouse.x - MOUSE_RADIUS, mouse.y - MOUSE_RADIUS, MOUSE_RADIUS * 2, MOUSE_RADIUS * 2);
    }
  }

  function animate() {
    update();
    draw();
    requestAnimationFrame(animate);
  }

  document.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });

  document.addEventListener('mouseleave', function () {
    mouse.active = false;
  });

  window.addEventListener('resize', function () {
    resize();
  });

  createParticles();
  animate();
})();
