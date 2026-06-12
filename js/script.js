/**
 * Birthday Website — script.js
 * Vanilla JS only. Handles:
 *  1. Cake assembly animation sequence
 *  2. Scene transition (day → night)
 *  3. Sparkle particle canvas
 *  4. Envelope open interaction
 *  5. Letter reveal
 *  6. Confetti burst
 */

'use strict';

/* ─────────────────────────────────────────────────────────────
   DOM References
───────────────────────────────────────────────────────────── */
const scene          = document.getElementById('scene');
const cakeBottom     = document.getElementById('cakeBottom');
const cakeMiddle     = document.getElementById('cakeMiddle');
const cakeTop        = document.getElementById('cakeTop');
const candlesRow     = document.getElementById('candlesRow');
const candles        = document.querySelectorAll('.candle');
const flames         = document.querySelectorAll('.flame');
const flameGlows     = document.querySelectorAll('.flame-glow');
const icingDrips     = document.querySelectorAll('.icing-drip');
const envelopeSection = document.getElementById('envelopeSection');
const envelopeBtn    = document.getElementById('envelopeBtn');
const envFlap        = document.getElementById('envFlap');
const letterOverlay  = document.getElementById('letterOverlay');
const letterPaper    = document.getElementById('letterPaper');
const letterContent  = document.getElementById('letterContent');
const letterClose    = document.getElementById('letterClose');
const sparkleCanvas  = document.getElementById('sparkleCanvas');
const confettiCanvas = document.getElementById('confettiCanvas');

/* ─────────────────────────────────────────────────────────────
   Utility — delay helper (returns a Promise)
───────────────────────────────────────────────────────────── */
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/* ─────────────────────────────────────────────────────────────
   1. CAKE ASSEMBLY SEQUENCE
   Timings (ms) — chosen to feel smooth and magical
───────────────────────────────────────────────────────────── */
async function runCakeSequence() {
  // Step 1: Cake bottom slides up
  await wait(400);
  cakeBottom.classList.add('assembled');

  // Step 2: Cake middle
  await wait(700);
  cakeMiddle.classList.add('assembled');

  // Step 3: Cake top
  await wait(700);
  cakeTop.classList.add('assembled');

  // Step 4: Icing pours (all drips simultaneously)
  await wait(600);
  icingDrips.forEach(drip => drip.classList.add('poured'));

  // Step 5: Candles rise (staggered left → right)
  await wait(700);
  candles[0].classList.add('rise');
  await wait(250);
  candles[1].classList.add('rise');
  await wait(250);
  candles[2].classList.add('rise');

  // Step 6: Flames ignite one by one
  await wait(500);
  igniteFlame(0);
  await wait(400);
  igniteFlame(1);
  await wait(400);
  igniteFlame(2);

  // Step 7: Scene goes dark → night mode
  await wait(700);
  transitionToNight();

  // Step 8: Envelope appears
  await wait(1200);
  envelopeSection.classList.add('visible');
}

/** Light a single candle flame by index */
function igniteFlame(index) {
  flames[index].classList.add('lit');
  candles[index].classList.add('flame-active');
  // Activate glow (it's a sibling before .flame in the DOM)
  flameGlows[index].style.opacity = '1';
}

/** Smoothly transition background to night */
function transitionToNight() {
  scene.classList.add('night');
}

/* ─────────────────────────────────────────────────────────────
   2. SPARKLE CANVAS — floating glitter particles
───────────────────────────────────────────────────────────── */
(function initSparkles() {
  const ctx = sparkleCanvas.getContext('2d');
  let particles = [];
  let W, H;

  function resize() {
    W = sparkleCanvas.width  = window.innerWidth;
    H = sparkleCanvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  /** Create a single sparkle particle */
  function createParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2.5 + 0.5,         // radius
      alpha: Math.random() * 0.7 + 0.2,
      da: (Math.random() * 0.012 + 0.004) * (Math.random() < 0.5 ? 1 : -1),
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.5 - 0.1,       // drift upward
      color: Math.random() < 0.5 ? '#ffd700' : '#ffb6c1',
    };
  }

  // Spawn initial particles
  for (let i = 0; i < 70; i++) particles.push(createParticle());

  function drawStar(cx, cy, r, ctx) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = particles.find(p => p.x === cx)?.color || '#ffd700';
    ctx.fill();
    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach((p, i) => {
      // Move
      p.x += p.vx;
      p.y += p.vy;
      p.alpha += p.da;

      // Clamp and reverse alpha fade
      if (p.alpha <= 0.1 || p.alpha >= 0.9) p.da *= -1;

      // Respawn if off-screen
      if (p.y < -10 || p.x < -10 || p.x > W + 10) {
        particles[i] = createParticle();
        particles[i].y = H + 5; // start from bottom when respawning
      }

      // Draw as a small glowing circle
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();

      // Add a tiny glow
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
      grad.addColorStop(0, p.color);
      grad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    });

    ctx.globalAlpha = 1;
    requestAnimationFrame(animate);
  }

  animate();
})();

/* ─────────────────────────────────────────────────────────────
   3. CONFETTI BURST — fires when letter fully opens
───────────────────────────────────────────────────────────── */
(function initConfetti() {
  const ctx = confettiCanvas.getContext('2d');
  let pieces = [];
  let W, H;
  let active = false;

  function resize() {
    W = confettiCanvas.width  = window.innerWidth;
    H = confettiCanvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const colors = [
    '#FFB6C1', '#87CEEB', '#ffd700', '#b0f0b0',
    '#ff9a9a', '#c3b1e1', '#ffd1dc', '#a8e6cf',
  ];

  function spawnPiece() {
    return {
      x: Math.random() * W,
      y: -10,
      w: Math.random() * 10 + 5,
      h: Math.random() * 5 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 4 + 2,
      angle: Math.random() * 360,
      va: (Math.random() - 0.5) * 6,
      alpha: 1,
      shape: Math.random() < 0.4 ? 'circle' : 'rect',
    };
  }

  /** Public method to trigger a burst */
  window.launchConfetti = function () {
    if (active) return;
    active = true;
    pieces = [];
    // Spawn 160 pieces
    for (let i = 0; i < 160; i++) {
      const p = spawnPiece();
      p.y = Math.random() * -200; // stagger starting heights
      pieces.push(p);
    }
    animateConfetti();
  };

  function animateConfetti() {
    if (!active) return;
    ctx.clearRect(0, 0, W, H);

    let alive = 0;
    pieces.forEach(p => {
      p.x     += p.vx;
      p.y     += p.vy;
      p.angle += p.va;
      p.vy    += 0.08; // gravity

      // Fade out as it nears bottom
      if (p.y > H * 0.7) p.alpha -= 0.02;
      if (p.alpha <= 0) return;
      alive++;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.translate(p.x, p.y);
      ctx.rotate((p.angle * Math.PI) / 180);
      ctx.fillStyle = p.color;

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      ctx.restore();
    });

    ctx.globalAlpha = 1;

    if (alive > 0) {
      requestAnimationFrame(animateConfetti);
    } else {
      ctx.clearRect(0, 0, W, H);
      active = false;
    }
  }
})();

/* ─────────────────────────────────────────────────────────────
   4. ENVELOPE INTERACTION
───────────────────────────────────────────────────────────── */
let letterOpen = false;

envelopeBtn.addEventListener('click', async () => {
  if (letterOpen) return;
  letterOpen = true;

  // a) Open the envelope flap
  envFlap.classList.add('open');

  // b) Show overlay after a short delay (flap animation ~0.4s)
  await wait(400);
  letterOverlay.setAttribute('aria-hidden', 'false');
  letterOverlay.classList.add('open');

  // c) Expand the paper
  await wait(120);
  letterPaper.classList.add('expanded');

  // d) Fade in letter text
  await wait(550);
  letterContent.classList.add('visible');

  // e) Confetti burst 🎉
  await wait(300);
  window.launchConfetti();
});

/** Close the letter */
async function closeLetter() {
  letterContent.classList.remove('visible');
  await wait(300);
  letterPaper.classList.remove('expanded');
  await wait(500);
  letterOverlay.classList.remove('open');
  letterOverlay.setAttribute('aria-hidden', 'true');
  envFlap.classList.remove('open');
  letterOpen = false;
}

letterClose.addEventListener('click', closeLetter);

// Close on overlay backdrop click
letterOverlay.addEventListener('click', (e) => {
  if (e.target === letterOverlay || e.target === letterOverlay.querySelector('.letter-container')) {
    closeLetter();
  }
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && letterOpen) closeLetter();
});

/* ─────────────────────────────────────────────────────────────
   5. KICK OFF THE SEQUENCE
───────────────────────────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  runCakeSequence();
});
